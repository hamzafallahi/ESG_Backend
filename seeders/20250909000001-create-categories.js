'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define the categories based on the evaluation-grid.json structure
    const categories = [
      {
        id: uuidv4(),
        name: 'Governance',
        name_fr: 'Gouvernance',
        description: 'Corporate governance encompasses the rules, practices and processes by which a company is directed and controlled. It concerns the distribution of powers between different stakeholders, transparency of decisions, risk management and business ethics.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Social',
        name_fr: 'Social',
        description: 'The social component of ESG concerns the impact of the company on people and society. It includes employee relations, working conditions, diversity and inclusion, health and safety, human rights, and community engagement.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Environment',
        name_fr: 'Environnement',
        description: 'The environmental aspect covers the company\'s impact on the natural environment. It includes waste management, energy efficiency, greenhouse gas emissions, sustainable use of resources, biodiversity protection and adaptation to climate change.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert the categories into the database
    await queryInterface.bulkInsert('categories', categories);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all categories (be careful with this in production)
    await queryInterface.bulkDelete('categories', {
      name: {
        [Sequelize.Op.in]: ['Governance', 'Social', 'Environment']
      }
    }, {});
  }
};
