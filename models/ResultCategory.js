module.exports = (sequelize, type) => {
  const ResultCategory = sequelize.define('result_categories', {
    id: {
        type:type.UUID,
        defaultValue: type.UUIDV4,
        primaryKey: true
    },
    result_id: {
      type: type.UUID,
      allowNull: false
    },
    category_id: {
      type: type.UUID,
      allowNull: false
    },
    score: {
      type: type.INTEGER
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    operators: false
  });

  ResultCategory.associate = function(models) {
    ResultCategory.belongsTo(models.results, { foreignKey: 'result_id', as: 'results', onDelete: 'CASCADE'});
    ResultCategory.belongsTo(models.category, { foreignKey: 'category_id', as: 'category', onDelete: 'CASCADE' });
  };

  return ResultCategory;
};
