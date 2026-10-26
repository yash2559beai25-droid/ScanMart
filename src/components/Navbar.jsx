// Navbar.jsx — Top navigation bar
//
// CONCEPTS:
// 1. Reading from Contexts:
//    — useAuth() provides user info and logout function
//    — useCart() provides total items count for the cart badge
// 2. React Router:
//    — NavLink applies an active style when the link matches the current URL

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

function Navbar({ theme, toggleTheme }) {
  // Local state for mobile hamburger menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Global Context state — no prop drilling needed!
  const { user, isLoggedIn, isOwner, logout } = useAuth();
  const { totalItems } = useCart();

  const navigate = useNavigate();

  function closeMenu() {
    setIsMenuOpen(false);
  }

  // Handle logout
  function handleLogout() {
    logout();
    navigate('/login');
    closeMenu();
  }

  // Get the first letter of user's name for the profile avatar circle
  let avatarLetter = 'U';
  if (user && user.name) {
    avatarLetter = user.name[0].toUpperCase();
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Logo clicks go to dashboard for owner, home for customer, or login */}
        <NavLink to={isLoggedIn ? (isOwner ? '/admin' : '/home') : '/login'} onClick={closeMenu}>
          <Logo />
        </NavLink>

        {/* Mobile menu button */}
        <button
          className="menu-btn"
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
          onClick={function () { setIsMenuOpen(!isMenuOpen); }}
        >
          Menu
        </button>

        {/* Navigation links */}
        <nav className={isMenuOpen ? 'nav-links open' : 'nav-links'}>

          {/* If user is logged in, show navigation */}
          {isLoggedIn && (
            <>
              {/* Customer navigation links */}
              {!isOwner && (
                <>
                  <NavLink to="/home" end onClick={closeMenu}>Home</NavLink>
                  <NavLink to="/products" onClick={closeMenu}>Products</NavLink>
                  <NavLink to="/scan" onClick={closeMenu}>Scan</NavLink>

                  {/* Cart link with badge count */}
                  <NavLink to="/cart" className="cart-link" onClick={closeMenu}>
                    Cart
                    {totalItems > 0 && (
                      <span className="cart-count">{totalItems}</span>
                    )}
                  </NavLink>
                </>
              )}

              {/* Store Owner navigation link */}
              {isOwner && (
                <>
                  <NavLink to="/admin" onClick={closeMenu}>Dashboard</NavLink>
                  <NavLink to="/products" onClick={closeMenu}>Customer View</NavLink>
                  <NavLink to="/scan" onClick={closeMenu}>Scan</NavLink>
                </>
              )}

              {/* Profile icon with first initial */}
              <NavLink to="/profile" onClick={closeMenu}>
                <span className="nav-avatar" title={user ? user.name : 'Profile'}>
                  {avatarLetter}
                </span>
              </NavLink>

              {/* Logout button */}
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

          {/* If user is not logged in, show Login link */}
          {!isLoggedIn && (
            <NavLink to="/login" onClick={closeMenu} className="btn btn-primary btn-sm">
              Login
            </NavLink>
          )}

          {/* Theme switcher */}
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
