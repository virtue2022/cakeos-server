import { Server } from "socket.io";

let io: Server;

// 🔥 TRACK CONNECTED USERS
const connectedUsers = new Map<string, string>();

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",

      methods: ["GET", "POST", "PUT"],
    },
  });

  // 🔥 CONNECTION
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ✅ USER ONLINE
    socket.on("user_online", (userId: string) => {
      connectedUsers.set(userId, socket.id);

      io.emit("online_users", Array.from(connectedUsers.keys()));
    });

    // 🔥 SEND CURRENT ONLINE USERS
    socket.on("get_online_users", () => {
      socket.emit("online_users", Array.from(connectedUsers.keys()));
    });

    // ✅ DISCONNECT
    socket.on("disconnect", () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);

          break;
        }
      }

      io.emit("online_users", Array.from(connectedUsers.keys()));

      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

// 🔥 GET SOCKET
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};

// 🔥 GET ONLINE USERS
export const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};
