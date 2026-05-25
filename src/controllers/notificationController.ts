import { Request, Response } from "express";
import Notification from "../models/Notification";

// ✅ GET MY NOTIFICATIONS
export const getNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await Notification.find({
      userId: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch notifications",
    });
  }
};

// ✅ MARK AS READ
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      {
        returnDocument: "after",
      },
    );

    res.json(notification);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to update notification",
    });
  }
};
