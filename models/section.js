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
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
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
