// Home Page Component
// Introduces the platform, shows how it works, categories, and a few featured products.
// Also fetches a random quote from an API to demonstrate: fetch API, async/await, Promises, try/catch.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { products } from '../data/products';
import { ProductCard } from './ProductsPage';

// Data for the "How it works" section
const steps = [
  { number: '1', title: 'Scan', text: 'Scan or enter the product code.' },
  { number: '2', title: 'Add to Cart', text: 'Check the item and add it.' },
  { number: '3', title: 'Pay', text: 'Review the cart and place the order.' },
  { number: '4', title: 'Show Receipt', text: 'Get a digital receipt instantly.' },
];

// Categories displayed on the home page for quick filtering
const homeCategories = ['Electronics', 'Grocery', 'Fashion', 'Home', 'Personal Care'];

function HomePage({ addToCart }) {
  // Grab the first 4 products to feature on the homepage
  const featuredProducts = products.slice(0, 4);

  // --- Fetch API + async/await + try/catch demo (Lectures 13–18) ---
  // State to store the fetched quote
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState('');

  // useEffect runs after the component mounts.
  // We define an async function inside it to use await with fetch.
  useEffect(function () {
    // Async function to fetch a random quote from a public API
    async function fetchQuote() {
      try {
        // fetch() returns a Promise. We use 'await' to wait for the response.
        const response = await fetch('https://dummyjson.com/quotes/random');

        // Check if the HTTP response was successful
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }

        // .json() also returns a Promise, so we await it too
        const data = await response.json();

        // Update state with the fetched quote
        setQuote(data);
        setQuoteLoading(false);
      } catch (error) {
        // try/catch handles any errors from the fetch or JSON parsing
        setQuoteError(error.message);
        setQuoteLoading(false);
      }
    }

    // Call our async function
    fetchQuote();
  }, []); // Empty array = run only once when the page loads

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

        {/* Decorative graphic showing the scanning flow */}
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
          {/* Loop over our steps array to render each step card */}
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
          {/* Map each category to a link that navigates to the products page with that category selected */}
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

      {/* --- Featured Products Section --- */}
      <section className="container section">
        <h2 className="section-title">Featured Products</h2>
        <p className="section-text">A few popular items from the store.</p>
        <div className="product-grid">
          {featuredProducts.map(function (product) {
            return (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            );
          })}
        </div>
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

      {/* --- Daily Inspiration Section (Fetch API Demo) --- */}
      {/* This section fetches a random quote from an external API using fetch + async/await */}
      <section className="container section">
        <h2 className="section-title">Daily Inspiration</h2>
        <p className="section-text">A fresh quote every time you visit, fetched from an API.</p>

        <article className="card benefit-card">
          {/* Show loading state while the fetch Promise is pending */}
          {quoteLoading && <p className="muted">Loading quote...</p>}

          {/* Show error message if the fetch failed (caught by try/catch) */}
          {quoteError && <p className="error-text">Could not load quote: {quoteError}</p>}

          {/* Show the quote once fetch resolves successfully */}
          {quote && (
            <>
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>"{quote.quote}"</p>
              <p className="muted" style={{ marginTop: '0.5rem' }}>— {quote.author}</p>
            </>
          )}
        </article>
      </section>
    </>
  );
}

export default HomePage;
