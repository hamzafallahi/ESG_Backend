'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('results', 'global_level', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('results', 'core_score', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('results', 'global_level');
    await queryInterface.removeColumn('results', 'core_score');
  },
};
