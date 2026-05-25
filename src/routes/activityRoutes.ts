import { Router } from "express";

import Activity from "../models/Activity";

import { protect, adminOnly } from "../middleware/auth";

const router = Router();

// ✅ GET ACTIVITIES
router.get("/", protect, adminOnly, async (_req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(20);

    res.json(activities);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch activities",
    });
  }
});

export default router;
