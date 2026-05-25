import { Request, Response } from "express";
import axios from "axios";

export const initializePayment = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: 500000, // ₦5,000 (kobo)
        callback_url: "http://localhost:5173/payment-success",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.data);
  } catch (err) {
    res.status(500).json({ error: "Payment init failed" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );

    res.json(response.data.data);
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
};