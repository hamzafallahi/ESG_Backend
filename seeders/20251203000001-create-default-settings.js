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
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('settings', {
      key: 'assessment_cooldown'
    }, {});
  }
};
