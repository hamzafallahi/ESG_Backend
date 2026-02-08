'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('assessment_progress', 'started_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('assessment_progress', 'started_at');
  }
};
