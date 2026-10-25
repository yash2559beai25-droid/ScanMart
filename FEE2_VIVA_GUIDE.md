# FEE-II Viva-II Guide — ScanMart

> **How to use this guide:** Read each topic once, look at the mentioned file, and practice explaining it in your own words. The viva questions at the end of each topic are the most important part.

---

## Topic 1: SPA and React Router

### What is an SPA (Single-Page Application)?

A regular website reloads the entire page every time you click a link. The browser fetches a completely new HTML file from the server each time.

An SPA loads **one HTML file once** and then React updates only the parts of the page that need to change. This makes navigation feel instant — like a mobile app.

ScanMart is an SPA. When you go from `/home` to `/products`, the browser **does not reload**. React just swaps the page content.

### What is React Router?

React Router is a library that connects URLs to components.

- **Without React Router:** There is only one page, and you cannot share or bookmark URLs.
- **With React Router:** `/products` always shows the Products page. `/cart` always shows the Cart. Users can bookmark, share, and navigate using browser back/forward.

### How does navigation work without a page reload?

React Router listens to URL changes using the **History API** built into the browser. When you click a `<NavLink>` or `<Link>`, React Router:
1. Updates the URL in the address bar
2. Matches the new URL against the route list
3. Renders the matching component
4. Does **not** send a network request to the server

### File: [`src/App.jsx`](file:///e:/ScanMart%202/src/App.jsx)

```jsx
// React Router routes are declared here
<Routes>
  <Route path="/"        element={<Navigate to="/login" replace />} />
  <Route path="/login"   element={<Login />} />
  <Route path="/home"    element={<HomePage />} />
  <Route path="/products" element={<ProductsPage />} />
  <Route path="/products/:id" element={<ProductDetailsPage />} />
  <Route path="/scan"    element={<ScanPage />} />
  <Route path="/cart"    element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/receipt" element={<ReceiptPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/admin"   element={<AdminPage />} />
  <Route path="*"        element={<NotFoundPage />} />
</Routes>
```

- `path="*"` is the **404 route** — it matches any URL not in the list.
- `path="/products/:id"` is a **dynamic route** — `:id` is a variable (e.g., `/products/3`).
- `<Navigate to="/login" replace />` **redirects** the root path to the login page.

### File: [`src/components/Navbar.jsx`](file:///e:/ScanMart%202/src/components/Navbar.jsx)

```jsx
// NavLink automatically adds an 'active' CSS class to the current link
<NavLink to="/products" onClick={closeMenu}>Products</NavLink>
```

### Viva Questions

**Q: What is an SPA?**
A: A Single-Page Application loads one HTML page and dynamically updates content using JavaScript. React Router maps URLs to components without reloading the page.

**Q: What does `<BrowserRouter>` do?**
A: It provides the routing context to the entire application. All `<Route>` and `<NavLink>` components must be inside it.

**Q: What is a dynamic route?**
A: A route with a variable in the URL. For example, `/products/:id` — the `:id` part changes for each product. We read it using `useParams()`.

**Q: What happens when you type an unknown URL?**
A: The `path="*"` route matches and renders `NotFoundPage` — our 404 page.

---

## Topic 2: Global and Local State

### What is State?

State is data that changes over time and causes the screen to update when it changes. For example, the items in your cart, whether you are logged in, or what you typed in a search box.

### What is Local State?

State that only **one component** needs. We use `useState` for this.

