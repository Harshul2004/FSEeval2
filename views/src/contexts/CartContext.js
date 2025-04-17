import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const savedCart = user?.id ? localStorage.getItem(`cart_${user.id}`) : null;
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
      calculateTotal();
    }
  }, [cart, user?.id]);

  const calculateTotal = () => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      const updatedCart = existingItem
        ? prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + product.quantity || 1 } : item
          )
        : [...prevCart, { ...product, quantity: product.quantity || 1 }];
      return updatedCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setTotal(0);
    if (user?.id) localStorage.removeItem(`cart_${user.id}`);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};