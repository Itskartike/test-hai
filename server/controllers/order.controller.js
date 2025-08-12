const {
  Order,
  OrderItem,
  User,
  Restaurant,
  MenuItem,
  Coupon,
} = require("../models");
const Joi = require("joi");

// Validation schemas
const createOrderSchema = Joi.object({
  restaurant_id: Joi.number().integer().positive().required(),
  items: Joi.array()
    .items(
      Joi.object({
        menu_item_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  coupon_id: Joi.number().integer().positive().optional(),
  delivery_address: Joi.string().min(10).required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "cancelled"
    )
    .required(),
});

class OrderController {
  // Create new order
  async createOrder(req, res) {
    try {
      // Validate request body
      const { error, value } = createOrderSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { restaurant_id, items, coupon_id, delivery_address } = value;

      // Check if restaurant exists and is active
      const restaurant = await Restaurant.findOne({
        where: { id: restaurant_id, status: "active" },
      });

      if (!restaurant) {
        return res
          .status(404)
          .json({ message: "Restaurant not found or inactive" });
      }

      // Validate menu items and calculate total
      let totalPrice = 0;
      const validatedItems = [];

      for (const item of items) {
        const menuItem = await MenuItem.findOne({
          where: { id: item.menu_item_id, restaurant_id },
        });

        if (!menuItem) {
          return res.status(400).json({
            message: `Menu item with ID ${item.menu_item_id} not found`,
          });
        }

        const itemTotal = parseFloat(menuItem.price) * item.quantity;
        totalPrice += itemTotal;

        validatedItems.push({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: menuItem.price,
          item_total: itemTotal,
        });
      }

      // Apply coupon if provided
      let discountAmount = 0;
      if (coupon_id) {
        const coupon = await Coupon.findOne({
          where: { id: coupon_id, is_active: true },
        });

        if (coupon) {
          if (coupon.discount_type === "percentage") {
            discountAmount = (totalPrice * coupon.discount_value) / 100;
          } else if (coupon.discount_type === "fixed") {
            discountAmount = parseFloat(coupon.discount_value);
          }
          totalPrice -= discountAmount;
        }
      }

      // Create order
      const order = await Order.create({
        user_id: req.user.id,
        restaurant_id,
        status: "pending",
        total_price: totalPrice.toFixed(2),
        timestamp: new Date(),
        coupon_id: coupon_id || null,
        delivery_address,
      });

      // Create order items
      const orderItems = await Promise.all(
        validatedItems.map((item) =>
          OrderItem.create({
            order_id: order.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price: item.price,
          })
        )
      );

      // Fetch complete order with associations
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Restaurant,
            as: "restaurant",
            attributes: ["id", "name", "address"],
          },
          {
            model: OrderItem,
            as: "orderItems",
            include: [
              {
                model: MenuItem,
                as: "menuItem",
                attributes: ["id", "name", "price", "image"],
              },
            ],
          },
          {
            model: Coupon,
            as: "coupon",
            attributes: ["id", "code", "discount_value", "discount_type"],
          },
        ],
      });

      res.status(201).json({
        message: "Order created successfully",
        order: completeOrder,
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get user's orders
  async getUserOrders(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { user_id: req.user.id };
      if (status) {
        whereClause.status = status;
      }

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Restaurant,
            as: "restaurant",
            attributes: ["id", "name", "address", "image"],
          },
          {
            model: OrderItem,
            as: "orderItems",
            include: [
              {
                model: MenuItem,
                as: "menuItem",
                attributes: ["id", "name", "price", "image"],
              },
            ],
          },
        ],
        order: [["timestamp", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        orders: orders.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(orders.count / limit),
          totalOrders: orders.count,
          hasNext: page * limit < orders.count,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get user orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get specific order by ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findOne({
        where: { id, user_id: req.user.id },
        include: [
          {
            model: Restaurant,
            as: "restaurant",
            attributes: ["id", "name", "address", "image", "phone"],
          },
          {
            model: OrderItem,
            as: "orderItems",
            include: [
              {
                model: MenuItem,
                as: "menuItem",
                attributes: ["id", "name", "price", "image", "description"],
              },
            ],
          },
          {
            model: Coupon,
            as: "coupon",
            attributes: ["id", "code", "discount_value", "discount_type"],
          },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Get order by ID error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Update order status (for restaurant owners)
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { error, value } = updateStatusSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { status } = value;

      // Find order and verify restaurant ownership
      const order = await Order.findOne({
        where: { id: orderId },
        include: [
          {
            model: Restaurant,
            as: "restaurant",
            where: { user_id: req.user.id },
          },
        ],
      });

      if (!order) {
        return res.status(404).json({
          message: "Order not found or you don't have permission to update it",
        });
      }

      // Update order status
      await order.update({ status });

      // Fetch updated order with full details
      const updatedOrder = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "phone"],
          },
          {
            model: Restaurant,
            as: "restaurant",
            attributes: ["id", "name"],
          },
          {
            model: OrderItem,
            as: "orderItems",
            include: [
              {
                model: MenuItem,
                as: "menuItem",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });

      res.json({
        message: "Order status updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get restaurant orders (for restaurant owners)
  async getRestaurantOrders(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      // Find restaurant owned by current user
      const restaurant = await Restaurant.findOne({
        where: { user_id: req.user.id },
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const whereClause = { restaurant_id: restaurant.id };
      if (status) {
        whereClause.status = status;
      }

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "phone"],
          },
          {
            model: OrderItem,
            as: "orderItems",
            include: [
              {
                model: MenuItem,
                as: "menuItem",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
        order: [["timestamp", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        orders: orders.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(orders.count / limit),
          totalOrders: orders.count,
          hasNext: page * limit < orders.count,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get restaurant orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Cancel order (customer only, within time limit)
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findOne({
        where: { id, user_id: req.user.id },
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if order can be cancelled
      if (!["pending", "confirmed"].includes(order.status)) {
        return res.status(400).json({
          message: "Order cannot be cancelled at this stage",
        });
      }

      // Check time limit (e.g., 5 minutes after order)
      const orderTime = new Date(order.timestamp);
      const now = new Date();
      const timeDifference = (now - orderTime) / (1000 * 60); // in minutes

      if (timeDifference > 5) {
        return res.status(400).json({
          message: "Order cannot be cancelled after 5 minutes",
        });
      }

      await order.update({ status: "cancelled" });

      res.json({
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new OrderController();
