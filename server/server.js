const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    message: "GlobalEats API is running!",
    timestamp: new Date().toISOString(),
    status: "OK",
  });
});

// Test database connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const { sequelize } = require("./models");
    await sequelize.authenticate();
    res.json({
      message: "Database connection successful!",
      status: "OK",
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed!",
      error: error.message,
      status: "ERROR",
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);

// Only start the server if we're not testing
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`� Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
    console.log(`🍕 Restaurants API: http://localhost:${PORT}/api/restaurants`);
    console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
  });
}

module.exports = app;
