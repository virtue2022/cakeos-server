import mongoose, { Document, Schema } from "mongoose";

export interface UserDoc extends Document {
  name: string;

  email: string;

  password: string;

  plan: "free" | "pro";

  role: "vendor" | "customer" | "admin";
  vendorStatus?: "pending" | "approved" | "suspended";
}

const UserSchema = new Schema<UserDoc>(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      default: "free",
    },

    role: {
      type: String,

      enum: ["vendor", "customer", "admin"],

      default: "customer",
    },
    vendorStatus: {
      type: String,

      enum: ["pending", "approved", "suspended"],

      default: "pending",
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model<UserDoc>("User", UserSchema);
