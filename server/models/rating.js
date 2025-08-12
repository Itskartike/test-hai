'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Rating belongs to User
      Rating.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Rating belongs to Restaurant
      Rating.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant'
      });
    }
  }
  Rating.init({
    user_id: DataTypes.INTEGER,
    stars: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    timestamp: DataTypes.DATE,
    restaurant_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Rating',
    tableName: 'Ratings',
    timestamps: false
  });
  return Rating;
};