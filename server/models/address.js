'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Address belongs to User
      Address.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  Address.init({
    label: DataTypes.STRING,
    street: DataTypes.TEXT,
    city: DataTypes.STRING,
    pincode: DataTypes.STRING,
    lat: DataTypes.DOUBLE,
    lng: DataTypes.DOUBLE,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
    timestamps: false
  });
  return Address;
};