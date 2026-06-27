'use strict';

const { v4: uuidv4 } = require('uuid');
const { SECTION_TITLE_TO_CODE, pillarForCode } = require('../config/esgScoring');

// Build the canonical 19 domains from the scoring config so the seed stays the
// single source of truth during the migration to data-driven scoring.
// label = a representative section title for the domain (admin-friendly display).
const buildDomains = () => {
  const byCode = {};
  Object.entries(SECTION_TITLE_TO_CODE).forEach(([title, code]) => {
    if (!byCode[code]) {
      byCode[code] = { code, pillar: pillarForCode(code), label: title };
    }
  });
  return Object.values(byCode);
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const domains = buildDomains();
    const codes = domains.map((d) => d.code);

    const existing = await queryInterface.sequelize.query(
      'SELECT code FROM domains WHERE code IN (:codes)',
      { replacements: { codes }, type: Sequelize.QueryTypes.SELECT }
    );
    const existingCodes = new Set(existing.map((d) => d.code));

    const toInsert = domains
      .filter((d) => !existingCodes.has(d.code))
      .map((d) => ({
        id: uuidv4(),
        code: d.code,
        pillar: d.pillar,
        label: d.label,
        created_at: now,
        updated_at: now
      }));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('domains', toInsert);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const codes = buildDomains().map((d) => d.code);
    await queryInterface.bulkDelete('domains', {
      code: { [Sequelize.Op.in]: codes }
    }, {});
  }
};
