'use strict';

const { v4: uuidv4 } = require('uuid');

// The 6 automotive sub-sectors. Labels default to the code and can be edited
// by admins later through the sub-sectors CRUD API.
const SUB_SECTORS = ['TS', 'FF', 'PL', 'CA', 'EE', 'MP'].map((code) => ({
  code,
  label: code,
}));

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const codes = SUB_SECTORS.map((s) => s.code);

    const existing = await queryInterface.sequelize.query(
      'SELECT code FROM sub_sectors WHERE code IN (:codes)',
      { replacements: { codes }, type: Sequelize.QueryTypes.SELECT }
    );
    const existingCodes = new Set(existing.map((s) => s.code));

    const toInsert = SUB_SECTORS
      .filter((s) => !existingCodes.has(s.code))
      .map((s) => ({
        id: uuidv4(),
        code: s.code,
        label: s.label,
        active: true,
        created_at: now,
        updated_at: now
      }));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('sub_sectors', toInsert);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const codes = SUB_SECTORS.map((s) => s.code);
    await queryInterface.bulkDelete('sub_sectors', {
      code: { [Sequelize.Op.in]: codes }
    }, {});
  }
};
