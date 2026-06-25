'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rsci extends Model {
    static associate(models) {
      Rsci.belongsToMany(models.question, {
        through: {
          model: 'question_rscis',
          timestamps: true,
          underscored: true
        },
        foreignKey: 'rsci_id',
        otherKey: 'question_id',
        as: 'questions'
      });
    }
  }

  Rsci.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'rsci',
    tableName: 'rscis',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });

  return Rsci;
};