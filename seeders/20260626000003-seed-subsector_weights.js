'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seed per-sub-sector, per-section weights.
 *
 * With domains removed, this seeder assigns a uniform baseline weight (1) to
 * every existing section under every existing sub-sector. Admins can then
 * customize weights via the admin UI ("Manage Weights" modal). Idempotent:
 * only creates missing (sub_sector_id, section_id) rows.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const subSectors = await queryInterface.sequelize.query(
      'SELECT id FROM sub_sectors',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const sections = await queryInterface.sequelize.query(
      'SELECT id FROM sections',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (subSectors.length === 0 || sections.length === 0) return;

    const existing = await queryInterface.sequelize.query(
      'SELECT sub_sector_id, section_id FROM subsector_weights',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingPairs = new Set(
      existing.map((w) => `${w.sub_sector_id}:${w.section_id}`)
    );

    const rows = [];
    subSectors.forEach((sub) => {
      sections.forEach((sec) => {
        const key = `${sub.id}:${sec.id}`;
        if (existingPairs.has(key)) return;
        rows.push({
          id: uuidv4(),
          sub_sector_id: sub.id,
          section_id: sec.id,
          weight: 1,
          created_at: now,
          updated_at: now,
        });
      });
    });

    if (rows.length > 0) {
      await queryInterface.bulkInsert('subsector_weights', rows);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('subsector_weights', {}, {});
  },
};
