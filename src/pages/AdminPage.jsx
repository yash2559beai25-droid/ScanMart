// AdminPage.jsx — Store Owner Inventory & Operations Dashboard
//
// CONCEPTS:
// 1. Role-based Access: Only authenticated users with role === 'owner' can access.
// 2. Full Live Inventory Control:
//    - Real-time stock increments (+1, +5, +10) and decrements (-1).
//    - Inline & full editing of product information (name, price, category, image, description).
//    - Listing new items with barcode validation and live publishing to customer catalog.
//    - Deleting products and catalog reset.
// 3. Customer Store Synchronization:
//    - Any modification made here is instantly reflected across customer pages (Catalog, Details, Search, Barcode Scanner).
// 4. Live Business Analytics & Real Order Tracking:
//    - Real-time sales, order counts, low stock alerts, and order history from customer checkouts.

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import {
  formatPrice,
  getStockClass,
  getStockText
} from '../data/products';

export default function AdminPage() {
  const { user, isLoggedIn, isOwner, logout } = useAuth();
  const navigate = useNavigate();

  const {
    products,
    allCategories,
    addProduct,
    updateProduct,
    updateStock,
    adjustStock,
    deleteProduct,
    resetProducts
  } = useProducts();

  // Active tab: 'inventory' or 'orders'
  const [activeTab, setActiveTab] = useState('inventory');

  // Search & Filters for inventory table
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Inline stock edit state
  const [editingStockId, setEditingStockId] = useState(null);
  const [inlineStockValue, setInlineStockValue] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    price: '',
    stock: '',
    category: '',
    customCategory: '',
    image: '',
    description: ''
  });
  const [addFormErrors, setAddFormErrors] = useState({});

  // Feedback notifications
  const [feedback, setFeedback] = useState(null);

  // Orders loaded from localStorage
  const [orders, setOrders] = useState([]);

  // Load customer orders from localStorage
  function loadOrders() {
    try {
      const raw = localStorage.getItem('scanmart_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    setOrders([]);
  }

  useEffect(function () {
    loadOrders();
    function onStorage(e) {
      if (e.key === 'scanmart_orders') {
        loadOrders();
      }
    }
    window.addEventListener('storage', onStorage);
    return function () {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Helper to show temporary feedback
  function showNotification(text, type = 'success') {
    setFeedback({ text, type });
    setTimeout(function () {
      setFeedback(null);
    }, 4000);
  }

  // Guard: if not logged in or not store owner, show Access Denied
  if (!isLoggedIn || !isOwner) {
    return (
      <section className="container section">
        <section className="empty-state card">
          <h2>Access Denied</h2>
          <p className="muted">
            This dashboard is reserved for Store Owners.
            Please log in with your Store Owner account to manage products.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Button to="/login">Go to Login</Button>
          </div>
        </section>
      </section>
    );
  }

  // --- Derived Statistics ---
  let lowStockCount = 0;
  let outOfStockCount = 0;
  for (let i = 0; i < products.length; i++) {
    const s = Number(products[i].stock) || 0;
    if (s === 0) {
      outOfStockCount++;
    } else if (s < 5) {
      lowStockCount++;
    }
  }

  let totalSales = 0;
  for (let i = 0; i < orders.length; i++) {
    totalSales += Number(orders[i].totalPrice) || 0;
  }

  // --- Filtered and Sorted Products List for Dashboard ---
  const displayedProducts = useMemo(function () {
    const q = searchQuery.toLowerCase().trim();

    let list = products.filter(function (item) {
      const matchesSearch = !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.code && item.code.toLowerCase().includes(q));

      const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;

      let matchesStock = true;
      const stockNum = Number(item.stock) || 0;
      if (stockStatusFilter === 'low') {
        matchesStock = stockNum > 0 && stockNum < 5;
      } else if (stockStatusFilter === 'out') {
        matchesStock = stockNum === 0;
      } else if (stockStatusFilter === 'in') {
        matchesStock = stockNum >= 5;
      }

      return matchesSearch && matchesCat && matchesStock;
    });

    if (sortBy === 'price-low') {
      list = [...list].sort(function (a, b) { return a.price - b.price; });
    } else if (sortBy === 'price-high') {
      list = [...list].sort(function (a, b) { return b.price - a.price; });
    } else if (sortBy === 'stock-low') {
      list = [...list].sort(function (a, b) { return a.stock - b.stock; });
    } else if (sortBy === 'stock-high') {
      list = [...list].sort(function (a, b) { return b.stock - a.stock; });
    } else if (sortBy === 'name') {
      list = [...list].sort(function (a, b) { return a.name.localeCompare(b.name); });
    }

    return list;
  }, [products, searchQuery, categoryFilter, stockStatusFilter, sortBy]);

  // --- Quick Stock Controls ---
  function handleAdjustStock(productId, delta, productName) {
    adjustStock(productId, delta);
    const updated = products.find(p => p.id === productId);
    const newQty = Math.max(0, (updated ? updated.stock : 0) + delta);
    showNotification(`Updated stock for "${productName}" to ${newQty} items.`);
  }

  function startInlineStockEdit(product) {
    setEditingStockId(product.id);
    setInlineStockValue(String(product.stock));
  }

  function saveInlineStock(productId, productName) {
    const qty = Math.max(0, parseInt(inlineStockValue, 10) || 0);
    updateStock(productId, qty);
    setEditingStockId(null);
    showNotification(`Stock for "${productName}" updated to ${qty}.`);
  }

  // --- Validation for Add Product Form ---
  function validateAddForm() {
    const errors = {};
    if (!newProduct.name.trim()) {
      errors.name = 'Product name is required.';
    }

    const codeUpper = newProduct.code.trim().toUpperCase();
    if (!codeUpper) {
      errors.code = 'Product code (barcode) is required.';
    } else {
      const exists = products.some(p => p.code.toUpperCase() === codeUpper);
      if (exists) {
        errors.code = `Code "${codeUpper}" already exists. Please choose a unique barcode.`;
      }
    }

    if (!newProduct.price || isNaN(Number(newProduct.price)) || Number(newProduct.price) <= 0) {
      errors.price = 'Please enter a valid positive price.';
    }

    if (newProduct.stock === '' || isNaN(Number(newProduct.stock)) || Number(newProduct.stock) < 0) {
      errors.stock = 'Stock must be 0 or more.';
    }

    const categoryChoice = newProduct.category === '__custom__'
      ? newProduct.customCategory.trim()
      : newProduct.category;

    if (!categoryChoice) {
      errors.category = 'Please select or enter a category.';
    }

    return errors;
  }

  // --- Submit Add Product ---
  function handleAddProduct(e) {
    e.preventDefault();
    const errors = validateAddForm();
    setAddFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const finalCategory = newProduct.category === '__custom__'
      ? newProduct.customCategory.trim()
      : newProduct.category;

    const added = addProduct({
      name: newProduct.name,
      code: newProduct.code,
      category: finalCategory,
      price: newProduct.price,
      stock: newProduct.stock,
      image: newProduct.image,
      description: newProduct.description
    });

    setNewProduct({
      name: '',
      code: '',
      price: '',
      stock: '',
      category: '',
      customCategory: '',
      image: '',
      description: ''
    });
    setAddFormErrors({});
    setShowAddModal(false);
    showNotification(`"${added.name}" listed successfully! It is now live in the customer store.`);
  }

  // --- Submit Full Product Edit ---
  function handleSaveFullEdit(e) {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      alert('Product name is required.');
      return;
    }
    if (isNaN(Number(editingProduct.price)) || Number(editingProduct.price) <= 0) {
      alert('Price must be greater than 0.');
      return;
    }
    if (isNaN(Number(editingProduct.stock)) || Number(editingProduct.stock) < 0) {
      alert('Stock cannot be negative.');
      return;
    }

    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      code: editingProduct.code,
      category: editingProduct.category,
      price: Number(editingProduct.price),
      stock: Number(editingProduct.stock),
      image: editingProduct.image,
      description: editingProduct.description
    });

    showNotification(`Updated details for "${editingProduct.name}".`);
    setEditingProduct(null);
  }

  // --- Delete Product ---
  function handleDeleteProduct(product) {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${product.name}" (${product.code}) from your store?\n\nCustomers will no longer be able to view or purchase this item.`
    );
    if (confirmDelete) {
      deleteProduct(product.id);
      showNotification(`"${product.name}" has been removed from inventory.`, 'info');
    }
  }

  // --- Reset Catalog ---
  function handleResetCatalog() {
    const confirmReset = window.confirm(
      'Reset catalog to original demo products?\n\nThis will restore the default 15 items and replace customized items.'
    );
    if (confirmReset) {
      resetProducts();
      showNotification('Store catalog reset to default demo products.');
    }
  }

  // --- Clear Orders ---
  function handleClearOrders() {
    const confirmClear = window.confirm('Clear all recorded customer demo orders?');
    if (confirmClear) {
      localStorage.removeItem('scanmart_orders');
      setOrders([]);
      showNotification('Demo orders cleared.', 'info');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="admin-page">
      <section className="container section">

        {/* Dashboard Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="section-title">Owner Management Portal</h1>
            <p className="muted">
              Logged in as <strong>{user.name}</strong> · Store Owner
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-secondary btn-sm" title="View customer storefront">
              🛒 Customer Store View
            </Link>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={function () { setShowAddModal(true); }}
            >
              + List New Item
            </button>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={handleResetCatalog}
              title="Reset inventory to original 15 products"
            >
              ↺ Reset Catalog
            </button>
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Live Feedback Toast/Banner */}
        {feedback && (
          <div
            className={feedback.type === 'info' ? 'card' : 'success-banner'}
            style={{
              marginTop: '1rem',
              padding: '0.8rem 1.2rem',
              borderRadius: '8px',
              border: feedback.type === 'info' ? '1px solid #3b82f6' : '1px solid #10b981',
              background: feedback.type === 'info' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{feedback.type === 'info' ? 'ℹ️' : '✅'} {feedback.text}</span>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              onClick={function () { setFeedback(null); }}
            >
              ✕
            </button>
          </div>
        )}

        {/* --- Live Analytics / KPI Cards --- */}
        <div className="admin-stats" style={{ marginTop: '1.2rem' }}>
          <article className="card stat-card">
            <p className="muted">Total Catalog Items</p>
            <p className="stat-value">{products.length}</p>
          </article>
          <article className="card stat-card">
            <p className="muted">Low Stock Items (&lt; 5)</p>
            <p className="stat-value" style={{ color: lowStockCount > 0 ? '#f59e0b' : 'white' }}>
              {lowStockCount}
            </p>
          </article>
          <article className="card stat-card">
            <p className="muted">Out of Stock</p>
            <p className="stat-value" style={{ color: outOfStockCount > 0 ? '#ef4444' : 'white' }}>
              {outOfStockCount}
            </p>
          </article>
          <article className="card stat-card">
            <p className="muted">Customer Orders / Sales</p>
            <p className="stat-value" style={{ fontSize: '1.5rem', color: '#10b981' }}>
              {orders.length} ({formatPrice(totalSales)})
            </p>
          </article>
        </div>

        {/* --- Dashboard Navigation Tabs --- */}
        <div className="admin-tabs">
          <button
            type="button"
            className={activeTab === 'inventory' ? 'admin-tab active' : 'admin-tab'}
            onClick={function () { setActiveTab('inventory'); }}
          >
            📦 Products &amp; Inventory ({products.length})
          </button>
          <button
            type="button"
            className={activeTab === 'orders' ? 'admin-tab active' : 'admin-tab'}
            onClick={function () { setActiveTab('orders'); }}
          >
            🛍️ Customer Orders ({orders.length})
          </button>
        </div>

        {/* ================= INVENTORY TAB ================= */}
        {activeTab === 'inventory' && (
          <>
            {/* Search, Filter & Sort Toolbar */}
            <div className="admin-toolbar">
              <input
                type="search"
                className="admin-search-input"
                placeholder="Search product name or barcode (e.g. SM001)..."
                value={searchQuery}
                onChange={function (e) { setSearchQuery(e.target.value); }}
              />

              <select
                className="admin-filter-select"
                value={categoryFilter}
                onChange={function (e) { setCategoryFilter(e.target.value); }}
              >
                {allCategories.map(function (cat) {
                  return <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>;
                })}
              </select>

              <select
                className="admin-filter-select"
                value={stockStatusFilter}
                onChange={function (e) { setStockStatusFilter(e.target.value); }}
              >
                <option value="all">All Stock Levels</option>
                <option value="in">In Stock (≥ 5)</option>
                <option value="low">Low Stock (1 - 4)</option>
                <option value="out">Out of Stock (0)</option>
              </select>

              <select
                className="admin-filter-select"
                value={sortBy}
                onChange={function (e) { setSortBy(e.target.value); }}
              >
                <option value="default">Sort: Default</option>
                <option value="stock-low">Stock: Low to High</option>
                <option value="stock-high">Stock: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>

              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={function () { setShowAddModal(true); }}
                style={{ marginLeft: 'auto' }}
              >
                + New Product
              </button>
            </div>

            {/* Product Inventory Table */}
            <div className="card table-wrap" style={{ marginTop: '1.2rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock &amp; Quick Restock</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p className="muted">No products match your search/filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    displayedProducts.map(function (product) {
                      const stockNum = Number(product.stock) || 0;
                      const stockClass = getStockClass(stockNum);

                      return (
                        <tr key={product.id}>
                          {/* Product with thumbnail */}
                          <td>
                            <div className="table-product-cell">
                              <img
                                className="table-img"
                                src={product.image}
                                alt={product.name}
                                onError={function (e) {
                                  e.target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80';
                                }}
                              />
                              <div>
                                <strong style={{ color: 'white' }}>{product.name}</strong>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                  ★ {product.rating || 4.5}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Code */}
                          <td>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#38bdf8' }}>
                              {product.code}
                            </span>
                          </td>

                          {/* Category */}
                          <td>{product.category}</td>

                          {/* Price */}
                          <td><strong>{formatPrice(product.price)}</strong></td>

                          {/* Stock + Quick Increase/Decrease buttons */}
                          <td>
                            {editingStockId === product.id ? (
                              <div className="edit-box">
                                <input
                                  type="number"
                                  min="0"
                                  value={inlineStockValue}
                                  onChange={function (e) { setInlineStockValue(e.target.value); }}
                                  autoFocus
                                />
                                <Button size="sm" onClick={function () { saveInlineStock(product.id, product.name); }}>
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={function () { setEditingStockId(null); }}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span
                                  style={{
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    minWidth: '28px',
                                    textDecoration: 'underline dotted'
                                  }}
                                  title="Click to set exact stock"
                                  onClick={function () { startInlineStockEdit(product); }}
                                >
                                  {stockNum}
                                </span>

                                {/* Quick Adjustment Buttons */}
                                <div className="stock-adjust-group" title="Quick Stock Adjustment">
                                  <button
                                    type="button"
                                    className="btn-qty-mini decrease"
                                    disabled={stockNum <= 0}
                                    onClick={function () { handleAdjustStock(product.id, -1, product.name); }}
                                    title="Decrease stock by 1"
                                  >
                                    -1
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-qty-mini"
                                    onClick={function () { handleAdjustStock(product.id, 1, product.name); }}
                                    title="Increase stock by 1"
                                  >
                                    +1
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-qty-mini"
                                    onClick={function () { handleAdjustStock(product.id, 5, product.name); }}
                                    title="Restock +5 items"
                                  >
                                    +5
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-qty-mini"
                                    onClick={function () { handleAdjustStock(product.id, 10, product.name); }}
                                    title="Restock +10 items"
                                  >
                                    +10
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td>
                            <span className={'badge badge-' + stockClass}>
                              {getStockText(stockNum)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={function () { setEditingProduct({ ...product }); }}
                            >
                              Edit
                            </Button>{' '}
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={function () { handleDeleteProduct(product); }}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                💡 <strong>Live Synchronization:</strong> Any changes made here are saved to localStorage and immediately available on the customer store, product details, barcode scanner, and checkout.
              </p>
              <Link to="/products" className="btn btn-secondary btn-sm">
                Preview Customer Store →
              </Link>
            </div>
          </>
        )}

        {/* ================= CUSTOMER ORDERS TAB ================= */}
        {activeTab === 'orders' && (
          <div className="card" style={{ marginTop: '1.2rem', padding: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ color: 'white', margin: 0 }}>Customer Order History</h2>
                <p className="muted" style={{ fontSize: '0.85rem' }}>
                  Orders placed by customers through self-checkout.
                </p>
              </div>
              {orders.length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleClearOrders}
                >
                  Clear Order History
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p className="muted" style={{ fontSize: '1.1rem' }}>No orders placed yet.</p>
                <p className="muted" style={{ fontSize: '0.9rem' }}>
                  To test: go to the customer view, add products to the cart, and complete a demo checkout.
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/products" className="btn btn-primary btn-sm">
                    Open Customer Store
                  </Link>
                </div>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items Purchased</th>
                      <th>Total Amount</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(function (ord) {
                      return (
                        <tr key={ord.orderId}>
                          <td>
                            <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                              {ord.orderId}
                            </strong>
                          </td>
                          <td>{ord.date}</td>
                          <td>
                            <div>
                              <strong>{ord.customer ? ord.customer.fullName : 'Customer'}</strong>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                {ord.customer ? ord.customer.email : ''} · {ord.customer ? ord.customer.city : ''}
                              </div>
                            </div>
                          </td>
                          <td>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                              {(ord.items || []).map(function (itm) {
                                return (
                                  <li key={itm.id}>
                                    {itm.name} × {itm.quantity} ({formatPrice(itm.price * itm.quantity)})
                                  </li>
                                );
                              })}
                            </ul>
                          </td>
                          <td>
                            <strong style={{ color: '#10b981' }}>{formatPrice(ord.totalPrice)}</strong>
                          </td>
                          <td>
                            <span className="badge badge-ok">
                              {ord.paymentStatus || 'Paid'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- MODAL: Add New Product --- */}
        {showAddModal && (
          <div className="modal-overlay" onClick={function (e) { if (e.target === e.currentTarget) setShowAddModal(false); }}>
            <div className="modal-content">
              <div className="modal-header">
                <h2>List New Product</h2>
                <button
                  type="button"
                  className="modal-close"
                  onClick={function () { setShowAddModal(false); }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddProduct} noValidate style={{ display: 'grid', gap: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <FormInput
                    id="new-product-name"
                    label="Product Name"
                    type="text"
                    placeholder="e.g. Basmati Rice 5kg"
                    value={newProduct.name}
                    onChange={function (e) {
                      setNewProduct({ ...newProduct, name: e.target.value });
                      if (addFormErrors.name) setAddFormErrors({ ...addFormErrors, name: '' });
                    }}
                    error={addFormErrors.name}
                    required
                  />

                  <FormInput
                    id="new-product-code"
                    label="Product Code / Barcode"
                    type="text"
                    placeholder="e.g. SM016 or RICE01"
                    value={newProduct.code}
                    onChange={function (e) {
                      setNewProduct({ ...newProduct, code: e.target.value });
                      if (addFormErrors.code) setAddFormErrors({ ...addFormErrors, code: '' });
                    }}
                    error={addFormErrors.code}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '0.8rem' }}>
                  <FormInput
                    id="new-product-price"
                    label="Price (₹)"
                    type="number"
                    min="1"
                    placeholder="e.g. 499"
                    value={newProduct.price}
                    onChange={function (e) {
                      setNewProduct({ ...newProduct, price: e.target.value });
                      if (addFormErrors.price) setAddFormErrors({ ...addFormErrors, price: '' });
                    }}
                    error={addFormErrors.price}
                    required
                  />

                  <FormInput
                    id="new-product-stock"
                    label="Initial Stock Quantity"
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={newProduct.stock}
                    onChange={function (e) {
                      setNewProduct({ ...newProduct, stock: e.target.value });
                      if (addFormErrors.stock) setAddFormErrors({ ...addFormErrors, stock: '' });
                    }}
                    error={addFormErrors.stock}
                    required
                  />

                  <div>
                    <label htmlFor="new-product-category">
                      Category <span className="required-mark">*</span>
                    </label>
                    <select
                      id="new-product-category"
                      className={addFormErrors.category ? 'select-input input-error' : 'select-input'}
                      value={newProduct.category}
                      onChange={function (e) {
                        setNewProduct({ ...newProduct, category: e.target.value });
                        if (addFormErrors.category) setAddFormErrors({ ...addFormErrors, category: '' });
                      }}
                      style={{ width: '100%', marginTop: '0.2rem' }}
                    >
                      <option value="">Select Category</option>
                      {allCategories.filter(c => c !== 'All').map(function (c) {
                        return <option key={c} value={c}>{c}</option>;
                      })}
                      <option value="__custom__">+ Enter Custom Category...</option>
                    </select>
                    {addFormErrors.category && (
                      <p className="error-text">{addFormErrors.category}</p>
                    )}
                  </div>
                </div>

                {newProduct.category === '__custom__' && (
                  <FormInput
                    id="new-custom-category"
                    label="Custom Category Name"
                    type="text"
                    placeholder="e.g. Beverages, Snacks..."
                    value={newProduct.customCategory}
                    onChange={function (e) {
                      setNewProduct({ ...newProduct, customCategory: e.target.value });
                    }}
                    required
                  />
                )}

                <div>
                  <FormInput
                    id="new-product-image"
                    label="Image URL (optional)"
                    type="url"
                    placeholder="https://images.unsplash.com/... (or leave blank for default image)"
                    value={newProduct.image}
                    onChange={function (e) {
                      setNewProduct({ ...newProduct, image: e.target.value });
                    }}
                  />
                  <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
                    Tip: If left blank, a stylish default merchandise photo will be used automatically.
                  </p>
                </div>

                <div>
                  <label htmlFor="new-product-desc">Product Description</label>
                  <textarea
                    id="new-product-desc"
                    className="text-input"
                    rows="3"
                    placeholder="Provide a helpful description for customers..."
                    value={newProduct.description}
                    onChange={function (e) {
                      setNewProduct({ ...newProduct, description: e.target.value });
                    }}
                    style={{ resize: 'vertical', width: '100%', marginTop: '0.2rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.8rem' }}>
                  <Button variant="secondary" onClick={function () { setShowAddModal(false); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Publish to Store
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL: Edit Existing Product --- */}
        {editingProduct && (
          <div className="modal-overlay" onClick={function (e) { if (e.target === e.currentTarget) setEditingProduct(null); }}>
            <div className="modal-content">
              <div className="modal-header">
                <h2>Edit Product Details</h2>
                <button
                  type="button"
                  className="modal-close"
                  onClick={function () { setEditingProduct(null); }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveFullEdit} style={{ display: 'grid', gap: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.8rem' }}>
                  <div>
                    <label htmlFor="edit-name">Product Name</label>
                    <input
                      id="edit-name"
                      className="text-input"
                      value={editingProduct.name}
                      onChange={function (e) { setEditingProduct({ ...editingProduct, name: e.target.value }); }}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-code">Barcode / Code</label>
                    <input
                      id="edit-code"
                      className="text-input"
                      value={editingProduct.code}
                      onChange={function (e) { setEditingProduct({ ...editingProduct, code: e.target.value }); }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label htmlFor="edit-price">Price (₹)</label>
                    <input
                      id="edit-price"
                      type="number"
                      min="1"
                      className="text-input"
                      value={editingProduct.price}
                      onChange={function (e) { setEditingProduct({ ...editingProduct, price: e.target.value }); }}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-stock">Current Stock</label>
                    <input
                      id="edit-stock"
                      type="number"
                      min="0"
                      className="text-input"
                      value={editingProduct.stock}
                      onChange={function (e) { setEditingProduct({ ...editingProduct, stock: e.target.value }); }}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-cat">Category</label>
                    <input
                      id="edit-cat"
                      className="text-input"
                      value={editingProduct.category}
                      onChange={function (e) { setEditingProduct({ ...editingProduct, category: e.target.value }); }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-image">Image URL</label>
                  <input
                    id="edit-image"
                    type="url"
                    className="text-input"
                    value={editingProduct.image}
                    onChange={function (e) { setEditingProduct({ ...editingProduct, image: e.target.value }); }}
                  />
                </div>

                <div>
                  <label htmlFor="edit-desc">Description</label>
                  <textarea
                    id="edit-desc"
                    className="text-input"
                    rows="3"
                    value={editingProduct.description}
                    onChange={function (e) { setEditingProduct({ ...editingProduct, description: e.target.value }); }}
                    style={{ resize: 'vertical', width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.8rem' }}>
                  <Button variant="secondary" onClick={function () { setEditingProduct(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
