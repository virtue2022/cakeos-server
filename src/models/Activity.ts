import mongoose, { Document, Schema } from "mongoose";

export interface ActivityDoc extends Document {
  title: string;

  message: string;

  type: "order" | "vendor" | "customer" | "message" | "system";

  createdAt: Date;
}

const ActivitySchema = new Schema<ActivityDoc>(
  {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["order", "vendor", "customer", "message", "system"],

      default: "system",
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model<ActivityDoc>("Activity", ActivitySchema);
