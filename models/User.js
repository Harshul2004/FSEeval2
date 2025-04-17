module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255), // Store hashed password
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'employee', 'customer'),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'Users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const bcrypt = require('bcrypt');
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.password) {
          const bcrypt = require('bcrypt');
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
    },
  });

  User.associate = function(models) {
    User.hasMany(models.Order, { foreignKey: 'userId' });
  };

  return User;
};