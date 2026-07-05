'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AssessmentProgress extends Model {
    static associate(models) {
      // Define association with User
      AssessmentProgress.belongsTo(models.user, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE'
      });

      // Normalized answers (one row per answered question)
      AssessmentProgress.hasMany(models.assessment_progress_answer, {
        foreignKey: 'assessment_progress_id',
        as: 'progress_answers',
        onDelete: 'CASCADE'
      });

      // Result this progress was submitted as (null while DRAFT)
      AssessmentProgress.belongsTo(models.results, {
        foreignKey: 'result_id',
        as: 'result'
      });
    }

    // Remove sensitive data from JSON output if needed
    toJSON() {
      const values = { ...this.get() };
      return values;
    }
  }
  
  AssessmentProgress.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED'),
      allowNull: false,
      defaultValue: 'DRAFT'
    },
    result_id: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'results',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    current_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Current page cannot be negative'
        }
      }
    },
    ui_state: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidJSON(value) {
          if (value !== null && typeof value !== 'object') {
            throw new Error('UI state must be a valid JSON object');
          }
        }
      }
    },
    total_questions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Total questions cannot be negative'
        }
      }
    },
    answered_questions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Answered questions cannot be negative'
        }
      }
    },
    completion_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Completion percentage cannot be negative'
        },
        max: {
          args: [100],
          msg: 'Completion percentage cannot exceed 100'
        }
      }
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    timestamps: true,
    modelName: 'assessment_progress',
    tableName: 'assessment_progress',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });
  
  return AssessmentProgress;
};
