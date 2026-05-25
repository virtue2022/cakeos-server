import express from "express";
import { protect, adminOnly } from "../middleware/auth";
import User from "../models/User";
import Order from "../models/Order";
import { getOnlineUsers } from "../socket";

const router = express.Router();

router.get(
  "/orders",

  protect,

  adminOnly,

  async (req, res) => {
    try {
      const orders = await Order.find().sort({
        createdAt: -1,
      });

      res.json(orders);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch orders",
      });
    }
  },
);

router.get(
  "/customers",

  protect,

  adminOnly,

  async (req, res) => {
    try {
      const customers = await User.find({
        role: "customer",
      }).select("-password");

      const formattedCustomers = customers.map((customer) => ({
        id: customer._id,

        name: customer.name,

        email: customer.email,

        orders: 0,

        spent: "₦0",

        status: "Active",
      }));

      res.json(formattedCustomers);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch customers",
      });
    }
  },
);

router.get(
  "/vendors",

  protect,

  adminOnly,

  async (req, res) => {
    try {
      const vendors = await User.find({
        role: "vendor",
      }).select("-password");

      const onlineUsers = getOnlineUsers();

      // const onlineUsers = getOnlineUsers();

      const formattedVendors = await Promise.all(
        vendors.map(async (vendor) => {
          // 🔥 vendor orders
          const vendorOrders = await Order.find({
            vendorId: vendor._id.toString(),
          });

          // 🔥 total revenue
          const totalRevenue = vendorOrders.reduce(
            (sum, order) => sum + (order.budget || 0),
            0,
          );

          return {
            id: vendor._id,

            business: vendor.name,

            email: vendor.email,

            orders: vendorOrders.length,

            revenue: `₦${totalRevenue.toLocaleString()}`,

            // 🔥 ONLINE STATUS
            online: onlineUsers.includes(vendor._id.toString()),

            status:
              vendor.vendorStatus === "approved"
                ? "Active"
                : vendor.vendorStatus === "suspended"
                  ? "Blocked"
                  : "Pending",
          };
        }),
      );

      res.json(formattedVendors);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch vendors",
      });
    }
  },
);

router.get(
  "/analytics",

  protect,

  adminOnly,

  async (req, res) => {
    try {
      const customers = await User.countDocuments({
        role: "customer",
      });

      const vendors = await User.countDocuments({
        role: "vendor",
      });

      const totalUsers = await User.countDocuments();

      const totalOrders = await Order.countDocuments();

      const orders = await Order.find();

      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.budget || 0),
        0,
      );

      // 📈 REVENUE CHART DATA
      const revenueChart = await Order.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",

                date: "$createdAt",
              },
            },

            revenue: {
              $sum: "$budget",
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      // 📈 CUSTOMER GROWTH
      const customerGrowth = await User.aggregate([
        {
          $match: {
            role: "customer",
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",

                date: "$createdAt",
              },
            },

            customers: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      // 🏆 TOP VENDORS
      const topVendors = await Order.aggregate([
        {
          $match: {
            vendorName: {
              $exists: true,
            },
          },
        },

        {
          $group: {
            _id: "$vendorName",

            revenue: {
              $sum: "$budget",
            },

            orders: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            revenue: -1,
          },
        },

        {
          $limit: 5,
        },
      ]);
      // 📊 LIVE METRICS
      const openOrders = await Order.countDocuments({
        status: "open",
      });

      const activeOrders = await Order.countDocuments({
        status: {
          $in: ["accepted", "baking", "ready"],
        },
      });

      const deliveredOrders = await Order.countDocuments({
        status: "delivered",
      });

      const activeVendors = await User.countDocuments({
        role: "vendor",

        vendorStatus: "approved",
      });
      res.json({
        revenue: `₦${totalRevenue.toLocaleString()}`,

        orders: totalOrders,

        customers,

        vendors,

        users: totalUsers,

        recentOrders: orders,

        revenueChart,

        customerGrowth,

        topVendors,
        openOrders,

        activeOrders,

        deliveredOrders,

        activeVendors,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch analytics",
      });
    }
  },
);

router.patch(
  "/vendors/:id/approve",

  protect,

  adminOnly,

  async (req, res) => {
    try {
      const vendor = await User.findByIdAndUpdate(
        req.params.id,

        {
          vendorStatus: "approved",
        },

        {
          new: true,
        },
      );

      res.json({
        message: "Vendor approved",

        vendor,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to approve vendor",
      });
    }
  },
);

router.patch(
  "/vendors/:id/suspend",

  protect,

  adminOnly,

  async (req, res) => {
    try {
      const vendor = await User.findByIdAndUpdate(
        req.params.id,

        {
          vendorStatus: "suspended",
        },

        {
          new: true,
        },
      );

      res.json({
        message: "Vendor suspended",

        vendor,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to suspend vendor",
      });
    }
  },
);

export default router;
