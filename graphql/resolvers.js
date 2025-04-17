const { User, Product, Order, OrderItem, Invoice } = require('../models');
const jwt = require('jsonwebtoken');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const invoiceController = require('../controllers/invoiceController');

// Assuming a secret key for JWT - move to .env or config for security
const JWT_SECRET = 'werty3456fveea!@$ZE523@$ZERsjgysie4763878w6'; // Replace with process.env.JWT_SECRET or a secure value

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return userController.getCurrentUser(user.id);
    },

    users: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Not authorized');
      return userController.getAllUsers();
    },

    user: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Not authorized');
      return userController.getUserById(id);
    },

    products: async () => {
      return await Product.findAll();
    },

    productsByCategory: async (_, { category }) => {
      console.log('Resolving productsByCategory query, category:', category);
      return await productController.getProductsByCategory(category);
    },

    product: async (_, { id }) => {
      return await Product.findByPk(id);
    },

    orders: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      if (['admin', 'employee'].includes(user.role)) {
        return await Order.findAll({
          include: [
            { 
              model: OrderItem,
              include: [Product]
            },
            User,
          ],
        });
      }
      return orderController.getOrdersByUserId(user.id, user);
    },

    order: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return orderController.getOrderById(id, user);
    },

    ordersByStatus: async (_, { status }, { user }) => {
      if (!user || !['admin', 'employee'].includes(user.role)) throw new Error('Not authorized');
      const orders = await orderController.getAllOrders(user);
      return orders.filter(order => order.status === status);
    },

    ordersByUser: async (_, { userId }, { user }) => {
      if (!user || (user.role !== 'admin' && user.id !== userId)) throw new Error('Not authorized');
      return orderController.getOrdersByUserId(userId, user);
    },

    myOrders: async (_, __, { user }) => {
      try {
        console.log('🔍 myOrders resolver called');
        console.log('👤 User in context:', JSON.stringify(user, null, 2));

        if (!user) throw new Error('Not authenticated');
        if (!user.id) throw new Error('User ID not found in context');

        // Direct database query to fetch orders
        const orders = await Order.findAll({
          where: { userId: user.id }, // Use the actual user ID from context
          include: [
            {
              model: OrderItem,
              include: [{
                model: Product,
                attributes: ['id', 'name', 'price']
              }],
              attributes: ['id', 'quantity', 'price']
            }
          ],
          order: [['createdAt', 'DESC']]
        });

        console.log(`📦 Found ${orders.length} orders`);

        // Convert Sequelize instances to plain objects and format them
        const formattedOrders = orders.map(order => {
          const plainOrder = order.get({ plain: true });
          return {
            id: plainOrder.id,
            status: plainOrder.status || 'PENDING',
            totalAmount: parseFloat(plainOrder.totalAmount),
            createdAt: new Date(plainOrder.createdAt).toISOString(),
            shippingAddress: plainOrder.shippingAddress || 'Not specified',
            paymentMethod: plainOrder.paymentMethod || 'Not specified',
            items: plainOrder.OrderItems.map(item => ({
              id: item.id,
              quantity: item.quantity,
              price: parseFloat(item.price),
              product: {
                id: item.Product.id,
                name: item.Product.name,
                price: parseFloat(item.Product.price)
              }
            }))
          };
        });

        console.log('✅ Successfully formatted orders');
        return formattedOrders;
      } catch (error) {
        console.error('❌ Error in myOrders resolver:', error);
        throw new Error('Failed to fetch orders: ' + error.message);
      }
    },

    invoice: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return invoiceController.getInvoiceById(id, user);
    },

    invoicesByOrder: async (_, { orderId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return invoiceController.getInvoicesByOrder(orderId, user);
    },

    // Employee queries
    getEmployees: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized');
      }
      return await User.findAll({
        where: { role: 'employee' }
      });
    },
    getActiveEmployees: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized');
      }
      return await User.findAll({
        where: { role: 'employee', isActive: true }
      });
    },
    getInactiveEmployees: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized');
      }
      return await User.findAll({
        where: { role: 'employee', isActive: false }
      });
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      try {
        const { email, password, firstName, lastName, role } = input;
        const result = await userController.register(email, password, firstName, lastName, role || 'customer');
        if (!result.token) {
          const token = jwt.sign({ id: result.user.id, role: result.user.role }, JWT_SECRET, { expiresIn: '1h' });
          result.token = token;
        }
        return {
          token: result.token,
          user: {
            ...result.user,
            role: result.user.role
          }
        };
      } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Registration failed');
      }
    },

    login: async (_, { email, password }) => {
      try {
        const result = await userController.login(email, password);
        if (!result.token) {
          const token = jwt.sign({ id: result.user.id, role: result.user.role }, JWT_SECRET, { expiresIn: '1h' });
          result.token = token;
        }
        return {
          token: result.token,
          user: result.user
        };
      } catch (error) {
        throw new Error(error.message || 'Login failed');
      }
    },

    updateUser: async (_, { id, input }, { user }) => {
      if (!user || (user.role !== 'admin' && user.id !== id)) throw new Error('Not authorized');
      try {
        return userController.updateUser(id, input);
      } catch (error) {
        throw new Error(error.message);
      }
    },

    deactivateUser: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Not authorized');
      try {
        return userController.deactivateUser(id);
      } catch (error) {
        throw new Error(error.message);
      }
    },

    createProduct: async (_, { input }, { user }) => {
      if (!user || !['admin', 'employee'].includes(user.role)) {
        throw new Error('Not authorized');
      }
      return await Product.create(input);
    },

    updateProduct: async (_, { id, input }, { user }) => {
      if (!user || !['admin', 'employee'].includes(user.role)) {
        throw new Error('Not authorized');
      }
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Product not found');
      }
      await product.update(input);
      return product;
    },

    deleteProduct: async (_, { id }, { user }) => {
      if (!user || !['admin', 'employee'].includes(user.role)) {
        throw new Error('Not authorized');
      }
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Product not found');
      }
      await product.destroy();
      return true;
    },

    createOrder: async (_, { input }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      if (!user.id) throw new Error('User ID not found in context');
      const { items, shippingAddress, paymentMethod } = input;
      return orderController.createOrder(user.id, items, shippingAddress, paymentMethod, user);
    },

    updateOrderStatus: async (_, { id, status }, { user }) => {
      if (!user || !['admin', 'employee'].includes(user.role)) throw new Error('Not authorized');
      return orderController.updateOrderStatus(id, status, user);
    },

    cancelOrder: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return orderController.cancelOrder(id, user);
    },

    generateInvoice: async (_, { orderId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      try {
        return invoiceController.generateInvoice(orderId, user);
      } catch (error) {
        throw new Error(error.message);
      }
    },

    // Employee mutations
    createEmployee: async (_, { input }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized');
      }

      const existingUser = await User.findOne({
        where: { email: input.email }
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }

      return await User.create({
        ...input,
        role: 'employee',
        isActive: true
      });
    },

    updateEmployee: async (_, { id, input }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized');
      }

      const employee = await User.findOne({
        where: { id, role: 'employee' }
      });

      if (!employee) {
        throw new Error('Employee not found');
      }

      // If updating email, check if it's already in use
      if (input.email && input.email !== employee.email) {
        const existingUser = await User.findOne({
          where: { email: input.email }
        });

        if (existingUser) {
          throw new Error('Email already in use');
        }
      }

      await employee.update({
        ...input,
        role: 'employee' // Ensure role remains employee
      });

      return employee;
    },

    toggleEmployeeStatus: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized');
      }

      const employee = await User.findOne({
        where: { id, role: 'employee' }
      });

      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.update({
        isActive: !employee.isActive
      });

      return employee;
    },
  },

  Order: {
    user: async (order) => User.findByPk(order.userId),
    items: async (order) => OrderItem.findAll({ where: { orderId: order.id } }),
    invoice: async (order) => Invoice.findOne({ where: { orderId: order.id } }),
  },

  OrderItem: {
    product: async (orderItem) => Product.findByPk(orderItem.productId),
  },

  Invoice: {
    order: async (invoice) => Order.findByPk(invoice.orderId),
  },
};

module.exports = resolvers;