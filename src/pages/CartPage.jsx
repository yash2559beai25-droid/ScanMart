// Cart Page, Checkout Page, and Receipt Page
//
// CONCEPTS:
// 1. Context API: using useCart() and useAuth() directly without prop drilling
// 2. Derived State: calculating total items and total price from cartItems
// 3. Controlled Form: Checkout fields bound to local useState variables

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// --- Cart Page ---
function CartPage() {
  const {
    cartItems,
    totalItems,
    totalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart
  } = useCart();

  // If cart is empty, show empty state message
  if (cartItems.length === 0) {
    return (
      <section className="container section">
        <h1 className="section-title">Your Cart</h1>
        <section className="empty-state card">
          <h2>Your cart is empty</h2>
          <p className="muted">Scan a product or browse the store to add items.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button to="/products">Browse Products</Button>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="container section">
      <h1 className="section-title">Your Cart</h1>
      <p className="section-text">Review items before checkout.</p>

      <div className="cart-layout">
        {/* Cart items list */}
        <div>
          {cartItems.map(function (item) {
            return (
              <article className="card cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p className="muted">{formatPrice(item.price)} each</p>

                  {/* Quantity adjustment buttons */}
                  <div className="qty-box">
                    <button
                      type="button"
                      onClick={function () { decreaseQuantity(item.id); }}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={function () { increaseQuantity(item.id); }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <p><strong>{formatPrice(item.price * item.quantity)}</strong></p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={function () { removeFromCart(item.id); }}
                  >
                    Remove
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Order summary sidebar */}
        <aside className="card summary-card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <strong>Total</strong>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
          <Button block to="/checkout">Proceed to Checkout</Button>
        </aside>
      </div>
    </section>
  );
}

// --- Checkout Page ---
export function CheckoutPage() {
  const navigate = useNavigate();

  // Read cart data from CartContext
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();

  // Read logged-in user from AuthContext
  const { user } = useAuth();

  // Controlled form inputs (local state)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState((user && user.email) ? user.email : '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function placeOrder(event) {
    event.preventDefault();

    // Basic validation
    if (!fullName || !email || !phone || !address || !city || !pincode) {
      setError('Please fill in all checkout details.');
      return;
    }

    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const order = {
      orderId: 'SM-' + randomNumber,
      date: new Date().toLocaleDateString('en-IN'),
      customer: {
        fullName: fullName,
        email: email,
        phone: phone,
        address: address,
        city: city,
        pincode: pincode
      },
      items: cartItems,
      totalItems: totalItems,
      totalPrice: totalPrice,
      paymentStatus: 'Demo Payment Successful'
    };

    setError('');
    setSuccessMessage('Order placed! Your digital receipt is ready.');
    clearCart(); // Clears cart items

    setTimeout(function () {
      navigate('/receipt', { state: { order: order } });
    }, 900);
  }

  // If cart is empty, do not show checkout form
  if (cartItems.length === 0 && !successMessage) {
    return (
      <section className="container section">
        <section className="empty-state card">
          <h2>Nothing to checkout</h2>
          <p className="muted">Add products to your cart first.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button to="/cart">Go to Cart</Button>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="container section">
      <h1 className="section-title">Checkout</h1>
      <p className="section-text">This is a demo checkout. No real payment is made.</p>

      {successMessage && <div className="success-banner">{successMessage}</div>}

      <div className="checkout-layout">
        {/* Checkout Form */}
        <form className="card form" onSubmit={placeOrder}>
          <div>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              className="text-input"
              value={fullName}
              onChange={function (e) { setFullName(e.target.value); }}
            />
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="text-input"
                value={email}
                onChange={function (e) { setEmail(e.target.value); }}
              />
            </div>
            <div>
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                className="text-input"
                value={phone}
                onChange={function (e) { setPhone(e.target.value); }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="address">Address</label>
            <input
              id="address"
              className="text-input"
              value={address}
              onChange={function (e) { setAddress(e.target.value); }}
            />
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="city">City</label>
              <input
                id="city"
                className="text-input"
                value={city}
                onChange={function (e) { setCity(e.target.value); }}
              />
            </div>
            <div>
              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                className="text-input"
                value={pincode}
                onChange={function (e) { setPincode(e.target.value); }}
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <Button type="submit">Place Order</Button>
          <Button variant="secondary" block to="/cart">Back to Cart</Button>
        </form>

        {/* Order Summary Sidebar */}
        <aside className="card summary-card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <strong>Total</strong>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}

// --- Receipt Page ---
export function ReceiptPage() {
  const location = useLocation();
  const order = (location.state && location.state.order) ? location.state.order : null;

  const qrCells = [
    1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1,
    1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1
  ];

  if (!order) {
    return (
      <section className="container section">
        <section className="empty-state card">
          <h2>No receipt yet</h2>
          <p className="muted">Place a demo order to see a digital receipt.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button to="/products">Go to Products</Button>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="container section">
      <article className="card receipt">
        <h1>SCANMART</h1>
        <p><strong>Digital Receipt</strong></p>
        <p>Order ID: {order.orderId}</p>
        <p>Date: {order.date}</p>
        <p>Name: {order.customer.fullName}</p>

        <table className="receipt-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(function (item) {
              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p>Subtotal: {formatPrice(order.totalPrice)}</p>
        <p><strong>Total: {formatPrice(order.totalPrice)}</strong></p>
        <p>Payment Status: {order.paymentStatus}</p>

        <p style={{ marginTop: '1rem' }}><strong>QR Verification Code</strong></p>
        <div className="qr-box" aria-label="QR placeholder">
          {qrCells.map(function (cell, index) {
            return <span key={index} className={cell ? '' : 'empty'} />;
          })}
        </div>

        <p className="muted">Show this receipt at the store exit.</p>
        <p><strong>Thank you for shopping with ScanMart!</strong></p>

        <div style={{ marginTop: '1rem' }}>
          <Button to="/home">Back to Home</Button>
        </div>
      </article>
    </section>
  );
}

export default CartPage;
