'use strict';

const SECTION_TITLE_TO_CODE = {
  'The vision, strategy and governance of the CSR approach': 'G1',
  'Ethical approach: Anti-corruption policy and business ethics / Due diligence': 'G2',
  'Relationship with clients and consumers': 'G3',
  'Transparency: Executive Compensation': 'G4',
  'Governance: Independence of the Board of Directors': 'G5',
  'Feminization of management': 'G6',
  'Data confidentiality and privacy protection': 'G7',
  'Working conditions: Compliance with regulatory standards in labor matters': 'S1',
  'Working conditions: health and safety at work': 'S2',
  'Working conditions: Equal pay': 'S3',
  'Working conditions: Employee training': 'S4',
  'Diversity and inclusion: Integration of women, people with reduced mobility, disabled people and young people': 'S5',
  'Community engagement and commitment to local communities': 'S6',
  'Social dialogue: Relationship with unions and staff representatives': 'S7',
  'Climate assessment: CO2 emissions: Carbon footprint/Carbon footprint': 'E1',
  'Energy Management': 'E2',
  'Pollution: water use/pollution, waste management': 'E3',
  'Circular economy': 'E4',
  'Impact on biodiversity': 'E5',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sections', 'code', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Populate the domain code for existing sections based on their English title.
    for (const [title, code] of Object.entries(SECTION_TITLE_TO_CODE)) {
      await queryInterface.sequelize.query(
        'UPDATE sections SET code = :code WHERE title = :title',
        { replacements: { code, title } }
      );
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('sections', 'code');
  },
};
