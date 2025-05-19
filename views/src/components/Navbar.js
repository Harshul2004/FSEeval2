import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useThemeMode } from '../contexts/ThemeModeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { mode, toggleMode } = useThemeMode();

  // Debug logging
  useEffect(() => {
    console.log('Current user:', user);
    console.log('User role:', user?.role);
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/auth/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          E-Commerce Store
        </Typography>

        <IconButton onClick={toggleMode} color="inherit">
          {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              {/* Show different buttons based on user role */}
              {user.role === 'employee' ? (
                // Employee buttons
                <>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/employee/dashboard"
                  >
                    Product Management
                  </Button>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/employee/orders"
                  >
                    Manage Orders
                  </Button>
                </>
              ) : (
                // Customer buttons
                <>
                  <Button color="inherit" component={RouterLink} to="/products">
                    Products
                  </Button>
                  {user.role === 'customer' && (
                    <IconButton
                      color="inherit"
                      component={RouterLink}
                      to="/cart"
                      size="large"
                    >
                      <Badge badgeContent={cartItems.length} color="error">
                        <ShoppingCartIcon />
                      </Badge>
                    </IconButton>
                  )}
                </>
              )}

              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1,
                    minWidth: '200px',
                  },
                }}
              >
                <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                  Profile
                </MenuItem>

                {user.role === 'customer' && (
                  <MenuItem component={RouterLink} to="/orders" onClick={handleClose}>
                    Orders
                  </MenuItem>
                )}

                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/auth/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;