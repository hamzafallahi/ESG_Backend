'use strict';

// Mark the eight Core domains as core = true on their sections.
// Core domains: E1, E2, E3, S1, S2, G1, G2, G3.
// The Core gate (config/esgScoring.applyCoreCap) requires the aggregate Core
// score to reach 60% before a company can be awarded N4 / N4+.
// Idempotent: re-running simply re-asserts the same flags.
const CORE_DOMAIN_CODES = ['E1', 'E2', 'E3', 'S1', 'S2', 'G1', 'G2', 'G3'];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `
        UPDATE sections AS s
        SET core = true
        FROM domains AS d
        WHERE s.domain_id = d.id
          AND d.code IN (:codes)
      `,
      {
        replacements: { codes: CORE_DOMAIN_CODES },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `
        UPDATE sections AS s
        SET core = false
        FROM domains AS d
        WHERE s.domain_id = d.id
          AND d.code IN (:codes)
      `,
      {
        replacements: { codes: CORE_DOMAIN_CODES },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );
  }
};
