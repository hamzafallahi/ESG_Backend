'use strict';

const { v4: uuidv4 } = require('uuid');

// The 6 automotive sub-sectors.
const SUB_SECTORS = [
  {
    code: 'TS',
    label: 'Traitement de surface / Chimie',
  },
  {
    code: 'FF',
    label: 'Fonderie / Forge / Métallurgie',
  },
  {
    code: 'PL',
    label: 'Plasturgie / Injection / Composites',
  },
  {
    code: 'CA',
    label: 'Câblage / Assemblage électrique',
  },
  {
    code: 'EE',
    label: 'Électronique embarquée / Logiciel',
  },
  {
    code: 'MP',
    label: 'Mécanique de précision / Usinage',
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