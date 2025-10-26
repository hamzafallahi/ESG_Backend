const db = require('../models');
const User = db.user;
const Admin = db.admin;
const SuperAdmin = db.super_admin;
const jwt = require('jsonwebtoken');
const AuthSerializer = require('../serializer/authserializer');
const config = require('../config/app-config');
const NotFoundError = require('../error/exception/NotFound');
const BusinessError = require('../error/BusinessError');
const TechnicalError = require('../error/TechnicalError');

// Signup - Register a new user
exports.signup = async (req, res, next) => {
  try {
    console.log('Signup request body:', req.body);
    // Check if user with this email already exists
    const existingUser = await User.findOne({
      where: { email: req.body.email }
    });

    if (existingUser) {
      const businessError = new BusinessError(409, 'EMAIL_IN_USE', 'Email already in use');
      businessError.addError('attributes.email', 'A user with this email already exists');
      throw businessError;
    }

    // Create new user
    const user = await User.create(req.body);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'user' },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION }
    );

    // Return user data with token
    const serializedUser = AuthSerializer.serialize(user.toJSON());
    return res.status(201).json({
      ...serializedUser,
      token
    });
  } catch (error) {
    next(error);
  }
};
// Login - Authenticate a user
exports.login = async (req, res, next) => {
  try {
    // Find user by email
    const user = await User.findOne({
      where: { email: req.body.email }
    });

    if (!user) {
      throw new NotFoundError('User not found', 'User');
    }

    // Verify password
    const isValidPassword = await user.validPassword(req.body.password);
    
    if (!isValidPassword) {
      const businessError = new BusinessError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
      businessError.addError('attributes.password', 'Email or password is incorrect');
      throw businessError;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'user' },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION }
    );

    // Return user data with token
    const serializedUser = AuthSerializer.serialize(user.toJSON());
    return res.status(200).json({
      ...serializedUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Get current user info
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      throw new NotFoundError('User not found', 'User');
    }

    const serializedUser = AuthSerializer.serialize(user.toJSON());
    return res.status(200).json(serializedUser);
  } catch (error) {
    next(error);
  }
};

// Admin Login - Authenticate an admin or super admin
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Try to find in super_admin first
    let user = await SuperAdmin.findOne({ where: { email } });
    let role = 'super_admin';
    
    // If not found in super_admin, try admin
    if (!user) {
      user = await Admin.findOne({ where: { email } });
      role = 'admin';
    }
    
    if (!user) {
      throw new NotFoundError('Admin not found', 'Admin');
    }

    // Check if admin is active
    if (!user.is_active) {
      const businessError = new BusinessError(403, 'ACCOUNT_INACTIVE', 'Account is inactive');
      businessError.addError('attributes.is_active', 'This account has been deactivated');
      throw businessError;
    }

    // Verify password
    const isValidPassword = await user.validPassword(password);
    
    if (!isValidPassword) {
      const businessError = new BusinessError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
      businessError.addError('attributes.password', 'Email or password is incorrect');
      throw businessError;
    }

    // Generate JWT token with role
    const token = jwt.sign(
      { id: user.id, email: user.email, role: role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION }
    );

    // Return admin data with token (without password)
    const userData = user.toJSON();
    return res.status(200).json({
      data: {
        type: role === 'super_admin' ? 'super_admins' : 'admins',
        id: userData.id,
        attributes: {
          username: userData.username,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          is_active: userData.is_active,
          role: role
        }
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Get current admin info
exports.getCurrentAdmin = async (req, res, next) => {
  try {
    let user;
    let role;
    
    // Try super_admin first
    user = await SuperAdmin.findByPk(req.userId);
    if (user) {
      role = 'super_admin';
    } else {
      // Try admin
      user = await Admin.findByPk(req.userId);
      role = 'admin';
    }
    
    if (!user) {
      throw new NotFoundError('Admin not found', 'Admin');
    }

    const userData = user.toJSON();
    return res.status(200).json({
      data: {
        type: role === 'super_admin' ? 'super_admins' : 'admins',
        id: userData.id,
        attributes: {
          username: userData.username,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          is_active: userData.is_active,
          role: role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
