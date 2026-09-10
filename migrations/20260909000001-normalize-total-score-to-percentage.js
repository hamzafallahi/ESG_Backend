'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE results
      SET total_score = ROUND((total_score * 100.0) / 955)
      WHERE total_score > 100;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Lossy: the original pre-conversion values cannot be recovered exactly.
    await queryInterface.sequelize.query(`
      UPDATE results
      SET total_score = ROUND((total_score * 955.0) / 100)
      WHERE total_score <= 100;
    `);
  },
};
