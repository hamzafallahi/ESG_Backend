'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    
    const superAdmins = [
      {
        id: uuidv4(),
        username: 'hamzafallahi',
        email: 'hamza.fallahi@esen.tn',
        password: await bcrypt.hash('azer', salt),
        first_name: 'Hamza',
        last_name: 'Fallahi',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'superadmin1',
        email: 'superadmin1@example.com',
        password: await bcrypt.hash('SuperAdmin123!', salt),
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'superadmin2',
        email: 'superadmin2@example.com',
        password: await bcrypt.hash('SuperAdmin123!', salt),
        first_name: 'Jane',
        last_name: 'Smith',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Use bulkInsert directly (bypasses model hooks)
    await queryInterface.bulkInsert('super_admins', superAdmins);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('super_admins', null, {});
  }
};
