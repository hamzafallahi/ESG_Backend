'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('subsector_weights', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      sub_sector_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sub_sectors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      domain_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'domains',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      weight: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addConstraint('subsector_weights', {
      fields: ['sub_sector_id', 'domain_id'],
      type: 'unique',
      name: 'subsector_weights_sub_sector_id_domain_id_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('subsector_weights');
  }
};
