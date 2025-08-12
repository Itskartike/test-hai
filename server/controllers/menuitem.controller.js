const { MenuItem, Restaurant } = require("../models");
const Joi = require("joi");

// Validation Schema
const menuItemSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().min(0).max(999999.99).required(),
  description: Joi.string().max(1000).required(),
  image: Joi.string().uri().allow("").optional(),
});

class MenuItemController {
  // Get restaurant's menu items
  async getRestaurantItems(req, res) {
    try {
      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const menuItems = await MenuItem.findAll({
        where: { restaurant_id: restaurant.id },
        order: [["name", "ASC"]],
      });

      res.json(menuItems);
    } catch (error) {
      console.error("Get menu items error:", error);
      res.status(500).json({ message: "Error fetching menu items" });
    }
  }

  // Add new menu item
  async addItem(req, res) {
    try {
      const { error, value } = menuItemSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const menuItem = await MenuItem.create({
        ...value,
        restaurant_id: restaurant.id,
      });

      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Add menu item error:", error);
      res.status(500).json({ message: "Error adding menu item" });
    }
  }

  // Update menu item
  async updateItem(req, res) {
    try {
      const { error, value } = menuItemSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const menuItem = await MenuItem.findOne({
        where: {
          id: req.params.id,
          restaurant_id: restaurant.id,
        },
      });

      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      await menuItem.update(value);
      res.json(menuItem);
    } catch (error) {
      console.error("Update menu item error:", error);
      res.status(500).json({ message: "Error updating menu item" });
    }
  }

  // Delete menu item
  async deleteItem(req, res) {
    try {
      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const menuItem = await MenuItem.findOne({
        where: {
          id: req.params.id,
          restaurant_id: restaurant.id,
        },
      });

      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      await menuItem.destroy();
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      console.error("Delete menu item error:", error);
      res.status(500).json({ message: "Error deleting menu item" });
    }
  }

  // Get menu items by restaurant ID (public)
  async getByRestaurantId(req, res) {
    try {
      const menuItems = await MenuItem.findAll({
        where: { restaurant_id: req.params.restaurantId },
        order: [["name", "ASC"]],
      });

      res.json(menuItems);
    } catch (error) {
      console.error("Get menu items by restaurant error:", error);
      res.status(500).json({ message: "Error fetching menu items" });
    }
  }
}

module.exports = new MenuItemController();
