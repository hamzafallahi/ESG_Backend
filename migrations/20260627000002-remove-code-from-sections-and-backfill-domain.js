'use strict';

const { SECTION_TITLE_TO_CODE } = require('../config/esgScoring');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sections = await queryInterface.sequelize.query(
      `
        SELECT s.id, s.title, s.category_id, s.domain_id
        FROM sections s
        ORDER BY s.category_id ASC, s.created_at ASC, s.id ASC
      `,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const domains = await queryInterface.sequelize.query(
      'SELECT id, code FROM domains ORDER BY code ASC',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const domainByCode = new Map(domains.map((domain) => [domain.code, domain.id]));
    const domainsByPrefix = domains.reduce((acc, domain) => {
      const prefix = String(domain.code || '').charAt(0);
      if (!acc[prefix]) acc[prefix] = [];
      acc[prefix].push(domain);
      return acc;
    }, {});

    const categories = await queryInterface.sequelize.query(
      'SELECT id, name, name_fr FROM categories',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const categoryPrefixById = new Map();
    categories.forEach((category) => {
      const name = category.name || category.name_fr || '';
      const prefix = name.startsWith('Env') ? 'E' : name.startsWith('Soc') ? 'S' : name.startsWith('Gov') ? 'G' : null;
      categoryPrefixById.set(category.id, prefix);
    });

    const seenByCategory = new Map();
    for (const section of sections) {
      const categoryId = section.category_id;
      const currentIndex = seenByCategory.get(categoryId) || 0;
      let resolvedDomainId = section.domain_id;

      if (!resolvedDomainId) {
        const mappedCode = SECTION_TITLE_TO_CODE[section.title];
        if (mappedCode && domainByCode.has(mappedCode)) {
          resolvedDomainId = domainByCode.get(mappedCode);
        } else {
          const prefix = categoryPrefixById.get(categoryId);
          const candidates = prefix ? (domainsByPrefix[prefix] || []) : [];
          if (candidates.length > 0) {
            resolvedDomainId = candidates[currentIndex % candidates.length].id;
          }
        }

        if (resolvedDomainId) {
          await queryInterface.sequelize.query(
            'UPDATE sections SET domain_id = :domainId WHERE id = :sectionId',
            {
              replacements: { domainId: resolvedDomainId, sectionId: section.id },
              type: Sequelize.QueryTypes.UPDATE,
            }
          );
        }
      }

      seenByCategory.set(categoryId, currentIndex + 1);
    }

    await queryInterface.removeColumn('sections', 'code');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sections', 'code', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    for (const [title, code] of Object.entries(SECTION_TITLE_TO_CODE)) {
      await queryInterface.sequelize.query(
        'UPDATE sections SET code = :code WHERE title = :title',
        {
          replacements: { code, title },
          type: Sequelize.QueryTypes.UPDATE,
        }
      );
    }
  },
};