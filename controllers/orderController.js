const { Order, OrderItem, Product, User } = require('../models');

const orderController = {
  // Create a new order
  createOrder: async (userId, items, shippingAddress, paymentMethod, user) => {
    try {
      if (!user) throw new Error('Not authenticated');
      if (!userId) throw new Error('User ID is required');
      if (user.role !== 'admin' && user.id !== userId) throw new Error('Not authorized');

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('No items provided for order');
      }
      if (!shippingAddress || !paymentMethod) {
        throw new Error('Shipping address and payment method are required');
      }

      let totalAmount = 0;
      for (const item of items) {
        if (!item.productId || !item.quantity || isNaN(item.quantity)) {
          throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
        }
        const product = await Product.findByPk(item.productId);
        if (!product) throw new Error(`Product with ID ${item.productId} not found`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.name}`);
        totalAmount += product.price * item.quantity;
      }

      const order = await Order.create({
        userId: userId,
        totalAmount,
        status: 'PENDING',
        shippingAddress,
        paymentMethod,
      });

      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
        await product.update({ stock: product.stock - item.quantity });
      }

      // Fetch the complete order with all associations
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            include: [Product],
            attributes: ['id', 'quantity', 'price']
          }
        ]
      });

      return completeOrder;
    } catch (error) {
      console.error('Order creation error:', {
        message: error.message,
        stack: error.stack,
        userId,
        user,
      });
      throw error;
    }
  },

  // [Rest of the methods remain unchanged]
  getAllOrders: async (user) => {
    try {
      if (user && user.role !== 'admin') throw new Error('Not authorized');
      return await Order.findAll({
        include: [
          { model: OrderItem, include: [Product] },
          User,
        ],
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOrderById: async (orderId, user) => {
    try {
      const order = await Order.findByPk(orderId, {
        include: [
          { model: OrderItem, include: [Product] },
          User,
        ],
      });
      if (!order) throw new Error('Order not found');
      if (user && user.role !== 'admin' && order.userId !== user.id) throw new Error('Not authorized');
      return order;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOrdersByUserId: async (userId, user) => {
    try {
      if (!user || (user.role !== 'admin' && user.id !== userId)) throw new Error('Not authorized');
      console.log('Fetching orders for user:', userId); // Debug log
      
      const orders = await Order.findAll({
        where: { userId },
        include: [
          {
            model: OrderItem,
            include: [Product],
            attributes: ['id', 'quantity', 'price']
          }
        ],
        order: [['createdAt', 'DESC']], // Sort by newest first
        raw: false // Ensure we get full model instances
      });

      // Convert to plain objects and ensure all fields are present
      const formattedOrders = orders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        items: order.OrderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.Product.id,
            name: item.Product.name,
            price: item.Product.price
          }
        }))
      }));

      console.log('Found orders:', formattedOrders.length); // Debug log
      console.log('First order sample:', formattedOrders[0]); // Debug log
      return formattedOrders;
    } catch (error) {
      console.error('Error in getOrdersByUserId:', error); // Debug log
      throw new Error(error.message);
    }
  },

  updateOrderStatus: async (orderId, status, user) => {
    try {
      if (!user || !['admin', 'employee'].includes(user.role)) throw new Error('Not authorized');
      const order = await Order.findByPk(orderId);
      if (!order) throw new Error('Order not found');
      await order.update({ status });
      return order;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  cancelOrder: async (orderId, user) => {
    try {
      if (!user) throw new Error('Not authenticated');
      const order = await Order.findByPk(orderId, { include: [OrderItem] });
      if (!order) throw new Error('Order not found');
      if (order.status === 'CANCELLED') throw new Error('Order is already cancelled');
      if (user.role !== 'admin' && order.userId !== user.id) throw new Error('Not authorized');

      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);
        await product.update({ stock: product.stock + item.quantity });
      }

      await order.update({ status: 'CANCELLED' });
      return order;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = orderController;
