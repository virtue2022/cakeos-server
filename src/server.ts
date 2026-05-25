import dotenv from "dotenv";
dotenv.config();

import http from "http";
import bcrypt from "bcryptjs";

import app from "./app";
import { connectDB } from "./config/db";
import { initSocket } from "./socket";
import { chatSocket } from "./sockets/chatSocket";

connectDB();

const server = http.createServer(app);

// 🔥 initialize socket
const io = initSocket(server);

// 🔥 attach io to requests
app.use((req: any, _res, next) => {
  req.io = io;
  next();
});

// 🔥 chat socket handlers
chatSocket(io);

console.log(bcrypt.hashSync("123456", 10));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
