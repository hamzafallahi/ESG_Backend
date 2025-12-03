'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('assessment_progress', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        unique: true
      },
      answers: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      current_page: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ui_state: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      total_questions: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      answered_questions: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      completion_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create indexes for fast lookups
    await queryInterface.addIndex('assessment_progress', ['user_id'], {
      name: 'idx_assessment_progress_user_id'
    });
    
    await queryInterface.addIndex('assessment_progress', ['updated_at'], {
      name: 'idx_assessment_progress_updated_at'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('assessment_progress');
  }
};
