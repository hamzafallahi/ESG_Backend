'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('users', 'surname', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('users', 'position', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'website_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'organisation_phone_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'organisation_email', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'postal_code', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('users', 'city', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('users', 'state', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('users', 'country', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('users', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'tax_number', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('users', 'linkedin', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'facebook', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'twitter', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'logo_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'video_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'video_url');
    await queryInterface.removeColumn('users', 'logo_url');
    await queryInterface.removeColumn('users', 'twitter');
    await queryInterface.removeColumn('users', 'facebook');
    await queryInterface.removeColumn('users', 'linkedin');
    await queryInterface.removeColumn('users', 'tax_number');
    await queryInterface.removeColumn('users', 'description');
    await queryInterface.removeColumn('users', 'country');
    await queryInterface.removeColumn('users', 'state');
    await queryInterface.removeColumn('users', 'city');
    await queryInterface.removeColumn('users', 'postal_code');
    await queryInterface.removeColumn('users', 'address');
    await queryInterface.removeColumn('users', 'organisation_email');
    await queryInterface.removeColumn('users', 'organisation_phone_number');
    await queryInterface.removeColumn('users', 'website_url');
    await queryInterface.removeColumn('users', 'position');
    await queryInterface.removeColumn('users', 'surname');
    await queryInterface.removeColumn('users', 'name');
  }
};
