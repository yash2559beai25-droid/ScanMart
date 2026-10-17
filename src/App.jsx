// App.jsx — The root component of ScanMart.
//
// CONCEPT: Context Providers and Routing
//   — AuthProvider wraps the whole app so any component can access auth state.
//   — CartProvider wraps the whole app so any component can access cart state.
//   — BrowserRouter provides the routing system.
//   — Routes maps URLs to components.
//   — Cart data no longer needs to be passed as props (no more prop-drilling!).

import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import { ProductDetailsPage, ProductsPage } from './pages/ProductsPage';
import CartPage, { CheckoutPage, ReceiptPage } from './pages/CartPage';
import ScanPage, { AdminPage, NotFoundPage, ProfilePage } from './pages/ScanPage';
import Login from './Login';

function App() {
  // Dark / Light mode state stays local to App
  const [theme, setTheme] = useState('light');

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  return (
    // AuthProvider — provides user login/logout state to all components
    <AuthProvider>
      {/* CartProvider — provides cart items and functions to all components */}
      <CartProvider>
        <BrowserRouter>
          <div className={theme === 'dark' ? 'app-shell dark' : 'app-shell'}>

            {/* Navbar no longer needs totalItems as a prop — it reads from CartContext directly */}
            <Navbar theme={theme} toggleTheme={toggleTheme} />

            <main className="main-content">
              <Routes>
                {/* Root path redirects to Login so users always authenticate first */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Login page — role selection, customer login, and store owner login */}
                <Route path="/login" element={<Login />} />

                {/* Home page */}
                <Route path="/home" element={<HomePage />} />

                {/* Products list page */}
                <Route path="/products" element={<ProductsPage />} />

                {/* Single product details page — uses a dynamic :id in the URL */}
                <Route path="/products/:id" element={<ProductDetailsPage />} />

                {/* Barcode scan page */}
                <Route path="/scan" element={<ScanPage />} />

                {/* Shopping cart page */}
                <Route path="/cart" element={<CartPage />} />

                {/* Checkout page */}
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Digital receipt page */}
                <Route path="/receipt" element={<ReceiptPage />} />

                {/* Customer profile / order history page */}
                <Route path="/profile" element={<ProfilePage />} />

                {/* Admin dashboard — for store owners */}
                <Route path="/admin" element={<AdminPage />} />

                {/* 404 — catches any URL that doesn't match the routes above */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
