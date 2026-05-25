import mongoose, { Document, Schema } from "mongoose";

export interface NotificationDoc extends Document {
  userId?: string;

  title: string;

  message: string;

  type: "order" | "chat" | "system" | "admin";

  read: boolean;
}

const NotificationSchema = new Schema<NotificationDoc>(
  {
    userId: {
      type: String,

      required: false,
    },

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

      enum: ["order", "chat", "system", "admin"],

      default: "system",
    },

    read: {
      type: Boolean,

      default: false,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model<NotificationDoc>(
  "Notification",
  NotificationSchema,
);
