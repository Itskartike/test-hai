"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Order belongs to User
      Order.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      // Order belongs to Restaurant
      Order.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });

      // Order belongs to Coupon
      Order.belongsTo(models.Coupon, {
        foreignKey: "coupon_id",
        as: "coupon",
      });

      // Order has many OrderItems
      Order.hasMany(models.OrderItem, {
        foreignKey: "order_id",
        as: "orderItems",
      });

      // Order has one Payment
      Order.hasOne(models.Payment, {
        foreignKey: "order_id",
        as: "payment",
      });
    }
  }
  Order.init(
    {
      user_id: DataTypes.INTEGER,
      restaurant_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      total_price: DataTypes.DECIMAL,
      timestamp: DataTypes.DATE,
      coupon_id: DataTypes.INTEGER,
      delivery_address: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Orders",
      timestamps: false,
    }
  );
  return Order;
};
