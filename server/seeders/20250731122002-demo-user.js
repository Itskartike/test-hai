"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Demo Customer",
          email: "customer@example.com",
          phone: "1234567890",
          password_hash: await bcrypt.hash("password123", 10),
          role: "customer",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pizza Palace Owner",
          email: "pizza@example.com",
          phone: "1234567891",
          password_hash: await bcrypt.hash("password123", 10),
          role: "restaurant",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Burger House Owner",
          email: "burger@example.com",
          phone: "1234567892",
          password_hash: await bcrypt.hash("password123", 10),
          role: "restaurant",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Sushi Express Owner",
          email: "sushi@example.com",
          phone: "1234567893",
          password_hash: await bcrypt.hash("password123", 10),
          role: "restaurant",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Taco Fiesta Owner",
          email: "taco@example.com",
          phone: "1234567894",
          password_hash: await bcrypt.hash("password123", 10),
          role: "restaurant",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Users",
      {
        email: [
          "customer@example.com",
          "pizza@example.com",
          "burger@example.com",
          "sushi@example.com",
          "taco@example.com",
        ],
      },
      {}
    );
  },
};
