import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Product, Order } from '../types';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [showPriceEdit, setShowPriceEdit] = useState(false);
  const [editingPriceProduct, setEditingPriceProduct] = useState<Product | null>(null);
  const [mrpPrice, setMrpPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('ownerAuthenticated');
    if (!isAuthenticated) {
      navigate('/owner/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/orders')
      ]);
      setProducts(productsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ownerAuthenticated');
    localStorage.removeItem('ownerPhone');
    navigate('/');
  };

  const toggleStock = async (product: Product) => {
    try {
      const newStock = !product.inStock;
      await axios.patch(`http://localhost:5000/api/products/${product.id}`, {
        inStock: newStock === undefined ? true : newStock
      });
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, inStock: newStock } : p
      ));
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock status');
    }
  };

  const handleImageUpdate = async (product: Product) => {
    if (!imageUrl.trim()) {
      alert('Please enter an image URL or upload an image');
      return;
    }

    try {
      // Add Unsplash parameters if it's an Unsplash URL
      let finalImageUrl = imageUrl;
      if (imageUrl.includes('unsplash.com') && !imageUrl.includes('?')) {
        finalImageUrl = `${imageUrl}?auto=format&fit=crop&w=400&q=80`;
      }

      await axios.patch(`http://localhost:5000/api/products/${product.id}`, {
        image: finalImageUrl
      });
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, image: finalImageUrl } : p
      ));
      setImageUrl('');
      setShowImageInput(false);
      setEditingProduct(null);
      setUploadMethod('url');
      alert('Image updated successfully');
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Failed to update image');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.onerror = () => {
      alert('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handlePriceUpdate = async (product: Product) => {
    const mrp = parseFloat(mrpPrice);
    const selling = parseFloat(sellingPrice);

    if (isNaN(mrp) || isNaN(selling)) {
      alert('Please enter valid prices');
      return;
    }

    if (selling > mrp) {
      alert('Selling price cannot be greater than MRP');
      return;
    }

    if (mrp <= 0 || selling <= 0) {
      alert('Prices must be greater than 0');
      return;
    }

    // Calculate discount automatically
    const discount = mrp - selling;

    try {
      await axios.patch(`http://localhost:5000/api/products/${product.id}`, {
        originalPrice: mrp,
        price: selling,
        discount: discount
      });

      setProducts(products.map(p => 
        p.id === product.id ? { ...p, originalPrice: mrp, price: selling, discount } : p
      ));

      setMrpPrice('');
      setSellingPrice('');
      setShowPriceEdit(false);
      setEditingPriceProduct(null);
      alert('Price updated successfully!');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    }
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    
    switch(action) {
      case 'categories':
        alert('Categories Management - Feature coming soon!');
        break;
      case 'add-category':
        alert('Add New Category - Feature coming soon!');
        break;
      case 'sales':
        alert('Sales Report - Feature coming soon!');
        break;
      case 'out-of-stock':
        // Filter to show only out of stock products
        const outOfStock = products.filter(p => p.inStock === false);
        if (outOfStock.length === 0) {
          alert('All products are in stock!');
        } else {
          alert(`Out of Stock Products (${outOfStock.length}):\n\n${outOfStock.map(p => `• ${p.name}`).join('\n')}`);
        }
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, { status });
      setOrders(orders.map(o => 
        o.orderId === orderId ? { ...o, status } : o
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing');
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Owner Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your store</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
              
              {/* 3-Dot Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <i className="fas fa-ellipsis-v text-xl px-1"></i>
                </button>
                
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                      <div className="py-2">
                        <button
                          onClick={() => handleMenuAction('categories')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 text-gray-700"
                        >
                          <i className="fas fa-list text-blue-600 w-5"></i>
                          <span className="font-medium">Manage Categories</span>
                        </button>
                        
                        <button
                          onClick={() => handleMenuAction('add-category')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 text-gray-700"
                        >
                          <i className="fas fa-plus-circle text-green-600 w-5"></i>
                          <span className="font-medium">Add New Category</span>
                        </button>
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        <button
                          onClick={() => handleMenuAction('sales')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 text-gray-700"
                        >
                          <i className="fas fa-chart-line text-purple-600 w-5"></i>
                          <span className="font-medium">Sales Report</span>
                        </button>
                        
                        <button
                          onClick={() => handleMenuAction('out-of-stock')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 text-gray-700"
                        >
                          <i className="fas fa-exclamation-triangle text-orange-600 w-5"></i>
                          <span className="font-medium">Out of Stock Products</span>
                        </button>
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        <button
                          onClick={() => handleMenuAction('logout')}
                          className="w-full text-left px-4 py-3 hover:bg-red-50 transition-all flex items-center gap-3 text-red-600"
                        >
                          <i className="fas fa-sign-out-alt w-5"></i>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-4 font-semibold transition ${
              activeTab === 'products'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 font-semibold transition ${
              activeTab === 'orders'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <p className="text-green-600 font-semibold mt-1">
                      ₹{product.price} <span className="text-gray-400 line-through text-sm">₹{product.originalPrice}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => toggleStock(product)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        product.inStock !== false
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingPriceProduct(product);
                        setShowPriceEdit(true);
                        setMrpPrice(product.originalPrice.toString());
                        setSellingPrice(product.price.toString());
                      }}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                    >
                      Edit Price
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowImageInput(true);
                        // Remove URL parameters for cleaner display
                        const cleanUrl = product.image.split('?')[0];
                        setImageUrl(cleanUrl);
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      Change Image
                    </button>
                  </div>
                </div>

                {/* Image Update Form */}
                {showImageInput && editingProduct?.id === product.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choose Upload Method
                      </label>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            setUploadMethod('url');
                            // Remove URL parameters for cleaner display
                            const cleanUrl = product.image.split('?')[0];
                            setImageUrl(cleanUrl);
                          }}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                            uploadMethod === 'url'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <i className="fas fa-link mr-2"></i>
                          Image URL
                        </button>
                        <button
                          onClick={() => {
                            setUploadMethod('file');
                            setImageUrl('');
                          }}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                            uploadMethod === 'file'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <i className="fas fa-image mr-2"></i>
                          Upload from Gallery
                        </button>
                      </div>
                    </div>

                    {uploadMethod === 'url' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL (from any source)
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter image URL (https://...)"
                          />
                          <button
                            onClick={() => handleImageUpdate(product)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => {
                              setShowImageInput(false);
                              setEditingProduct(null);
                              setImageUrl('');
                              setUploadMethod('url');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Image from Gallery
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <label className="flex-1 cursor-pointer">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
                                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                                <p className="text-sm text-gray-600">Click to select image</p>
                                <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {imageUrl && (
                            <div className="space-y-2">
                              <div className="border border-gray-300 rounded-lg p-2">
                                <img
                                  src={imageUrl}
                                  alt="Preview"
                                  className="w-full h-48 object-cover rounded"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleImageUpdate(product)}
                                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                  Update Image
                                </button>
                                <button
                                  onClick={() => {
                                    setShowImageInput(false);
                                    setEditingProduct(null);
                                    setImageUrl('');
                                    setUploadMethod('url');
                                  }}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Update Form */}
                {showPriceEdit && editingPriceProduct?.id === product.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      <i className="fas fa-tag mr-2 text-purple-600"></i>
                      Update Product Price
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          MRP (Maximum Retail Price)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            value={mrpPrice}
                            onChange={(e) => setMrpPrice(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter MRP"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selling Price (After Discount)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            value={sellingPrice}
                            onChange={(e) => setSellingPrice(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter selling price"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Discount Preview */}
                    {mrpPrice && sellingPrice && parseFloat(mrpPrice) >= parseFloat(sellingPrice) && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-700">
                            <i className="fas fa-percentage mr-2"></i>
                            Customer Discount:
                          </span>
                          <span className="text-lg font-bold text-green-700">
                            ₹{(parseFloat(mrpPrice) - parseFloat(sellingPrice)).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Customers will save {((parseFloat(mrpPrice) - parseFloat(sellingPrice)) / parseFloat(mrpPrice) * 100).toFixed(1)}% on this product
                        </p>
                      </div>
                    )}

                    {/* Validation Warning */}
                    {mrpPrice && sellingPrice && parseFloat(sellingPrice) > parseFloat(mrpPrice) && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          Selling price cannot be greater than MRP!
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handlePriceUpdate(product)}
                        className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                      >
                        <i className="fas fa-check mr-2"></i>
                        Update Price
                      </button>
                      <button
                        onClick={() => {
                          setShowPriceEdit(false);
                          setEditingPriceProduct(null);
                          setMrpPrice('');
                          setSellingPrice('');
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Pending Orders */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Pending Orders ({pendingOrders.length})
              </h2>
              {pendingOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending orders</p>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <div key={order.orderId} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order.orderId}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          {order.username && (
                            <p className="text-sm text-gray-600 mt-1">Customer: {order.username}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between font-semibold mb-4">
                          <span>Total:</span>
                          <span className="text-green-600">₹{order.total}</span>
                        </div>

                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.orderId, 'confirmed')}
                              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                              Confirm Order
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(order.orderId, 'processing')}
                              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                              Start Processing
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => updateOrderStatus(order.orderId, 'shipped')}
                              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                              Mark as Shipped
                            </button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => updateOrderStatus(order.orderId, 'cancelled')}
                              className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                        <p className="font-semibold mb-1">Delivery Address:</p>
                        <p>{order.address.name} - {order.address.phone}</p>
                        <p>{order.address.street}, {order.address.city}</p>
                        <p>{order.address.state} - {order.address.pin}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Orders */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Completed Orders ({completedOrders.length})
              </h2>
              {completedOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No completed orders</p>
              ) : (
                <div className="space-y-4">
                  {completedOrders.map((order) => (
                    <div key={order.orderId} className="bg-white rounded-lg shadow p-6 opacity-75">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order.orderId}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          {order.username && (
                            <p className="text-sm text-gray-600 mt-1">Customer: {order.username}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span className="text-green-600">₹{order.total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
