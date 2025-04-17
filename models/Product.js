module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
      {
        fields: ['category'],
      },
    ],
  });

  Product.associate = function(models) {
    Product.hasMany(models.OrderItem, { foreignKey: 'productId' });
  };

  return Product;
};