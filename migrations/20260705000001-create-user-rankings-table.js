'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_rankings', {
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
      result_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      computed_at: {
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

    await queryInterface.addIndex('user_rankings', ['user_id', 'year'], {
      unique: true,
      name: 'user_rankings_user_year_unique',
    });
    await queryInterface.addIndex('user_rankings', ['year']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_rankings');
  },
};
