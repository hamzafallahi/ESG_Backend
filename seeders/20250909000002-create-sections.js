'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get the category IDs from the database
    const categories = await queryInterface.sequelize.query(
      "SELECT id, name FROM categories WHERE name IN ('Governance', 'Social', 'Environment')",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create a map of category names to IDs
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Define all sections based on evaluation-grid.json structure
    const sections = [
      // Governance Category Sections
      {
        id: uuidv4(),
        category_id: categoryMap['Governance'],
        title: 'The vision, strategy and governance of the CSR approach',
        title_fr: 'La vision, la stratégie et la gouvernance de la démarche de RSE',
        description: 'Assessment of CSR policy, business strategy and leadership commitment to sustainable development.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Governance'],
        title: 'Ethical approach: Anti-corruption policy and business ethics / Due diligence',
        title_fr: 'Démarche éthique:Politique de lutte contre la corruption et éthique des affaires / Devoir de diligence',
        description: 'Assessment of ethical practices, anti-corruption measures and due diligence processes.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Governance'],
        title: 'Relationship with clients and consumers',
        title_fr: 'Relation avec les clients et les consommateurs',
        description: 'Assessment of contractual commitment, customer listening and promotion of responsible consumption.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Governance'],
        title: 'Transparency: Executive Compensation',
        title_fr: 'Transparence : Rémunération des dirigeants',
        description: 'Assessment of financial data transparency, compensation disclosure and stakeholder involvement.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Governance'],
        title: 'Governance: Independence of the Board of Directors',
        title_fr: 'Gouvernance : Indépendance du conseil d\'administration',
        description: 'Assessment of board member independence and impartiality of decision-making processes.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Governance'],
        title: 'Feminization of management',
        title_fr: 'Féminisation de la direction',
        description: 'Assessment of feminization goals, equal opportunity policies and development of female skills.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Governance'],
        title: 'Data confidentiality and privacy protection',
        title_fr: 'Confidentialité des données et protection de la vie privée',
        description: 'Assessment of personal data protection procedures, awareness and regulatory compliance.',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Social Category Sections
      {
        id: uuidv4(),
        category_id: categoryMap['Social'],
        title: 'Working conditions: Compliance with regulatory standards in labor matters',
        title_fr: 'Condition de travail : Respect des normes règlementaires en matière de travail',
        description: 'Assessment of compliance with labor standards, employment contracts and human rights.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Social'],
        title: 'Working conditions: health and safety at work',
        title_fr: 'Condition de travail : santé et sécurité au travail',
        description: 'Assessment of safety committees, risk prevention procedures and safety certifications.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Social'],
        title: 'Working conditions: Equal pay',
        title_fr: 'Condition de travail :égalité des salaires',
        description: 'Assessment of pay equity, compensation grids and remuneration systems.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Social'],
        title: 'Working conditions: Employee training',
        title_fr: 'Condition de travail :Formation des employés',
        description: 'Assessment of skills development plans, continuous training and talent management.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Social'],
        title: 'Diversity and inclusion: Integration of women, people with reduced mobility, disabled people and young people',
        title_fr: 'Diversité et inclusion :Intégration de la femme , des personnes à mobilité réduite , en situation d\'handicape et des jeunes',
        description: 'Assessment of inclusion policies, diversity and adaptation of work spaces.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Social'],
        title: 'Community engagement and commitment to local communities',
        title_fr: 'Engagement communautaire et engagement sur les communautés locales',
        description: 'Assessment of territorial anchoring, relations with local communities and regional development.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Social'],
        title: 'Social dialogue: Relationship with unions and staff representatives',
        title_fr: 'Dialogue sociale: Relation avec les syndicats et représentants du personnel',
        description: 'Assessment of social dialogue, collective bargaining and relations with social partners.',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Environment Category Sections
      {
        id: uuidv4(),
        category_id: categoryMap['Environment'],
        title: 'Climate assessment: CO2 emissions: Carbon footprint/Carbon footprint',
        title_fr: 'Le bilan climatique : Emission de CO2 :Bilan carbone /Empreinte carbone',
        description: 'Assessment of carbon footprint, emission reduction targets and climate transition plans.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Environment'],
        title: 'Energy Management',
        title_fr: 'Management Énergétique',
        description: 'Assessment of energy efficiency, energy monitoring and energy certifications.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Environment'],
        title: 'Pollution: water use/pollution, waste management',
        title_fr: 'La pollution : l\'utilisation /la pollution de l\'eau, la gestion des déchets',
        description: 'Assessment of environmental aspects management, water pollution and waste management.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Environment'],
        title: 'Circular economy',
        title_fr: 'Economie circulaire',
        description: 'Assessment of circular economy processes, eco-design and use of recycled products.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: categoryMap['Environment'],
        title: 'Impact on biodiversity',
        title_fr: 'Impact sur la biodiversité',
        description: 'Assessment of biodiversity impact, ecological partnerships and preservation initiatives.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('sections', sections);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all sections
    const sectionsToDelete = [
      'The vision, strategy and governance of the CSR approach',
      'Ethical approach: Anti-corruption policy and business ethics / Due diligence',
      'Relationship with clients and consumers',
      'Transparency: Executive Compensation',
      'Governance: Independence of the Board of Directors',
      'Feminization of management',
      'Data confidentiality and privacy protection',
      'Working conditions: Compliance with regulatory standards in labor matters',
      'Working conditions: health and safety at work',
      'Working conditions: Equal pay',
      'Working conditions: Employee training',
      'Diversity and inclusion: Integration of women, people with reduced mobility, disabled people and young people',
      'Community engagement and commitment to local communities',
      'Social dialogue: Relationship with unions and staff representatives',
      'Climate assessment: CO2 emissions: Carbon footprint/Carbon footprint',
      'Energy Management',
      'Pollution: water use/pollution, waste management',
      'Circular economy',
      'Impact on biodiversity'
    ];

    await queryInterface.bulkDelete('sections', {
      title: {
        [Sequelize.Op.in]: sectionsToDelete
      }
    }, {});
  }
};
