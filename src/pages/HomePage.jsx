import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { ProductCard } from './ProductsPage';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

const API_URL = 'https://fakestoreapi.com/products';

const steps = [
{
number: '1',
title: 'Scan',
text: 'Scan or enter the product code.',
},
{
number: '2',
title: 'Add to Cart',
text: 'Check the item and add it.',
},
{
number: '3',
title: 'Pay',
text: 'Review the cart and place the order.',
},
{
number: '4',
title: 'Show Receipt',
text: 'Get a digital receipt instantly.',
},
];

const homeCategories = [
'Electronics',
'Grocery',
'Fashion',
'Home',
'Personal Care',
];

function HomePage() {
const { addToCart } = useCart();
const { products } = useProducts();

const [featuredProducts, setFeaturedProducts] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [loadError, setLoadError] = useState(null);
const [usingFallback, setUsingFallback] = useState(false);
const [retryCount, setRetryCount] = useState(0);

const fetchProducts = useCallback(async (signal) => {
setIsLoading(true);
setLoadError(null);
setUsingFallback(false);


try {
  const response = await fetch(API_URL, { signal });

  if (!response.ok) {
    throw new Error('Unable to fetch products from the API.');
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Invalid product data received from the API.');
  }

  const apiProducts = data.slice(0, 4).map((item) => ({
    id: `fs-${item.id}`,
    code: `API${item.id}`,
    name: item.title,
    category: item.category,
    price: Number(item.price) || 0,
    rating: Number(item.rating?.rate) || 4.5,
    stock: 10,
    image: item.image,
    description: item.description || 'No description available.',
  }));

  setFeaturedProducts(apiProducts);
} catch (error) {
  if (error.name === 'AbortError') {
    return;
  }

  if (products.length > 0) {
    setFeaturedProducts(products.slice(0, 4));
    setUsingFallback(true);
    setLoadError(null);
  } else {
    setFeaturedProducts([]);
    setLoadError(
      error.message || 'Unable to load products. Please try again.'
    );
  }
} finally {
  if (!signal.aborted) {
    setIsLoading(false);
  }
}


}, [products]);

useEffect(() => {
const controller = new AbortController();


fetchProducts(controller.signal);

return () => {
  controller.abort();
};


}, [fetchProducts, retryCount]);

function handleRetry() {
setRetryCount((count) => count + 1);
}

  return (
    <>
      {/* Hero Section */}
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

        <Button variant="secondary" to="/products">
          Browse Products
        </Button>
      </div>
    </div>

    {/* Scanning Graphic */}
    <aside className="card hero-card">
      <div>
        <p className="eyebrow" style={{ color: '#99f6e4' }}>
          Live shopping flow
        </p>

        <h2>Scan Product → Cart → Receipt</h2>
      </div>

      <div className="scan-frame">
        <div className="scan-line" />
        <p>Ready to scan SM001</p>
      </div>
    </aside>
  </section>

  {/* How ScanMart Works */}
  <section className="container section">
    <h2 className="section-title">How ScanMart Works</h2>

    <p className="section-text">
      Four simple steps from shelf to receipt.
    </p>

    <div className="steps">
      {steps.map((step) => (
        <article className="card step-card" key={step.number}>
          <div className="step-number">{step.number}</div>
          <h3>{step.title}</h3>
          <p className="muted">{step.text}</p>
        </article>
      ))}
    </div>
  </section>

  {/* Shop by Category */}
  <section className="container section">
    <h2 className="section-title">Shop by Category</h2>

    <p className="section-text">Find everyday items faster.</p>

    <div className="categories">
      {homeCategories.map((category) => (
        <Link
          key={category}
          className="card category-card"
          to="/products"
          state={{ category }}
        >
          {category}
        </Link>
      ))}
    </div>
  </section>

  {/* Featured Products */}
  <section className="container section">
    <h2 className="section-title">Featured Products</h2>

    <p className="section-text">
      Discover popular products from our online catalog.
    </p>

    {usingFallback && !isLoading && (
      <p className="muted">
        The API is unavailable. Showing local ScanMart products instead.
      </p>
    )}

    {isLoading && (
      <div
        className="async-state card"
        style={{ textAlign: 'center', padding: '2rem' }}
      >
        <p>Loading products...</p>
      </div>
    )}

    {loadError && !isLoading && (
      <div
        className="async-state card"
        style={{ textAlign: 'center', padding: '2rem' }}
        role="alert"
      >
        <p className="error-text">{loadError}</p>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: '0.8rem' }}
          onClick={handleRetry}
        >
          Try Again
        </button>
      </div>
    )}

    {!isLoading &&
      !loadError &&
      featuredProducts.length === 0 && (
        <div
          className="async-state card"
          style={{ textAlign: 'center', padding: '2rem' }}
        >
          <p className="muted">No products available right now.</p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      )}

    {!isLoading &&
      !loadError &&
      featuredProducts.length > 0 && (
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}

    <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
      <Button to="/products">View All Products</Button>
    </div>
  </section>

  {/* Why Choose ScanMart */}
  <section className="container section">
    <h2 className="section-title">Why ScanMart?</h2>

    <div className="benefits">
      <article className="card benefit-card">
        <h3>No long queues</h3>
        <p className="muted">
          Scan while you shop and checkout on your phone.
        </p>
      </article>

      <article className="card benefit-card">
        <h3>Clear prices</h3>
        <p className="muted">
          See product details and totals before you pay.
        </p>
      </article>

      <article className="card benefit-card">
        <h3>Digital receipt</h3>
        <p className="muted">
          Keep a simple receipt you can show at the exit.
        </p>
      </article>
    </div>
  </section>
</>

);
}

export default HomePage;
