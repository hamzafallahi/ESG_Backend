'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.section, {
        foreignKey: 'section_id',
        as: 'section'
      });
    }
  }
  Question.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    section_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sections',
        key: 'id'
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    text_fr: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    score_value: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'question',
    tableName: 'questions',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });
  return Question;
};
