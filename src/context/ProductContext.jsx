// ProductContext.jsx — Global Inventory & Product Catalog State
//
// CONCEPTS:
// 1. Centralized Product State: Manages the master product catalog for both customers and owners.
// 2. Persistent Storage: Syncs with browser localStorage so owner updates survive page reloads.
// 3. Multi-tab Sync: Listens for storage events to immediately update across multiple open tabs.
// 4. Live Stock & Inventory Updates:
//    - Owners can add, edit, adjust stock, or delete items.
//    - Customers instantly see newly added products, stock changes, and price updates.
//    - Successful customer checkouts automatically decrement stock in real time.

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { products as initialDefaultProducts, categories as defaultCategories } from '../data/products';

const PRODUCTS_STORAGE_KEY = 'scanmart_products';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(function () {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to parse scanmart_products from localStorage', err);
    }
    // Default fallback
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialDefaultProducts));
    } catch (e) {
      // ignore
    }
    return initialDefaultProducts;
  });

  // Save changes to localStorage whenever products state updates
  useEffect(function () {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      console.error('Failed to save scanmart_products to localStorage', err);
    }
  }, [products]);

  // Synchronize across browser tabs
  useEffect(function () {
    function handleStorageChange(event) {
      if (event.key === PRODUCTS_STORAGE_KEY && event.newValue) {
        try {
          const updated = JSON.parse(event.newValue);
          if (Array.isArray(updated)) {
            setProducts(updated);
          }
        } catch (e) {
          // ignore
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return function () {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // --- Add a new product ---
  function addProduct(productData) {
    let maxId = 0;
    for (let i = 0; i < products.length; i++) {
      if (products[i].id > maxId) {
        maxId = products[i].id;
      }
    }
    const nextId = maxId + 1;

    const newProduct = {
      id: nextId,
      code: (productData.code || '').trim().toUpperCase(),
      name: (productData.name || '').trim(),
      category: productData.category || 'General',
      price: Math.max(0, Number(productData.price) || 0),
      rating: Number(productData.rating) || 4.5,
      stock: Math.max(0, Number(productData.stock) || 0),
      image: (productData.image && productData.image.trim()) 
        ? productData.image.trim() 
        : 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
      description: (productData.description || '').trim() || 'No description provided.'
    };

    setProducts(function (prev) {
      return [newProduct, ...prev];
    });

    return newProduct;
  }

  // --- Update an existing product's details ---
  function updateProduct(id, updatedFields) {
    setProducts(function (prev) {
      return prev.map(function (item) {
        if (item.id === id) {
          return {
            ...item,
            ...updatedFields,
            price: updatedFields.price !== undefined ? Math.max(0, Number(updatedFields.price)) : item.price,
            stock: updatedFields.stock !== undefined ? Math.max(0, Number(updatedFields.stock)) : item.stock,
            code: updatedFields.code ? updatedFields.code.trim().toUpperCase() : item.code,
            name: updatedFields.name ? updatedFields.name.trim() : item.name,
            category: updatedFields.category ? updatedFields.category.trim() : item.category
          };
        }
        return item;
      });
    });
  }

  // --- Set stock directly ---
  function updateStock(id, newStock) {
    const validStock = Math.max(0, Number(newStock) || 0);
    setProducts(function (prev) {
      return prev.map(function (item) {
        if (item.id === id) {
          return { ...item, stock: validStock };
        }
        return item;
      });
    });
  }

  // --- Increment or decrement stock by delta (e.g. +1, +5, -1) ---
  function adjustStock(id, delta) {
    setProducts(function (prev) {
      return prev.map(function (item) {
        if (item.id === id) {
          const updated = Math.max(0, (Number(item.stock) || 0) + delta);
          return { ...item, stock: updated };
        }
        return item;
      });
    });
  }

  // --- Delete a product ---
  function deleteProduct(id) {
    setProducts(function (prev) {
      return prev.filter(function (item) {
        return item.id !== id;
      });
    });
  }

  // --- Reset to default products ---
  function resetProducts() {
    setProducts(initialDefaultProducts);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialDefaultProducts));
    } catch (e) {
      // ignore
    }
  }

  // --- Deduct stock when an order is placed ---
  function reduceStockForOrder(cartItems) {
    if (!cartItems || !cartItems.length) return;
    const quantityMap = {};
    for (let i = 0; i < cartItems.length; i++) {
      quantityMap[cartItems[i].id] = (quantityMap[cartItems[i].id] || 0) + (cartItems[i].quantity || 1);
    }

    setProducts(function (prev) {
      return prev.map(function (item) {
        if (quantityMap[item.id]) {
          const newStock = Math.max(0, item.stock - quantityMap[item.id]);
          return { ...item, stock: newStock };
        }
        return item;
      });
    });
  }

  // --- Look up helpers ---
  function getProductById(id) {
    const numId = Number(id);
    for (let i = 0; i < products.length; i++) {
      if (products[i].id === numId) {
        return products[i];
      }
    }
    return null;
  }

  function getProductByCode(code) {
    if (!code) return null;
    const formatted = code.trim().toUpperCase();
    for (let i = 0; i < products.length; i++) {
      if (products[i].code.toUpperCase() === formatted) {
        return products[i];
      }
    }
    return null;
  }

  // Dynamic categories derived from current catalog
  const allCategories = useMemo(function () {
    const catSet = new Set(defaultCategories);
    for (let i = 0; i < products.length; i++) {
      if (products[i].category) {
        catSet.add(products[i].category);
      }
    }
    const arr = Array.from(catSet).filter(function (cat) { return cat !== 'All'; });
    return ['All', ...arr];
  }, [products]);

  const value = {
    products,
    allCategories,
    addProduct,
    updateProduct,
    updateStock,
    adjustStock,
    deleteProduct,
    resetProducts,
    reduceStockForOrder,
    getProductById,
    getProductByCode
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used inside a ProductProvider');
  }
  return context;
}
