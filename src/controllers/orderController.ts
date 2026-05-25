import { Request, Response } from "express";
import Order from "../models/Order";
import Lead from "../models/Lead";
import Message from "../models/Message";
import User from "../models/User";
import Activity from "../models/Activity";
import { getIO } from "../socket";
import Notification from "../models/Notification";

// ✅ CREATE ORDER (PUBLIC)
export const createOrder = async (req: any, res: Response) => {
  try {
    const order = await Order.create({
      ...req.body,

      customerId: req.userId,

      status: "open",
      timeline: [
        {
          text: "📝 Order placed",

          time: new Date().toISOString(),
        },
      ],
    });

    // 🔥 CREATE ACTIVITY
    const activity = await Activity.create({
      title: "New Marketplace Order",

      message: `${order.customerName} placed a new cake order 🎂`,

      type: "order",
    });

    // 🔥 LIVE ADMIN ACTIVITY
    getIO().emit("new_activity", activity);
    // 🔥 CREATE INITIAL MESSAGE (chat starts immediately)
    await Message.create({
      leadId: order._id.toString(),
      text: `New order from ${order.customerName}`,
      from: "customer",
    });

    // 🔥 LINK CHAT
    order.chatId = order._id.toString();
    await order.save();

    await Notification.create({
      title: "New Marketplace Order",

      message: `${order.customerName} placed a new cake order 🎂`,

      type: "admin",
    });
    // 🔥 REAL-TIME NOTIFICATION
    // req.io.emit("order_notification", order);
    getIO().emit("order_notification", order);
    getIO().emit("dashboard_update");

    // 🔔 ADMIN NOTIFICATION
    const adminNotification = await Notification.create({
      userId: "admin",

      title: "New Order",

      message: `${order.customerName} placed a new cake order 🎂`,

      type: "admin",
    });

    getIO().emit("new_notification", adminNotification);

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const createOrderFromLead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!lead) {
      return res.status(404).json({
        error: "Lead not found",
      });
    }

    const existing = await Order.findOne({
      leadId: lead._id.toString(),
    });

    if (existing) {
      return res.status(400).json({
        error: "Order already created",
      });
    }

    const order = await Order.create({
      customerName: lead.name,
      phone: lead.phone,

      cakeType: lead.cakeType || "Custom Cake",
      size: lead.size || "Medium",

      budget: lead.budget,

      location: lead.location || "Not specified",

      date: lead.date || new Date().toISOString(),

      type: "crm",

      status: "accepted",

      vendorId: req.userId,

      leadId: lead._id.toString(),
    });

    lead.stage = "Converted";

    await lead.save();

    res.json(order);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to convert lead",
    });
  }
};

// ✅ GET ALL ORDERS
export const getOrders = async (req: Request, res: Response) => {
  try {
    const type = req.query.type as "marketplace" | "crm" | undefined;

    const filter = type ? { type } : {};

    const orders = await Order.find(filter).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// GET MY ORDERS (VENDOR DASHBOARD)
export const getMyOrders = async (req: any, res: Response) => {
  try {
    const orders = await Order.find({
      vendorId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch your orders" });
  }
};

// ✅ CUSTOMER ORDERS
export const getCustomerOrders = async (req: any, res: Response) => {
  try {
    const orders = await Order.find({
      customerId: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch customer orders",
    });
  }
};

// ✅ UPDATE ORDER STATUS
export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const order = await Order.findOne({
      _id: id,

      vendorId: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    // 🔥 STATUS LABELS
    const labels: Record<string, string> = {
      baking: "🎂 Baking started",

      ready: "📦 Cake ready for delivery",

      delivered: "🚚 Cake delivered",
    };

    // 🔥 UPDATE STATUS
    order.status = status;

    // 🔥 APPEND TIMELINE
    order.timeline = [
      ...(order.timeline || []),

      {
        text: labels[status] || `Status changed to ${status}`,

        time: new Date().toISOString(),
      },
    ];

    await order.save();

    // 🔥 LIVE UPDATE
    // req.io.emit("order_status_updated", order);
    getIO().emit("order_status_updated", order);
    getIO().emit("dashboard_update");
    res.json(order);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to update order",
    });
  }
};

// ✅ ACCEPT ORDER
export const acceptOrder = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const vendor = await User.findById(req.userId);
    // 🔒 ONLY ACCEPT IF STILL OPEN
    const order = await Order.findOneAndUpdate(
      { _id: id, status: "open" },
      {
        status: "accepted",
        vendorId: req.userId,
        vendorName: vendor?.name,
        timeline: [
          {
            text: "✅ Order accepted",

            time: new Date().toISOString(),
          },
        ],
      },
      { new: true },
    );

    if (!order) {
      return res.status(400).json({
        error: "Order already taken",
      });
    }

    // 🔥 CREATE CRM LEAD
    const existingLead = await Lead.findOne({
      leadId: order._id.toString(),
    });

    if (!existingLead) {
      await Lead.create({
        name: order.customerName,

        phone: order.phone,

        cakeType: order.cakeType,

        size: order.size,

        budget: order.budget,

        location: order.location,

        date: order.date,

        userId: req.userId,

        stage: "Converted",

        leadId: order._id.toString(),
      });
    }

    // 🔔 CREATE NOTIFICATION
    if (order.customerId) {
      const notification = await Notification.create({
        userId: order.customerId,

        title: "Order Accepted",

        message: `${vendor?.name} accepted your cake order 🎂`,

        type: "order",
      });

      getIO().emit("new_notification", notification);
      getIO().emit("dashboard_update");
    }

    // 💬 OPTIONAL: notify customer in chat
    await Message.create({
      leadId: order.chatId,
      text: "✅ Your order has been accepted by a vendor. We’ll start preparing your cake 🎂",
      from: "agent",
      status: "sent",
    });

    // 🔥 LIVE CUSTOMER UPDATE
    getIO().emit("order_status_updated", order);

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Accept failed" });
  }
};
