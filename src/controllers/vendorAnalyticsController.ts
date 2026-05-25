import { Request, Response } from "express";

import Order from "../models/Order";

export const getVendorAnalytics = async (
  req: Request & { user?: any },
  res: Response,
) => {
  try {
    const vendorId = req.user.id;

    // ✅ GET ALL ORDERS FOR THIS VENDOR
    let orders = await Order.find({
      vendorId,
    });

    // 🔥 FALLBACK FOR OLD ORDERS WITHOUT vendorId
    if (orders.length === 0) {
      orders = await Order.find();
    }

    console.log("TOTAL ORDERS FOUND:", orders.length);

    // ✅ TOTAL ORDERS
    const totalOrders = orders.length;

    // ✅ COMPLETED ORDERS
    const completedOrders = orders.filter(
      (order) =>
        order.status?.toLowerCase() === "completed" ||
        order.status?.toLowerCase() === "delivered",
    );

    console.log("COMPLETED ORDERS:", completedOrders.length);

    // ✅ TOTAL REVENUE
    const totalRevenue = completedOrders.reduce(
      (acc, order) => acc + Number(order.amount || order.budget || 0),
      0,
    );

    // ✅ AVG ORDER VALUE
    const averageOrder =
      completedOrders.length > 0
        ? Math.round(totalRevenue / completedOrders.length)
        : 0;

    // ✅ MONTHLY REVENUE
    const monthlyRevenueMap: Record<string, number> = {};

    completedOrders.forEach((order) => {
      const date = new Date((order as any).createdAt);

      const month = date.toLocaleString("default", {
        month: "short",
      });

      if (!monthlyRevenueMap[month]) {
        monthlyRevenueMap[month] = 0;
      }

      monthlyRevenueMap[month] += Number(order.amount || order.budget || 0);
    });

    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(
      ([month, revenue]) => ({
        month,
        revenue,
      }),
    );

    // ✅ TOP CUSTOMERS
    const customerMap: Record<
      string,
      {
        name: string;
        total: number;
      }
    > = {};

    completedOrders.forEach((order) => {
      const customerName = order.customerName || "Unknown";

      if (!customerMap[customerName]) {
        customerMap[customerName] = {
          name: customerName,
          total: 0,
        };
      }

      customerMap[customerName].total += Number(
        order.amount || order.budget || 0,
      );
    });

    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // ✅ AI SUGGESTIONS
    const aiSuggestions = topCustomers.map((customer) => ({
      text: `${customer.name} is a high-value customer — offer premium cake packages.`,
    }));

    // ✅ RESPONSE
    res.json({
      totalOrders,

      completedOrders: completedOrders.length,

      totalRevenue,

      averageOrder,

      monthlyRevenue,

      topCustomers,

      aiSuggestions,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to load analytics",
    });
  }
};
