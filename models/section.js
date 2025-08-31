'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Section extends Model {
    static associate(models) {
      Section.belongsTo(models.category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      Section.hasMany(models.question, {
        foreignKey: 'section_id',
        as: 'questions'
      });
    }
  }
  Section.init({
    section_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'category_id'
      }
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'section',
    tableName: 'sections',
    underscored: true,
    timestamps: true
  });
  return Section;
};
