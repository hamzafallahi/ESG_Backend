'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Domain extends Model {
    static associate(models) {
      Domain.hasMany(models.subsector_weight, {
        foreignKey: 'domain_id',
        as: 'subsector_weights',
        onDelete: 'CASCADE'
      });
      Domain.hasMany(models.section, {
        foreignKey: 'domain_id',
        as: 'sections'
      });
    }
  }

  Domain.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    pillar: {
      type: DataTypes.STRING,
      allowNull: false
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'domain',
    tableName: 'domains',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });

  return Domain;
};
