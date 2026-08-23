// App.jsx — The root component of ScanMart.
// All routes are defined here using React Router.
// The cart state is "lifted up" here using the useCart custom hook.
// The theme state (dark/light) is also lifted up here.
// Cart data and functions are passed down to pages as props.

import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { useCart } from './hooks/useCart';
import HomePage from './pages/HomePage';
import { ProductDetailsPage, ProductsPage } from './pages/ProductsPage';
import CartPage, { CheckoutPage, ReceiptPage } from './pages/CartPage';
import ScanPage, { AdminPage, NotFoundPage, ProfilePage } from './pages/ScanPage';
import Login from './Login';

function App() {
  // useCart() returns cart data and functions
  // We pass these as props to pages (this is lifting state up)
  const cart = useCart();

  // --- Dark / Light mode ---
  const [theme, setTheme] = useState('light');

  // Toggle between dark and light
  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  return (
    <BrowserRouter>
      {/* Add 'dark' class when theme is dark */}
      <div className={theme === 'dark' ? 'app-shell dark' : 'app-shell'}>
        {/* Navbar receives totalItems, theme, and toggleTheme */}
        <Navbar totalItems={cart.totalItems} theme={theme} toggleTheme={toggleTheme} />

        <main className="main-content">
          <Routes>
            {/* Login page — shown first when the site opens */}
            <Route path="/" element={<Login />} />

            {/* Home page */}
            <Route path="/home" element={<HomePage addToCart={cart.addToCart} />} />

            {/* Products list page */}
            <Route path="/products" element={<ProductsPage addToCart={cart.addToCart} />} />

            {/* Single product details — dynamic route with :id */}
            <Route path="/products/:id" element={<ProductDetailsPage addToCart={cart.addToCart} />} />

            {/* Scan page */}
            <Route path="/scan" element={<ScanPage addToCart={cart.addToCart} />} />

            {/* Cart page — receives all cart data as props */}
            <Route
              path="/cart"
              element={
                <CartPage
                  cartItems={cart.cartItems}
                  totalItems={cart.totalItems}
                  totalPrice={cart.totalPrice}
                  increaseQuantity={cart.increaseQuantity}
                  decreaseQuantity={cart.decreaseQuantity}
                  removeFromCart={cart.removeFromCart}
                />
              }
            />

            {/* Checkout page */}
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  cartItems={cart.cartItems}
                  totalItems={cart.totalItems}
                  totalPrice={cart.totalPrice}
                  clearCart={cart.clearCart}
                />
              }
            />

            {/* Receipt page */}
            <Route path="/receipt" element={<ReceiptPage />} />

            {/* Profile page */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin dashboard */}
            <Route path="/admin" element={<AdminPage />} />

            {/* 404 page — catches any unknown route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

