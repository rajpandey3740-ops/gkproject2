import React from 'react';
import { CartItem } from '../types';

interface CartModalProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onUpdateQuantity: (id: number, change: number) => void;
}

const CartModal: React.FC<CartModalProps> = ({
  cart,
  isOpen,
  onClose,
  onCheckout,
  onUpdateQuantity,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = subtotal - total;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times text-xl md:text-2xl"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {cart.length === 0 ? (
            <div className="empty-cart text-center py-8">
              <i className="fas fa-shopping-cart text-5xl md:text-6xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3"
                >
                  <div className="bg-white rounded-lg p-2 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.unit}</p>
                    <p className="font-bold text-purple-600">₹{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="font-bold w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="border-t p-4 md:p-6 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600 text-sm md:text-base">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-green-600 font-semibold text-sm md:text-base">
                <span>Savings:</span>
                <span>₹{savings}</span>
              </div>
              <div className="flex justify-between text-lg md:text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span>₹{total}</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:opacity-90 transition-all shadow-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
