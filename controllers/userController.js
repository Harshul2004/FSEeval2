const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const JWT_SECRET = 'werty3456fveea!@$ZE523@$ZERsjgysie4763878w6';

const userController = {
  register: async (email, password, firstName, lastName, role) => {
    try {
      console.log('Register attempt:', { email, firstName, lastName, role });
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({ where: { email: normalizedEmail } });
      if (existingUser) throw new Error('User already exists');

      const userRole = (role || 'customer').toLowerCase();
      if (!['admin', 'employee', 'customer'].includes(userRole)) {
        throw new Error('Invalid role');
      }

      const user = await User.create({
        email: normalizedEmail,
        password,
        role: userRole,
        firstName,
        lastName,
      });
      console.log('User created in DB:', { id: user.id, role: user.role }); // Debug DB role

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      });
      console.log('User registered, token generated:', { userId: user.id, token });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      console.error('Registration error:', error.message);
      throw new Error(error.message);
    }
  },

  login: async (email, password) => {
    try {
      console.log('Login attempt:', { email });
      const normalizedEmail = email.trim().toLowerCase();

      const user = await User.findOne({ where: { email: normalizedEmail } });
      if (!user) throw new Error('Invalid email or password');

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) throw new Error('Invalid email or password');

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      });
      console.log('User logged in, token generated, DB role:', { userId: user.id, token, role: user.role });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      console.error('Login error:', error.message);
      throw new Error(error.message);
    }
  },

  getCurrentUser: async (userId) => {
    try {
      console.log('Fetching current user with ID:', userId);
      const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
      if (!user) {
        console.log(`User not found in DB for ID: ${userId}`);
        throw new Error('User not found');
      }
      console.log('Current user fetched from DB:', user);
      return user;
    } catch (error) {
      console.error('Get current user error:', error.message);
      throw new Error(error.message);
    }
  },

  getAllUsers: async () => {
    try {
      return await User.findAll({ attributes: { exclude: ['password'] } });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserById: async (userId) => {
    try {
      const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateUser: async (userId, input) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');
      await user.update(input);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deactivateUser: async (userId) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');
      await user.update({ isActive: false });
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = userController;