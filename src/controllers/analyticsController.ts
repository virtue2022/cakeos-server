import { Request, Response } from "express";
import Lead from "../models/Lead";

export const getAnalytics = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    const leads = await Lead.find({ userId });

    // ✅ TOTAL LEADS
    const totalLeads = leads.length;

    // ✅ TOTAL REVENUE (only converted)
    const totalRevenue = leads
      .filter((l) => l.stage === "Converted")
      .reduce((sum, l) => sum + (l.budget || 0), 0);

    // ✅ BY STAGE
    const byStage: Record<string, number> = {};
    leads.forEach((l) => {
      byStage[l.stage] = (byStage[l.stage] || 0) + 1;
    });

    // ✅ BY CHANNEL
    const byChannel: Record<string, number> = {};
    leads.forEach((l) => {
      const channel = l.platform || "direct";
      byChannel[channel] = (byChannel[channel] || 0) + 1;
    });

    // ✅ MONTHLY REVENUE (REAL DATA)
    const monthly: Record<string, number> = {};

    leads.forEach((l: any) => {
      if (l.stage !== "Converted") return;

      const date = new Date(l.createdAt);
      const month = date.toLocaleString("default", { month: "short" });

      monthly[month] = (monthly[month] || 0) + (l.budget || 0);
    });

    // ✅ RESPONSE
    res.json({
      totalLeads,
      totalRevenue,
      byStage,
      byChannel,
      monthly, // 🔥 NEW
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics failed" });
  }
};
