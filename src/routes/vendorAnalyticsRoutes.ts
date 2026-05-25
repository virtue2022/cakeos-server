import express from "express";
import { protect } from "../middleware/auth";

import { getVendorAnalytics } from "../controllers/vendorAnalyticsController";

const router = express.Router();

router.get("/", protect, getVendorAnalytics);

export default router;
