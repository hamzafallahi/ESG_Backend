'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add the French label column.
    await queryInterface.addColumn('sub_sectors', 'label_fr', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Preserve the existing (French) labels in label_fr before switching the
    //    default label to English.
    await queryInterface.sequelize.query(
      'UPDATE sub_sectors SET label_fr = label WHERE label_fr IS NULL'
    );

    // 3. Switch the default label to the English version (keyed by code).
    await queryInterface.sequelize.query(
      `UPDATE sub_sectors
       SET label = CASE code
         WHEN 'TS' THEN 'Surface Treatment / Chemicals'
         WHEN 'FF' THEN 'Foundry / Forging / Metallurgy'
         WHEN 'PL' THEN 'Plastics Processing / Injection Molding / Composites'
         WHEN 'CA' THEN 'Wiring / Electrical Assembly'
         WHEN 'EE' THEN 'Embedded Electronics / Software'
         WHEN 'MP' THEN 'Precision Mechanics / Machining'
         ELSE label
       END`
    );
  },

  async down(queryInterface, Sequelize) {
    // Restore the French label as the default, then drop the French column.
    await queryInterface.sequelize.query(
      'UPDATE sub_sectors SET label = label_fr WHERE label_fr IS NOT NULL'
    );
    await queryInterface.removeColumn('sub_sectors', 'label_fr');
  },
};