'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const tableInfo = await queryInterface.describeTable('users', { transaction });

      if (!tableInfo.organisation_id) {
        await queryInterface.addColumn('users', 'organisation_id', {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        }, { transaction });
      }

      if (!tableInfo.adherent_id) {
        await queryInterface.addColumn('users', 'adherent_id', {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        }, { transaction });
      }

      if (tableInfo.password && tableInfo.password.allowNull !== false) {
        await queryInterface.changeColumn('users', 'password', {
          type: Sequelize.STRING,
          allowNull: true,
        }, { transaction });
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const tableInfo = await queryInterface.describeTable('users', { transaction });

      if (tableInfo.organisation_id) {
        await queryInterface.removeColumn('users', 'organisation_id', { transaction });
      }

      if (tableInfo.adherent_id) {
        await queryInterface.removeColumn('users', 'adherent_id', { transaction });
      }

      if (tableInfo.password) {
        await queryInterface.changeColumn('users', 'password', {
          type: Sequelize.STRING,
          allowNull: false,
        }, { transaction });
      }
    });
  },
};
