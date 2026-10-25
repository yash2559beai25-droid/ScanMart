// Product data stored as a JavaScript array of objects.
// This is NOT a JSON file — it is a .js file with export.
// Each product has: id, code, name, category, price, rating, stock, image, description.

export const products = [
  {
    id: 1,
    code: 'SM001',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 999,
    rating: 4.5,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    description: 'Comfortable wireless headphones with clear sound.',
  },
  {
    id: 2,
    code: 'SM002',
    name: 'Smart Watch',
    category: 'Electronics',
    price: 2499,
    rating: 4.6,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    description: 'A smart watch for time, steps, and notifications.',
  },
  {
    id: 3,
    code: 'SM003',
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    price: 1299,
    rating: 4.3,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
    description: 'Portable Bluetooth speaker with strong bass.',
  },
  {
    id: 4,
    code: 'SM004',
    name: 'USB Power Bank',
    category: 'Electronics',
    price: 799,
    rating: 4.4,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80',
    description: 'Compact power bank for charging on the go.',
  },
  {
    id: 5,
    code: 'SM005',
    name: 'Organic Basmati Rice 5kg',
    category: 'Grocery',
    price: 549,
    rating: 4.7,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    description: 'Long grain organic basmati rice for daily meals.',
  },
  {
    id: 6,
    code: 'SM006',
    name: 'Extra Virgin Olive Oil',
    category: 'Grocery',
    price: 399,
    rating: 4.5,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
    description: 'Pure olive oil for cooking and salads. 500ml bottle.',
  },
  {
    id: 7,
    code: 'SM007',
    name: 'Mixed Nuts Pack',
    category: 'Grocery',
    price: 299,
    rating: 4.4,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d24?w=600&q=80',
    description: 'Healthy mix of almonds, cashews, and raisins.',
  },
  {
    id: 8,
    code: 'SM008',
    name: 'Cotton T-Shirt',
    category: 'Fashion',
    price: 499,
    rating: 4.2,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    description: 'Soft cotton t-shirt for everyday wear.',
  },
  {
    id: 9,
    code: 'SM009',
    name: 'Sports Shoes',
    category: 'Fashion',
    price: 1899,
    rating: 4.6,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    description: 'Comfortable sports shoes for walking and running.',
  },
  {
    id: 10,
    code: 'SM010',
    name: 'Denim Jacket',
    category: 'Fashion',
    price: 1599,
    rating: 4.3,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    description: 'Classic denim jacket for casual outfits.',
  },
  {
    id: 11,
    code: 'SM011',
    name: 'LED Desk Lamp',
    category: 'Home',
    price: 699,
    rating: 4.5,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1507473883500-ef5385763b1c?w=600&q=80',
    description: 'Adjustable LED desk lamp for study and work.',
  },
  {
    id: 12,
    code: 'SM012',
    name: 'Ceramic Coffee Mug Set',
    category: 'Home',
    price: 449,
    rating: 4.4,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    description: 'Set of ceramic mugs for tea or coffee.',
  },
  {
    id: 13,
    code: 'SM013',
    name: 'Cotton Bed Sheet',
    category: 'Home',
    price: 899,
    rating: 4.2,
    stock: 2,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
    description: 'Soft cotton bed sheet for comfortable sleep.',
  },
  {
    id: 14,
    code: 'SM014',
    name: 'Herbal Shampoo',
    category: 'Personal Care',
    price: 249,
    rating: 4.3,
    stock: 28,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    description: 'Mild herbal shampoo for daily hair care.',
  },
  {
    id: 15,
    code: 'SM015',
    name: 'Face Wash Gel',
    category: 'Personal Care',
    price: 199,
    rating: 4.5,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    description: 'Refreshing face wash gel for clean skin.',
  },
];

// List of categories for the filter buttons
export const categories = [
  'All',
  'Electronics',
  'Grocery',
  'Fashion',
  'Home',
  'Personal Care',
];

// Helper function: format price with rupee symbol
export function formatPrice(amount) {
  return '₹' + amount;
}

// Helper function: return stock status text
export function getStockText(stock) {
  if (stock === 0) return 'Out of Stock';
  if (stock < 5) return 'Low Stock';
  return 'In Stock';
}

// Helper function: return CSS class based on stock level
export function getStockClass(stock) {
  if (stock === 0) return 'out';
  if (stock < 5) return 'low';
  return 'ok';
}
