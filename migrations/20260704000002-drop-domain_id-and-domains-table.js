'use strict';

/** Drop sections.domain_id and the domains table entirely. */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [sectionCols] = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'sections' AND column_name = 'domain_id'`
    );
    if (sectionCols.length > 0) {
      await queryInterface.removeColumn('sections', 'domain_id');
    }

    const [domainTable] = await queryInterface.sequelize.query(
      `SELECT to_regclass('public.domains') AS reg`
    );
    if (domainTable?.[0]?.reg) {
      await queryInterface.dropTable('domains');
    }
  },

  async down() {
    // One-way migration.
  },
};
