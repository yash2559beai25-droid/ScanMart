// Products Page Component
// Loads products from a public REST API, with local ScanMart data as a fallback.
// Search is debounced. Category, sort, and pagination all work on the same list.

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Button from '../components/Button';
import ProductSkeleton from '../components/ProductSkeleton';
import { useCartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  products as localProducts,
  formatPrice,
  getStockText,
  getStockClass,
} from '../data/products';
import { useDebounce } from '../hooks/useDebounce';
import { useProducts } from '../hooks/useProducts';
import { mapFakeStoreProduct } from '../utils/mapFakeStoreProduct';

const PAGE_SIZE = 8;

// --- ProductCard Component ---
export function ProductCard({ product, onAddToCart }) {
  const { showToast } = useToast();
  const [imageFailed, setImageFailed] = useState(false);
  const stockClass = getStockClass(product.stock);

  function handleAddToCart() {
    onAddToCart(product);
    showToast(product.name + ' added to cart');
  }

  return (
    <article className="card product-card">
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

        <span className={'badge badge-' + stockClass}>
          {getStockText(product.stock)}
        </span>

        <div className="product-actions">
          <Button
            variant="secondary"
            size="sm"
            block
            to={'/products/' + product.id}
            state={{ product: product }}
          >
            View Details
          </Button>
          <Button
            size="sm"
            block
            disabled={product.stock === 0}
            onClick={handleAddToCart}
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
  const { addToCart } = useCartContext();
  const location = useLocation();
  const startingCategory = location.state?.category || 'All';

  const { catalog, status, errorMessage, usedFallback, retry } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(startingCategory);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  // Wait 350ms after the user stops typing before filtering.
  const debouncedSearch = useDebounce(searchTerm, 350);

  const categoryOptions = useMemo(
    function () {
      const uniqueCategories = [];

      catalog.forEach(function (product) {
        if (uniqueCategories.indexOf(product.category) === -1) {
          uniqueCategories.push(product.category);
        }
      });

      uniqueCategories.sort();

      if (
        selectedCategory !== 'All' &&
        uniqueCategories.indexOf(selectedCategory) === -1
      ) {
        uniqueCategories.push(selectedCategory);
      }

      return ['All'].concat(uniqueCategories);
    },
    [catalog, selectedCategory]
  );

  const filteredProducts = useMemo(
    function () {
      const searchText = debouncedSearch.trim().toLowerCase();

      let result = catalog.filter(function (product) {
        const matchesCategory =
          selectedCategory === 'All' || product.category === selectedCategory;

        const matchesSearch =
          searchText === '' ||
          product.name.toLowerCase().includes(searchText) ||
          product.category.toLowerCase().includes(searchText) ||
          product.code.toLowerCase().includes(searchText) ||
          product.description.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
      });

      if (sortBy === 'price-low') {
        result = [...result].sort(function (a, b) {
          return a.price - b.price;
        });
      }
      if (sortBy === 'price-high') {
        result = [...result].sort(function (a, b) {
          return b.price - a.price;
        });
      }
      if (sortBy === 'name-az') {
        result = [...result].sort(function (a, b) {
          return a.name.localeCompare(b.name);
        });
      }
      if (sortBy === 'name-za') {
        result = [...result].sort(function (a, b) {
          return b.name.localeCompare(a.name);
        });
      }
      if (sortBy === 'rating') {
        result = [...result].sort(function (a, b) {
          return b.rating - a.rating;
        });
      }

      return result;
    },
    [catalog, debouncedSearch, selectedCategory, sortBy]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  useEffect(
    function () {
      setCurrentPage(1);
    },
    [debouncedSearch, selectedCategory, sortBy]
  );

  useEffect(
    function () {
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    },
    [currentPage, totalPages]
  );

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = filteredProducts.slice(pageStart, pageStart + PAGE_SIZE);
  const isLoading = status === 'loading';
  const hasActiveFilters =
    searchTerm !== '' || selectedCategory !== 'All' || sortBy !== 'default';

  function clearFilters() {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('default');
    setCurrentPage(1);
  }

  function goToPreviousPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  return (
    <section className="container section">
      <h1 className="section-title">Products</h1>
      <p className="section-text">Search, filter, and add items to your cart.</p>

      {status === 'success' && (
        <p className="muted product-source-note">
          Live products loaded from Fake Store API, plus local ScanMart items.
        </p>
      )}

      {status === 'error' && (
        <div className="error-banner card" role="alert">
          <p className="error-text">{errorMessage}</p>
          {usedFallback && (
            <p className="muted">Local ScanMart products are still available below.</p>
          )}
          <Button onClick={retry}>Retry</Button>
        </div>
      )}

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
          value={selectedCategory}
          onChange={function (event) { setSelectedCategory(event.target.value); }}
          aria-label="Filter by category"
        >
          {categoryOptions.map(function (category) {
            return (
              <option key={category} value={category}>
                {category === 'All' ? 'All categories' : category}
              </option>
            );
          })}
        </select>

        <select
          className="select-input"
          value={sortBy}
          onChange={function (event) { setSortBy(event.target.value); }}
          aria-label="Sort products"
        >
          <option value="default">Sort: Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-az">Name: A to Z</option>
          <option value="name-za">Name: Z to A</option>
          <option value="rating">Rating</option>
        </select>

        <Button
          variant="secondary"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
        >
          Clear filters
        </Button>
      </div>

      <div className="category-filter" role="group" aria-label="Filter by category chips">
        {categoryOptions.map(function (category) {
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

      {isLoading && (
        <div className="product-grid" aria-busy="true" aria-label="Loading products">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(function (item) {
            return <ProductSkeleton key={item} />;
          })}
        </div>
      )}

      {!isLoading && filteredProducts.length === 0 && (
        <section className="empty-state card">
          <h2>No products found</h2>
          <p className="muted">Try another search word or category.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        </section>
      )}

      {!isLoading && visibleProducts.length > 0 && (
        <>
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

          <nav className="pagination" aria-label="Product pages">
            <Button
              variant="secondary"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <p className="pagination-status">
              Page {currentPage} of {totalPages}
            </p>
            <Button
              variant="secondary"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </nav>
        </>
      )}
    </section>
  );
}

// --- Product Details Page ---
// Route: /products/:id
// Local ScanMart products are found in the existing data file.
// API products (ids starting with fs-) are fetched from Fake Store.
export function ProductDetailsPage() {
  const { addToCart } = useCartContext();
  const { showToast } = useToast();
  const { id } = useParams();
  const location = useLocation();

  const localProduct = localProducts.find(function (item) {
    return String(item.id) === String(id);
  });

  const passedProduct = location.state?.product || null;
  const [apiProduct, setApiProduct] = useState(
    passedProduct && String(passedProduct.id) === String(id) ? passedProduct : null
  );
  const [status, setStatus] = useState(localProduct ? 'success' : 'loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(
    function () {
      if (localProduct) {
        setStatus('success');
        return undefined;
      }

      if (!String(id).startsWith('fs-')) {
        setStatus('notfound');
        return undefined;
      }

      let cancelled = false;
      const apiId = String(id).replace('fs-', '');

      async function loadDetails() {
        setStatus('loading');
        setErrorMessage('');

        try {
          const response = await fetch('https://fakestoreapi.com/products/' + apiId);

          if (!response.ok) {
            throw new Error('Product details could not be loaded.');
          }

          const data = await response.json();

          if (cancelled) {
            return;
          }

          setApiProduct(mapFakeStoreProduct(data));
          setStatus('success');
        } catch {
          if (cancelled) {
            return;
          }

          if (passedProduct && String(passedProduct.id) === String(id)) {
            setApiProduct(passedProduct);
            setStatus('success');
            return;
          }

          setErrorMessage('Could not load this product from the API.');
          setStatus('error');
        }
      }

      loadDetails();

      return function () {
        cancelled = true;
      };
    },
    [id, localProduct, passedProduct]
  );

  const product = localProduct || apiProduct;

  function handleAddToCart() {
    addToCart(product);
    showToast(product.name + ' added to cart');
  }

  if (status === 'loading') {
    return (
      <section className="container section">
        <p className="muted">Loading product details...</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="container section">
        <section className="empty-state card">
          <h2>Could not load product</h2>
          <p className="muted">{errorMessage}</p>
          <div style={{ marginTop: '1rem' }}>
            <Button to="/products">Back to Products</Button>
          </div>
        </section>
      </section>
    );
  }

  if (status === 'notfound' || !product) {
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
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button variant="secondary" to="/products">Back to Products</Button>
        </div>
      </div>
    </section>
  );
}
