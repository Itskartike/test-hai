const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Restaurant } = require("../models");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "fallback-secret-key",
    { expiresIn: "24h" }
  );
};

// Remove sensitive data from user object
const sanitizeUser = (user) => {
  const { password_hash, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

const authController = {
  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      // Generate token
      const token = generateToken(user);

      // Get restaurant info if user is a restaurant owner
      let restaurant = null;
      if (user.role === "restaurant") {
        restaurant = await Restaurant.findOne({ where: { user_id: user.id } });
      }

      res.json({
        message: "Login successful",
        user: sanitizeUser(user),
        restaurant,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Register
  register: async (req, res) => {
    try {
      const { name, email, password, role = "customer", phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email, and password are required",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({
        name,
        email,
        password_hash,
        role,
        phone,
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: "User registered successfully",
        user: sanitizeUser(user),
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = req.user; // Set by auth middleware

      // Get restaurant info if user is a restaurant owner
      let restaurant = null;
      if (user.role === "restaurant") {
        restaurant = await Restaurant.findOne({ where: { user_id: user.id } });
      }

      res.json({
        user: sanitizeUser(user),
        restaurant,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const user = req.user;
      const { name, phone, image_url } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (image_url !== undefined) updateData.image_url = image_url;

      await user.update(updateData);

      res.json({
        message: "Profile updated successfully",
        user: sanitizeUser(user),
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Logout (mainly for client-side cleanup)
  logout: (req, res) => {
    res.json({
      message: "Logged out successfully",
    });
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const user = req.user;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "Current password and new password are required",
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      await user.update({ password_hash });

      res.json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = authController;
