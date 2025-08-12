const {
  Restaurant,
  MenuItem,
  Rating,
  User,
  Order,
  OrderItem,
} = require("../models");
const { Op } = require("sequelize");
const Joi = require("joi");

// Validation Schemas
const restaurantProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().required(),
  phone: Joi.string()
    .pattern(/^\+?([0-9]{10,15})$/)
    .required(),
  image: Joi.string().uri().allow("").optional(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

const menuItemSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().min(0).max(999999.99).required(),
  description: Joi.string().max(1000).required(),
  image: Joi.string().uri().allow("").optional(),
});

class RestaurantController {
  // Get restaurant profile
  async getProfile(req, res) {
    try {
      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
        include: [
          {
            model: Rating,
            as: "ratings",
            attributes: ["stars"],
          },
        ],
      });

      if (!restaurant) {
        return res
          .status(404)
          .json({ message: "Restaurant profile not found" });
      }

      // Calculate average rating
      const ratings = restaurant.ratings.map((r) => r.stars);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b) / ratings.length
          : 0;

      const profile = {
        ...restaurant.toJSON(),
        rating: avgRating,
        ratings_count: ratings.length,
      };
      delete profile.ratings; // Remove the ratings array

      res.json(profile);
    } catch (error) {
      console.error("Get restaurant profile error:", error);
      res.status(500).json({ message: "Error fetching restaurant profile" });
    }
  }

  // Update restaurant profile
  async updateProfile(req, res) {
    try {
      // Validate request body
      const { error, value } = restaurantProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
      });

      if (!restaurant) {
        return res
          .status(404)
          .json({ message: "Restaurant profile not found" });
      }

      await restaurant.update(value);
      res.json(restaurant);
    } catch (error) {
      console.error("Update restaurant profile error:", error);
      res.status(500).json({ message: "Error updating restaurant profile" });
    }
  }

  // Get restaurant by ID (public)
  async getById(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [
          {
            model: MenuItem,
            as: "menuItems",
          },
          {
            model: Rating,
            as: "ratings",
            attributes: ["stars"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Calculate average rating
      const ratings = restaurant.ratings.map((r) => r.stars);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b) / ratings.length
          : 0;

      const restaurantData = {
        ...restaurant.toJSON(),
        rating: avgRating,
        ratings_count: ratings.length,
      };

      res.json(restaurantData);
    } catch (error) {
      console.error("Get restaurant by ID error:", error);
      res.status(500).json({ message: "Error fetching restaurant" });
    }
  }

  // Search restaurants
  async search(req, res) {
    try {
      const { search, sort, lat, lng, page = 1, limit = 10 } = req.query;

      let order = [];
      switch (sort) {
        case "rating":
          // Will be handled after fetching
          break;
        case "name":
          order.push(["name", "ASC"]);
          break;
        case "distance":
          // Will be handled if coordinates provided
          break;
      }

      let where = { status: "active" };
      if (search) {
        where = {
          ...where,
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { address: { [Op.iLike]: `%${search}%` } },
          ],
        };
      }

      const restaurants = await Restaurant.findAll({
        where,
        include: [
          {
            model: Rating,
            as: "ratings",
            attributes: ["stars"],
          },
        ],
        order,
        offset: (page - 1) * limit,
        limit,
      });

      // Process restaurants to include ratings and distance
      const processedRestaurants = restaurants.map((restaurant) => {
        const ratings = restaurant.ratings.map((r) => r.stars);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b) / ratings.length
            : 0;

        let distance = null;
        if (lat && lng) {
          distance = calculateDistance(
            lat,
            lng,
            restaurant.lat,
            restaurant.lng
          );
        }

        const result = {
          ...restaurant.toJSON(),
          rating: avgRating,
          ratings_count: ratings.length,
        };
        delete result.ratings;

        if (distance !== null) {
          result.distance = distance;
        }

        return result;
      });

      // Sort by rating if requested
      if (sort === "rating") {
        processedRestaurants.sort((a, b) => b.rating - a.rating);
      }
      // Sort by distance if coordinates provided and sort by distance requested
      else if (sort === "distance" && lat && lng) {
        processedRestaurants.sort((a, b) => a.distance - b.distance);
      }

      res.json(processedRestaurants);
    } catch (error) {
      console.error("Search restaurants error:", error);
      res.status(500).json({ message: "Error searching restaurants" });
    }
  }

  // Get restaurant orders
  async getOrders(req, res) {
    try {
      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const orders = await Order.findAll({
        where: { restaurant_id: restaurant.id },
        include: [
          {
            model: OrderItem,
            as: "orderItems",
            include: [
              {
                model: MenuItem,
                as: "menuItem",
              },
            ],
          },
          {
            model: User,
            as: "user",
            attributes: ["name", "email", "phone"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json(orders);
    } catch (error) {
      console.error("Get restaurant orders error:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  }

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const { orderId } = req.params;

      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const order = await Order.findOne({
        where: {
          id: orderId,
          restaurant_id: restaurant.id,
        },
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const validStatuses = [
        "pending",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await order.update({ status });
      res.json(order);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Error updating order status" });
    }
  }
}

// Utility function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

module.exports = new RestaurantController();
