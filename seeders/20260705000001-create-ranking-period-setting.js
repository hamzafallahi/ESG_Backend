'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('settings', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        key: 'ranking_period',
        value: JSON.stringify({
          start_month: 1,
          start_day: 1,
          auto_reset_enabled: true,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('settings', { key: 'ranking_period' }, {});
  },
};
