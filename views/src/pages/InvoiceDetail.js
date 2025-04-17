import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import { toast } from 'react-toastify';

const GET_INVOICE = gql`
  query GetInvoice($id: ID!) {
    invoice(id: $id) {
      id
      invoiceNumber
      amount
      createdAt
      order {
        id
        status
        totalAmount
        items {
          id
          quantity
          price
          product {
            id
            name
          }
        }
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_INVOICE, {
    variables: { id }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    toast.error('Failed to fetch invoice details');
    return null;
  }

  const invoice = data?.invoice;

  if (!invoice) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">Invoice not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Invoice #{invoice.invoiceNumber}</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/invoices')}
        >
          Back to Invoices
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Information
            </Typography>
            <Typography>Order ID: {invoice.order.id}</Typography>
            <Typography>Status: {invoice.order.status}</Typography>
            <Typography>
              Date: {new Date(invoice.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Typography>
              {invoice.order.user.firstName} {invoice.order.user.lastName}
            </Typography>
            <Typography>{invoice.order.user.email}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <Box>
          {invoice.order.items.map((item) => (
            <Box key={item.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                {item.product.name}
              </Typography>
              <Typography>
                Quantity: {item.quantity}
              </Typography>
              <Typography>
                Price: ${item.price.toFixed(2)}
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Typography variant="h6">
            Total: ${invoice.order.totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoiceDetail; 