'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'color', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'name_fr'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('categories', 'color');
  }
};
