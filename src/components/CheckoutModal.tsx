import React, { useState, useEffect } from 'react';
import { CartItem, Address } from '../types';

interface CheckoutModalProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cart,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    const addresses = localStorage.getItem('addresses');
    if (addresses) {
      const parsed = JSON.parse(addresses);
      const defaultAddr = parsed.find((addr: Address) => addr.isDefault) || parsed[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    }
  }, []);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = subtotal - total;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    alert(`Order placed successfully! Payment method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}`);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <h2 className="text-2xl font-bold">Checkout</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Order Summary */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b"
                    >
                      <div className="flex items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-contain rounded-lg mr-3"
                        />
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            {item.unit} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-purple-600">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right: Delivery & Payment */}
              <div className="space-y-6">
                {/* Delivery Address */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Delivery Address
                  </h3>
                  {selectedAddress ? (
                    <div className="bg-gray-50 rounded-xl p-4 mb-3">
                      <p className="font-semibold">{selectedAddress.name}</p>
                      <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedAddress.street}, {selectedAddress.city},{' '}
                        {selectedAddress.state} - {selectedAddress.pin}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 text-sm">No address selected</p>
                    </div>
                  )}
                </div>
                {/* Payment Method */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-purple-600"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-800">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-purple-600"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-800">UPI Payment</p>
                        <p className="text-sm text-gray-500">Pay via UPI</p>
                      </div>
                    </label>
                  </div>
                  {paymentMethod === 'upi' && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                      <p className="font-semibold text-gray-800 mb-2">UPI ID:</p>
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <span className="font-mono text-purple-600">
                          7974908914@ptaxis
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('7974908914@ptaxis');
                            alert('UPI ID copied to clipboard');
                          }}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Footer: Total & Place Order */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Subtotal: ₹{subtotal}</p>
                <p className="text-sm text-green-600 font-semibold">
                  Savings: ₹{savings}
                </p>
                <p className="text-2xl font-bold text-gray-900">Total: ₹{total}</p>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
