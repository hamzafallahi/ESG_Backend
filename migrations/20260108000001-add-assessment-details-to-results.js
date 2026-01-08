'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('results', 'assessment_details', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: 'Stores the assessment progress snapshot at the time of result creation'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('results', 'assessment_details');
  }
};
