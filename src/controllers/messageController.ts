import { Request, Response } from "express";

import Message from "../models/Message";
import Order from "../models/Order";

// ✅ GET SINGLE CHAT
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;

    const messages = await Message.find({
      leadId,
    }).sort({
      createdAt: 1,
    });

    res.json(messages);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to load messages",
    });
  }
};

// ✅ GET VENDOR CHAT LIST
export const getVendorChats = async (req: any, res: Response) => {
  try {
    const vendorId = req.userId;

    const chats = await Order.find({
      vendorId,
      chatId: {
        $exists: true,
      },
    }).sort({
      updatedAt: -1,
    });

    res.json(chats);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to load chats",
    });
  }
};

// ✅ SEND MESSAGE
export const sendMessage = async (req: any, res: Response) => {
  try {
    const { leadId, text, from } = req.body;

    const message = await Message.create({
      leadId,
      text,
      from,
      status: "sent",
    });

    // 🔥 REALTIME
    req.io.emit("receive_message", message);

    res.json(message);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to send message",
    });
  }
};
