const { Invoice, Order } = require('../models');

const invoiceController = {
  generateInvoice: async (orderId, user) => {
    try {
      const order = await Order.findByPk(orderId, { include: ['OrderItems'] });
      if (!order) throw new Error('Order not found');

      if (user && !['admin', 'employee'].includes(user.role)) throw new Error('Not authorized');

      const invoiceNumber = `INV-${Date.now()}`;
      const invoice = await Invoice.create({
        orderId: order.id,
        invoiceNumber,
        amount: order.totalAmount
      });

      return invoice;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getInvoiceById: async (id, user) => {
    try {
      const invoice = await Invoice.findByPk(id, {
        include: [{ model: Order, include: ['OrderItems'] }]
      });
      if (!invoice) throw new Error('Invoice not found');

      if (user && user.role !== 'admin' && invoice.Order.userId !== user.id) throw new Error('Not authorized');

      return invoice;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getInvoicesByOrder: async (orderId, user) => {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) throw new Error('Order not found');

      if (user && user.role !== 'admin' && order.userId !== user.id) throw new Error('Not authorized');

      return await Invoice.findAll({
        where: { orderId },
        include: [{ model: Order, include: ['OrderItems'] }]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllInvoices: async (user) => {
    try {
      if (user && user.role !== 'admin') throw new Error('Not authorized');
      return await Invoice.findAll({
        include: [{ model: Order, include: ['OrderItems'] }]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  downloadInvoice: async (id, user) => {
    try {
      const invoice = await Invoice.findByPk(id, {
        include: [{ model: Order, include: ['OrderItems'] }]
      });
      if (!invoice) throw new Error('Invoice not found');

      if (user && !['admin', 'employee'].includes(user.role)) throw new Error('Not authorized');

      // TODO: Implement PDF generation
      return invoice; // Return data for now
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = invoiceController;