// Login.jsx — Role Selection and Login Forms
//
// CONCEPTS:
// 1. Local State: useState for form inputs, errors, show/hide password, and current view
// 2. Form Validation: checking required fields, email format, and password length
// 3. Global Auth State: useAuth() from AuthContext to store the logged-in user

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import FormInput from './components/FormInput';
import './Login.css';

// Simple email check: must have '@' and a '.' after it
function isValidEmail(email) {
  if (!email) {
    return false;
  }
  const atPosition = email.indexOf('@');
  const dotPosition = email.lastIndexOf('.');

  // @ must not be at the start, and . must come after @
  if (atPosition > 0 && dotPosition > atPosition + 1 && dotPosition < email.length - 1) {
    return true;
  }
  return false;
}

// ========== MAIN LOGIN COMPONENT ==========
function Login() {
  // 'select'    -> Role selection (Customer / Store Owner)
  // 'customer'  -> Customer login form
  // 'register'  -> Customer registration form
  // 'shopOwner' -> Store Owner login form
  const [view, setView] = useState('select');

  const navigate = useNavigate();
  const { login } = useAuth(); // Global login function from AuthContext

  // Go back to the previous screen
  function handleBack() {
    if (view === 'register') {
      setView('customer');
    } else {
      setView('select');
    }
  }

  return (
    <section className="login-page">
      {/* Brand header */}
      <div className="login-brand">
        <h1>ScanMart</h1>
        <p>Your Smart Local Shopping Platform</p>
      </div>

      {/* 1. ROLE SELECTION VIEW */}
      {view === 'select' && (
        <div className="login-roles">
          {/* Customer Option Card */}
          <article className="card login-role-card">
            <div className="login-role-icon">🛒</div>
            <h2>Customer</h2>
            <p className="muted">
              Scan products, manage your cart, and enjoy faster checkout.
            </p>
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={function () { setView('customer'); }}
            >
              Continue as Customer
            </button>
          </article>

          {/* Store Owner Option Card */}
          <article className="card login-role-card">
            <div className="login-role-icon">🏪</div>
            <h2>Store Owner</h2>
            <p className="muted">
              Manage products, monitor inventory, and review store orders.
            </p>
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={function () { setView('shopOwner'); }}
            >
              Continue as Store Owner
            </button>
          </article>
        </div>
      )}

      {/* 2. CUSTOMER LOGIN FORM */}
      {view === 'customer' && (
        <CustomerLoginForm
          onBack={handleBack}
          onRegister={function () { setView('register'); }}
          login={login}
          navigate={navigate}
        />
      )}

      {/* 3. CUSTOMER REGISTRATION FORM */}
      {view === 'register' && (
        <CustomerRegisterForm
          onBack={handleBack}
          login={login}
          navigate={navigate}
        />
      )}

      {/* 4. STORE OWNER LOGIN FORM */}
      {view === 'shopOwner' && (
        <ShopOwnerLoginForm
          onBack={handleBack}
          login={login}
          navigate={navigate}
        />
      )}
    </section>
  );
}


