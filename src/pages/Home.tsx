import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartItem, Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import CartModal from '../components/CartModal';
import CheckoutModal from '../components/CheckoutModal';

const API_BASE_URL = 'http://localhost:5000/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Fetch products and categories from API
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch products and categories in parallel
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/categories`)
      ]);

      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
        setFilteredProducts(productsRes.data.data);
      }

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
      setShowMenu(false);
    }
  };

  const handleMenuItemClick = (action: string) => {
    setShowMenu(false);
    
    switch(action) {
      case 'orders':
        navigate('/orders');
        break;
      case 'owner-login':
        navigate('/owner/login');
        break;
      case 'account':
        alert('Account settings - Feature coming soon!');
        break;
      case 'customer-service':
        alert('Customer Service - Feature coming soon!');
        break;
      case 'return-refund':
        alert('Return & Refund - Feature coming soon!');
        break;
      case 'switch-account':
        if (confirm('Switch to a different account?')) {
          handleLogout();
        }
        break;
      default:
        break;
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setShowMenu(false);
    alert(`Language changed to ${lang}`);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-start">
              <div className="bg-white rounded-full p-2 text-purple-600">
                <i className="fas fa-store text-xl md:text-2xl"></i>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">GK General Store</h1>
                <p className="text-xs md:text-sm opacity-80">Your Neighborhood Store Online</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-md relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-12 pr-12 py-2.5 md:py-3 rounded-full text-gray-800 outline-none text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                title="Voice search"
              >
                <i className="fas fa-microphone text-sm md:text-base"></i>
              </button>
            </div>

            {/* Login, Cart and Menu Buttons */}
            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto justify-center lg:justify-end">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-white text-purple-600 px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg text-sm md:text-base whitespace-nowrap"
                >
                  <i className="fas fa-user-circle mr-1 md:mr-2"></i>
                  <span className="hidden sm:inline">{username}</span>
                  <span className="sm:hidden">User</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-purple-600 px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg text-sm md:text-base whitespace-nowrap"
                >
                  <i className="fas fa-user mr-1 md:mr-2"></i>
                  Login
                </Link>
              )}
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-white text-purple-600 px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg text-sm md:text-base whitespace-nowrap"
              >
                <i className="fas fa-shopping-cart mr-1 md:mr-2"></i>
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white rounded-full w-5 h-5 md:w-7 md:h-7 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* 3-Dot Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="bg-white text-purple-600 p-2 md:p-3 rounded-full hover:bg-purple-50 transition-all shadow-lg"
                >
                  <i className="fas fa-ellipsis-v text-lg"></i>
                </button>
                
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                      {/* Language Selection */}
                      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-600 mb-2">LANGUAGE</p>
                        <div className="space-y-1">
                          {['English', 'Hindi', 'Spanish'].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => handleLanguageChange(lang)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                selectedLanguage === lang
                                  ? 'bg-purple-600 text-white font-semibold'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <i className={`fas fa-${selectedLanguage === lang ? 'check-circle' : 'globe'} mr-2`}></i>
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => handleMenuItemClick('orders')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 text-gray-700"
                        >
                          <i className="fas fa-box text-purple-600 w-5"></i>
                          <span className="font-medium">My Orders</span>
                        </button>
                        
                        <button
                          onClick={() => handleMenuItemClick('account')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 text-gray-700"
                        >
                          <i className="fas fa-user-cog text-purple-600 w-5"></i>
                          <span className="font-medium">Account Settings</span>
                        </button>
                        
                        <button
                          onClick={() => handleMenuItemClick('customer-service')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 text-gray-700"
                        >
                          <i className="fas fa-headset text-purple-600 w-5"></i>
                          <span className="font-medium">Customer Service</span>
                        </button>
                        
                        <button
                          onClick={() => handleMenuItemClick('return-refund')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 text-gray-700"
                        >
                          <i className="fas fa-undo text-purple-600 w-5"></i>
                          <span className="font-medium">Return & Refund</span>
                        </button>

                        <div className="border-t border-gray-100 my-2"></div>
                        
                        <button
                          onClick={() => handleMenuItemClick('owner-login')}
                          className="w-full text-left px-4 py-3 hover:bg-green-50 transition-all flex items-center gap-3 text-green-700 font-semibold"
                        >
                          <i className="fas fa-crown text-green-600 w-5"></i>
                          <span>Owner Login</span>
                        </button>
                      </div>

                      {/* Account Actions */}
                      {isLoggedIn && (
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={() => handleMenuItemClick('switch-account')}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 text-gray-700"
                          >
                            <i className="fas fa-exchange-alt text-blue-600 w-5"></i>
                            <span className="font-medium">Switch Account</span>
                          </button>
                          
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 transition-all flex items-center gap-3 text-red-600"
                          >
                            <i className="fas fa-sign-out-alt w-5"></i>
                            <span className="font-medium">Log Out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <i className="fas fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Categories */}
        {!isLoading && !error && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shop by Category</h2>
              <div className="flex gap-3 overflow-x-auto pb-4">
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
          </>
        )}
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

      {/* Sticky View Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
          <button
            onClick={() => setShowCart(true)}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-2xl flex items-center justify-between px-6 pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white text-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                {cartCount}
              </div>
              <span>View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-90">₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span>
              <i className="fas fa-chevron-up"></i>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
