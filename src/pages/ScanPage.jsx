import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import {
  formatPrice,
  getStockText,
  getStockClass
} from '../data/products';
export { default as AdminPage } from './AdminPage';


// ==================== SCAN PAGE ====================
// CONCEPTS:
// 1. Local state (useState) for the entered product code, scanned product, and feedback message.
// 2. Global state (useCart) to add the scanned product to the cart.
// 3. Central inventory (useProducts) ensures barcode scanning immediately detects newly listed products and live stock.
// 4. useRef to auto-focus the code input field when the page opens.

function ScanPage() {
  const { addToCart } = useCart();
  const { products, getProductByCode } = useProducts();
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

    // Find product matching code in live catalog
    const found = getProductByCode(code);

    if (!found) {
      setScannedProduct(null);
      const examples = products.slice(0, 3).map(function (p) { return p.code; }).join(', ');
      setMessage(`Product "${code}" not found. Try: ${examples}...`);
      return;
    }

    setScannedProduct(found);
    setMessage('');
  }

  // Keep scanned product synchronized with live inventory (stock/price updates)
  const currentScanned = scannedProduct
    ? (products.find(function (p) { return p.id === scannedProduct.id; }) || scannedProduct)
    : null;

  const isOutOfStock = currentScanned ? Number(currentScanned.stock) <= 0 : false;

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
            placeholder="e.g. SM001"
          />
          <Button type="submit">Scan</Button>
        </form>
      </section>

      {message && (
        <p className="error-text" style={{ marginTop: '1rem', textAlign: 'center' }}>
          {message}
        </p>
      )}

      {currentScanned && (
        <article className="card scanned-product">
          <img src={currentScanned.image} alt={currentScanned.name} />
          <div>
            <p className="muted">{currentScanned.category}</p>
            <h2>{currentScanned.name}</h2>
            <p className="price" style={{ fontSize: '1.2rem' }}>
              {formatPrice(currentScanned.price)}
            </p>
            <p className="muted">Code: {currentScanned.code}</p>

            <p style={{ margin: '0.4rem 0' }}>
              <span className={'badge badge-' + getStockClass(currentScanned.stock)}>
                {getStockText(currentScanned.stock)} ({currentScanned.stock} available)
              </span>
            </p>

            <Button
              disabled={isOutOfStock}
              onClick={function () { addToCart(currentScanned); }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
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


// Note: AdminPage is implemented in AdminPage.jsx and re-exported at top.

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