const { sequelize } = require('./config/database');
const { Order, OrderItem, Product, User } = require('./models');

async function checkOrders() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Find the user
    const user = await User.findOne({
      where: { email: 'usertest1@gmail.com' }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', user.id);

    // Find all orders for this user
    const orders = await Order.findAll({
      where: { userId: user.id },
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });

    console.log('Number of orders found:', orders.length);
    console.log('Orders:', JSON.stringify(orders, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkOrders(); 