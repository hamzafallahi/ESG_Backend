'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rscis', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      title_fr: {
        type: Sequelize.STRING(255),
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

    await queryInterface.createTable('question_rscis', {
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
      rsci_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'rscis',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }

    });

    await queryInterface.addConstraint('question_rscis', {
      fields: ['question_id', 'rsci_id'],
      type: 'primary key',
      name: 'question_rscis_pkey'
    });

    await queryInterface.addIndex('question_rscis', ['rsci_id'], {
      name: 'question_rscis_rsci_id_idx'
    });

    await queryInterface.addIndex('question_rscis', ['question_id'], {
      name: 'question_rscis_question_id_idx'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('question_rscis', 'question_rscis_question_id_idx');
    await queryInterface.removeIndex('question_rscis', 'question_rscis_rsci_id_idx');
    await queryInterface.dropTable('question_rscis');
    await queryInterface.dropTable('rscis');
  }
};