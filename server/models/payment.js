'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Payment belongs to Order
      Payment.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
    }
  }
  Payment.init({
    order_id: DataTypes.INTEGER,
    method: DataTypes.STRING,
    status: DataTypes.STRING,
    transaction_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
    timestamps: false
  });
  return Payment;
};