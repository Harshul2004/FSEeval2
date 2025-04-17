# Role-Based eCommerce Platform

A modern eCommerce platform built with React, Node.js, Express, GraphQL, and MySQL, featuring role-based access control for different user types.

## Features

- Role-based access control (Admin, Employee, Customer)
- JWT-based authentication
- GraphQL API
- MySQL database with Sequelize ORM
- Modern React frontend
- Order management system
- Product inventory management
- Invoice generation

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **API**: GraphQL
- **Authentication**: JWT
- **Styling**: CSS

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. Install dependencies:
   ```bash
   npm install or npm i
   cd views && npm install or npm i
   cd ..
   ```

3. Create a MySQL database:
   ```sql
   CREATE DATABASE ecommerce_furniture;
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings

5. Start the development server:
   ```bash
   # Start backend server
   npm run dev

   # In another terminal, start frontend
   npm start
   ```

## Project Structure

```
TESTPROJECT/
├── config/
│   └── database.js
├── controllers/
│   ├── invoiceController.js
│   ├── orderController.js
│   ├── productController.js
│   └── userController.js
├── graphql/
│   ├── resolvers.js
│   └── schema.js
├── js/
│   └── server.js
├── middlewares/
│   └── auth.js
├── models/
│   ├── index.js
│   ├── Invoice.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Product.js
│   └── User.js
├── node_modules/
├── views/                  <-- React frontend lives here
│   ├── node_modules/
│   ├── public/
│   └── src/
│       ├── apollo/
│       │   └── client.js
│       ├── components/
│       │   └── ProtectedRoute.js
│       ├── contexts/
│       │   ├── AuthContext.js
│       │   └── CartContext.js
│       ├── layouts/
│       │   ├── AuthLayout.js
│       │   └── MainLayout.js
│       ├── pages/
│       │   ├── AdminDashboard.js
│       │   ├── Cart.js
│       │   ├── Home.js
│       │   ├── InvoiceDetail.js
│       │   ├── Invoices.js
│       │   ├── Login.js
│       │   ├── OrderDetail.js
│       │   ├── Orders.js
│       │   ├── ProductDetail.js
│       │   ├── Products.js
│       │   ├── Profile.js
│       │   └── Register.js
│       ├── App.css
│       ├── App.js
│       ├── App.test.js
│       ├── index.css
│       ├── index.js
│       ├── logo.svg
│       ├── reportWebVitals.js
│       ├── setupTests.js
│       └── theme.js
├── .env
├── .env.example
├── package-lock.json
├── package.json
├── README.md
└── seed-products.js
```

## API Documentation

The GraphQL API is available at `/graphql`. Use the GraphQL Playground to explore the API schema and test queries/mutations.

### Example Queries

```graphql
# Get all products
query {
  products {
    id
    name
    price
    stock
  }
}

# Get user orders
query {
  myOrders {
    id
    status
    totalAmount
    items {
      product {
        name
        price
      }
      quantity
    }
  }
}
```

### Example Mutations

```graphql
# Create a new order
mutation {
  createOrder(input: {
    items: [
      { productId: 1, quantity: 2 }
    ]
  }) {
    id
    status
    totalAmount
  }
}

# Update order status
mutation {
  updateOrderStatus(id: 1, status: SHIPPED) {
    id
    status
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
