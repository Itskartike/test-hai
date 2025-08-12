'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeliveryAgent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DeliveryAgent.init({
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    location_lat: DataTypes.DOUBLE,
    location_lng: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'DeliveryAgent',
    tableName: 'DeliveryAgents',
    timestamps: false
  });
  return DeliveryAgent;
};