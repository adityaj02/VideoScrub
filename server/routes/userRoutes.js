const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
    console.log("---- REQUEST RECEIVED ----");
    console.log("BODY:", req.body);

    try {
        const { supabaseId, email, name, phone } = req.body;

        if (!supabaseId || !email) {
            console.log("Missing required fields");
            return res.status(400).json({ error: "Missing required fields" });
        }

        let user = await User.findOne({ supabaseId });

        if (user) {
            console.log("Updating existing user");
            user.name = name;
            user.phone = phone;
            await user.save();
        } else {
            console.log("Creating new user");
            user = await User.create({
                supabaseId,
                email,
                name,
                phone
            });
        }

        console.log("Success");
        res.json(user);

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
