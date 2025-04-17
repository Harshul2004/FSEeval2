import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import { toast } from 'react-toastify';

const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      status
      totalAmount
      shippingAddress
      paymentMethod
      createdAt
      items {
        id
        quantity
        price
        product {
          id
          name
          image
          price
        }
      }
    }
  }
`;

const CANCEL_ORDER = gql`
  mutation CancelOrder($id: ID!) {
    cancelOrder(id: $id) {
      id
      status
    }
  }
`;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_ORDER, {
    variables: { id }
  });
  const [cancelOrder] = useMutation(CANCEL_ORDER);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      case 'SHIPPED':
        return 'primary';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder({
        variables: { id },
        refetchQueries: [{ query: GET_ORDER, variables: { id } }]
      });
      toast.success('Order cancelled successfully');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    toast.error('Failed to fetch order details');
    return null;
  }

  const order = data?.order;

  if (!order) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h5">Order not found</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/orders')}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Order #{order.id}
        </Typography>
        <Chip
          label={order.status}
          color={getStatusColor(order.status)}
          size="medium"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={item.product.image || 'https://via.placeholder.com/50'}
                          alt={item.product.name}
                          sx={{ width: 50, height: 50, mr: 2 }}
                        />
                        <Typography>{item.product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Shipping Address:</Typography>
              <Typography variant="body1">{order.shippingAddress}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Payment Method:</Typography>
              <Typography variant="body1">{order.paymentMethod}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Order Date:</Typography>
              <Typography variant="body1">
                {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${order.totalAmount.toFixed(2)}</Typography>
            </Box>
            {order.status === 'PENDING' && (
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={handleCancelOrder}
              >
                Cancel Order
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetail; 