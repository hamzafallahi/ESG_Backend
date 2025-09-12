module.exports = (sequelize, type) => {
  const Result = sequelize.define('results', {
    id: {
        type:type.UUID,
        defaultValue: type.UUIDV4,
        primaryKey: true
    },
    user_id: {
      type: type.UUID,
      allowNull: false
    },
    total_score: {
      type: type.INTEGER
    },
    global_feedback: {
      type: type.TEXT
    },
    current_rank: {
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

  Result.associate = function(models) {
    //Result.belongsTo(models.User, { foreignKey: 'user_id' });
    Result.hasMany(models.result_categories, { foreignKey: 'result_id' ,    as: 'result_categories'});
    Result.hasMany(models.result_sections, { foreignKey: 'result_id' ,    as: 'result_sections' });
  };

  return Result;
};
