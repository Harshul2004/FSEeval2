import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { toast } from 'react-toastify';

const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      status
      totalAmount
      createdAt
      shippingAddress
      paymentMethod
      items {
        id
        quantity
        price
        product {
          id
          name
          price
        }
      }
    }
  }
`;

const Orders = () => {
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('GraphQL error:', error);
      if (error.message.includes('must be logged in')) {
        navigate('/login');
        toast.error('Please log in to view your orders');
      } else {
        toast.error('Failed to fetch orders: ' + error.message);
      }
    },
    onCompleted: (data) => {
      console.log('Orders data received:', data);
      if (data?.myOrders) {
        console.log(`Received ${data.myOrders.length} orders`);
      }
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Current auth token:', token ? 'Present' : 'Not found');
    
    if (!token) {
      navigate('/login');
      toast.error('Please log in to view your orders');
      return;
    }

    console.log('Orders component mounted, fetching orders...');
    refetch();
  }, [navigate, refetch]);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const orders = data?.myOrders || [];
  console.log('Orders to display:', orders);

  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          No orders found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Shipping Address</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Date not available'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{order.shippingAddress}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  {order.items.map((item) => (
                    <Box key={item.id} sx={{ mb: 1 }}>
                      {item.quantity}x {item.product.name} (${item.price.toFixed(2)})
                    </Box>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Orders; 