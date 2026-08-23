// Navbar component.
// This appears at the top of every page for navigation.
// It uses state to toggle the mobile menu.
// Receives totalItems, theme, and toggleTheme as props from App.jsx.

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';

function Navbar({ totalItems, theme, toggleTheme }) {
  // State to track if the mobile hamburger menu is open or closed
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to close the mobile menu when a navigation link is clicked
  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* The logo acts as a link to the home page */}
        <NavLink to="/home" onClick={closeMenu}>
          <Logo />
        </NavLink>

        {/* Hamburger button for mobile devices */}
        <button
          className="menu-btn"
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
          onClick={function () { setIsMenuOpen(!isMenuOpen); }}
        >
          Menu
        </button>

        {/* Navigation links container */}
        <nav className={isMenuOpen ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/home" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/products" onClick={closeMenu}>Products</NavLink>
          <NavLink to="/scan" onClick={closeMenu}>Scan</NavLink>

          <NavLink to="/cart" className="cart-link" onClick={closeMenu}>
            Cart
            {/* Show a badge with the number of items if the cart is not empty */}
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </NavLink>

          <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>

          {/* Dark / Light mode toggle button */}
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
