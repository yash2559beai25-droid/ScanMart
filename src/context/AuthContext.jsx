// AuthContext.jsx — Global Authentication State
//
// This file creates a "context" that stores the logged-in user's information.
// Any component anywhere in the app can read this without passing props.
//
// How it works:
//   1. createContext() creates an empty shared container.
//   2. AuthProvider wraps the whole app and puts data in the container.
//   3. useAuth() is a simple custom hook any component calls to get the data.

import { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Step 1: Create the empty context container
const AuthContext = createContext(null);

// Step 2: The Provider component
// This wraps our entire app so every page can access the auth data
export function AuthProvider({ children }) {

  // Store the user in localStorage so login survives a page refresh
  // user looks like: { name: "Yash", email: "yash@example.com", role: "customer" }
  // user is null when nobody is logged in
  const [user, setUser] = useLocalStorage('scanmart_user', null);

  // Called when the user successfully submits the login form
  function login(name, email, role) {
    var newUser = {
      name: name,
      email: email,
      role: role
    };
    setUser(newUser);
  }

  // Called when the user clicks Logout — clears the saved user
  function logout() {
    setUser(null);
  }

  // Check if anyone is logged in
  var isLoggedIn = user !== null;

  // Check if the logged-in user is a customer
  var isCustomer = false;
  if (user !== null && user.role === 'customer') {
    isCustomer = true;
  }

  // Check if the logged-in user is a store owner
  var isOwner = false;
  if (user !== null && user.role === 'owner') {
    isOwner = true;
  }

  // This object is what components get when they call useAuth()
  var value = {
    user: user,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    isCustomer: isCustomer,
    isOwner: isOwner
  };

  return (
    // Step 3: Give every child component access to the value
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 4: Custom hook — instead of writing useContext(AuthContext) everywhere,
// components just write: const { user, login, logout } = useAuth();
export function useAuth() {
  var context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
