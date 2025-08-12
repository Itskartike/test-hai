const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    );
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Invalid token - user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        message: "Token expired",
      });
    }
    return res.status(500).json({
      message: "Token verification failed",
      error: error.message,
    });
  }
};

// Middleware to check if user has required role
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret-key"
      );
      const user = await User.findByPk(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  optionalAuth,
};
