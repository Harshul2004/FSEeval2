const bcrypt = require('bcrypt');
const { sequelize } = require('./models');
const { User } = require('./models');

async function seedAdmin() {
  try {
    // Admin user data
    const adminData = {
      email: 'admin@ecommerce.com',
      password: 'Admin@123', // This will be hashed by the User model hooks
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: adminData.email }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create(adminData);
    console.log('Admin user created successfully:', admin.email);

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the seed
seedAdmin(); 