// Products Page Component
// Displays all products, allows search, filter by category, and sort.
//
// CONCEPTS:
// 1. Local State: searchTerm, selectedCategory, and sortBy are local to this page.
// 2. Global State: addToCart comes from CartContext (no prop drilling).
// 3. Derived List: useMemo recalculates the filtered/sorted products only when search/category/sort changes.

import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';
import {
  products,
  categories,
  formatPrice,
  getStockText,
  getStockClass,
} from '../data/products';

// --- ProductCard Component ---
export function ProductCard({ product, onAddToCart }) {
  const [imageFailed, setImageFailed] = useState(false);
  const stockClass = getStockClass(product.stock);

  return (
    <article className="card product-card">
      {/* If image fails to load, show product initial */}
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

        {/* Stock status badge */}
        <span className={'badge badge-' + stockClass}>
          {getStockText(product.stock)}
        </span>

        <div className="product-actions">
          <Button variant="secondary" size="sm" block to={'/products/' + product.id}>
            View Details
          </Button>
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
export function ProductsPage() {
  const { addToCart } = useCart();

  const location = useLocation();
  const startingCategory = (location.state && location.state.category) ? location.state.category : 'All';

  // Local state for searching, filtering, and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(startingCategory);
  const [sortBy, setSortBy] = useState('default');

  // Filter and sort products
  const visibleProducts = useMemo(
    function () {
      const searchText = searchTerm.toLowerCase();

      let result = products.filter(function (product) {
        const matchesSearch = product.name.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      if (sortBy === 'price-low') {
        result = [...result].sort(function (a, b) { return a.price - b.price; });
      } else if (sortBy === 'price-high') {
        result = [...result].sort(function (a, b) { return b.price - a.price; });
      } else if (sortBy === 'rating') {
        result = [...result].sort(function (a, b) { return b.rating - a.rating; });
      }

      return result;
    },
    [searchTerm, selectedCategory, sortBy]
  );

  return (
    <section className="container section">
      <h1 className="section-title">Products</h1>
      <p className="section-text">Search, filter, and add items to your cart.</p>

      {/* Search and Sort Toolbar */}
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

      {/* Empty State */}
      {visibleProducts.length === 0 && (
        <section className="empty-state card">
          <h2>No products found</h2>
          <p className="muted">Try another search word or category.</p>
        </section>
      )}

      {/* Products Grid */}
      {visibleProducts.length > 0 && (
        <div className="product-grid">
          {visibleProducts.map(function (product) {
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
  );
}

// --- Product Details Page ---
export function ProductDetailsPage() {
  const { addToCart } = useCart();
  const { id } = useParams();

  const product = products.find(function (item) {
    return item.id === Number(id);
  });

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
