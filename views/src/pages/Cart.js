import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      status
      totalAmount
    }
  }
`;

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [formData, setFormData] = useState({
    shippingAddress: '',
    paymentMethod: 'CASH'
  });

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/auth/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.shippingAddress) {
      toast.error('Please enter shipping address');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      await createOrder({
        variables: {
          input: {
            items: orderItems,
            shippingAddress: formData.shippingAddress,
            paymentMethod: formData.paymentMethod
          }
        }
      });

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (cart.length === 0) {
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Actions</TableCell>
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
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      size="small"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      inputProps={{ min: 1, style: { textAlign: 'center', width: 50 } }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  ${(item.price * item.quantity).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleRemoveItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Total: ${calculateTotal().toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Place Order'}
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Order Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Shipping Address"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                label="Payment Method"
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Cart;