"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MenuItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // MenuItem belongs to Restaurant
      MenuItem.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });

      // MenuItem has many OrderItems
      MenuItem.hasMany(models.OrderItem, {
        foreignKey: "item_id",
        as: "orderItems",
      });
    }
  }
  MenuItem.init(
    {
      restaurant_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      price: DataTypes.DECIMAL,
      image: DataTypes.TEXT,
      image_url: DataTypes.TEXT,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "MenuItem",
      tableName: "MenuItems",
      timestamps: false,
    }
  );
  return MenuItem;
};
