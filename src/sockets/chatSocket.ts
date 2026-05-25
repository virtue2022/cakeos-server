import { Server } from "socket.io";
import Message from "../models/Message";
import { generateReply } from "../services/aiReply";
import Lead from "../models/Lead";
import { extractOrderDetails } from "../services/extractOrderDetails";
import Order from "../models/Order";

const onlineUsers = new Map();

export const chatSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("🔥 User connected:", socket.id);

    // 🔥 REGISTER ONLINE USER
    socket.on("user_online", (userId) => {
      onlineUsers.set(userId, socket.id);

      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // socket.on("order_taken", (orderId) => {
    //   // 🔥 notify everyone else
    //   socket.broadcast.emit("order_locked", orderId);
    // });

    socket.on("order_taken", async (orderId) => {
      try {
        const order = await Order.findById(orderId);

        if (!order) return;

        // 🔥 lock marketplace order
        socket.broadcast.emit("order_locked", orderId);

        // 🔥 notify customer
        io.emit("order_accepted", {
          orderId,

          message:
            "🎂 Your order has been accepted by a vendor and production will begin shortly.",
        });
      } catch (err) {
        console.error(err);
      }
    });

    // 🔥 LIVE ORDER STATUS UPDATE
    socket.on("vendor_order_update", (order) => {
      io.emit("customer_order_update", order);
    });

    // =============================
    // 💬 SEND MESSAGE
    // =============================
    socket.on("send_message", async (data) => {
      try {
        const { leadId, text, from } = data;

        if (!leadId || !text) return;

        // ✅ SAVE USER MESSAGE
        const saved = await Message.create({
          leadId,
          text,
          from,
          status: "sent",
        });

        // =============================
        // 📊 AUTO PIPELINE UPDATE
        // =============================
        if (from === "customer") {
          const msg = text.toLowerCase();
          const details = extractOrderDetails(text);

          if (Object.keys(details).length > 0) {
            try {
              await Lead.findByIdAndUpdate(leadId, details);
            } catch {
              // ignore if it's an order chat
            }
          }

          let stage: any = "Interested";

          if (
            msg.includes("hi") ||
            msg.includes("hello") ||
            msg.includes("interested")
          ) {
            stage = "Interested";
          }

          if (
            msg.includes("price") ||
            msg.includes("cost") ||
            msg.includes("budget") ||
            msg.includes("how much")
          ) {
            stage = "Negotiation";
          }

          if (
            msg.includes("date") ||
            msg.includes("when") ||
            msg.includes("delivery") ||
            msg.includes("location")
          ) {
            stage = "Qualified";
          }

          if (
            msg.includes("book") ||
            msg.includes("order") ||
            msg.includes("pay") ||
            msg.includes("confirm")
          ) {
            stage = "Converted";
          }

          // 🔥 only update if it's actually a Lead
          try {
            await Lead.findByIdAndUpdate(leadId, { stage });
          } catch {
            // ignore if it's an order chat
          }
        }

        // =============================
        // 📡 EMIT MESSAGE
        // =============================
        io.emit("receive_message", saved);

        // 🔥 LIVE UNREAD NOTIFICATION
        io.emit("new_message_notification", {
          leadId,
        });

        // =============================
        // 🤖 AI AUTO REPLY (SMART SELLING)
        // =============================
        if (from === "customer") {
          let replyText = generateReply(text);
          const msg = text.toLowerCase();

          // 🧾 FIRST CONFIRM → SHOW SUMMARY
          if (msg === "confirm") {
            const lead = await Lead.findById(leadId);

            if (!lead) return;

            // 🧾 FIRST CONFIRM → SHOW SUMMARY
            if (lead.stage !== "Closing" && lead.stage !== "Converted") {
              replyText = `🎂 Order Summary:\n
Cake: ${lead.cakeType || "Not specified"}
Size: ${lead.size || "Not specified"}
Date: ${lead.date || "Not specified"}
Location: ${lead.location || "Not specified"}

Type *confirm* again to finalize your order ✅`;

              await Lead.findByIdAndUpdate(leadId, {
                stage: "Closing",
              });
            } else if (lead.stage === "Closing") {
              // ✅ FINAL CONFIRM → CREATE ORDER

              const order = await Order.create({
                customerName: lead.name,
                cakeType: lead.cakeType,
                size: lead.size,
                date: lead.date,
                location: lead.location,
                budget: lead.budget,

                chatId: lead._id.toString(),
                status: "open",
              });

              // ✅ mark lead converted
              await Lead.findByIdAndUpdate(leadId, {
                stage: "Converted",
              });

              replyText =
                "✅ Order confirmed 🎉\n\nYour cake is now scheduled.\nA vendor will start processing it shortly 🎂";

              // 🔥 notify vendors (optional but powerful)
              io.emit("order_notification", order);
            }
          }

          const aiMsg = await Message.create({
            leadId,
            text: replyText,
            from: "agent",
            status: "sent",
          });

          const delay = 800 + Math.random() * 1200;

          setTimeout(() => {
            io.emit("receive_message", aiMsg);
          }, delay);
        }
      } catch (err) {
        console.error("❌ SOCKET ERROR:", err);
      }
    });

    // =============================
    // ✍️ TYPING
    // =============================
    socket.on("typing", ({ leadId }) => {
      socket.broadcast.emit("user_typing", { leadId });
    });

    socket.on("stop_typing", ({ leadId }) => {
      socket.broadcast.emit("stop_typing", { leadId });
    });

    // =============================
    // 👀 READ RECEIPTS
    // =============================
    socket.on("read_messages", async ({ leadId }) => {
      try {
        await Message.updateMany(
          { leadId, from: "customer", status: { $ne: "read" } },
          { status: "read" },
        );

        socket.broadcast.emit("messages_read", { leadId });
      } catch (err) {
        console.error("❌ READ ERROR:", err);
      }
    });

    // =============================
    // 🔌 DISCONNECT
    // =============================
    socket.on("disconnect", () => {
      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          onlineUsers.delete(key);
        }
      }

      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log("❌ User disconnected:", socket.id);
    });
  });
};
