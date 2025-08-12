"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Restaurant has many MenuItems
      Restaurant.hasMany(models.MenuItem, {
        foreignKey: "restaurant_id",
        as: "menuItems",
      });

      // Restaurant has many Orders
      Restaurant.hasMany(models.Order, {
        foreignKey: "restaurant_id",
        as: "orders",
      });

      // Restaurant has many Ratings
      Restaurant.hasMany(models.Rating, {
        foreignKey: "restaurant_id",
        as: "ratings",
      });
    }
  }
  Restaurant.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Restaurant name is required" },
          len: {
            args: [2, 100],
            msg: "Restaurant name must be between 2 and 100 characters",
          },
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Address is required" },
        },
      },
      lat: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          isFloat: { msg: "Latitude must be a valid number" },
          min: {
            args: [-90],
            msg: "Latitude must be greater than or equal to -90",
          },
          max: {
            args: [90],
            msg: "Latitude must be less than or equal to 90",
          },
        },
      },
      lng: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          isFloat: { msg: "Longitude must be a valid number" },
          min: {
            args: [-180],
            msg: "Longitude must be greater than or equal to -180",
          },
          max: {
            args: [180],
            msg: "Longitude must be less than or equal to 180",
          },
        },
      },
      image: {
        type: DataTypes.STRING,
        validate: {
          isUrl: {
            msg: "Please provide a valid image URL",
          },
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        validate: {
          isIn: {
            args: [["active", "inactive", "pending", "suspended"]],
            msg: "Invalid restaurant status",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Restaurant",
      tableName: "Restaurants",
      timestamps: false,
    }
  );
  return Restaurant;
};
