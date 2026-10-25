// Home Page Component
// Introduces the platform, shows how it works, categories, and featured products.
//
// CONCEPTS:
// 1. Context API (useCart): reads addToCart function without prop-drilling
// 2. Asynchronous State Management:
//    - isLoading: true while fetching products
//    - loadError: stores error message if request fails
//    - featuredProducts: stores the loaded items
//    - retry button: triggers fetch again if there was an error

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { products as allProducts } from '../data/products';
import { ProductCard } from './ProductsPage';
import { useCart } from '../context/CartContext';

// Steps for "How ScanMart Works"
const steps = [
  { number: '1', title: 'Scan', text: 'Scan or enter the product code.' },
  { number: '2', title: 'Add to Cart', text: 'Check the item and add it.' },
  { number: '3', title: 'Pay', text: 'Review the cart and place the order.' },
  { number: '4', title: 'Show Receipt', text: 'Get a digital receipt instantly.' }
];

const homeCategories = ['Electronics', 'Grocery', 'Fashion', 'Home', 'Personal Care'];

// Simulated async product loader
// In a real application, this would be: fetch('/api/products')
function loadFeaturedProducts() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      // Return first 4 products after 800ms delay
      resolve(allProducts.slice(0, 4));
    }, 800);
  });
}

function HomePage() {
  // Global cart function from CartContext
  const { addToCart } = useCart();

  // Async states
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Fetch products when page loads
  useEffect(function () {
    fetchProducts();
  }, []);

  // Async function using try/catch/finally
  async function fetchProducts() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await loadFeaturedProducts();
      setFeaturedProducts(data);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* --- Hero Section --- */}
      <section className="container hero">
        <div>
          <p className="eyebrow">Smart self-checkout</p>
          <h1>Shop, scan, and skip the billing queue.</h1>
          <p>
            ScanMart is a smart self-checkout website for retail stores.
            Browse products, scan a code, add items to your cart,
            and get a digital receipt.
          </p>
          <div className="hero-actions">
            <Button to="/scan">Start Scanning</Button>
            <Button variant="secondary" to="/products">Browse Products</Button>
          </div>
        </div>

        {/* Scanning graphic */}
        <aside className="card hero-card">
          <div>
            <p className="eyebrow" style={{ color: '#99f6e4' }}>Live shopping flow</p>
            <h2>Scan Product → Cart → Receipt</h2>
          </div>
          <div className="scan-frame">
            <div className="scan-line" />
            <p>Ready to scan SM001</p>
          </div>
        </aside>
      </section>

      {/* --- How ScanMart Works Section --- */}
      <section className="container section">
        <h2 className="section-title">How ScanMart Works</h2>
        <p className="section-text">Four simple steps from shelf to receipt.</p>
        <div className="steps">
          {steps.map(function (step) {
            return (
              <article className="card step-card" key={step.number}>
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p className="muted">{step.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* --- Shop by Category Section --- */}
      <section className="container section">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-text">Find everyday items faster.</p>
        <div className="categories">
          {homeCategories.map(function (category) {
            return (
              <Link
                key={category}
                className="card category-card"
                to="/products"
                state={{ category: category }}
              >
                {category}
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- Featured Products Section with Async States --- */}
      <section className="container section">
        <h2 className="section-title">Featured Products</h2>
        <p className="section-text">A few popular items from the store.</p>

        {/* 1. Loading State */}
        {isLoading && (
          <div className="async-state card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>⏳ Loading products...</p>
          </div>
        )}

        {/* 2. Error State */}
        {loadError && !isLoading && (
          <div className="async-state card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="error-text">⚠️ {loadError}</p>
            <button
              className="btn btn-secondary"
              style={{ marginTop: '0.8rem' }}
              onClick={fetchProducts}
            >
              Try Again
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!isLoading && !loadError && featuredProducts.length === 0 && (
          <div className="async-state card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="muted">No products available right now.</p>
          </div>
        )}

        {/* 4. Success State */}
        {!isLoading && !loadError && featuredProducts.length > 0 && (
          <div className="product-grid">
            {featuredProducts.map(function (product) {
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* --- Why Choose ScanMart Section --- */}
      <section className="container section">
        <h2 className="section-title">Why ScanMart?</h2>
        <div className="benefits">
          <article className="card benefit-card">
            <h3>No long queues</h3>
            <p className="muted">Scan while you shop and checkout on your phone.</p>
          </article>
          <article className="card benefit-card">
            <h3>Clear prices</h3>
            <p className="muted">See product details and totals before you pay.</p>
          </article>
          <article className="card benefit-card">
            <h3>Digital receipt</h3>
            <p className="muted">Keep a simple receipt you can show at the exit.</p>
          </article>
        </div>
      </section>
    </>
  );
}

export default HomePage;
