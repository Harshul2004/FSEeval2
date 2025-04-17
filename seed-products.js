const { sequelize } = require('./config/database');
const { Product } = require('./models');

async function seedProducts() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await Product.bulkCreate([
      {
        name: 'Oak Dining Table',
        description: 'Solid oak table for 6, modern design.',
        price: 299.99,
        stock: 10,
        category: 'Dining',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Leather Sofa',
        description: 'Comfortable 3-seater with premium leather.',
        price: 599.99,
        stock: 5,
        category: 'Living Room',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Wooden Bookshelf',
        description: 'Sturdy 5-shelf unit, rustic finish.',
        price: 149.99,
        stock: 15,
        category: 'Storage',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { returning: true });

    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await sequelize.close();
  }
}

seedProducts();