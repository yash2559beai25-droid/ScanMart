// CartContext — shares cart data with the whole app using React Context API.
// The cart logic still lives in the useCart hook.
// This file only provides that data so pages do not need cart props.

import { createContext, useContext } from 'react';
import { useCart } from '../hooks/useCart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Call the existing cart hook once here.
  // Every page can then read this same cart instead of receiving props.
  const cart = useCart();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error('useCartContext must be used inside CartProvider');
  }

  return cart;
}
