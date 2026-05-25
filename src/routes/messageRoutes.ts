import { Router } from "express";

import {
  getMessages,
  getVendorChats,
  sendMessage,
} from "../controllers/messageController";

import { protect } from "../middleware/auth";

const router = Router();

// ✅ GET ALL VENDOR CHATS
router.get("/vendor", protect, getVendorChats);

// ✅ GET CHAT MESSAGES
router.get("/:leadId", protect, getMessages);

// ✅ SEND MESSAGE
router.post("/", protect, sendMessage);

export default router;
