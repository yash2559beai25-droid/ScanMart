import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  products as initialProducts,
  categories,
  formatPrice,
  getStockText,
  getStockClass
} from '../data/products';


// ==================== SCAN PAGE ====================
// CONCEPTS:
// 1. Local state (useState) for the entered product code, scanned product, and feedback message.
// 2. Global state (useCart) to add the scanned product to the cart.
// 3. useRef to auto-focus the code input field when the page opens.

function ScanPage() {
  const { addToCart } = useCart();
  const inputRef = useRef(null);

  const [productCode, setProductCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [message, setMessage] = useState('');

  // Auto-focus input on page load
  useEffect(function () {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  function handleScan(event) {
    event.preventDefault();

    const code = productCode.trim().toUpperCase();

    if (!code) {
      setScannedProduct(null);
      setMessage('Please enter a product code.');
      return;
    }

    // Find product matching code
    let found = null;
    for (let i = 0; i < initialProducts.length; i++) {
      if (initialProducts[i].code === code) {
        found = initialProducts[i];
        break;
      }
    }

    if (!found) {
      setScannedProduct(null);
      setMessage('Product not found. Try SM001, SM002 ... SM015.');
      return;
    }

    setScannedProduct(found);
    setMessage('');
  }

  return (
    <section className="container section scanner-page">
      <section className="card scanner-box">
        <h1>Scan Product</h1>
        <p className="muted">Enter a product code to simulate scanning.</p>

        <div className="scan-area" aria-hidden="true">
          <span>Scan Area</span>
          <div className="scan-line" />
        </div>

        <form className="scanner-form" onSubmit={handleScan}>
          <label htmlFor="productCode">Enter Product Code</label>
          <input
            id="productCode"
            ref={inputRef}
            className="text-input"
            value={productCode}
            onChange={function (e) { setProductCode(e.target.value); }}
            placeholder="SM001"
          />
          <Button type="submit">Scan</Button>
        </form>
      </section>

      {message && (
        <p className="error-text" style={{ marginTop: '1rem', textAlign: 'center' }}>
          {message}
        </p>
      )}

      {scannedProduct && (
        <article className="card scanned-product">
          <img src={scannedProduct.image} alt={scannedProduct.name} />
          <div>
            <p className="muted">{scannedProduct.category}</p>
            <h2>{scannedProduct.name}</h2>
            <p>{formatPrice(scannedProduct.price)}</p>
            <p className="muted">Code: {scannedProduct.code}</p>
            <Button
              disabled={scannedProduct.stock === 0}
              onClick={function () { addToCart(scannedProduct); }}
            >
              Add to Cart
            </Button>
          </div>
        </article>
      )}
    </section>
  );
}


// ==================== PROFILE PAGE ====================
// Shows the logged-in customer's details and recent orders from localStorage.

export function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // If user is not logged in, prompt them to log in
  if (!isLoggedIn) {
    return (
      <section className="container section">
        <section className="empty-state card">
          <h2>Not logged in</h2>
          <p className="muted">Please log in to view your profile.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button to="/login">Go to Login</Button>
          </div>
        </section>
      </section>
    );
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Read saved orders from localStorage
  let savedOrders = [];
  try {
    const rawData = localStorage.getItem('scanmart_orders');
    if (rawData) {
      savedOrders = JSON.parse(rawData);
    }
  } catch (err) {
    savedOrders = [];
  }

  return (
    <section className="container section">
      <h1 className="section-title">My Profile</h1>

      <div className="profile-grid">
        {/* Profile Card — Displays details from AuthContext */}
        <article className="card profile-card">
          <h2>My Profile</h2>
          <p><strong>{user.name}</strong></p>
          <p className="muted">{user.email}</p>
          <p className="muted">Role: {user.role === 'customer' ? 'Customer' : 'Store Owner'}</p>

          <p style={{ marginTop: '0.8rem' }}>
            Total Orders: {savedOrders.length}
          </p>

          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1rem' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </article>

        {/* Orders Card */}
        <article className="card profile-card">
          <h2>My Orders</h2>
          {savedOrders.length === 0 && (
            <p className="muted">
              No orders yet. Complete a demo checkout to see orders here.
            </p>
          )}
          {savedOrders.slice(0, 3).map(function (order) {
            return (
              <p key={order.orderId}>
                {order.orderId} · {order.date} · {formatPrice(order.totalPrice)}
              </p>
            );
          })}
          {savedOrders.length > 0 && (
            <p style={{ marginTop: '0.8rem' }}>
              <Link to="/receipt">View last receipt</Link>
            </p>
          )}
        </article>
      </div>

      <article className="card profile-card" style={{ marginTop: '1rem' }}>
        <h2>Shopping Preferences</h2>
        <p>Preferred store: ScanMart Downtown</p>
        <p>Receipt type: Digital only</p>
        <p className="muted">Saved shopping information is demo data for now.</p>
      </article>
    </section>
  );
}


// ==================== ADMIN PAGE ====================
// Store Owner dashboard — manage products, view stock, add new products.
// CONCEPTS:
// 1. Role-based Access: Only users with role === 'owner' can access.
// 2. Form Validation: Checking required fields before adding a product.
// 3. Derived State: Calculating low stock count and inventory statistics.

export function AdminPage() {
  const { user, isLoggedIn, isOwner, logout } = useAuth();
  const navigate = useNavigate();

  // Local state for product list in admin dashboard
  const [adminProducts, setAdminProducts] = useState(initialProducts);

  // Stock edit state
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');

  // Toggle for Add Product form
  const [showAddForm, setShowAddForm] = useState(false);

  // Controlled form state for adding a product
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    price: '',
    stock: '',
    category: '',
    description: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [addSuccess, setAddSuccess] = useState('');

  // Async simulation for dashboard stats
  const [statsLoading, setStatsLoading] = useState(true);
  useEffect(function () {
    const timer = setTimeout(function () {
      setStatsLoading(false);
    }, 600);
    return function () {
      clearTimeout(timer);
    };
  }, []);

  // Guard: if not logged in or not store owner, show Access Denied
  if (!isLoggedIn || !isOwner) {
    return (
      <section className="container section">
        <section className="empty-state card">
          <h2>Access Denied</h2>
          <p className="muted">
            This page is only for Store Owners.
            Please log in with a Store Owner account.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Button to="/login">Go to Login</Button>
          </div>
        </section>
      </section>
    );
  }

  // Derived calculations: low stock items
  let lowStockCount = 0;
  for (let i = 0; i < adminProducts.length; i++) {
    if (adminProducts[i].stock < 5) {
      lowStockCount = lowStockCount + 1;
    }
  }

  // --- Edit stock ---
  function startEdit(product) {
    setEditingId(product.id);
    setEditStock(String(product.stock));
  }

  function saveEdit(productId) {
    const updated = adminProducts.map(function (product) {
      if (product.id === productId) {
        return {
          ...product,
          stock: Number(editStock)
        };
      }
      return product;
    });
    setAdminProducts(updated);
    setEditingId(null);
  }

  // --- Delete product ---
  function deleteProduct(productId) {
    const remaining = adminProducts.filter(function (product) {
      return product.id !== productId;
    });
    setAdminProducts(remaining);
  }

  // --- Validation for Add Product form ---
  function validateAddForm() {
    const errors = {};

    if (!newProduct.name.trim()) {
      errors.name = 'Product name is required.';
    }

    if (!newProduct.code.trim()) {
      errors.code = 'Product code is required.';
    } else {
      const codeUpper = newProduct.code.trim().toUpperCase();
      for (let i = 0; i < adminProducts.length; i++) {
        if (adminProducts[i].code === codeUpper) {
          errors.code = 'This product code already exists.';
          break;
        }
      }
    }

    if (!newProduct.price) {
      errors.price = 'Price is required.';
    } else if (isNaN(Number(newProduct.price)) || Number(newProduct.price) <= 0) {
      errors.price = 'Price must be a positive number.';
    }

    if (newProduct.stock === '') {
      errors.stock = 'Stock quantity is required.';
    } else if (isNaN(Number(newProduct.stock)) || Number(newProduct.stock) < 0) {
      errors.stock = 'Stock must be 0 or more.';
    }

    if (!newProduct.category) {
      errors.category = 'Please select a category.';
    }

    return errors;
  }

  // --- Submit handler for Add Product form ---
  function handleAddProduct(event) {
    event.preventDefault();
    setAddSuccess('');

    const errors = validateAddForm();
    setFormErrors(errors);

    // If there are errors, stop
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Determine the next product ID
    let maxId = 0;
    for (let i = 0; i < adminProducts.length; i++) {
      if (adminProducts[i].id > maxId) {
        maxId = adminProducts[i].id;
      }
    }
    const nextId = maxId + 1;

    const itemToAdd = {
      id: nextId,
      code: newProduct.code.trim().toUpperCase(),
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: Number(newProduct.price),
      rating: 4.0,
      stock: Number(newProduct.stock),
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
      description: newProduct.description.trim() || 'No description provided.'
    };

    setAdminProducts([...adminProducts, itemToAdd]);
    setNewProduct({
      name: '',
      code: '',
      price: '',
      stock: '',
      category: '',
      description: ''
    });
    setFormErrors({});
    setAddSuccess('Product "' + itemToAdd.name + '" added successfully!');
    setShowAddForm(false);
  }

  function updateField(field, value) {
    setNewProduct(function (prev) {
      return {
        ...prev,
        [field]: value
      };
    });
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(function (prev) {
        return {
          ...prev,
          [field]: ''
        };
      });
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
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="muted">Welcome, {user.name} · Store Owner</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={function () {
                setShowAddForm(!showAddForm);
                setAddSuccess('');
              }}
            >
              {showAddForm ? 'Cancel' : '+ Add Product'}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Success message banner */}
        {addSuccess && (
          <div className="success-banner" style={{ marginTop: '1rem' }}>
            ✅ {addSuccess}
          </div>
        )}

        {/* --- Add Product Form --- */}
        {showAddForm && (
          <div className="card" style={{ padding: '1.2rem', marginTop: '1.2rem' }}>
            <h2 style={{ color: 'white', marginBottom: '0.8rem' }}>Add New Product</h2>
            <form onSubmit={handleAddProduct} noValidate style={{ display: 'grid', gap: '0.8rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <FormInput
                    id="new-name"
                    label="Product Name"
                    type="text"
                    value={newProduct.name}
                    onChange={function (e) { updateField('name', e.target.value); }}
                    placeholder="e.g. Rice Bran Oil"
                    error={formErrors.name}
                    required
                  />
                </div>
                <div>
                  <FormInput
                    id="new-code"
                    label="Product Code (Barcode)"
                    type="text"
                    value={newProduct.code}
                    onChange={function (e) { updateField('code', e.target.value); }}
                    placeholder="e.g. SM016"
                    error={formErrors.code}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <FormInput
                    id="new-price"
                    label="Price (₹)"
                    type="number"
                    value={newProduct.price}
                    onChange={function (e) { updateField('price', e.target.value); }}
                    placeholder="e.g. 299"
                    error={formErrors.price}
                    required
                  />
                </div>
                <div>
                  <FormInput
                    id="new-stock"
                    label="Stock Quantity"
                    type="number"
                    value={newProduct.stock}
                    onChange={function (e) { updateField('stock', e.target.value); }}
                    placeholder="e.g. 20"
                    error={formErrors.stock}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-category">
                    Category <span className="required-mark">*</span>
                  </label>
                  <select
                    id="new-category"
                    className={formErrors.category ? 'select-input input-error' : 'select-input'}
                    value={newProduct.category}
                    onChange={function (e) { updateField('category', e.target.value); }}
                    style={{ width: '100%' }}
                  >
                    <option value="">Select category</option>
                    {categories.filter(function (cat) { return cat !== 'All'; }).map(function (cat) {
                      return (
                        <option key={cat} value={cat}>{cat}</option>
                      );
                    })}
                  </select>
                  {formErrors.category && (
                    <p className="error-text">{formErrors.category}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="new-description">Description (optional)</label>
                <input
                  id="new-description"
                  className="text-input"
                  value={newProduct.description}
                  onChange={function (e) { updateField('description', e.target.value); }}
                  placeholder="Short product description"
                />
              </div>

              <button className="btn btn-primary" type="submit">
                Add Product
              </button>
            </form>
          </div>
        )}

        {/* --- Statistics Cards --- */}
        {statsLoading ? (
          <div className="card" style={{ padding: '1.2rem', marginTop: '1.2rem', textAlign: 'center' }}>
            <p className="muted">⏳ Loading dashboard stats...</p>
          </div>
        ) : (
          <div className="admin-stats" style={{ marginTop: '1.2rem' }}>
            <article className="card stat-card">
              <p className="muted">Total Products</p>
              <p className="stat-value">{adminProducts.length}</p>
            </article>
            <article className="card stat-card">
              <p className="muted">Total Orders</p>
              <p className="stat-value">0</p>
            </article>
            <article className="card stat-card">
              <p className="muted">Total Sales</p>
              <p className="stat-value">{formatPrice(0)}</p>
            </article>
            <article className="card stat-card">
              <p className="muted">Low Stock</p>
              <p className="stat-value">{lowStockCount}</p>
            </article>
          </div>
        )}

        {/* --- Product Inventory Table --- */}
        <div className="card table-wrap" style={{ marginTop: '1.2rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminProducts.map(function (product) {
                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.price)}</td>

                    <td>
                      {editingId === product.id ? (
                        <div className="edit-box">
                          <input
                            type="number"
                            value={editStock}
                            onChange={function (e) { setEditStock(e.target.value); }}
                            aria-label="Edit stock"
                          />
                          <Button size="sm" onClick={function () { saveEdit(product.id); }}>
                            Save
                          </Button>
                        </div>
                      ) : (
                        product.stock
                      )}
                    </td>

                    <td>
                      <span className={'badge badge-' + getStockClass(product.stock)}>
                        {getStockText(product.stock)}
                      </span>
                    </td>

                    <td>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={function () { startEdit(product); }}
                      >
                        Edit
                      </Button>{' '}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={function () { deleteProduct(product.id); }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="muted" style={{ marginTop: '0.8rem', fontSize: '0.85rem' }}>
          Note: Edits and deletions apply to this session only. Refresh to restore original data.
        </p>

      </section>
    </div>
  );
}


// ==================== 404 PAGE ====================

export function NotFoundPage() {
  return (
    <section className="container not-found">
      <h1>404</h1>
      <h2>Oops! Page not found.</h2>
      <p className="muted">The page you are looking for does not exist.</p>
      <div style={{ marginTop: '1rem' }}>
        <Button to="/home">Back to Home</Button>
      </div>
    </section>
  );
}

export default ScanPage;