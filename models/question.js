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
    question_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sections',
        key: 'section_id'
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    score_value: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'question',
    tableName: 'questions',
    underscored: true,
    timestamps: true
  });
  return Question;
};
