'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.section, {
        foreignKey: 'category_id',
        as: 'sections',
        onDelete: 'CASCADE'
      });
      Category.hasMany(models.result_categories, {
        foreignKey: 'category_id',
        as: 'result_categories',
        onDelete: 'CASCADE'
      });
      Category.hasMany(models.recommendations, {
        foreignKey: 'category_id',
        as: 'recommendations',
        onDelete: 'CASCADE'
      });
    }
  }
  Category.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    name_fr: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'category',
    tableName: 'categories',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    timestamps: true
  });
  return Category;
};
