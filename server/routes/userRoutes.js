const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

// GET /api/users/me — get current user profile (from JWT)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      id: user._id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      phone: user.phone,
      location: user.location,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("User fetch failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/users/me — update current user profile
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.replace(/\D/g, "").slice(0, 15);
    if (location !== undefined) updates.location = location;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      id: user._id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      phone: user.phone,
      location: user.location,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("User update failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
