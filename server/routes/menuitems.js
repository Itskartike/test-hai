const express = require("express");
const router = express.Router();
const { MenuItem, Restaurant } = require("../models");
const {
  authenticateToken,
  authorize,
  optionalAuth,
} = require("../middleware/auth");

// GET all menu items (public)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll({
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
      ],
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET menu item by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id, {
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
      ],
    });
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET menu items by restaurant ID (public)
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll({
      where: { restaurant_id: req.params.restaurantId },
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
      ],
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new menu item (restaurant owners only)
router.post(
  "/",
  authenticateToken,
  authorize(["restaurant"]),
  async (req, res) => {
    try {
      const { restaurant_id, name, price, image, image_url, description } =
        req.body;

      // Verify the restaurant belongs to the authenticated user
      const restaurant = await Restaurant.findOne({
        where: {
          id: restaurant_id,
          user_id: req.user.id,
        },
      });

      if (!restaurant) {
        return res.status(403).json({
          message: "Not authorized to add menu items to this restaurant",
        });
      }

      const menuItem = await MenuItem.create({
        restaurant_id,
        name,
        price,
        image,
        image_url,
        description,
      });

      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Menu item creation error:", error);
      res.status(500).json({
        error: error.message,
        details: error.stack,
      });
    }
  }
);

// PUT update menu item (restaurant owners only)
router.put(
  "/:id",
  authenticateToken,
  authorize(["restaurant"]),
  async (req, res) => {
    try {
      const menuItem = await MenuItem.findByPk(req.params.id, {
        include: [
          {
            model: Restaurant,
            as: "restaurant",
          },
        ],
      });

      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      // Verify the restaurant belongs to the authenticated user
      if (menuItem.restaurant.user_id !== req.user.id) {
        return res.status(403).json({
          message: "Not authorized to update this menu item",
        });
      }

      const { restaurant_id, name, price, image, image_url, description } =
        req.body;
      await menuItem.update({
        restaurant_id,
        name,
        price,
        image,
        image_url,
        description,
      });

      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE menu item (restaurant owners only)
router.delete(
  "/:id",
  authenticateToken,
  authorize(["restaurant"]),
  async (req, res) => {
    try {
      const menuItem = await MenuItem.findByPk(req.params.id, {
        include: [
          {
            model: Restaurant,
            as: "restaurant",
          },
        ],
      });

      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      // Verify the restaurant belongs to the authenticated user
      if (menuItem.restaurant.user_id !== req.user.id) {
        return res.status(403).json({
          message: "Not authorized to delete this menu item",
        });
      }

      await menuItem.destroy();
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
