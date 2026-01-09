const { DateTime, Duration } = require('luxon');
const { notifyAdminsOfResultFeedback } = require('../helper/notificationHelper');

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
    },
    assessment_details: {
      type: type.JSONB,
      allowNull: true,
      defaultValue: null
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
    const User = sequelize.models.user;
    const Settings = sequelize.models.settings;
    const InboxMessage = sequelize.models.inbox_message;
    
    if (result.user_id) {
      // Save assessment progress to result before resetting
      if (AssessmentProgress) {
        const progress = await AssessmentProgress.findOne({
          where: { user_id: result.user_id }
        });
        
        if (progress) {
          // Save the assessment progress snapshot to the result
          const assessmentDetails = {
            user_id: progress.user_id,
            answers: progress.answers,
            current_page: progress.current_page,
            ui_state: progress.ui_state,
            total_questions: progress.total_questions,
            answered_questions: progress.answered_questions,
            completion_percentage: parseFloat(progress.completion_percentage),
            saved_at: new Date().toISOString()
          };
          
          await result.update({ assessment_details: assessmentDetails });
          
          // Reset the assessment progress
          await progress.update({
            answers: {},
            current_page: 0,
            ui_state: {},
            answered_questions: 0,
            completion_percentage: 0.00
          });
        }
      }
      
      // Update user's next_allowed_assessment_date
      if (User && Settings) {
        const user = await User.findByPk(result.user_id);
        const cooldownSetting = await Settings.findOne({
          where: { key: 'assessment_cooldown' }
        });
        
        if (user && cooldownSetting) {
          const durationISO = cooldownSetting.value.duration; // ISO 8601 duration (e.g., 'P6M')
          const duration = Duration.fromISO(durationISO);
          const nextAllowedDate = DateTime.now().plus(duration).toJSDate();
          
          await user.update({
            next_allowed_assessment_date: nextAllowedDate
          });
        }
        
        // Create result_feedback inbox message and notify admins
        if (user && InboxMessage && (result.global_feedback && result.global_feedback.trim() !== '')) {
          try {
            const inboxMessage = await InboxMessage.create({
              sent_by_user_id: result.user_id,
              sent_by_admin_id: null,
              sent_by_super_admin_id: null,
              type: 'result_feedback',
              payload: { 
                result_id: result.id,
                global_feedback: result.global_feedback
              },
              status: null
            });
            
            // Notify all connected admins
            notifyAdminsOfResultFeedback(
              result.user_id,
              user.organization_name,
              user.organization_name,
              result.id,
              inboxMessage.id
            );
          } catch (error) {
            console.error('Error creating result feedback inbox message:', error);
            // Don't fail the result creation if inbox message fails
          }
        }
      }
    }
  });

  return Result;
};
