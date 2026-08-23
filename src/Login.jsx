// Login Page.
// Shows role selection (Customer / Shop Owner), login form, and registration forms.
// Uses useState to switch between views (conditional rendering).
// Uses useNavigate to redirect after login/registration.
// Uses controlled form inputs.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  // "select" = Customer / Shop Owner cards
  // "customer" = customer login form
  // "register" = new customer account form
  // "shopOwner" = shop owner registration form
  const [view, setView] = useState('select');
  const navigate = useNavigate();

  function handleCustomerLogin(event) {
    event.preventDefault();
    navigate('/home');
  }

  function handleCreateAccount(event) {
    event.preventDefault();

    const form = event.target;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    navigate('/home');
  }

  function handleShopRegister(event) {
    event.preventDefault();
    navigate('/admin');
  }

  function goBack() {
    if (view === 'register') {
      setView('customer');
    } else {
      setView('select');
    }
  }

  return (
    <section className="login-page">
      <div className="login-brand">
        <h1>ScanMart</h1>
        <p>Your Smart Local Shopping Platform</p>
      </div>

      {view === 'select' && (
        <div className="login-roles">
          <article className="card login-role-card">
            <div className="login-role-icon" aria-hidden="true">
              🛒
            </div>
            <h2>Customer</h2>
            <p className="muted">Shop products from local stores</p>
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={() => setView('customer')}
            >
              Continue as Customer
            </button>
          </article>

          <article className="card login-role-card">
            <div className="login-role-icon" aria-hidden="true">
              🏪
            </div>
            <h2>Shop Owner</h2>
            <p className="muted">Register and manage your shop</p>
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={() => setView('shopOwner')}
            >
              Continue as Shop Owner
            </button>
          </article>
        </div>
      )}

      {view === 'customer' && (
        <div className="card login-form-card">
          <button className="btn btn-ghost login-back" type="button" onClick={goBack}>
            ← Back
          </button>
          <h2>Welcome Back!</h2>
          <p className="muted">Login to your ScanMart account</p>

          <form className="form login-form" onSubmit={handleCustomerLogin}>
            <div>
              <label htmlFor="customer-email">Email</label>
              <input
                className="text-input"
                id="customer-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="customer-password">Password</label>
              <input
                className="text-input"
                id="customer-password"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              Login
            </button>
          </form>

          <button
            className="btn btn-ghost btn-block"
            type="button"
            onClick={() => setView('register')}
          >
            Don’t have an account? Create Account
          </button>
        </div>
      )}

      {view === 'register' && (
        <div className="card login-form-card">
          <button className="btn btn-ghost login-back" type="button" onClick={goBack}>
            ← Back
          </button>
          <h2>Create Account</h2>
          <p className="muted">Create a new ScanMart customer account.</p>

          <form className="form login-form" onSubmit={handleCreateAccount}>
            <div>
              <label htmlFor="customer-full-name">Full Name</label>
              <input
                className="text-input"
                id="customer-full-name"
                type="text"
                name="fullName"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label htmlFor="register-email">Email</label>
              <input
                className="text-input"
                id="register-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="register-password">Password</label>
              <input
                className="text-input"
                id="register-password"
                type="password"
                name="password"
                placeholder="Create a password"
                required
              />
            </div>
            <div>
              <label htmlFor="register-confirm-password">Confirm Password</label>
              <input
                className="text-input"
                id="register-confirm-password"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                required
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              Create Account
            </button>
          </form>
        </div>
      )}

      {view === 'shopOwner' && (
        <div className="card login-form-card">
          <button className="btn btn-ghost login-back" type="button" onClick={goBack}>
            ← Back
          </button>
          <h2>Shop Owner Registration</h2>
          <p className="muted">Register your shop to start selling on ScanMart.</p>

          <form className="form login-form" onSubmit={handleShopRegister}>
            <div>
              <label htmlFor="owner-name">Owner Name</label>
              <input
                className="text-input"
                id="owner-name"
                type="text"
                name="ownerName"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label htmlFor="shop-name">Shop Name</label>
              <input
                className="text-input"
                id="shop-name"
                type="text"
                name="shopName"
                placeholder="Your shop name"
                required
              />
            </div>
            <div>
              <label htmlFor="owner-email">Email</label>
              <input
                className="text-input"
                id="owner-email"
                type="email"
                name="email"
                placeholder="shop@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="owner-phone">Phone Number</label>
              <input
                className="text-input"
                id="owner-phone"
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label htmlFor="shop-address">Shop Address</label>
              <input
                className="text-input"
                id="shop-address"
                type="text"
                name="shopAddress"
                placeholder="Street, city"
                required
              />
            </div>
            <div>
              <label htmlFor="owner-password">Password</label>
              <input
                className="text-input"
                id="owner-password"
                type="password"
                name="password"
                placeholder="Create a password"
                required
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              Register Shop
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default Login;
