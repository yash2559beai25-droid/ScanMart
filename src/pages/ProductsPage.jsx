// Products Page Component
// Displays a list of all products, allows searching, filtering by category, and sorting.

import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Button from '../components/Button';
import {
  products,
  categories,
  formatPrice,
  getStockText,
  getStockClass,
} from '../data/products';

// --- ProductCard Component ---
// A reusable component to display a single product's summary.
export function ProductCard({ product, onAddToCart }) {
  // We use state to track if the image fails to load
  const [imageFailed, setImageFailed] = useState(false);
  
  // Determine CSS class based on stock level for the badge
  const stockClass = getStockClass(product.stock);

  return (
    <article className="card product-card">
      {/* Conditional rendering: show a fallback initial if image loading fails */}
      {imageFailed ? (
        <div className="product-image-fallback" aria-hidden="true">
          {product.name.charAt(0)}
        </div>
      ) : (
        <img
          className="product-image"
          src={product.image}
          alt={product.name}
          onError={function () { setImageFailed(true); }}
        />
      )}

      <div className="product-body">
        <div className="product-meta">
          <span className="muted">{product.category}</span>
          <span>★ {product.rating}</span>
        </div>
        <h3>{product.name}</h3>
        <p className="price" style={{ fontSize: '1.2rem' }}>
          {formatPrice(product.price)}
        </p>
        
        {/* Dynamic stock badge */}
        <span className={'badge badge-' + stockClass}>
          {getStockText(product.stock)}
        </span>
        
        <div className="product-actions">
          {/* Link to view product details */}
          <Button variant="secondary" size="sm" block to={'/products/' + product.id}>
            View Details
          </Button>
          {/* Disable Add to Cart button if out of stock */}
          <Button
            size="sm"
            block
            disabled={product.stock === 0}
            onClick={function () { onAddToCart(product); }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}

// --- Main Products Page ---
export function ProductsPage({ addToCart }) {
  const location = useLocation();
  // Get starting category from routing state (e.g., if clicked from HomePage), default to 'All'
  const startingCategory = location.state?.category || 'All';

  // State for our search bar, category filter, and sorting dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(startingCategory);
  const [sortBy, setSortBy] = useState('default');

  // useMemo caches the filtered/sorted products so we don't recalculate unless inputs change
  const visibleProducts = useMemo(
    function () {
      const searchText = searchTerm.toLowerCase();

      // Step 1: Filter products by search text AND selected category
      let result = products.filter(function (product) {
        const matchesSearch = product.name.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      // Step 2: Sort the filtered results based on the dropdown selection
      if (sortBy === 'price-low') {
        result = [...result].sort(function (a, b) { return a.price - b.price; });
      }
      if (sortBy === 'price-high') {
        result = [...result].sort(function (a, b) { return b.price - a.price; });
      }
      if (sortBy === 'rating') {
        result = [...result].sort(function (a, b) { return b.rating - a.rating; });
      }

      return result;
    },
    [searchTerm, selectedCategory, sortBy] // Recalculate when these state variables change
  );

  return (
    <section className="container section">
      <h1 className="section-title">Products</h1>
      <p className="section-text">Search, filter, and add items to your cart.</p>

      {/* Toolbar for Searching and Sorting */}
      <div className="toolbar">
        <input
          className="search-bar"
          type="search"
          value={searchTerm}
          onChange={function (event) { setSearchTerm(event.target.value); }}
          placeholder="Search products..."
          aria-label="Search products"
        />
        <select
          className="select-input"
          value={sortBy}
          onChange={function (event) { setSortBy(event.target.value); }}
          aria-label="Sort products"
        >
          <option value="default">Sort: Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Category Filter Chips */}
      <div className="category-filter" role="group" aria-label="Filter by category">
        {categories.map(function (category) {
          return (
            <button
              key={category}
              type="button"
              className={category === selectedCategory ? 'chip active' : 'chip'}
              onClick={function () { setSelectedCategory(category); }}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Empty State: What to show if no products match the search/filter */}
      {visibleProducts.length === 0 && (
        <section className="empty-state card">
          <h2>No products found</h2>
          <p className="muted">Try another search word or category.</p>
        </section>
      )}

      {/* The Grid of Products */}
      {visibleProducts.length > 0 && (
        <div className="product-grid">
          {visibleProducts.map(function (product) {
            return (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            );
          })}
        </div>
      )}
    </section>
  );
}

// --- Product Details Page ---
// Displays detailed information for a single product.
// Route: /products/:id
export function ProductDetailsPage({ addToCart }) {
  // useParams allows us to extract the "id" value from the URL (e.g., /products/3)
  const { id } = useParams();

  // Find the exact product in our data array whose ID matches the URL
  const product = products.find(function (item) {
    return item.id === Number(id); // Convert URL string 'id' to a number
  });

  // If we couldn't find a product with that ID, show an error message
  if (!product) {
    return (
      <section className="container section">
        <section className="empty-state card">
          <h2>Product not found</h2>
          <p className="muted">This product does not exist.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button to="/products">Back to Products</Button>
          </div>
        </section>
      </section>
    );
  }

  const stockClass = getStockClass(product.stock);

  return (
    <section className="container section details">
      <img className="details-image" src={product.image} alt={product.name} />
      <div>
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="muted">Product code: {product.code}</p>
        <p className="price">{formatPrice(product.price)}</p>
        <p>Rating: ★ {product.rating}</p>
        
        <p className={'badge badge-' + stockClass}>
          {getStockText(product.stock)}
        </p>
        
        <p style={{ margin: '1rem 0' }}>{product.description}</p>
        
        <div className="hero-actions">
          <Button
            disabled={product.stock === 0}
            onClick={function () { addToCart(product); }}
          >
            Add to Cart
          </Button>
          <Button variant="secondary" to="/products">Back to Products</Button>
        </div>
      </div>
    </section>
  );
}
