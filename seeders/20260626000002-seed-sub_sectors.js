'use strict';

const { v4: uuidv4 } = require('uuid');

// The 6 automotive sub-sectors. `label` is the English label, `label_fr` the
// French one.
const SUB_SECTORS = [
  {
    code: 'TS',
    label: 'Surface Treatment / Chemicals',
    label_fr: 'Traitement de surface / Chimie',
  },
  {
    code: 'FF',
    label: 'Foundry / Forging / Metallurgy',
    label_fr: 'Fonderie / Forge / Métallurgie',
  },
  {
    code: 'PL',
    label: 'Plastics Processing / Injection Molding / Composites',
    label_fr: 'Plasturgie / Injection / Composites',
  },
  {
    code: 'CA',
    label: 'Wiring / Electrical Assembly',
    label_fr: 'Câblage / Assemblage électrique',
  },
  {
    code: 'EE',
    label: 'Embedded Electronics / Software',
    label_fr: 'Électronique embarquée / Logiciel',
  },
  {
    code: 'MP',
    label: 'Precision Mechanics / Machining',
    label_fr: 'Mécanique de précision / Usinage',
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const codes = SUB_SECTORS.map((s) => s.code);

    const existing = await queryInterface.sequelize.query(
      'SELECT code FROM sub_sectors WHERE code IN (:codes)',
      {
        replacements: { codes },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const existingCodes = new Set(existing.map((s) => s.code));

    // Insert missing sub-sectors
    const toInsert = SUB_SECTORS.filter(
      (s) => !existingCodes.has(s.code)
    ).map((s) => ({
      id: uuidv4(),
      code: s.code,
      label: s.label,
      label_fr: s.label_fr,
      active: true,
      created_at: now,
      updated_at: now,
    }));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('sub_sectors', toInsert);
    }

    // Update labels for existing sub-sectors
    for (const subSector of SUB_SECTORS) {
      await queryInterface.bulkUpdate(
        'sub_sectors',
        {
          label: subSector.label,
          label_fr: subSector.label_fr,
          updated_at: now,
        },
        {
          code: subSector.code,
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const codes = SUB_SECTORS.map((s) => s.code);

    await queryInterface.bulkDelete(
      'sub_sectors',
      {
        code: {
          [Sequelize.Op.in]: codes,
        },
      },
      {}
    );
  },
};