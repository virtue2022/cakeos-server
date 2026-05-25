import mongoose, { Schema, Document } from "mongoose";

export interface MessageDoc extends Document {
  leadId: string;
  text: string;
  from: "agent" | "customer";
  status: "sent" | "delivered" | "read"; // ✅ ADD THIS
  createdAt?: Date;
  updatedAt?: Date;
}

const MessageSchema = new Schema<MessageDoc>(
  {
    leadId: { type: String, required: true },

    text: { type: String, required: true },

    from: {
      type: String,
      enum: ["agent", "customer"],
      required: true,
    },

    // ✅ ADD THIS
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

export default mongoose.model<MessageDoc>("Message", MessageSchema);