'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Insert demo orders
    await queryInterface.bulkInsert('Orders', [
      {
        user_id: 1,
        restaurant_id: 1,
        status: 'placed',
        total_price: 27.98,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 1,
        restaurant_id: 2,
        status: 'delivered',
        total_price: 20.98,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Insert demo order items
    await queryInterface.bulkInsert('OrderItems', [
      {
        order_id: 1,
        item_id: 1, // Margherita Pizza
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        order_id: 2,
        item_id: 4, // Classic Cheeseburger
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        order_id: 2,
        item_id: 5, // Bacon Deluxe Burger
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('OrderItems', null, {});
    await queryInterface.bulkDelete('Orders', null, {});
  }
};