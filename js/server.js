require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const { sequelize } = require('../config/database');

const typeDefs = require('../graphql/schema');
const resolvers = require('../graphql/resolvers');
const { authMiddleware } = require('../middlewares/auth');

const app = express();

// Basic CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Basic Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    try {
      const user = await authMiddleware(req);
      console.log('Authenticated user:', user ? user.id : 'none');
      return { user };
    } catch (error) {
      console.error('Auth error:', error.message);
      return { user: null };
    }
  }
});

async function startServer() {
  try {
    // First, test database connection
    await sequelize.authenticate();
    console.log('Database connected');

    // Start Apollo Server
    await server.start();
    console.log('Apollo Server started');

    // Apply middleware
    server.applyMiddleware({ app, path: '/graphql', cors: false });
    console.log('Middleware applied');

    // Start Express server
    const PORT = 4000;
    app.listen(PORT, () => {
      console.log(`
Server ready at http://localhost:${PORT}
GraphQL endpoint: http://localhost:${PORT}/graphql
      `);
    });

  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

// Start server
startServer();