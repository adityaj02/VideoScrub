const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { authMiddleware } = require("../middleware/auth");

// GET /api/orders?email= — get orders by user email
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { email } = req.query;
    const filter = email ? { userEmail: email } : { userId: req.user.userId };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Order fetch failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/orders/count — total order count
router.get("/count", async (_req, res) => {
  try {
    const count = await Order.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Order count failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/orders — create order(s), supports bulk insert
router.post("/", authMiddleware, async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [req.body];

    // Attach userId from JWT to each row
    const enriched = rows.map((row) => ({
      ...row,
      userId: req.user.userId,
    }));

    const inserted = await Order.insertMany(enriched);
    res.status(201).json(inserted);
  } catch (err) {
    console.error("Order create failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/orders/:orderId/cancel — cancel an order
router.patch("/:orderId/cancel", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: { status: "cancelled" } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    console.error("Order cancel failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