// ========== CUSTOMER LOGIN FORM ==========
function CustomerLoginForm({ onBack, onRegister, login, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validate user inputs before logging in
  function validate() {
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  }

  function handleLogin(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    // Simulate async login with 600ms timeout
    setTimeout(function () {
      const name = email.split('@')[0];
      login(name, email, 'customer'); // Save user to AuthContext
      navigate('/home');              // Redirect customer to home page
      setIsLoading(false);
    }, 600);
  }

  // Button to show/hide password text
  const togglePasswordBtn = (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={function () { setShowPassword(!showPassword); }}
      aria-label="Toggle password visibility"
    >
      {showPassword ? '🙈' : '👁️'}
    </button>
  );

  return (
    <div className="card login-form-card">
      <button className="btn btn-ghost login-back" type="button" onClick={onBack}>
        ← Back
      </button>
      <h2>Welcome Back!</h2>
      <p className="muted">Login to your ScanMart account</p>

      <form className="login-form" onSubmit={handleLogin} noValidate>
        <FormInput
          id="customer-email"
          label="Email Address"
          type="email"
          value={email}
          onChange={function (e) { setEmail(e.target.value); }}
          placeholder="you@example.com"
          error={emailError}
          required
        />

        <FormInput
          id="customer-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={function (e) { setPassword(e.target.value); }}
          placeholder="Enter your password"
          error={passwordError}
          required
          rightElement={togglePasswordBtn}
        />

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <button
        className="btn btn-ghost btn-block"
        type="button"
        onClick={onRegister}
        style={{ marginTop: '0.5rem' }}
      >
        Don't have an account? Create Account
      </button>
    </div>
  );
}


// ========== CUSTOMER REGISTRATION FORM ==========
function CustomerRegisterForm({ onBack, login, navigate }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  function validate() {
    let isValid = true;

    // Full name check
    if (!fullName.trim()) {
      setNameError('Full name is required.');
      isValid = false;
    } else {
      setNameError('');
    }

    // Email check
    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password check
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Confirm password match check
    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      isValid = false;
    } else {
      setConfirmError('');
    }

    return isValid;
  }

  function handleRegister(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    setTimeout(function () {
      login(fullName.trim(), email, 'customer');
      navigate('/home');
      setIsLoading(false);
    }, 600);
  }

  const togglePasswordBtn = (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={function () { setShowPassword(!showPassword); }}
      aria-label="Toggle password visibility"
    >
      {showPassword ? '🙈' : '👁️'}
    </button>
  );

  return (
    <div className="card login-form-card">
      <button className="btn btn-ghost login-back" type="button" onClick={onBack}>
        ← Back
      </button>
      <h2>Create Account</h2>
      <p className="muted">Create a new ScanMart customer account.</p>

      <form className="login-form" onSubmit={handleRegister} noValidate>
        <FormInput
          id="reg-fullName"
          label="Full Name"
          type="text"
          value={fullName}
          onChange={function (e) { setFullName(e.target.value); }}
          placeholder="Your full name"
          error={nameError}
          required
        />

        <FormInput
          id="reg-email"
          label="Email Address"
          type="email"
          value={email}
          onChange={function (e) { setEmail(e.target.value); }}
          placeholder="you@example.com"
          error={emailError}
          required
        />

        <FormInput
          id="reg-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={function (e) { setPassword(e.target.value); }}
          placeholder="Create a password (min 4 characters)"
          error={passwordError}
          required
          rightElement={togglePasswordBtn}
        />

        <FormInput
          id="reg-confirmPassword"
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={function (e) { setConfirmPassword(e.target.value); }}
          placeholder="Re-enter your password"
          error={confirmError}
          required
        />

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}


// ========== STORE OWNER LOGIN FORM ==========
function ShopOwnerLoginForm({ onBack, login, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function validate() {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  }

  function handleOwnerLogin(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    setTimeout(function () {
      const name = email.split('@')[0];
      login(name, email, 'owner'); // Role is 'owner'
      navigate('/admin');          // Redirect to the Admin Dashboard
      setIsLoading(false);
    }, 600);
  }

  const togglePasswordBtn = (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={function () { setShowPassword(!showPassword); }}
      aria-label="Toggle password visibility"
    >
      {showPassword ? '🙈' : '👁️'}
    </button>
  );

  return (
    <div className="card login-form-card">
      <button className="btn btn-ghost login-back" type="button" onClick={onBack}>
        ← Back
      </button>
      <h2>Store Owner Login</h2>
      <p className="muted">Manage products, monitor inventory, and review store orders.</p>

      <form className="login-form" onSubmit={handleOwnerLogin} noValidate>
        <FormInput
          id="owner-email"
          label="Store Owner Email"
          type="email"
          value={email}
          onChange={function (e) { setEmail(e.target.value); }}
          placeholder="shop@example.com"
          error={emailError}
          required
        />

        <FormInput
          id="owner-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={function (e) { setPassword(e.target.value); }}
          placeholder="Enter your password"
          error={passwordError}
          required
          rightElement={togglePasswordBtn}
        />

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login as Store Owner'}
        </button>
      </form>

      <p className="muted" style={{ marginTop: '0.8rem', fontSize: '0.85rem' }}>
        💡 Demo: Use any email and a password with 4 or more characters.
      </p>
    </div>
  );
}

export default Login;
