const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', { name: req.body.name, email: req.body.email });
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Optimized: Check if user already exists (use lean() for better performance)
    const existingUser = await User.findOne({ email: trimmedEmail }).lean();

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email. Please login instead.',
        code: 'USER_EXISTS'
      });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: trimmedEmail,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Todo Master!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Please check your input and try again.',
        errors: messages,
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Handle duplicate email (MongoDB duplicate key error)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.',
        code: 'USER_EXISTS'
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with enhanced error handling
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fast validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        code: 'MISSING_FIELDS'
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Find user first
    const user = await User.findOne({ email: trimmedEmail }).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User does not exist. Please register first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.',
        code: 'INVALID_PASSWORD'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful! Welcome back!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a more advanced implementation, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Server error during logout'
    });
  }
});

module.exports = router;
