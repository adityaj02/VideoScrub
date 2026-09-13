const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "houserve_jwt_secret_2024_secure_key";

/**
 * Middleware that verifies the Bearer token from the Authorization header.
 * Attaches `req.user` = { userId, email, googleId } on success.
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      googleId: decoded.googleId,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Optional auth — attaches req.user if token is valid, but doesn't block.
 */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    const token = header.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        googleId: decoded.googleId,
      };
    } catch {
      // Token invalid — ignore, continue as unauthenticated
    }
  }

  next();
}

module.exports = { authMiddleware, optionalAuth };
