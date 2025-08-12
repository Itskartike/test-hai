"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User has many Addresses
      User.hasMany(models.Address, {
        foreignKey: "user_id",
        as: "addresses",
      });

      // User has many Orders
      User.hasMany(models.Order, {
        foreignKey: "user_id",
        as: "orders",
      });

      // User has many Ratings
      User.hasMany(models.Rating, {
        foreignKey: "user_id",
        as: "ratings",
      });
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Name is required" },
          len: {
            args: [2, 50],
            msg: "Name must be between 2 and 50 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Email is required" },
          isEmail: { msg: "Please provide a valid email address" },
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Phone number is required" },
          is: {
            args: /^\+?([0-9]{10,15})$/,
            msg: "Please provide a valid phone number",
          },
        },
      },
      password_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [["customer", "restaurant", "delivery", "admin"]],
            msg: "Invalid role specified",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
    }
  );
  return User;
};
