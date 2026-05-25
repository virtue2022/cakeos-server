import { Response } from "express";

import Lead from "../models/Lead";
import Order from "../models/Order";
import Message from "../models/Message";

export const getDashboardStats = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    const totalLeads = await Lead.countDocuments({
      userId,
    });

    const convertedLeads = await Lead.countDocuments({
      userId,
      stage: "Converted",
    });

    const activeOrders = await Order.countDocuments({
      vendorId: userId,
      status: {
        $nin: ["completed", "delivered"],
      },
    });

    // ✅ GET VENDOR CHAT IDS
    const vendorOrders = await Order.find({
      vendorId: userId,
    }).select("chatId");

    // ✅ EXTRACT CHAT IDS
    const vendorChatIds = vendorOrders
      .map((o) => o.chatId)
      .filter((id): id is string => Boolean(id));

    // ✅ COUNT ONLY VENDOR CUSTOMER MESSAGES
    const unreadMessages = await Message.countDocuments({
      leadId: {
        $in: vendorChatIds,
      },

      from: "customer",

      status: {
        $ne: "read",
      },
    });

    const revenueData = await Order.find({
      vendorId: userId,
    });

    const totalRevenue = revenueData.reduce(
      (sum, order) => sum + (order.budget || 0),
      0,
    );

    res.json({
      totalLeads,
      convertedLeads,
      activeOrders,
      unreadMessages,
      totalRevenue,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to load dashboard stats",
    });
  }
};
