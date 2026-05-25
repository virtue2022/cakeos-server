import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

// const signToken = (id: string) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET as string, {
//     expiresIn: "7d",
//   });
// };

const signToken = (id: string, role: string) => {
  return jwt.sign(
    {
      id,
      role,
    },

    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    },
  );
};

// ✅ REGISTER
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    const token = signToken(user._id.toString(), user.role);

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// ✅ LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 🚫 BLOCK PENDING/SUSPENDED VENDORS
    if (user.role === "vendor") {
      if (user.vendorStatus === "pending") {
        return res.status(403).json({
          error: "Your vendor account is awaiting admin approval.",
        });
      }

      if (user.vendorStatus === "suspended") {
        return res.status(403).json({
          error: "Your vendor account has been suspended.",
        });
      }
    }

    const token = signToken(user._id.toString(), user.role);

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
