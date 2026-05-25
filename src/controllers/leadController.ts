import { Response } from "express";
import Lead from "../models/Lead";
import { Stage } from "../types";
import { AuthRequest } from "../middleware/auth";

// ✅ GET LEADS
export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const leads = await Lead.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(leads);
  } catch {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

// ✅ CREATE LEAD
export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      userId: req.userId,
    });

    res.json(lead);
  } catch {
    res.status(500).json({ error: "Failed to create lead" });
  }
};

// ✅ UPDATE STAGE
export const updateLeadStage = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { stage } = req.body as { stage: Stage };

  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { stage },
      { new: true }
    );

    res.json(lead);
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};

// ✅ FULL UPDATE (EDIT LEAD)
export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    res.json(lead);
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};

// ✅ DELETE LEAD
export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
};