'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('questions', 'text_fr', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('questions', 'level', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('questions', 'text_en');
    await queryInterface.removeColumn('questions', 'text_fr');
    await queryInterface.removeColumn('questions', 'level');
  }
};
