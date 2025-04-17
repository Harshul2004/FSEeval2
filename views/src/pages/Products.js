import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
      stock
      category
      imageUrl
    }
  }
`;

const Products = () => {
  const { user } = useAuth();
  console.log('Products component, user:', user);

  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    context: {
      headers: {
        authorization: user ? `Bearer ${localStorage.getItem('token')}` : '',
      },
    },
  });

  console.log('Query result - loading:', loading, 'error:', error, 'data:', data);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const allProducts = data?.products || [];

  if (loading) return <CircularProgress />;
  if (error) return <p>Error loading products: {error.message}</p>;

  const handleAddToCart = (product) => {
    addToCart(product);
    console.log(`${product.name} added to cart`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>
      <Grid container spacing={3}>
        {allProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.imageUrl || 'https://via.placeholder.com/200'}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ${product.price} (Stock: {product.stock})
                </Typography>
                <Typography variant="caption">{product.category}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {allProducts.length === 0 && <p>No products available.</p>}
    </div>
  );
};

export default Products;