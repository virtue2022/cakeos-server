import { Router } from "express";
import {
  getLeads,
  createLead,
  updateLeadStage,
  updateLead,      // ✅ ADD
  deleteLead
} from "../controllers/leadController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, getLeads);
router.post("/", protect, createLead);
router.put("/:id/stage", protect, updateLeadStage);
router.put("/:id", protect, updateLead);   // ✅ ADD THIS
router.delete("/:id", protect, deleteLead);

export default router;