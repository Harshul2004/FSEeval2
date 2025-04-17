module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['orderId'],
      },
      {
        fields: ['productId'],
      },
    ],
  });

  OrderItem.associate = function(models) {
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'productId' });
  };

  return OrderItem;
};