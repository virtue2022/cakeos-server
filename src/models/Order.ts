import mongoose, { Schema, Document } from "mongoose";
type TimelineEvent = {
  text: string;

  time: string;
};

export interface OrderDoc extends Document {
  customerName: string;
  phone: string;
  cakeType: string;
  size: string;

  budget: number;
  amount?: number;

  location: string;
  date: string;

  type: "marketplace" | "crm";

  status:
    | "open"
    | "accepted"
    | "completed"
    | "pending"
    | "baking"
    | "ready"
    | "delivered";

  vendorId?: string;
  vendorName?: string;
  timeline?: TimelineEvent[];
  customerId?: string;

  chatId?: string;

  leadId?: string;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    customerName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    cakeType: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: false,
    },

    budget: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,

      default: 0,
    },

    location: {
      type: String,
      required: false,
    },

    date: {
      type: String,
      required: false,
    },

    type: {
      type: String,
      enum: ["marketplace", "crm"],
      default: "marketplace",
    },

    status: {
      type: String,

      enum: [
        "open",
        "accepted",
        "completed",
        "pending",
        "baking",
        "ready",
        "delivered",
      ],

      default: "open",
    },

    vendorId: {
      type: String,
    },
    vendorName: {
      type: String,
    },
    timeline: [
      {
        text: String,

        time: String,
      },
    ],
    customerId: {
      type: String,
    },

    chatId: {
      type: String,
    },

    leadId: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model<OrderDoc>("Order", OrderSchema);