**Examples in ScanMart:**
- `searchTerm` in [`ProductsPage`](file:///e:/ScanMart%202/src/pages/ProductsPage.jsx) — only the Products page needs it
- `showPassword` in [`Login.jsx`](file:///e:/ScanMart%202/src/Login.jsx) — only the login form needs it
- `isMenuOpen` in [`Navbar.jsx`](file:///e:/ScanMart%202/src/components/Navbar.jsx) — only the Navbar needs it

```jsx
// Local state example — only this component uses this variable
const [showPassword, setShowPassword] = useState(false);
```

### What is Global State?

State that **multiple components** need at the same time.

**Examples in ScanMart:**
- Cart items — needed by Navbar (count badge), ScanPage (add to cart), CartPage (display), CheckoutPage (totals)
- Logged-in user — needed by Navbar (show name), ProfilePage (show info), AdminPage (access control)

### What is Context API?

Context API is React's built-in tool for sharing state across components without "prop drilling" (passing props through multiple levels).

**How it works:**
1. `createContext()` creates a container
2. A `<Provider>` wraps the app and puts data in the container
3. Any component calls `useContext()` to read from the container

### File: [`src/context/CartContext.jsx`](file:///e:/ScanMart%202/src/context/CartContext.jsx)

```jsx
// Step 1: Create the context
const CartContext = createContext(null);

// Step 2: Provider wraps the app
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useLocalStorage('scanmart_cart', []);
  // ... cart functions ...
  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, ... }}>
      {children}
    </CartContext.Provider>
  );
}

// Step 3: Custom hook for easy access
export function useCart() {
  return useContext(CartContext);
}
```

### File: [`src/context/AuthContext.jsx`](file:///e:/ScanMart%202/src/context/AuthContext.jsx)

```jsx
// Any component can now call:
const { user, login, logout, isLoggedIn, isOwner } = useAuth();
```

### Viva Questions

**Q: What is the difference between local state and global state?**
A: Local state (useState) is for data only one component uses, like a search input or password visibility toggle. Global state (Context) is for data shared across multiple components, like the shopping cart or logged-in user.

**Q: Why is Context API useful for the shopping cart?**
A: The cart is needed by many components — Navbar shows the count, ScanPage adds items, CartPage displays items, CheckoutPage calculates totals. Without Context, we would have to pass cart data as props through every level (prop drilling). Context makes it directly accessible to any component.

**Q: What is prop drilling and why should we avoid it?**
A: Prop drilling is passing data down through many component levels as props, even if intermediate components don't need the data. It makes code harder to maintain. Context solves this.

---

## Topic 3: Asynchronous State Management

### What is Asynchronous Code?

Synchronous code runs line by line and waits for each line to finish. Asynchronous code starts a task (like fetching data from a server) and continues running other code while waiting for the result.

```js
// Synchronous — blocks execution
const data = readFile(); // Everything waits here

// Asynchronous — non-blocking
const data = await fetchProducts(); // JavaScript continues doing other things while waiting
```

### Why do we need loading states?

When fetching data, there is a delay. Without a loading state, the screen would be blank or show stale data. A loading indicator tells the user "we're working on it."

### The three important async states:

| State | When shown | Example |
|-------|-----------|---------|
| **Loading** | While the request is in progress | "⏳ Loading products..." |
| **Error** | When the request fails | "⚠️ Unable to load. Try again." |
| **Success** | When data arrives | Product grid is displayed |
| **Empty** | When request succeeds but returns no data | "No products found." |

### File: [`src/pages/HomePage.jsx`](file:///e:/ScanMart%202/src/pages/HomePage.jsx)

```jsx
// Async state variables
const [featuredProducts, setFeaturedProducts] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [loadError, setLoadError] = useState(null);

// useEffect runs fetchProducts when the page first loads
useEffect(function () {
  fetchProducts();
}, []);

// async function with try/catch/finally pattern
async function fetchProducts() {
  setIsLoading(true);
  setLoadError(null);

  try {
    const data = await loadFeaturedProducts(); // simulated network call
    setFeaturedProducts(data);
  } catch (error) {
    setLoadError(error.message);   // Show error to user
  } finally {
    setIsLoading(false);            // Always stop loading spinner
  }
}
```

```jsx
{/* Four states shown in JSX */}
{isLoading && <p>⏳ Loading products...</p>}
{loadError && <p className="error-text">{loadError}</p>}
{!isLoading && !loadError && featuredProducts.length === 0 && <p>No products.</p>}
{!isLoading && !loadError && featuredProducts.length > 0 && <ProductGrid ... />}
```

### File: [`src/pages/ScanPage.jsx`](file:///e:/ScanMart%202/src/pages/ScanPage.jsx) — AdminPage

```jsx
// Dashboard stats show a loading state for 600ms on first render
const [statsLoading, setStatsLoading] = useState(true);
useEffect(function () {
  const timer = setTimeout(() => setStatsLoading(false), 600);
  return () => clearTimeout(timer); // cleanup
}, []);
```

### Viva Questions

**Q: What is async/await?**
A: `async` marks a function as asynchronous. Inside it, `await` pauses until a Promise resolves. It makes asynchronous code look like synchronous code and is easier to read than `.then()` chains.

**Q: What is try/catch/finally?**
A: `try` contains code that might fail. `catch` handles the error if it fails. `finally` always runs at the end — perfect for stopping a loading spinner.

**Q: Why is `useEffect` used for data fetching?**
A: `useEffect` runs code after the component renders. An empty dependency array `[]` means it runs once when the component first appears on screen — ideal for loading initial data.

---

## Topic 4: Form Validation

### What is Form Validation?

Form validation checks that user input is correct before submitting it. It prevents bad data from being processed and gives users clear feedback about what to fix.

### Why is Validation Necessary?

- Users make typos
- Users might leave required fields empty
- Invalid data can cause crashes or incorrect results
- Without validation, any form submission goes through

### How is Email Validated in ScanMart?

File: [`src/Login.jsx`](file:///e:/ScanMart%202/src/Login.jsx)

```jsx
// Simple regex that checks for basic email format: something@something.something
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// In the validate function:
if (!email.trim()) {
  setEmailError('Email is required.');
} else if (!isValidEmail(email)) {
  setEmailError('Please enter a valid email address.');
} else {
  setEmailError(''); // Clear error when valid
}
```

### Reusable FormInput Component

File: [`src/components/FormInput.jsx`](file:///e:/ScanMart%202/src/components/FormInput.jsx)

Instead of repeating `<label>` + `<input>` + error message in every form, we created one reusable component:

```jsx
// Used in Login.jsx like this:
<FormInput
  id="customer-email"
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}         // Shows red error text if not empty
  required                   // Shows red asterisk
/>
```

### Product Form Validation

File: [`src/pages/ScanPage.jsx`](file:///e:/ScanMart%202/src/pages/ScanPage.jsx) — AdminPage

```jsx
function validateAddForm() {
  const errors = {};
  if (!newProduct.name.trim())   errors.name = 'Product name is required.';
  if (!newProduct.code.trim())   errors.code = 'Product code is required.';
  if (Number(newProduct.price) <= 0) errors.price = 'Price must be positive.';
  if (Number(newProduct.stock) < 0)  errors.stock = 'Stock cannot be negative.';
  if (!newProduct.category)      errors.category = 'Please select a category.';
  return errors;
}
```

### Viva Questions

**Q: What is form validation and why is it important?**
A: Validation checks user input before processing it. It's important because users make mistakes, required fields might be left empty, and email or price formats might be wrong. Without validation, the app could crash or store incorrect data.

**Q: What is a controlled input?**
A: A controlled input is an `<input>` whose value is linked to a React state variable. Every time the user types, the state updates, and React re-renders with the new value.

**Q: What is a reusable component?**
A: A component that can be used in multiple places by passing different props. `FormInput` is reusable — it appears in the Customer Login form, Store Owner Login form, and the Admin Add Product form.

---

## Topic 5: Authentication and Roles

### What is Authentication?

Authentication is verifying who the user is — confirming their identity. In ScanMart, when a user provides an email and password, the app decides: "Are you a Customer or a Store Owner?"

> ⚠️ **Important for viva:** ScanMart uses **demo authentication** — there is no real server checking passwords. Any valid email and a 4+ character password will work. Real apps must verify credentials on the server.

### How is Auth Implemented in ScanMart?

File: [`src/context/AuthContext.jsx`](file:///e:/ScanMart%202/src/context/AuthContext.jsx)

```jsx
// When the user submits the login form:
function login(name, email, role) {
  // Saves user to localStorage so they stay logged in after page refresh
  setUser({ name, email, role });
}

// When the user clicks Logout:
function logout() {
  setUser(null); // Clears the user from state and localStorage
}
```

The user object looks like:
```js
{ name: "yash", email: "yash@example.com", role: "customer" }
// OR
{ name: "store", email: "store@example.com", role: "owner" }
```

### How are Customer and Store Owner Flows Different?

| Action | Customer | Store Owner |
|--------|----------|-------------|
| After login | Redirected to `/home` | Redirected to `/admin` |
| Navbar shows | Home, Products, Scan, Cart | Dashboard |
| Can access Admin page | ❌ Sees "Access Denied" | ✅ Full dashboard |
| Can browse products | ✅ Yes | ✅ Yes (as a person) |

### Route Protection

File: [`src/pages/ScanPage.jsx`](file:///e:/ScanMart%202/src/pages/ScanPage.jsx) — AdminPage

```jsx
// Simple client-side check
if (!isLoggedIn || !isOwner) {
  return <p>Access Denied. Please log in as a Store Owner.</p>;
}
```

### Frontend vs Backend Authorization

**Frontend check (what ScanMart does):** The component checks the user's role stored in localStorage and shows or hides content.

**Backend authorization (what real apps do):** Every API request also sends the user's token to the server. The server independently verifies the role. A clever user **cannot bypass this** by editing localStorage.

> 💬 Tell your professor: "ScanMart uses client-side route protection for demonstration purposes. In a real application, the server would validate every request."

### Viva Questions

**Q: What is the difference between authentication and authorization?**
A: Authentication is verifying WHO you are (login). Authorization is deciding WHAT you are allowed to do (role-based access). ScanMart does both — login verifies you, and the role (customer/owner) controls what pages you can see.

**Q: Why can't we trust client-side route checks alone?**
A: Because a user can open browser developer tools, edit localStorage, change their role to "owner," and bypass the check. Real security requires the server to verify the role on every API request.

**Q: How does the cart persist after login?**
A: The `useLocalStorage` hook saves cart items to the browser's localStorage under the key `scanmart_cart`. When the page reloads, `useState` initializes from this saved data.

---

## Topic 6: Git

### What is Git?

Git is a version control system. It tracks every change you make to your code. If you break something, you can go back to a working version. Git also lets multiple developers work on the same project without overwriting each other's changes.

### What is `git status`?

`git status` shows you:
- Which files have been changed but not yet saved to Git
- Which files are new (untracked)
- Which branch you are on

```bash
git status
# On branch main
# Changes not staged for commit:
#   modified: src/context/AuthContext.jsx
#   modified: src/pages/ScanPage.jsx
```

### What is a Commit?

A commit is a saved snapshot of your project at a specific point in time. Each commit has:
- A unique ID (hash)
- A message describing what changed
- The exact changes made

```bash
git add .
git commit -m "feat: add role-based authentication with AuthContext"
```

### Feature-Based Commits in ScanMart

Each feature was developed separately and should be committed separately:

```bash
# Suggested commit messages for each phase:
git commit -m "feat: add AuthContext for role-based authentication"
git commit -m "feat: convert cart to CartContext for global state"
git commit -m "feat: add form validation to login and admin forms"
git commit -m "feat: add async loading states to HomePage and AdminPage"
git commit -m "feat: add add-product form to admin dashboard"
git commit -m "docs: add FEE2_VIVA_GUIDE.md"
```

### Why commit feature by feature?

- Each commit is a checkpoint you can return to
- If a new feature breaks something, you can undo just that commit
- Your professor can see the project progress step by step
- It shows professional software development habits

### Current Git Status

The following files were modified for FEE-II:

**New files created:**
- `src/context/AuthContext.jsx` — Global authentication state
- `src/context/CartContext.jsx` — Global cart state
- `src/components/FormInput.jsx` — Reusable form input component
- `FEE2_VIVA_GUIDE.md` — This guide

**Files modified:**
- `src/App.jsx` — Added providers, cleaned up props
- `src/Login.jsx` — Full validation, AuthContext, show/hide password
- `src/components/Navbar.jsx` — Uses contexts, logout button, role-aware
- `src/pages/HomePage.jsx` — Async loading states, uses CartContext
- `src/pages/ProductsPage.jsx` — Uses CartContext (no more props)
- `src/pages/CartPage.jsx` — Uses CartContext and AuthContext
- `src/pages/ScanPage.jsx` — Uses CartContext; AdminPage with add form; ProfilePage with real user
- `src/index.css` — New styles for FormInput, nav-avatar, input-error

### Viva Questions

**Q: What is Git and why do we use it?**
A: Git is a version control system that tracks changes to code. We use it to save progress checkpoints, work on new features without breaking existing code, and collaborate with others.

**Q: What is the difference between `git add` and `git commit`?**
A: `git add` stages (marks) the changes you want to save. `git commit` actually saves the staged changes as a snapshot in Git's history.

**Q: What is a branch in Git?**
A: A branch is an independent copy of the project where you can make changes without affecting the main code. When the feature is ready, you merge it back.

---

## Quick Reference: Files and Concepts

| File | Concept Demonstrated |
|------|---------------------|
| [`src/context/AuthContext.jsx`](file:///e:/ScanMart%202/src/context/AuthContext.jsx) | Context API, createContext, useContext, custom hook |
| [`src/context/CartContext.jsx`](file:///e:/ScanMart%202/src/context/CartContext.jsx) | Context API, global cart state, localStorage persistence |
| [`src/components/FormInput.jsx`](file:///e:/ScanMart%202/src/components/FormInput.jsx) | Reusable component, props, conditional rendering |
| [`src/Login.jsx`](file:///e:/ScanMart%202/src/Login.jsx) | Form validation, local state, show/hide password, AuthContext |
| [`src/App.jsx`](file:///e:/ScanMart%202/src/App.jsx) | React Router, BrowserRouter, Routes, Route, Context Providers |
| [`src/components/Navbar.jsx`](file:///e:/ScanMart%202/src/components/Navbar.jsx) | NavLink, useAuth, useCart, role-based rendering |
| [`src/pages/HomePage.jsx`](file:///e:/ScanMart%202/src/pages/HomePage.jsx) | Async state management, useEffect, try/catch/finally, loading/error/retry |
| [`src/pages/ProductsPage.jsx`](file:///e:/ScanMart%202/src/pages/ProductsPage.jsx) | useMemo, local state, CartContext, filtering and sorting |
| [`src/pages/CartPage.jsx`](file:///e:/ScanMart%202/src/pages/CartPage.jsx) | CartContext, derived state (totals from items), AuthContext |
| [`src/pages/ScanPage.jsx`](file:///e:/ScanMart%202/src/pages/ScanPage.jsx) | useRef, CartContext, AuthContext, role protection, form validation |
| [`src/hooks/useLocalStorage.js`](file:///e:/ScanMart%202/src/hooks/useLocalStorage.js) | Custom hook, localStorage, useState, useEffect |

---

## Summary: FEE-II Concepts in ScanMart

| FEE-II Requirement | Implementation |
|--------------------|---------------|
| Multi-page SPA with routing | React Router v7, 11 routes, dynamic `:id` route, 404 page |
| Global state (Context API) | `AuthContext`, `CartContext` — no prop drilling |
| Local state | `useState` in Login forms, Navbar menu, ProductsPage filters |
| Asynchronous state management | `async/await`, `useEffect`, loading/error/retry in `HomePage` |
| Form validation | Login, Register, Admin Add Product — inline errors, no `alert()` |
| Reusable components | `FormInput`, `Button`, `ProductCard`, `Logo` |
| Authentication and roles | Customer → `/home`, Store Owner → `/admin` |
| LocalStorage persistence | Cart persists on refresh, user stays logged in |
| Dark/Light theme | CSS variables, `.dark` class toggle |
| 404 handling | `path="*"` catches unknown routes |
