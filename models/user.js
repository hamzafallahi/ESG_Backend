'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here if needed
      User.hasOne(models.assessment_progress, {
        foreignKey: 'user_id',
        as: 'assessment_progress',
        onDelete: 'CASCADE'
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
  
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    organization_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Organization name cannot be empty'
        }
      }
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Phone number cannot be empty'
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
    }
  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    modelName: 'user',
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    hooks: {
      // Hash the password before creating a user
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hash the password before updating a user if it changed
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Create AssessmentProgress entry after user is created
      afterCreate: async (user) => {
        const AssessmentProgress = sequelize.models.assessment_progress;
        if (AssessmentProgress) {
          await AssessmentProgress.create({
            user_id: user.id,
            answers: {},
            current_page: 0,
            ui_state: {},
            total_questions: 0,
            answered_questions: 0,
            completion_percentage: 0.00
          });
        }
      }
    }
  });
  
  return User;
};