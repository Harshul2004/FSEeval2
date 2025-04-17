module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
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
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
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
        unique: true,
        fields: ['invoiceNumber'],
      },
    ],
  });

  Invoice.associate = function(models) {
    Invoice.belongsTo(models.Order, { foreignKey: 'orderId' });
  };

  return Invoice;
};