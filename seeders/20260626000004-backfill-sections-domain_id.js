'use strict';

// Backfill sections.domain_id from the legacy sections.code column, matching on
// the domain code. Idempotent: only fills rows that don't yet have a domain_id.
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE sections AS s
      SET domain_id = d.id
      FROM domains AS d
      WHERE s.code = d.code
        AND s.domain_id IS NULL
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE sections
      SET domain_id = NULL
    `);
  }
};
