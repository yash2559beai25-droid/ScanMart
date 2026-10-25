// Custom Hook: useLocalStorage
// Works like useState, but saves the value in the browser's localStorage.
// This means the data is not lost when the user refreshes the page.
// Used by useCart to save cart items.

import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  // Initialize state: try to load saved value from localStorage
  const [value, setValue] = useState(function () {
    try {
      const savedData = localStorage.getItem(key);

      // If data exists in localStorage, parse it from JSON string to object
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch {
      // If parsing fails, use the initial value
      return initialValue;
    }

    return initialValue;
  });

  // useEffect: save the value to localStorage whenever it changes
  useEffect(function () {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // Return same format as useState: [value, setValue]
  return [value, setValue];
}
