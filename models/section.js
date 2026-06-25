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
        as: 'questions',
        onDelete: 'CASCADE'
      });
      Section.hasMany(models.result_sections, {
        foreignKey: 'section_id',
        as: 'result_sections',
        onDelete: 'CASCADE'
      });
    }
  }
  Section.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    title_fr: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    core: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'section',
    tableName: 'sections',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });
  return Section;
};
