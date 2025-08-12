const express = require("express");
const router = express.Router();
const { Order, OrderItem, User, Restaurant, MenuItem } = require("../models");
const {
  authenticateToken,
  authorize,
  optionalAuth,
} = require("../middleware/auth");

// GET all orders (admin only or authenticated users get their own orders)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let whereClause = {};

    // If not admin, only show user's own orders
    if (req.user.role !== "admin") {
      whereClause.user_id = req.user.id;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
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
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET order by ID (users can only see their own orders unless admin)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    let whereClause = { id: req.params.id };

    // If not admin, only show user's own orders
    if (req.user.role !== "admin") {
      whereClause.user_id = req.user.id;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
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
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new order (authenticated customers only)
router.post(
  "/",
  authenticateToken,
  authorize(["customer"]),
  async (req, res) => {
    try {
      const { restaurant_id, items, delivery_address, total_amount } = req.body;

      // Create the order
      const order = await Order.create({
        user_id: req.user.id,
        restaurant_id,
        delivery_address,
        total_amount,
        status: "pending",
      });

      // Create order items
      if (items && items.length > 0) {
        const orderItems = items.map((item) => ({
          order_id: order.id,
          item_id: item.item_id,
          quantity: item.quantity,
          price: item.price,
        }));

        await OrderItem.bulkCreate(orderItems);
      }

      // Fetch the complete order with includes
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
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
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });

      res.status(201).json(completeOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT update order status (restaurant owners and admins only)
router.put(
  "/:id/status",
  authenticateToken,
  authorize(["restaurant", "admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByPk(req.params.id, {
        include: [
          {
            model: Restaurant,
            as: "restaurant",
          },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // If restaurant role, check if they own the restaurant
      if (
        req.user.role === "restaurant" &&
        order.restaurant.user_id !== req.user.id
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this order" });
      }

      await order.update({ status });

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT update order (users can only update their own orders)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    let whereClause = { id: req.params.id };

    // If not admin, only allow updating user's own orders
    if (req.user.role !== "admin") {
      whereClause.user_id = req.user.id;
    }

    const order = await Order.findOne({ where: whereClause });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { delivery_address, status } = req.body;

    // Customers can only update delivery_address, not status
    const updateData = {};
    if (delivery_address) updateData.delivery_address = delivery_address;
    if (status && req.user.role === "admin") updateData.status = status;

    await order.update(updateData);

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE order (users can only delete their own orders, admins can delete any)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    let whereClause = { id: req.params.id };

    // If not admin, only allow deleting user's own orders
    if (req.user.role !== "admin") {
      whereClause.user_id = req.user.id;
    }

    const order = await Order.findOne({ where: whereClause });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.destroy();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
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
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
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
              attributes: ["id", "name", "price", "description"],
            },
          ],
        },
      ],
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new order
router.post("/", async (req, res) => {
  try {
    const { user_id, restaurant_id, items, total_price, status } = req.body;

    // Create the order
    const order = await Order.create({
      user_id,
      restaurant_id,
      total_price,
      status: status || "placed",
      timestamp: new Date(),
    });

    // Create order items
    if (items && items.length > 0) {
      const orderItems = items.map((item) => ({
        order_id: order.id,
        item_id: item.item_id,
        quantity: item.quantity,
      }));

      await OrderItem.bulkCreate(orderItems);
    }

    // Fetch the complete order with relationships
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
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
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update order status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.update({ status });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.destroy();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
