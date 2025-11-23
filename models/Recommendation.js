'use strict';
module.exports = (sequelize, DataTypes) => {
  const Recommendation = sequelize.define('recommendations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    name_fr: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.BLOB,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Recommendation.associate = function(models) {
    Recommendation.belongsTo(models.category, { foreignKey: 'category_id', as: 'category', onDelete: 'CASCADE' });
  };

  return Recommendation;
};
