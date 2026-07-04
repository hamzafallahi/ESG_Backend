'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.section, {
        foreignKey: 'section_id',
        as: 'section',
        onDelete: 'CASCADE'
      });
      Question.hasMany(models.justification, {
        foreignKey: 'question_id',
        as: 'justifications',
        onDelete: 'CASCADE'
      });
      Question.belongsToMany(models.rsci, {
        through: {
          model: 'question_rscis',
          timestamps: true,
          underscored: true
        },
        foreignKey: 'question_id',
        otherKey: 'rsci_id',
        as: 'rscis'
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
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 4,
        isInt: true
      }
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
