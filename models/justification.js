'use strict';
const { Model } = require('sequelize');

const PROOF_TYPES = [
  'POLICY',
  'PROCEDURE',
  'CERTIFICATION',
  'REPORT',
  'AUDIT',
  'CONTRACT',
  'INVOICE',
  'TRAINING_RECORD',
  'LICENSE',
  'PERMIT',
  'RISK_ASSESSMENT',
  'KPI_DASHBOARD',
  'MEETING_MINUTES',
  'ACTION_PLAN',
  'OTHER'
];

module.exports = (sequelize, DataTypes) => {
  class Justification extends Model {
    static associate(models) {
      Justification.belongsTo(models.question, {
        foreignKey: 'question_id',
        as: 'question',
        onDelete: 'CASCADE'
      });

      Justification.hasMany(models.assessment_progress_answer, {
        foreignKey: 'justification_id',
        as: 'progress_answers'
      });
    }
  }

  Justification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id'
        }
      },
      proof_type: {
        type: DataTypes.ENUM(...PROOF_TYPES),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          len: [50, 500]
        }
      },
      attachments: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      document_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      reference_number: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      evaluator_comment: {
        type: DataTypes.STRING(500),
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'justification',
      tableName: 'justifications',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true
    }
  );

  return Justification;
};