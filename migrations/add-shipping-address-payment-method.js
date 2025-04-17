'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'shippingAddress', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Not specified'
    });

    await queryInterface.addColumn('Orders', 'paymentMethod', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'CASH'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'shippingAddress');
    await queryInterface.removeColumn('Orders', 'paymentMethod');
  }
}; 