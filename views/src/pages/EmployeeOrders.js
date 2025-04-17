import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
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
  Alert,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { toast } from 'react-toastify';

const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    orders {
      id
      status
      totalAmount
      createdAt
      shippingAddress
      paymentMethod
      user {
        id
        firstName
        lastName
        email
      }
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

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const EmployeeOrders = () => {
  const { loading, error, data, refetch } = useQuery(GET_ALL_ORDERS);
  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS);

  const formatDate = (dateString) => {
    try {
      const date = new Date(parseInt(dateString));
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus({
        variables: {
          id: orderId,
          status: newStatus
        }
      });
      toast.success('Order status updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update order status: ' + error.message);
    }
  };

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

  const orders = data?.orders || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Order Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Shipping Address</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.user.firstName} {order.user.lastName}
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    {order.user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {formatDate(order.createdAt)}
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
                <TableCell>
                  <FormControl fullWidth>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      size="small"
                    >
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="PROCESSING">Processing</MenuItem>
                      <MenuItem value="SHIPPED">Shipped</MenuItem>
                      <MenuItem value="DELIVERED">Delivered</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {orders.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No orders found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default EmployeeOrders; 