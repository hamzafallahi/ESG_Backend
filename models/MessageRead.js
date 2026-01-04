'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MessageRead extends Model {
    static associate(models) {
      // Read belongs to a message
      MessageRead.belongsTo(models.inbox_message, {
        foreignKey: 'message_id',
        as: 'message'
      });

      // Read can be by an admin
      MessageRead.belongsTo(models.admin, {
        foreignKey: 'admin_id',
        as: 'reader_admin'
      });

      // Read can be by a super admin
      MessageRead.belongsTo(models.super_admin, {
        foreignKey: 'super_admin_id',
        as: 'reader_super_admin'
      });
    }

    // Custom validation to ensure either admin_id or super_admin_id is set
    static async beforeValidate(instance) {
      if (!instance.admin_id && !instance.super_admin_id) {
        throw new Error('Either admin_id or super_admin_id must be provided');
      }
      if (instance.admin_id && instance.super_admin_id) {
        throw new Error('Cannot have both admin_id and super_admin_id set');
      }
    }
  }
  
  MessageRead.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    message_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'inbox_messages',
        key: 'id'
      },
      validate: {
        notEmpty: {
          msg: 'Message ID cannot be empty'
        }
      }
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id'
      }
    },
    super_admin_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'super_admins',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'message_read',
    tableName: 'message_reads',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
      eitherAdminOrSuperAdmin() {
        if (!this.admin_id && !this.super_admin_id) {
          throw new Error('Either admin_id or super_admin_id must be provided');
        }
        if (this.admin_id && this.super_admin_id) {
          throw new Error('Cannot have both admin_id and super_admin_id set');
        }
      }
    }
  });

  return MessageRead;
};
