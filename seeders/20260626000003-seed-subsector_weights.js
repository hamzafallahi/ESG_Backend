'use strict';

const { v4: uuidv4 } = require('uuid');
const { SUBSECTOR_WEIGHTS } = require('../config/esgScoring');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Resolve id maps for sub_sectors and domains by their code.
    const subSectors = await queryInterface.sequelize.query(
      'SELECT id, code FROM sub_sectors',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const domains = await queryInterface.sequelize.query(
      'SELECT id, code FROM domains',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const subSectorIdByCode = {};
    subSectors.forEach((s) => { subSectorIdByCode[s.code] = s.id; });
    const domainIdByCode = {};
    domains.forEach((d) => { domainIdByCode[d.code] = d.id; });

    // Existing (sub_sector_id, domain_id) pairs, to stay idempotent.
    const existing = await queryInterface.sequelize.query(
      'SELECT sub_sector_id, domain_id FROM subsector_weights',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingPairs = new Set(
      existing.map((w) => `${w.sub_sector_id}:${w.domain_id}`)
    );

    const rows = [];
    Object.entries(SUBSECTOR_WEIGHTS).forEach(([subCode, weights]) => {
      const subSectorId = subSectorIdByCode[subCode];
      if (!subSectorId) return;

      Object.entries(weights).forEach(([domainCode, weight]) => {
        const domainId = domainIdByCode[domainCode];
        if (!domainId) return;

        const pairKey = `${subSectorId}:${domainId}`;
        if (existingPairs.has(pairKey)) return;

        rows.push({
          id: uuidv4(),
          sub_sector_id: subSectorId,
          domain_id: domainId,
          weight,
          created_at: now,
          updated_at: now
        });
      });
    });

    if (rows.length > 0) {
      await queryInterface.bulkInsert('subsector_weights', rows);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove every weight row (reference data table).
    await queryInterface.bulkDelete('subsector_weights', {}, {});
  }
};
