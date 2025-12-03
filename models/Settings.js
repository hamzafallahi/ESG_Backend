'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Settings extends Model {
    static associate(models) {
      // No associations for settings table
    }
  }
  Settings.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'settings',
    tableName: 'settings',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    timestamps: true
  });
  return Settings;
};
