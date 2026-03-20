const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const { supabaseId, email, name, phone } = req.body;

    if (!supabaseId || !email) {
      return res.status(400).json({ error: "Missing required fields: supabaseId and email" });
    }

    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedPhone = typeof phone === "string" ? phone.replace(/\D/g, "").slice(0, 15) : "";

    const user = await User.findOneAndUpdate(
      { supabaseId },
      {
        $set: {
          email,
          name: normalizedName,
          phone: normalizedPhone,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json(user);
  } catch (err) {
    console.error("User upsert failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:supabaseId", async (req, res) => {
  try {
    const { supabaseId } = req.params;
    const user = await User.findOne({ supabaseId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("User fetch failed:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
