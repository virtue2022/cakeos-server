import { Router } from "express";

import Notification from "../models/Notification";

import { protect } from "../middleware/auth";

const router = Router();

// ✅ GET MY NOTIFICATIONS
router.get("/", protect, async (req: any, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.userId }, { type: "admin" }],
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
});

// ✅ MARK AS READ
router.patch("/:id/read", protect, async (req, res) => {
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
});

export default router;
