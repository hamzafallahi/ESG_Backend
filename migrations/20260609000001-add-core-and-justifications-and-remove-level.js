'use strict';

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

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sections', 'core', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.removeColumn('questions', 'level');

    await queryInterface.createTable('justifications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      proof_type: {
        type: Sequelize.ENUM(...PROOF_TYPES),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      attachments: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      document_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      reference_number: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      evaluator_comment: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
      ADD CONSTRAINT justifications_description_length_check
      CHECK (char_length(description) BETWEEN 50 AND 500);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
      ADD CONSTRAINT justifications_evaluator_comment_length_check
      CHECK (evaluator_comment IS NULL OR char_length(evaluator_comment) <= 500);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
      ADD CONSTRAINT justifications_attachments_count_check
      CHECK (jsonb_typeof(attachments) = 'array' AND jsonb_array_length(attachments) <= 3);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
      ADD CONSTRAINT justifications_document_date_today_check
      CHECK (document_date <= CURRENT_DATE);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('justifications', 'justifications_document_date_today_check');
    await queryInterface.removeConstraint('justifications', 'justifications_attachments_count_check');
    await queryInterface.removeConstraint('justifications', 'justifications_evaluator_comment_length_check');
    await queryInterface.removeConstraint('justifications', 'justifications_description_length_check');

    await queryInterface.dropTable('justifications');

    await queryInterface.addColumn('questions', 'level', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    await queryInterface.removeColumn('sections', 'core');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_justifications_proof_type";');
  }
};