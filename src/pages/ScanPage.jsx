// Scan Page, Profile Page, Admin Page, and NotFound Page Components.
// These pages showcase refs, searching an array, and mock admin actions.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { products, formatPrice, getStockText, getStockClass } from '../data/products';

// --- Scan Page Component ---
// Allows users to simulate scanning by typing a product code (e.g., SM001).
function ScanPage({ addToCart }) {
  // useRef allows us to reference a real HTML DOM element directly (the input field here)
  const inputRef = useRef(null);

  const [productCode, setProductCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [message, setMessage] = useState('');

  // useEffect runs after the component renders on the screen.
  // Here, we use it to automatically focus the text input so the user can type immediately.
  useEffect(function () {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []); // The empty array means this effect only runs once when the component mounts

  // Handle the form submission when the user clicks 'Scan' or hits Enter
  function handleScan(event) {
    event.preventDefault();
    
    const code = productCode.trim().toUpperCase();

    if (!code) {
      setScannedProduct(null);
      setMessage('Please enter a product code.');
      return;
    }

    // Use Array.find() to locate a product with a matching code in our mock database
    const foundProduct = products.find(function (product) {
      return product.code === code;
    });

    if (!foundProduct) {
      setScannedProduct(null);
      setMessage('Product not found. Please check the product code.');
      return;
    }

    // If a product is found, update the state to display it
    setScannedProduct(foundProduct);
    setMessage('');
  }

  return (
    <section className="container section scanner-page">
      <section className="card scanner-box">
        <h1>Scan Product</h1>
        <p className="muted">Enter a product code to simulate scanning.</p>

        {/* Decorative scanning graphic */}
        <div className="scan-area" aria-hidden="true">
          <span>Scan Area</span>
          <div className="scan-line" />
        </div>

        {/* Scanning Form */}
        <form className="scanner-form" onSubmit={handleScan}>
          <label htmlFor="productCode">Enter Product Code</label>
          <input
            id="productCode"
            ref={inputRef} // Attach our reference to this input field
            className="text-input"
            value={productCode}
            onChange={function (event) { setProductCode(event.target.value); }}
            placeholder="SM001"
          />
          <button className="btn btn-primary" type="submit">
            Scan
          </button>
        </form>
      </section>

      {/* Show validation/error messages here */}
      {message && (
        <p className="error-text" style={{ marginTop: '1rem', textAlign: 'center' }}>
          {message}
        </p>
      )}

      {/* Render the product details if a valid code was found */}
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

// --- Profile Page Component ---
// Displays mock user profile data. Order history will use localStorage later.
export function ProfilePage() {
  // Order history will be loaded from localStorage later
  const savedOrders = [];

  return (
    <section className="container section">
      <h1 className="section-title">My Profile</h1>
      <p className="section-text">This is demo shopper information. Login will come later.</p>

      <div className="profile-grid">
        {/* User Details */}
        <article className="card profile-card">
          <h2>My Profile</h2>
          <p><strong>Aisha Rahman</strong></p>
          <p className="muted">aisha.rahman@email.com</p>
          <p className="muted">+91 98765 43210</p>
          <p className="muted">Pune</p>
          <p style={{ marginTop: '0.8rem' }}>Total Orders: {savedOrders.length}</p>
        </article>

        {/* Order History */}
        <article className="card profile-card">
          <h2>My Orders</h2>
          {savedOrders.length === 0 && (
            <p className="muted">No orders yet. Complete a demo checkout to see orders here.</p>
          )}
          
          {/* Loop over the first 3 orders */}
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

// --- Admin Dashboard Component ---
// Provides a mock interface for a store employee to view stats and manage product stock locally.
export function AdminPage() {
  // Store a local copy of the product data in state so we can edit/delete items
  // Note: These changes reset if you refresh because we aren't saving to an actual backend database.
  const [adminProducts, setAdminProducts] = useState(products);
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');

  // Order history will be loaded from localStorage later
  const savedOrders = [];
  
  // Array.reduce() adds up all total prices from all orders
  const totalSales = savedOrders.reduce(function (sum, order) {
    return sum + order.totalPrice;
  }, 0);
  
  // Count how many products are low in stock
  const lowStockProducts = adminProducts.filter(function (product) {
    return product.stock < 5;
  }).length;

  // Function to activate "edit mode" for a specific row
  function startEdit(product) {
    setEditingId(product.id);
    setEditStock(String(product.stock)); // Pre-fill the input with the current stock
  }

  // Function to save the new stock value for a product
  function saveEdit(productId) {
    const updatedList = adminProducts.map(function (product) {
      if (product.id === productId) {
        // Use the spread operator (...product) to copy all properties, but overwrite 'stock'
        return { ...product, stock: Number(editStock) };
      }
      return product; // Leave other products unchanged
    });
    
    setAdminProducts(updatedList);
    setEditingId(null); // Exit "edit mode"
  }

  // Function to remove a product from the local state list
  function deleteProduct(productId) {
    const remainingProducts = adminProducts.filter(function (product) {
      return product.id !== productId;
    });
    setAdminProducts(remainingProducts);
  }

  return (
    <div className="admin-page">
      <section className="container section">
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-text">Store staff view. Edit and delete actions only apply to this page for demo purposes.</p>

        {/* Dashboard Statistics */}
        <div className="admin-stats">
          <article className="card stat-card">
            <p className="muted">Total Products</p>
            <p className="stat-value">{adminProducts.length}</p>
          </article>
          <article className="card stat-card">
            <p className="muted">Total Orders</p>
            <p className="stat-value">{savedOrders.length}</p>
          </article>
          <article className="card stat-card">
            <p className="muted">Total Sales</p>
            <p className="stat-value">{formatPrice(totalSales)}</p>
          </article>
          <article className="card stat-card">
            <p className="muted">Low Stock Products</p>
            <p className="stat-value">{lowStockProducts}</p>
          </article>
        </div>

        {/* Product Management Table */}
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
                    
                    {/* Conditionally render either a text input (if editing) or the plain number */}
                    <td>
                      {editingId === product.id ? (
                        <div className="edit-box">
                          <input
                            type="number"
                            value={editStock}
                            onChange={function (event) { setEditStock(event.target.value); }}
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
                    
                    {/* Visual badge indicating stock status */}
                    <td>
                      <span className={'badge badge-' + getStockClass(product.stock)}>
                        {getStockText(product.stock)}
                      </span>
                    </td>
                    
                    <td>
                      <Button size="sm" variant="secondary" onClick={function () { startEdit(product); }}>
                        Edit
                      </Button>{' '}
                      <Button size="sm" variant="danger" onClick={function () { deleteProduct(product.id); }}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// --- NotFound Page Component ---
// This acts as a "catch-all" (404 Error) component when a user navigates to an invalid URL.
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
