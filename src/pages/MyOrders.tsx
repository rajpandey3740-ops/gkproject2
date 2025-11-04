import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Order } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const username = localStorage.getItem('username');
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        params: { username }
      });

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-white hover:text-gray-200">
                <i className="fas fa-arrow-left text-xl"></i>
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-2 text-purple-600">
                  <i className="fas fa-box text-xl"></i>
                </div>
                <h1 className="text-2xl font-bold">My Orders</h1>
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
            <p className="text-gray-600 text-lg">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <i className="fas fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-20">
            <i className="fas fa-shopping-bag text-gray-300 text-6xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-bold text-gray-800">{order.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Items ({order.items.length})</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-contain rounded-lg bg-gray-50"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.unit} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-purple-600">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-4 bg-gray-50 border-t">
                  <h3 className="font-bold text-gray-800 mb-2">Delivery Address</h3>
                  <p className="text-sm text-gray-700">
                    {order.address.name} - {order.address.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.address.street}, {order.address.city}, {order.address.state} -{' '}
                    {order.address.pin}
                  </p>
                </div>

                {/* Order Total */}
                <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm opacity-90">Payment Method</p>
                      <p className="font-semibold">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-90">Total Amount</p>
                      <p className="text-2xl font-bold">₹{order.total}</p>
                      {order.savings > 0 && (
                        <p className="text-xs opacity-90">Saved ₹{order.savings}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOrders;
