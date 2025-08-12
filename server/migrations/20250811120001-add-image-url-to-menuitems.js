"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column already exists before adding it
    const tableDescription = await queryInterface.describeTable("MenuItems");

    if (!tableDescription.image_url) {
      await queryInterface.addColumn("MenuItems", "image_url", {
        type: Sequelize.TEXT,
        allowNull: true,
        after: "image",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("MenuItems", "image_url");
  },
};
