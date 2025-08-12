const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticateToken, checkRole } = require("../middleware/auth");

// Customer routes (protected)
router.post(
  "/",
  authenticateToken,
  checkRole(["customer"]),
  orderController.createOrder
);
router.get(
  "/",
  authenticateToken,
  checkRole(["customer"]),
  orderController.getUserOrders
);
router.get(
  "/:id",
  authenticateToken,
  checkRole(["customer"]),
  orderController.getOrderById
);
router.put(
  "/:id/cancel",
  authenticateToken,
  checkRole(["customer"]),
  orderController.cancelOrder
);

// Restaurant owner routes (protected)
router.get(
  "/restaurant",
  authenticateToken,
  checkRole(["restaurant"]),
  orderController.getRestaurantOrders
);
router.put(
  "/:orderId/status",
  authenticateToken,
  checkRole(["restaurant"]),
  orderController.updateOrderStatus
);

module.exports = router;
