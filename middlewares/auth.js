const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req) => {
  try {
    console.log('Auth header:', req.headers.authorization || 'undefined'); // Debug log
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header, proceeding without auth'); // Allow unauth for products
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token in header');
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'werty3456fveea!@$ZE523@$ZERsjgysie4763878w6'); // Fallback secret
    console.log('Token decoded:', decoded);
    const userId = decoded.id;
    console.log('Fetching user with ID:', userId);
    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });

    if (!user) {
      console.log(`User not found in DB for ID: ${userId}`);
      return null;
    }
    if (!user.isActive) {
      console.log(`User ID ${userId} is inactive`);
      return null;
    }

    console.log('User fetched successfully:', user);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  } catch (error) {
    console.error('Auth error:', error.message);
    return null;
  }
};

const requireAuth = (roles = []) => {
  return async (req, res, next) => {
    const user = await authMiddleware(req);
    if (!user && roles.length > 0) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (user && roles.length > 0 && !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    req.user = user;
    next();
  };
};

module.exports = {
  authMiddleware,
  requireAuth,
};