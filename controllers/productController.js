const { Product } = require('../models');

const productController = {

  getAllProducts: async () => {
    try {
      console.log('Fetching all products');
      return await Product.findAll();
    } catch (error) {
      console.error('Error fetching products:', error.message);
      throw new Error('Failed to fetch products');
    }
  },

  getProductById: async (productId) => {
    try {
      const product = await Product.findByPk(productId);
      if (!product) throw new Error('Product not found');
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getProductsByCategory: async (category) => {
    try {
      console.log('Fetching products by category:', category);
      return await Product.findAll({ where: { category } });
    } catch (error) {
      console.error('Error fetching products by category:', error.message);
      throw new Error('Failed to fetch products by category');
    }
  },

  createProduct: async (name, description, price, stock, category) => {
    try {
      const product = await Product.create({
        name,
        description,
        price,
        stock,
        category
      });
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateProduct: async (productId, input) => {
    try {
      const product = await Product.findByPk(productId);
      if (!product) throw new Error('Product not found');
      await product.update(input);
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteProduct: async (productId) => {
    try {
      const product = await Product.findByPk(productId);
      if (!product) throw new Error('Product not found');
      await product.destroy();
      return { id: productId };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = productController;