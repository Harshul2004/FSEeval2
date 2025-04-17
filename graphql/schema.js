const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum UserRole {
    admin
    employee
    customer
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  type User {
    id: ID!
    email: String!
    role: UserRole!
    firstName: String!
    lastName: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    stock: Int!
    category: String!
    imageUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    productId: ID!
    quantity: Int!
    price: Float!
    product: Product!
  }

  type Order {
    id: ID!
    userId: ID!
    status: OrderStatus!
    totalAmount: Float!
    createdAt: String!
    updatedAt: String!
    shippingAddress: String
    paymentMethod: String
    user: User
    items: [OrderItem!]!
    invoice: Invoice
  }

  type Invoice {
    id: ID!
    orderId: ID!
    amount: Float!
    createdAt: String!
    order: Order!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input UserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
    stock: Int!
    category: String!
    imageUrl: String
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input OrderInput {
    items: [OrderItemInput!]!
    shippingAddress: String!
    paymentMethod: String!
  }

  type Query {
    # User queries
    me: User
    users: [User!]!
    user(id: ID!): User
    # Employee queries
    getEmployees: [User!]!
    getActiveEmployees: [User!]!
    getInactiveEmployees: [User!]!

    # Product queries
    products: [Product!]!
    product(id: ID!): Product
    productsByCategory(category: String!): [Product!]!

    # Order queries
    orders: [Order!]!
    order(id: ID!): Order
    ordersByStatus(status: OrderStatus!): [Order!]!
    ordersByUser(userId: ID!): [Order!]!
    myOrders: [Order!]!

    # Invoice queries
    invoice(id: ID!): Invoice
    invoicesByOrder(orderId: ID!): [Invoice!]!
  }

  type Mutation {
    # User mutations
    register(input: UserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateUser(id: ID!, input: UserInput!): User!
    deactivateUser(id: ID!): User!
    # Employee mutations
    createEmployee(input: UserInput!): User!
    updateEmployee(id: ID!, input: UserInput!): User!
    toggleEmployeeStatus(id: ID!): User!

    # Product mutations
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Order mutations
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    cancelOrder(id: ID!): Order!

    # Invoice mutations
    generateInvoice(orderId: ID!): Invoice!
  }

  directive @auth(roles: [UserRole]) on FIELD_DEFINITION
`;

module.exports = typeDefs; 