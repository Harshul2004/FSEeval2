module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
    ],
  });

  Order.associate = function(models) {
    Order.belongsTo(models.User, { foreignKey: 'userId' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
    Order.hasOne(models.Invoice, { foreignKey: 'orderId' });
  };

  return Order;
};