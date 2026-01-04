'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InboxMessage extends Model {
    static associate(models) {
      // Message can be sent by a user
      InboxMessage.belongsTo(models.user, {
        foreignKey: 'sent_by_user_id',
        as: 'sender_user'
      });

      // Message can be sent by an admin
      InboxMessage.belongsTo(models.admin, {
        foreignKey: 'sent_by_admin_id',
        as: 'sender_admin'
      });

      // Message can be sent by a super admin
      InboxMessage.belongsTo(models.super_admin, {
        foreignKey: 'sent_by_super_admin_id',
        as: 'sender_super_admin'
      });

      // Message has many reads
      InboxMessage.hasMany(models.message_read, {
        foreignKey: 'message_id',
        as: 'reads',
        onDelete: 'CASCADE'
      });
    }
  }
  
  InboxMessage.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sent_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sent_by_admin_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id'
      }
    },
    sent_by_super_admin_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'super_admins',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('contact_us', 'retake_request', 'support_request', 'bug_report', 'result_feedback'),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Message type cannot be empty'
        },
        isIn: {
          args: [['contact_us', 'retake_request', 'support_request', 'bug_report', 'result_feedback']],
          msg: 'Invalid message type'
        }
      }
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('unresolved', 'resolved'),
      allowNull: true,
      defaultValue: null,
      validate: {
        isIn: {
          args: [['unresolved', 'resolved']],
          msg: 'Invalid status. Must be either unresolved or resolved'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'inbox_message',
    tableName: 'inbox_messages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return InboxMessage;
};
