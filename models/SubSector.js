'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SubSector extends Model {
    static associate(models) {
      SubSector.hasMany(models.subsector_weight, {
        foreignKey: 'sub_sector_id',
        as: 'subsector_weights',
        onDelete: 'CASCADE'
      });
    }
  }

  SubSector.init({
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
    label: {
      type: DataTypes.STRING,
      allowNull: true
    },
    label_fr: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'sub_sector',
    tableName: 'sub_sectors',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });

  return SubSector;
};
