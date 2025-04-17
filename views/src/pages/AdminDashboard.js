import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { useQuery, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const GET_ADMIN_STATS = gql`
  query {
    users {
      id
    }
    products {
      id
    }
    orders {
      id
      totalAmount
    }
  }
`;

const GET_RECENT_ORDERS = gql`
  query {
    orders {
      id
      status
      totalAmount
      createdAt
      user {
        id
        firstName
        lastName
      }
    }
  }
`;

const AdminDashboard = () => {
  const { loading: statsLoading, error: statsError, data: statsData } = useQuery(GET_ADMIN_STATS);
  const { loading: ordersLoading, error: ordersError, data: ordersData } = useQuery(GET_RECENT_ORDERS);

  if (statsLoading || ordersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (statsError || ordersError) {
    toast.error('Failed to fetch dashboard data');
    return null;
  }

  const stats = {
    totalUsers: statsData?.users?.length || 0,
    totalProducts: statsData?.products?.length || 0,
    totalOrders: statsData?.orders?.length || 0,
    totalRevenue: statsData?.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0
  };

  // Get the 5 most recent orders by sorting them by createdAt
  const recentOrders = [...(ordersData?.orders || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">
                {stats.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {stats.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                ${stats.totalRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Employee Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/admin/employees"
                fullWidth
              >
                Manage Employees
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Recent Orders
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.user.firstName} {order.user.lastName}
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell align="right">
                  ${order.totalAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminDashboard; 