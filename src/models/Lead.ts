import mongoose, { Document, Schema } from "mongoose";
import { Stage } from "../types";

// ✅ DEFINE DOCUMENT TYPE PROPERLY
export interface LeadDocument extends Document {
  name: string;
  phone: string;
  event: string;
  budget: number;
  stage: Stage;
  source?: string;
  platform?: string;
  userId: string;
  leadId?: string;

  // 🔥 ADD THESE (THIS FIXES YOUR ERROR)
  cakeType?: string;
  size?: string;
  date?: string;
  location?: string;
}

const LeadSchema = new Schema<LeadDocument>(
  {
    name: { type: String, required: true },
    phone: String,
    event: String,
    budget: Number,
    cakeType: { type: String },
    size: { type: String },
    date: { type: String },
    location: { type: String },

    stage: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Interested",
        "Negotiation",
        "Converted",
        "Lost",
      ],
      default: "New",
    },

    source: String,
    platform: String,

    // 🔥 ADD THIS (CRITICAL)
    userId: { type: String, required: true },
    leadId: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<LeadDocument>("Lead", LeadSchema);
