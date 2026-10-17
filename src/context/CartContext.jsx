// CartContext.jsx — Global Shopping Cart State
//
// This file manages the shopping cart using React Context API.
// Any page or component in ScanMart can access cart items and cart functions.
// This completely avoids "prop drilling" (passing props through multiple components).

import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// 1. Create the context container
const CartContext = createContext(null);

// 2. The Provider component wraps our entire application
export function CartProvider({ children }) {
  // Save cart items in localStorage with the key 'scanmart_cart'
  // When the user refreshes the page, their cart items are restored
  const [cartItems, setCartItems] = useLocalStorage('scanmart_cart', []);

  // --- Add a product to the cart ---
  function addToCart(product) {
    setCartItems(function (previousItems) {
      // Check if product is already in the cart
      let foundIndex = -1;
      for (let i = 0; i < previousItems.length; i++) {
        if (previousItems[i].id === product.id) {
          foundIndex = i;
          break;
        }
      }

      // If the product is already in the cart, increase its quantity by 1
      if (foundIndex !== -1) {
        return previousItems.map(function (item, index) {
          if (index === foundIndex) {
            return {
              ...item,
              quantity: item.quantity + 1
            };
          }
          return item;
        });
      }

      // If it is a new product, add it to the cart with quantity 1
      const newItem = {
        id: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: 1
      };

      return [...previousItems, newItem];
    });
  }

  // --- Remove a product completely from the cart ---
  function removeFromCart(productId) {
    setCartItems(function (previousItems) {
      return previousItems.filter(function (item) {
        return item.id !== productId;
      });
    });
  }

  // --- Increase quantity of an item by 1 ---
  function increaseQuantity(productId) {
    setCartItems(function (previousItems) {
      return previousItems.map(function (item) {
        if (item.id === productId) {
          return {
            ...item,
            quantity: item.quantity + 1
          };
        }
        return item;
      });
    });
  }

  // --- Decrease quantity by 1 (remove if quantity becomes 0) ---
  function decreaseQuantity(productId) {
    setCartItems(function (previousItems) {
      const updatedList = [];
      for (let i = 0; i < previousItems.length; i++) {
        const item = previousItems[i];
        if (item.id === productId) {
          const newQty = item.quantity - 1;
          if (newQty > 0) {
            updatedList.push({
              ...item,
              quantity: newQty
            });
          }
        } else {
          updatedList.push(item);
        }
      }
      return updatedList;
    });
  }

  // --- Empty all items from the cart ---
  function clearCart() {
    setCartItems([]);
  }

  // --- Derived State: Calculate total count and total price ---
  // We calculate totals directly from cartItems so we never have out-of-sync values
  let totalItems = 0;
  let totalPrice = 0;

  for (let i = 0; i < cartItems.length; i++) {
    totalItems = totalItems + cartItems[i].quantity;
    totalPrice = totalPrice + (cartItems[i].price * cartItems[i].quantity);
  }

  // The shared object provided to all components
  const value = {
    cartItems: cartItems,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    increaseQuantity: increaseQuantity,
    decreaseQuantity: decreaseQuantity,
    clearCart: clearCart,
    totalItems: totalItems,
    totalPrice: totalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Custom hook for consuming the CartContext easily
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}
