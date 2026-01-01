'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class SuperAdmin extends Model {
    static associate(models) {
      // Super admin can create many admins
      SuperAdmin.hasMany(models.admin, {
        foreignKey: 'created_by',
        as: 'admins'
      });

      // Super admin can send many inbox messages
      SuperAdmin.hasMany(models.inbox_message, {
        foreignKey: 'sent_by_super_admin_id',
        as: 'sent_messages'
      });

      // Super admin can read many messages
      SuperAdmin.hasMany(models.message_read, {
        foreignKey: 'super_admin_id',
        as: 'read_messages'
      });
    }

    // Method to check if password matches
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    // Remove password from JSON output
    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }
  
  SuperAdmin.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Username already exists'
      },
      validate: {
        notEmpty: {
          msg: 'Username cannot be empty'
        },
        len: {
          args: [3, 50],
          msg: 'Username must be between 3 and 50 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email address already in use'
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password cannot be empty'
        },
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    modelName: 'super_admin',
    tableName: 'super_admins',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    hooks: {
      // Hash the password before creating a super admin
      beforeCreate: async (superAdmin) => {
        if (superAdmin.password) {
          const salt = await bcrypt.genSalt(10);
          superAdmin.password = await bcrypt.hash(superAdmin.password, salt);
        }
      },
      // Hash the password before updating a super admin if it changed
      beforeUpdate: async (superAdmin) => {
        if (superAdmin.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          superAdmin.password = await bcrypt.hash(superAdmin.password, salt);
        }
      }
    }
  });
  
  return SuperAdmin;
};
