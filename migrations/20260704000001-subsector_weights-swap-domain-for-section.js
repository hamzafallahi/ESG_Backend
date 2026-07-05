'use strict';

/**
 * Replace subsector_weights.domain_id with subsector_weights.section_id.
 *
 * Weights are now stored per (sub_sector, section) instead of
 * per (sub_sector, domain). Existing rows are remapped by expanding each
 * (sub_sector_id, domain_id, weight) row into one row per section that
 * belonged to that domain. The weight is split evenly across those sections
 * so per-sub-sector totals stay stable.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { QueryTypes } = Sequelize;

    // Skip if the domain_id column is already gone (idempotent re-run).
    const [columns] = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'subsector_weights'`
    );
    const hasDomainId = columns.some((c) => c.column_name === 'domain_id');
    if (!hasDomainId) return;

    await queryInterface.addColumn('subsector_weights', 'section_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'sections', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Domain-based weights need the domains table + sections.domain_id to
    // still exist in order to be remapped.
    const [domainTable] = await queryInterface.sequelize.query(
      `SELECT to_regclass('public.domains') AS reg`
    );
    const domainsExist = !!domainTable?.[0]?.reg;
    const hasSectionsDomainId = (
      await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name = 'sections' AND column_name = 'domain_id'`
      )
    )[0].length > 0;

    if (domainsExist && hasSectionsDomainId) {
      const oldWeights = await queryInterface.sequelize.query(
        `SELECT id, sub_sector_id, domain_id, weight FROM subsector_weights`,
        { type: QueryTypes.SELECT }
      );

      const sections = await queryInterface.sequelize.query(
        `SELECT id, domain_id FROM sections WHERE domain_id IS NOT NULL`,
        { type: QueryTypes.SELECT }
      );

      // domainId -> [sectionId, ...]
      const sectionsByDomain = new Map();
      sections.forEach((s) => {
        if (!sectionsByDomain.has(s.domain_id)) sectionsByDomain.set(s.domain_id, []);
        sectionsByDomain.get(s.domain_id).push(s.id);
      });

      const now = new Date();
      const inserts = [];
      const deletableIds = [];

      oldWeights.forEach((row) => {
        const targetSections = sectionsByDomain.get(row.domain_id) || [];
        if (targetSections.length === 0) return;
        const perSection = Number(row.weight) / targetSections.length;
        targetSections.forEach((sectionId, idx) => {
          if (idx === 0) {
            // Reuse the existing PK for the first mapping to keep row count low.
            inserts.push({
              type: 'update',
              id: row.id,
              section_id: sectionId,
              weight: perSection,
            });
          } else {
            inserts.push({
              type: 'insert',
              sub_sector_id: row.sub_sector_id,
              section_id: sectionId,
              weight: perSection,
            });
          }
        });
        // If a domain had no sections mapped, the old row will be deleted below.
        if (targetSections.length === 0) deletableIds.push(row.id);
      });

      for (const op of inserts) {
        if (op.type === 'update') {
          await queryInterface.sequelize.query(
            `UPDATE subsector_weights
             SET section_id = :sectionId, weight = :weight, updated_at = :now
             WHERE id = :id`,
            { replacements: { sectionId: op.section_id, weight: op.weight, id: op.id, now } }
          );
        } else {
          await queryInterface.sequelize.query(
            `INSERT INTO subsector_weights
               (id, sub_sector_id, section_id, weight, created_at, updated_at)
             VALUES (gen_random_uuid(), :subSectorId, :sectionId, :weight, :now, :now)`,
            {
              replacements: {
                subSectorId: op.sub_sector_id,
                sectionId: op.section_id,
                weight: op.weight,
                now,
              },
            }
          );
        }
      }

      // Drop any rows we could not remap (domain had no sections).
      await queryInterface.sequelize.query(
        `DELETE FROM subsector_weights WHERE section_id IS NULL`
      );
    } else {
      // Fresh DB (no domains yet) — table has no rows to remap.
      await queryInterface.sequelize.query(
        `DELETE FROM subsector_weights WHERE section_id IS NULL`
      );
    }

    // Drop the old unique constraint and FK, then the domain_id column.
    try {
      await queryInterface.removeConstraint(
        'subsector_weights',
        'subsector_weights_sub_sector_id_domain_id_unique'
      );
    } catch (_) { /* already dropped */ }

    await queryInterface.removeColumn('subsector_weights', 'domain_id');

    // Make section_id required + unique per sub-sector.
    await queryInterface.changeColumn('subsector_weights', 'section_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'sections', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('subsector_weights', {
      fields: ['sub_sector_id', 'section_id'],
      type: 'unique',
      name: 'subsector_weights_sub_sector_id_section_id_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    // One-way migration: restoring domain-based weights is not supported.
    // Re-run the original migrations from scratch if needed.
  },
};
