const db = require('../models');
const User = db.user;
const jwt = require('jsonwebtoken');
const AuthSerializer = require('../serializer/authserializer');
const config = require('../config/app-config');
const NotFoundError = require('../error/exception/NotFound');
const BusinessError = require('../error/BusinessError');
const TechnicalError = require('../error/TechnicalError');

// Signup - Register a new user
exports.signup = async (req, res) => {
  try {
    console.log('Signup request body:', req.body);
    // Check if user with this email already exists
    const existingUser = await User.findOne({
      where: { email: req.body.email }
    });

    if (existingUser) {
      throw new BusinessError({
        status: 409,
        title: 'Email already in use',
        detail: 'A user with this email already exists'
      });
    }

    // Create new user
    const user = await User.create(req.body);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
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
    throw new TechnicalError(500, 'SIGNUP_ERROR', 'An unexpected error occurred during signup', error.message);
  }
};

// Login - Authenticate a user
exports.login = async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({
      where: { email: req.body.email }
    });

    if (!user) {
      throw new NotFoundError({
        status: 404,
        title: 'User not found',
        detail: 'No user found with this email'
      });
    }

    // Verify password
    const isValidPassword = await user.validPassword(req.body.password);
    
    if (!isValidPassword) {
      throw new BusinessError({
        status: 401,
        title: 'Invalid credentials',
        detail: 'Email or password is incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
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
    throw error;
  }
};

// Get current user info
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      throw new NotFoundError({
        status: 404,
        title: 'User not found',
        detail: 'User no longer exists'
      });
    }

    const serializedUser = AuthSerializer.serialize(user.toJSON());
    return res.status(200).json(serializedUser);
  } catch (error) {
    throw error;
  }
};