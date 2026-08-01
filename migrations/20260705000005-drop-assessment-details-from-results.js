'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('results');
    if (table.assessment_details) {
      await queryInterface.removeColumn('results', 'assessment_details');
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('results');
    if (!table.assessment_details) {
      await queryInterface.addColumn('results', 'assessment_details', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: null,
      });
    }
  },
};
