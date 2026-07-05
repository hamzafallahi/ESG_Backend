'use strict';

/**
 * Mark canonical Core sections with core = true.
 * Idempotent: re-running simply re-asserts the same flags.
 *
 * Core sections correspond to the eight ex-Core domains (E1, E2, E3, S1, S2,
 * G1, G2, G3). They are now identified by their canonical English title.
 */
const CORE_SECTION_TITLES = [
  // E1
  'Climate assessment: CO2 emissions: Carbon footprint/Carbon footprint',
  // E2
  'Energy Management',
  // E3
  'Pollution: water use/pollution, waste management',
  // S1
  'Working conditions: Compliance with regulatory standards in labor matters',
  // S2
  'Working conditions: health and safety at work',
  // G1
  'The vision, strategy and governance of the CSR approach',
  // G2
  'Ethical approach: Anti-corruption policy and business ethics / Due diligence',
  // G3
  'Relationship with clients and consumers',
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `UPDATE sections SET core = true WHERE title IN (:titles)`,
      { replacements: { titles: CORE_SECTION_TITLES }, type: Sequelize.QueryTypes.UPDATE }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `UPDATE sections SET core = false WHERE title IN (:titles)`,
      { replacements: { titles: CORE_SECTION_TITLES }, type: Sequelize.QueryTypes.UPDATE }
    );
  },
};
