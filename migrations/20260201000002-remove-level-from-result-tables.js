'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('result_categories', 'level');
    await queryInterface.removeColumn('result_sections', 'level');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('result_categories', 'level', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('result_sections', 'level', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
