import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products, categories } from '../data/products';
import { CartItem, Product } from '../types';
import ProductCard from '../components/ProductCard';
import CartModal from '../components/CartModal';
import CheckoutModal from '../components/CheckoutModal';

const Home: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Check login status
    const loginStatus = localStorage.getItem('isLoggedIn');
    const savedUsername = localStorage.getItem('username');
    if (loginStatus === 'true' && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    // Filter products based on category and search
    let filtered = products;
    
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [currentCategory, searchQuery]);

  const addToCart = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId: number, change: number) => {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    if (item.quantity + change <= 0) {
      removeFromCart(productId);
    } else {
      const newCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + change } : item
      );
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = (productId: number) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('rememberMe');
      setIsLoggedIn(false);
      setUsername('');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2 text-purple-600">
                <i className="fas fa-store text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold">GK General Store</h1>
                <p className="text-sm opacity-80">Your Neighborhood Store Online</p>
              </div>
            </div>

            <div className="flex-1 max-w-md relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-12 pr-12 py-3 rounded-full text-gray-800 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                title="Voice search"
              >
                <i className="fas fa-microphone"></i>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg"
                >
                  <i className="fas fa-user-circle mr-2"></i>
                  {username}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg"
                >
                  <i className="fas fa-user mr-2"></i>
                  Login
                </Link>
              )}
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg"
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Shop by Category</h2>
          <div className="flex gap-3 overflow-x-auto pb-4">
            <button
              onClick={() => setCurrentCategory('all')}
              className={`category-btn px-6 py-3 rounded-full font-semibold whitespace-nowrap ${
                currentCategory === 'all' ? 'active' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="mr-2">🛒</span>
              All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCurrentCategory(cat.id)}
                className={`category-btn px-6 py-3 rounded-full font-semibold whitespace-nowrap ${
                  currentCategory === cat.id ? 'active' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">
              {currentCategory === 'all' ? 'All Products' : categories.find(c => c.id === currentCategory)?.name}
            </h2>
            <p className="text-gray-600">{filteredProducts.length} products available</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={cart.find(item => item.id === product.id)?.quantity || 0}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>
        </div>
      </main>

      <CartModal
        cart={cart}
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
        onUpdateQuantity={updateQuantity}
      />

      <CheckoutModal
        cart={cart}
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => {
          setCart([]);
          localStorage.removeItem('cart');
          setShowCheckout(false);
        }}
      />
    </div>
  );
};

export default Home;
