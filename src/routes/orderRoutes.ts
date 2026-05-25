import { Router } from "express";
import {
  createOrder,
  getOrders,
  getMyOrders,
  acceptOrder,
  updateOrderStatus,
  createOrderFromLead,
  getCustomerOrders,
} from "../controllers/orderController";
import { protect } from "../middleware/auth";

const router = Router();

// public
router.post("/", protect, createOrder);
router.post("/from-lead/:id", protect, createOrderFromLead);

// vendor only
router.get("/", protect, getOrders);
router.put("/:id/accept", protect, acceptOrder);
router.get("/mine", protect, getMyOrders);
router.get("/customer", protect, getCustomerOrders);
router.put("/:id/status", protect, updateOrderStatus);

export default router;
