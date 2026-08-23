// Home Page Component
// Introduces the platform, shows how it works, categories, and a few featured products.
// Also fetches a random quote from an API to demonstrate: fetch API, async/await, Promises, try/catch.

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



    </>
  );
}

export default HomePage;
