import React, { useState } from 'react';
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
  CircularProgress,
  Pagination
} from '@mui/material';
import { toast } from 'react-toastify';

const GET_INVOICES = gql`
  query {
    getAllInvoices {
      id
      invoiceNumber
      amount
      createdAt
      order {
        id
        status
        totalAmount
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

const Invoices = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { loading, error, data } = useQuery(GET_INVOICES);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    toast.error('Failed to fetch invoices');
    return null;
  }

  const invoices = data?.getAllInvoices || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Invoices
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.order.id}</TableCell>
                <TableCell>
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{invoice.order.status}</TableCell>
                <TableCell align="right">
                  ${invoice.amount.toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {invoices.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No invoices found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Invoices; 