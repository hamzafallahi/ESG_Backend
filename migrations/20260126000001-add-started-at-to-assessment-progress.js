'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('assessment_progress', 'started_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Set started_at to created_at for existing records
    await queryInterface.sequelize.query(`
      UPDATE assessment_progress
      SET started_at = 
      WHERE started_at IS NULL
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('assessment_progress', 'started_at');
  }
};
