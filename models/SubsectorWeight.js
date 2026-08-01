'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SubsectorWeight extends Model {
    static associate(models) {
      SubsectorWeight.belongsTo(models.sub_sector, {
        foreignKey: 'sub_sector_id',
        as: 'sub_sector',
        onDelete: 'CASCADE'
      });
      SubsectorWeight.belongsTo(models.section, {
        foreignKey: 'section_id',
        as: 'section',
        onDelete: 'CASCADE'
      });
    }
  }

  SubsectorWeight.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sub_sector_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sub_sectors',
        key: 'id'
      }
    },
    section_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sections',
        key: 'id'
      }
    },
    weight: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'subsector_weight',
    tableName: 'subsector_weights',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });

  return SubsectorWeight;
};
