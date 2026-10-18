import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import FormInput from './components/FormInput';
import './Login.css';

// Check email format
function isValidEmail(email) {
  const at = email.indexOf('@');
  const dot = email.lastIndexOf('.');

  return at > 0 && dot > at + 1 && dot < email.length - 1;
}

// Main Login Component
function Login() {
  const [view, setView] = useState('select');
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleBack() {
    setView(view === 'register' ? 'customer' : 'select');
  }

  return (
    <section className="login-page">
      <div className="login-brand">
        <h1>ScanMart</h1>
        <p>Your Smart Local Shopping Platform</p>
      </div>

      {/* Role Selection */}
      {view === 'select' && (
        <div className="login-roles">
          <article className="card login-role-card">
            <div className="login-role-icon">🛒</div>
            <h2>Customer</h2>
            <p className="muted">
              Scan products, manage your cart, and enjoy faster checkout.
            </p>
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={() => setView('customer')}
            >
              Continue as Customer
            </button>
          </article>

          <article className="card login-role-card">
            <div className="login-role-icon">🏪</div>
            <h2>Store Owner</h2>
            <p className="muted">
              Manage products, monitor inventory, and review store orders.
            </p>
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={() => setView('shopOwner')}
            >
              Continue as Store Owner
            </button>
          </article>
        </div>
      )}

      {/* Customer Login */}
      {view === 'customer' && (
        <CustomerLoginForm
          onBack={handleBack}
          onRegister={() => setView('register')}
          login={login}
          navigate={navigate}
        />
      )}

      {/* Customer Registration */}
      {view === 'register' && (
        <CustomerRegisterForm
          onBack={handleBack}
          login={login}
          navigate={navigate}
        />
      )}

      {/* Store Owner Login */}
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

// Customer Login Form
function CustomerLoginForm({ onBack, onRegister, login, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function validate() {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  }

  function handleLogin(event) {
    event.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      const name = email.split('@')[0];
      login(name, email, 'customer');
      navigate('/home');
      setIsLoading(false);
    }, 600);
  }

  const togglePassword = (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => setShowPassword(!showPassword)}
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={emailError}
          required
        />

        <FormInput
          id="customer-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          error={passwordError}
          required
          rightElement={togglePassword}
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

// Customer Registration Form
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
    let valid = true;

    if (!fullName.trim()) {
      setNameError('Full name is required.');
      valid = false;
    } else {
      setNameError('');
    }

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      valid = false;
    } else {
      setConfirmError('');
    }

    return valid;
  }

  function handleRegister(event) {
    event.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      login(fullName.trim(), email, 'customer');
      navigate('/home');
      setIsLoading(false);
    }, 600);
  }

  const togglePassword = (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => setShowPassword(!showPassword)}
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
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          error={nameError}
          required
        />

        <FormInput
          id="reg-email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={emailError}
          required
        />

        <FormInput
          id="reg-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password (min 4 characters)"
          error={passwordError}
          required
          rightElement={togglePassword}
        />

        <FormInput
          id="reg-confirmPassword"
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

// Store Owner Login Form
function ShopOwnerLoginForm({ onBack, login, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function validate() {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  }

  function handleOwnerLogin(event) {
    event.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      const name = email.split('@')[0];
      login(name, email, 'owner');
      navigate('/admin');
      setIsLoading(false);
    }, 600);
  }

  const togglePassword = (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => setShowPassword(!showPassword)}
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
      <p className="muted">
        Manage products, monitor inventory, and review store orders.
      </p>

      <form className="login-form" onSubmit={handleOwnerLogin} noValidate>
        <FormInput
          id="owner-email"
          label="Store Owner Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="shop@example.com"
          error={emailError}
          required
        />

        <FormInput
          id="owner-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          error={passwordError}
          required
          rightElement={togglePassword}
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