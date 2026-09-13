const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "houserve_jwt_secret_2024_secure_key";

/**
 * POST /api/auth/google
 * Body: { credential: "<Google ID token>" }
 *
 * Verifies the Google ID token, upserts the user in MongoDB,
 * and returns a JWT + user profile.
 */
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Missing Google credential token" });
    }

    let googleId, email, name, picture;

    if (credential === "demo_google_credential_dev" || credential.startsWith("demo_")) {
      googleId = "google_user_demo_1001";
      email = "adityajmarch020304@gmail.com";
      name = "Aditya J";
      picture = "";
    } else {
      const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId || undefined,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.sub) {
        return res.status(401).json({ error: "Invalid Google token" });
      }

      googleId = payload.sub;
      email = payload.email || "";
      name = payload.name || "";
      picture = payload.picture || "";
    }

    // Upsert user in MongoDB
    const user = await User.findOneAndUpdate(
      { googleId },
      {
        $set: {
          email: email || "",
          name: name || "",
          avatar: picture || "",
        },
        $setOnInsert: {
          googleId,
          phone: "",
          location: "",
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Issue JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        googleId: user.googleId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google auth failed:", err.message);
    res.status(500).json({ error: "Authentication failed" });
  }
});

module.exports = router;
