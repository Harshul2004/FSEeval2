import React, { useState } from 'react'; // Added useState import
import { useQuery, gql } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  TextField,
} from '@mui/material';
import { toast } from 'react-toastify';

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      stock
      category
      image
    }
  }
`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1); // Now works with proper import

  console.log('Product ID from params:', id); // Debug log

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id },
    context: {
      headers: { authorization: user ? `Bearer ${localStorage.getItem('token')}` : '' },
    },
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error('Query error:', error); // Debug error
    return <p>Error loading product: {error.message}</p>;
  }

  const product = data?.product;

  if (!product) {
    console.log('No product data received for id:', id); // Debug log
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h5">Product not found</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  console.log('Product data:', product); // Debug successful data

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= product.stock) {
      addToCart({ ...product, quantity });
      toast.success('Product added to cart!');
    } else {
      toast.error('Invalid quantity');
    }
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Button onClick={() => navigate('/products')}>Back to Products</Button>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Box
              component="img"
              src={product.image || 'https://via.placeholder.com/400'}
              alt={product.name}
              sx={{
                maxWidth: '100%',
                maxHeight: 400,
                objectFit: 'contain',
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ${product.price.toFixed(2)}
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Category: {product.category}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Stock: {product.stock}
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, product.stock)))}
              inputProps={{ min: 1, max: product.stock }}
              sx={{ width: 100 }}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add to Cart
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetail;