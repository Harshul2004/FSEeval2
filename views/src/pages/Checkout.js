import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';

const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      userId
      totalAmount
      status
      shippingAddress
      paymentMethod
      createdAt
      updatedAt
    }
  }
`;

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart = [], total = 0, clearCart } = useCart() || {}; // Added clearCart
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [createOrder, { loading, error }] = useMutation(CREATE_ORDER);

  console.log('Checkout rendering', { user, cart, total }); // Debug log

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to complete the order');
      navigate('/auth/login');
      return;
    }

    const items = (cart || []).map(item => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    try {
      const { data } = await createOrder({
        variables: {
          input: {
            items,
            shippingAddress,
            paymentMethod,
          },
        },
      });
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <p>Error: {error.message}</p>;

  if (!cart || cart.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5">Your cart is empty</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={item.image || 'https://via.placeholder.com/50'}
                      alt={item.name}
                      sx={{ width: 50, height: 50, mr: 2 }}
                    />
                    <Typography>{item.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom>
        Total: ${total.toFixed(2)}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="Shipping Address"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          margin="normal"
          SelectProps={{
            native: true,
          }}
          required
        >
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
          <option value="paypal">PayPal</option>
        </TextField>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Place Order
        </Button>
      </Box>
    </Box>
  );
};

export default Checkout;