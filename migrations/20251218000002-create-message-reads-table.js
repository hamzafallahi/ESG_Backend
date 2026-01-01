'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('message_reads', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      message_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'inbox_messages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      super_admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'super_admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add constraint to ensure at least one of admin_id or super_admin_id is not null
    await queryInterface.sequelize.query(`
      ALTER TABLE message_reads 
      ADD CONSTRAINT check_reader_exists 
      CHECK (
        (admin_id IS NOT NULL AND super_admin_id IS NULL) OR 
        (admin_id IS NULL AND super_admin_id IS NOT NULL)
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE message_reads DROP CONSTRAINT IF EXISTS check_reader_exists;');
    await queryInterface.dropTable('message_reads');
  }
};
