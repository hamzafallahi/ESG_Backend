'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_inbox_messages_status" AS ENUM ('unresolved', 'resolved');
    `);
    
    // Add status column
    await queryInterface.addColumn('inbox_messages', 'status', {
      type: Sequelize.ENUM('unresolved', 'resolved'),
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove status column
    await queryInterface.removeColumn('inbox_messages', 'status');
    
    // Drop status ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_inbox_messages_status";');
  }
};
