'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('settings', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        key: 'assessment_cooldown',
        value: JSON.stringify({
          duration: 'P6M'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('settings', {
      key: 'assessment_cooldown'
    }, {});
  }
};
