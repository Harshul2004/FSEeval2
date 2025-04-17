import React, { useContext, Component } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Container,
  Box,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  ExitToApp,
  Dashboard,
  Inventory,
  ListAlt,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="h5">Something went wrong.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Reload
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const MainLayout = () => {
  const { user, logout, hasRole } = useContext(AuthContext);
  const { cart = [] } = useContext(CartContext) || {};
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    handleClose();
  };

  // Helper function to determine if user is employee
  const isEmployee = user && user.role === 'employee';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            E-Commerce Store
          </Typography>

          {/* Show different buttons based on user role */}
          {isEmployee ? (
            <>
              <Button
                color="inherit"
                startIcon={<Inventory />}
                onClick={() => navigate('/employee/dashboard')}
              >
                Product Management
              </Button>
              <Button
                color="inherit"
                startIcon={<ListAlt />}
                onClick={() => navigate('/employee/orders')}
              >
                Manage Orders
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/products')}>
                Products
              </Button>
              {user && user.role === 'customer' && (
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/cart')}
                  sx={{ ml: 2 }}
                >
                  <Badge badgeContent={cart.length} color="error">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              )}
            </>
          )}

          {user ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleMenu}
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => {
                  navigate('/profile');
                  handleClose();
                }}>
                  <Person sx={{ mr: 1 }} /> Profile
                </MenuItem>
                
                {/* Show Orders menu item only for customers */}
                {user.role === 'customer' && (
                  <MenuItem onClick={() => {
                    navigate('/orders');
                    handleClose();
                  }}>
                    <ShoppingCart sx={{ mr: 1 }} /> Orders
                  </MenuItem>
                )}

                {/* Show Admin Dashboard only for admins */}
                {hasRole(['admin']) && (
                  <MenuItem onClick={() => {
                    navigate('/admin');
                    handleClose();
                  }}>
                    <Dashboard sx={{ mr: 1 }} /> Admin Dashboard
                  </MenuItem>
                )}

                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/auth/login')}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} E-Commerce Store. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;