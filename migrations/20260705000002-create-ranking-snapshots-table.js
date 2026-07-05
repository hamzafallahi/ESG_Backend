'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ranking_snapshots', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rank: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_participants: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      trigger_result_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      snapshot_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addIndex('ranking_snapshots', ['user_id', 'year', 'snapshot_at'], {
      name: 'ranking_snapshots_user_year_time_idx',
    });
    await queryInterface.addIndex('ranking_snapshots', ['year']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ranking_snapshots');
  },
};
