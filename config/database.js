const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce_furniture', // Default DB name if not in .env
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'harshul@123', // Match DB_PASS from .env
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306, // Default MySQL port
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize };