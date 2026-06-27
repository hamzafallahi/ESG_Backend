'use strict';

const { SECTION_TITLE_TO_CODE } = require('../config/esgScoring');

// Backfill sections.domain_id by matching each section title to the canonical
// ESG domain code. Idempotent: only fills rows that don't yet have a domain_id.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const titleToCode = Object.entries(SECTION_TITLE_TO_CODE);

    for (const [title, code] of titleToCode) {
      await queryInterface.sequelize.query(
        `
          UPDATE sections AS s
          SET domain_id = d.id
          FROM domains AS d
          WHERE s.title = :title
            AND d.code = :code
            AND s.domain_id IS NULL
        `,
        {
          replacements: { title, code },
          type: Sequelize.QueryTypes.UPDATE,
        }
      );
    }
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE sections
      SET domain_id = NULL
    `);
  }
};
