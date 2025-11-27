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
    Result.hasMany(models.result_categories, { foreignKey: 'result_id' ,    as: 'result_categories', onDelete: 'CASCADE'});
    Result.hasMany(models.result_sections, { foreignKey: 'result_id' ,    as: 'result_sections', onDelete: 'CASCADE' });
  };

  // Hook to reset AssessmentProgress after Result is created
  Result.afterCreate(async (result, options) => {
    const AssessmentProgress = sequelize.models.assessment_progress;
    if (AssessmentProgress && result.user_id) {
      const progress = await AssessmentProgress.findOne({
        where: { user_id: result.user_id }
      });
      
      if (progress) {
        await progress.update({
          answers: {},
          current_page: 0,
          ui_state: {},
          answered_questions: 0,
          completion_percentage: 0.00
        });
      }
    }
  });

  return Result;
};
