const db = require('../models');
const User = db.user;
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