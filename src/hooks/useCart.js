// Custom Hook: useCart
// This hook handles all the cart logic.
// It is called in App.jsx, and cart data is sent to pages using props.
// This is "lifting state up" — the cart lives in App, not in individual pages.

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useCart() {
  // Cart items stored using our custom useLocalStorage hook.
  // This saves the cart in the browser's localStorage under the key 'scanmart_cart'.
  // So the cart is NOT lost when the user refreshes the page.
  const [cartItems, setCartItems] = useLocalStorage('scanmart_cart', []);

  // --- Add a product to the cart ---
  // useCallback stops this function from being re-created on every render
  const addToCart = useCallback(function (product) {
    setCartItems(function (previousItems) {
      // Check if the product is already in the cart
      const existingItem = previousItems.find(function (item) {
        return item.id === product.id;
      });

      // If it exists, increase its quantity by 1
      if (existingItem) {
        return previousItems.map(function (item) {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      }

      // If it's new, add it with quantity 1
      const newItem = {
        id: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: 1,
      };

      // Spread operator: copy old items and add the new one
      return [...previousItems, newItem];
    });
  }, [setCartItems]);

  // --- Remove a product from the cart ---
  const removeFromCart = useCallback(function (productId) {
    setCartItems(function (previousItems) {
      return previousItems.filter(function (item) {
        return item.id !== productId;
      });
    });
  }, [setCartItems]);

  // --- Increase quantity by 1 ---
  const increaseQuantity = useCallback(function (productId) {
    setCartItems(function (previousItems) {
      return previousItems.map(function (item) {
        if (item.id === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    });
  }, [setCartItems]);

  // --- Decrease quantity by 1 (remove if it reaches 0) ---
  const decreaseQuantity = useCallback(function (productId) {
    setCartItems(function (previousItems) {
      return previousItems
        .map(function (item) {
          if (item.id === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter(function (item) {
          return item.quantity > 0;
        });
    });
  }, [setCartItems]);

  // --- Empty the entire cart ---
  const clearCart = useCallback(function () {
    setCartItems([]);
  }, [setCartItems]);

  // --- Calculate totals using a for loop ---
  let totalItems = 0;
  let totalPrice = 0;

  for (let i = 0; i < cartItems.length; i++) {
    totalItems = totalItems + cartItems[i].quantity;
    totalPrice = totalPrice + cartItems[i].price * cartItems[i].quantity;
  }

  // Return everything so App.jsx can use it
  return {
    cartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
}
