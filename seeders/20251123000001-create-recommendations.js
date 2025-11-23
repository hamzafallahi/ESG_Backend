'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, fetch existing categories to get their IDs
    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories WHERE name IN ('Governance', 'Social', 'Environment');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (categories.length === 0) {
      console.log('No categories found. Please run category seeders first.');
      return;
    }

    // Map category names to IDs
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    const recommendations = [];

    // Governance Recommendations (levels 1-5)
    if (categoryMap['Governance']) {
      recommendations.push(
        {
          id: uuidv4(),
          category_id: categoryMap['Governance'],
          level: 1,
          name: 'Establish Basic Governance Framework',
          name_fr: 'Établir un cadre de gouvernance de base',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Governance'],
          level: 2,
          name: 'Implement Board Diversity and Ethics Policies',
          name_fr: 'Mettre en œuvre des politiques de diversité et d\'éthique du conseil',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Governance'],
          level: 3,
          name: 'Strengthen Risk Management and Compliance',
          name_fr: 'Renforcer la gestion des risques et la conformité',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Governance'],
          level: 4,
          name: 'Enhance Stakeholder Engagement and Transparency',
          name_fr: 'Améliorer l\'engagement des parties prenantes et la transparence',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Governance'],
          level: 5,
          name: 'Achieve Excellence in Corporate Governance',
          name_fr: 'Atteindre l\'excellence en gouvernance d\'entreprise',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // Social Recommendations (levels 1-5)
    if (categoryMap['Social']) {
      recommendations.push(
        {
          id: uuidv4(),
          category_id: categoryMap['Social'],
          level: 1,
          name: 'Implement Basic Employee Health and Safety',
          name_fr: 'Mettre en œuvre la santé et la sécurité de base des employés',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Social'],
          level: 2,
          name: 'Develop Fair Labor Practices and Training Programs',
          name_fr: 'Développer des pratiques de travail équitables et des programmes de formation',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Social'],
          level: 3,
          name: 'Foster Diversity, Equity and Inclusion',
          name_fr: 'Favoriser la diversité, l\'équité et l\'inclusion',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Social'],
          level: 4,
          name: 'Strengthen Community Engagement and Human Rights',
          name_fr: 'Renforcer l\'engagement communautaire et les droits de l\'homme',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Social'],
          level: 5,
          name: 'Lead in Social Responsibility and Employee Well-being',
          name_fr: 'Diriger en matière de responsabilité sociale et de bien-être des employés',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // Environment Recommendations (levels 1-5)
    if (categoryMap['Environment']) {
      recommendations.push(
        {
          id: uuidv4(),
          category_id: categoryMap['Environment'],
          level: 1,
          name: 'Start Basic Waste Management and Recycling',
          name_fr: 'Commencer la gestion de base des déchets et le recyclage',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Environment'],
          level: 2,
          name: 'Improve Energy Efficiency and Reduce Consumption',
          name_fr: 'Améliorer l\'efficacité énergétique et réduire la consommation',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Environment'],
          level: 3,
          name: 'Implement Carbon Footprint Reduction Program',
          name_fr: 'Mettre en œuvre un programme de réduction de l\'empreinte carbone',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Environment'],
          level: 4,
          name: 'Adopt Renewable Energy and Circular Economy',
          name_fr: 'Adopter les énergies renouvelables et l\'économie circulaire',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          category_id: categoryMap['Environment'],
          level: 5,
          name: 'Achieve Carbon Neutrality and Environmental Leadership',
          name_fr: 'Atteindre la neutralité carbone et le leadership environnemental',
          image: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // Insert recommendations
    if (recommendations.length > 0) {
      await queryInterface.bulkInsert('recommendations', recommendations);
      console.log(`Inserted ${recommendations.length} recommendations`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all recommendations
    await queryInterface.bulkDelete('recommendations', null, {});
  }
};
