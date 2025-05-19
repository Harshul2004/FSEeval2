import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import client from './apollo/client';
import getTheme from './theme';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
// import OrderDetail from './pages/OrderDetail';
// import Invoices from './pages/Invoices';
// import InvoiceDetail from './pages/InvoiceDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
// import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Checkout from './pages/Checkout';
// import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeOrders from './pages/EmployeeOrders';
// import { useAuth } from './contexts/AuthContext';
// import { useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminEmployeeManagement from './pages/AdminEmployeeManagement';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { useThemeMode } from './contexts/ThemeModeContext';

function App() {
  const { mode } = useThemeMode();

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={getTheme(mode)}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <CartProvider>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<Register />} />
                </Route>

                {/* Main Layout Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/checkout" element={<Checkout />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <Routes>
                          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="employees" element={<AdminEmployeeManagement />} />
                        </Routes>
                      </ProtectedRoute>
                    }
                  />

                  {/* Employee Routes */}
                  <Route
                    path="/employee/*"
                    element={
                      <ProtectedRoute roles={['employee']}>
                        <Routes>
                          <Route path="/" element={<Navigate to="/employee/dashboard" />} />
                          <Route path="dashboard" element={<EmployeeDashboard />} />
                          <Route path="orders" element={<EmployeeOrders />} />
                        </Routes>
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </CartProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;