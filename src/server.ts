import dotenv from "dotenv";
dotenv.config();

import http from "http";
import bcrypt from "bcryptjs";

import app from "./app";
import { connectDB } from "./config/db";
import { initSocket } from "./socket";
import { chatSocket } from "./sockets/chatSocket";

connectDB();

// 🔥 CREATE HTTP SERVER
const server = http.createServer(app);

// 🔥 INITIALIZE SOCKET.IO
const io = initSocket(server);

// 🔥 ATTACH IO TO REQUESTS
app.use((req: any, _res, next) => {
  req.io = io;
  next();
});

// 🔥 CHAT SOCKET HANDLERS
chatSocket(io);

console.log(bcrypt.hashSync("123456", 10));

const PORT = process.env.PORT || 5000;

// 🔥 IMPORTANT: USE server.listen NOT app.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
