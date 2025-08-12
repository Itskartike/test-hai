'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Payments', [
      {
        order_id: 1,
        method: 'card',
        status: 'paid',
        transaction_id: 'TXN123456',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        order_id: 2,
        method: 'cash',
        status: 'pending',
        transaction_id: 'TXN654321',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', null, {});
  }
};