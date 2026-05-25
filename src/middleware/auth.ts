import type { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;

  role?: string;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;

      role: string;
    };

    req.userId = decoded.id;

    req.role = decoded.role;

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.role !== "admin") {
    return res.status(403).json({
      error: "Admin access only",
    });
  }

  next();
};

export const vendorOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.role !== "vendor") {
    return res.status(403).json({
      error: "Vendor access only",
    });
  }

  next();
};
