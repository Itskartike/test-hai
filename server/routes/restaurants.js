const express = require("express");
const router = express.Router();
const { Restaurant, MenuItem, Order, OrderItem, User } = require("../models");
const {
  authenticateToken,
  authorize,
  optionalAuth,
} = require("../middleware/auth");

// GET all restaurants (public)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { limit } = req.query;
    const queryOptions = {
      where: { status: "active" },
      include: [
        {
          model: require("../models").Rating,
          as: "ratings",
          attributes: ["id", "stars"],
        },
      ],
    };

    if (limit) {
      queryOptions.limit = parseInt(limit);
    }

    const restaurants = await Restaurant.findAll(queryOptions);
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET restaurant profile for authenticated restaurant owner
router.get(
  "/profile",
  authenticateToken,
  authorize(["restaurant"]),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
        include: [
          {
            model: require("../models").Rating,
            as: "ratings",
            attributes: ["id", "stars"],
          },
        ],
      });

      if (!restaurant) {
        return res
          .status(404)
          .json({ message: "Restaurant profile not found" });
      }

      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET restaurant orders for authenticated restaurant owner
router.get(
  "/orders",
  authenticateToken,
  authorize(["restaurant"]),
  async (req, res) => {
    try {
      // First get the restaurant for this user
      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Get orders for this restaurant through menu items
      const orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            as: "orderItems",
            include: [
              {
                model: MenuItem,
                as: "menuItem",
                where: { restaurant_id: restaurant.id },
                attributes: ["id", "name", "price"],
              },
            ],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "phone"],
          },
        ],
      });

      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET restaurant by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [
        {
          model: MenuItem,
          as: "menuItems",
        },
        {
          model: require("../models").Rating,
          as: "ratings",
          attributes: ["id", "stars"],
        },
      ],
    });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new restaurant
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, address, lat, lng, image, image_url, status } = req.body;

    const restaurant = await Restaurant.create({
      user_id: req.user.id,
      name,
      address,
      lat,
      lng,
      image,
      image_url,
      status: status || "active",
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update restaurant
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if user owns this restaurant
    if (req.user.role === "restaurant" && restaurant.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this restaurant" });
    }

    const { name, address, lat, lng, image, image_url, status } = req.body;
    await restaurant.update({
      name,
      address,
      lat,
      lng,
      image,
      image_url,
      status,
    });

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE restaurant
router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin", "restaurant"]),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Check if user owns this restaurant (unless admin)
      if (
        req.user.role === "restaurant" &&
        restaurant.user_id !== req.user.id
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this restaurant" });
      }

      await restaurant.destroy();
      res.json({ message: "Restaurant deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
