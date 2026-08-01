'use strict';
const { Model } = require('sequelize');

const ANSWER_TYPES = ['YES', 'NN', 'NA', 'NAC'];

module.exports = (sequelize, DataTypes) => {
  class AssessmentProgressAnswer extends Model {
    static associate(models) {
      AssessmentProgressAnswer.belongsTo(models.assessment_progress, {
        foreignKey: 'assessment_progress_id',
        as: 'progress',
        onDelete: 'CASCADE'
      });

      AssessmentProgressAnswer.belongsTo(models.question, {
        foreignKey: 'question_id',
        as: 'question',
        onDelete: 'CASCADE'
      });

      AssessmentProgressAnswer.belongsTo(models.justification, {
        foreignKey: 'justification_id',
        as: 'justification_record',
        onDelete: 'SET NULL'
      });
    }

    // Shape used by the API (same contract as the legacy JSONB answers values)
    toAnswerValue() {
      const value = { type: this.answer_type };
      if (this.nac_percentage !== null && this.nac_percentage !== undefined) {
        value.nac_percentage = Number(this.nac_percentage);
      }
      const j = this.justification_record;
      if (j) {
        value.justification = {
          proof_type: j.proof_type,
          description: j.description,
          document_date: j.document_date,
          reference_number: j.reference_number,
          evaluator_comment: j.evaluator_comment,
          attachment_urls: j.attachments || [],
        };
      }
      return value;
    }
  }

  AssessmentProgressAnswer.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    assessment_progress_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assessment_progress',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    answer_type: {
      type: DataTypes.ENUM(...ANSWER_TYPES),
      allowNull: false,
      validate: {
        isIn: {
          args: [ANSWER_TYPES],
          msg: `Answer type must be one of: ${ANSWER_TYPES.join(', ')}`
        }
      }
    },
    nac_percentage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'NAC percentage must be at least 1'
        },
        max: {
          args: [100],
          msg: 'NAC percentage cannot exceed 100'
        }
      }
    },
    justification_id: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'justifications',
        key: 'id'
      },
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    timestamps: true,
    modelName: 'assessment_progress_answer',
    tableName: 'assessment_progress_answers',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['assessment_progress_id', 'question_id'],
        name: 'uq_progress_answers_progress_question'
      }
    ]
  });

  return AssessmentProgressAnswer;
};
