git statusgit status# ScanMart Project Guide

This project covers Lectures 1 to 42 (Evaluation-I).

## What is ScanMart?

ScanMart is a self-checkout website: Shop → Scan → Cart → Checkout → Receipt.

No backend, no database, no real payment, no real camera.

## Team Files

| Member | File | What they explain |
|---|---|---|
| 1 | `src/pages/HomePage.jsx` | Hero section, steps, categories, featured products |
| 2 | `src/pages/ProductsPage.jsx` | Search, filter, sort, product details page |
| 3 | `src/pages/CartPage.jsx` | Cart, checkout form, receipt |
| 4 | `src/pages/ScanPage.jsx` | Scan by code, profile, admin, 404 |

## Syllabus Covered

### Lectures 1–6: HTML & CSS
- Semantic tags: `<header>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<nav>`
- Box Model, Flexbox, Grid layouts in `src/index.css`
- Media queries for mobile responsiveness

### Lectures 7–12: JavaScript Basics
- Variables: `searchTerm`, `cartItems`, `productCode`
- Functions: `addToCart`, `handleScan`, `placeOrder`
- Arrays and objects: product list in `src/data/products.js`
- Loops: `for` loop to calculate cart total in `useCart.js`

### Lectures 13–18: ES6+ and Web APIs
- `let` and `const` everywhere
- Arrow functions and regular function expressions
- Spread operator: `{ ...item, quantity: item.quantity + 1 }`
- Import/export modules
- Events and forms: search, scan, checkout
- LocalStorage: cart saved as `scanmart_cart`
- `JSON.stringify()` and `JSON.parse()` for LocalStorage
- Fetch API: `fetch('https://dummyjson.com/quotes/random')` in HomePage
- Promises: `fetch()` returns a Promise, `.json()` returns a Promise
- `async/await`: async function inside useEffect to await fetch response
- `try/catch`: wraps the fetch call to handle network errors gracefully

### Lectures 19–24: React + Vite
- Project created with Vite
- JSX syntax in all components
- Controlled inputs: `value` + `onChange` in search, checkout forms

### Lectures 25–30: Components and Props
- Reusable components: `Navbar`, `Footer`, `Button`, `Logo`, `ProductCard`
- Props: `<ProductCard product={product} onAddToCart={addToCart} />`
- State with `useState`
- Lists rendered with `map()`
- Conditional rendering: empty cart, product not found, no search results

### Lectures 31–36: Hooks
- `useState`: search, filter, sort, scanner, checkout form, mobile menu
- `useEffect`: auto-focus the scan input on page load
- `useRef`: reference to the scan input element
- `useMemo`: filtered and sorted product list (only recalculates when inputs change)
- `useCallback`: cart functions in `useCart.js` (prevents unnecessary re-creation)
- Custom hooks: `useCart` and `useLocalStorage`
- `useCart` uses `useLocalStorage` internally to persist cart data in the browser
- Lifting state up: cart state lives in `App.jsx`, passed to pages via props

We do NOT use Context API, Redux, or any state management library.

### Lectures 37–42: React Router
- Routes defined in `App.jsx` using `<Routes>` and `<Route>`
- Dynamic route: `/products/:id` with `useParams()`
- Navigation: `useNavigate()` for redirect after checkout
- Nested links with `<NavLink>` (active link styling)
- 404 page: `path="*"` catches unknown routes

## How Cart Works (Lifting State Up)

1. `useCart()` hook runs in `App.jsx`
2. App passes cart data and functions as props to pages
3. Pages use those props to display and modify the cart

```jsx
<HomePage addToCart={cart.addToCart} />
<Navbar totalItems={cart.totalItems} />
```

## Viva Quick Answers

**What is a component?** A reusable piece of UI, like Navbar or ProductCard.

**Why use props?** To send data from a parent component to a child component.

**Where is useState?** Search bar, filter, sort, scanner input, checkout form, mobile menu.

**Where is useEffect?** Scan page — to auto-focus the input when the page loads.

**Where is useRef?** Scan page — to get a reference to the input element.

**Where is useMemo?** Products page — to avoid recalculating the filtered list on every render.

**Where is useCallback?** useCart hook — to avoid recreating cart functions on every render.

**Why React Router?** To navigate between Home, Products, Scan, Cart without page reload.

**How does search work?** `filter()` checks if the product name includes the search text.

**How does the cart work?** `addToCart`, `removeFromCart`, `increaseQuantity`, `decreaseQuantity` functions in `useCart`. Cart is saved in LocalStorage.

**How does scan work?** User types a code like SM001. `find()` searches the product list for that code.

**What is the spread operator?** `{ ...item, quantity: 5 }` copies the item and changes only the quantity.

**Where is fetch API used?** HomePage — to fetch a random quote from `dummyjson.com/quotes/random`.

**What is async/await?** A way to write asynchronous code that reads like synchronous code. We use `await fetch()` inside an `async function`.

**What is try/catch?** It catches errors. If `fetch()` fails (e.g., no internet), the `catch` block runs and shows an error message instead of crashing.

**How does localStorage work?** `useLocalStorage` hook saves data as a JSON string using `localStorage.setItem()`. When the page reloads, it reads it back using `localStorage.getItem()` and `JSON.parse()`.
