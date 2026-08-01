'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('questions');

    if (!table.level) {
      await queryInterface.addColumn('questions', 'level', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      });
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE questions
      DROP CONSTRAINT IF EXISTS questions_level_range_check;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE questions
      ADD CONSTRAINT questions_level_range_check
      CHECK (level >= 1 AND level <= 4);
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE questions
      DROP CONSTRAINT IF EXISTS questions_level_range_check;
    `);

    const table = await queryInterface.describeTable('questions');
    if (table.level) {
      await queryInterface.removeColumn('questions', 'level');
    }
  }
};
