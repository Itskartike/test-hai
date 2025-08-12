"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "delivery_address", {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: "Not specified",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "delivery_address");
  },
};
