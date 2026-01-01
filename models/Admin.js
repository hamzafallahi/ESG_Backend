'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      // Admin belongs to a super admin (creator)
      Admin.belongsTo(models.super_admin, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      // Admin can send many inbox messages
      Admin.hasMany(models.inbox_message, {
        foreignKey: 'sent_by_admin_id',
        as: 'sent_messages'
      });

      // Admin can read many messages
      Admin.hasMany(models.message_read, {
        foreignKey: 'admin_id',
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
  
  Admin.init({
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
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'super_admins',
        key: 'id'
      }
    }
  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    modelName: 'admin',
    tableName: 'admins',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    hooks: {
      // Hash the password before creating an admin
      beforeCreate: async (admin) => {
        if (admin.password) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      },
      // Hash the password before updating an admin if it changed
      beforeUpdate: async (admin) => {
        if (admin.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      }
    }
  });
  
  return Admin;
};
