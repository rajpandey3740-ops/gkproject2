import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (id: number) => void;
  onUpdateQuantity: (id: number, change: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  return (
    <div className="product-card bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="relative">
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-48 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4"
          />
        </div>
        {product.discount > 0 && (
          <div className="badge-discount absolute top-3 right-3 text-white px-3 py-1 rounded-full text-sm font-bold">
            {product.discount}% OFF
          </div>
        )}
        {product.popular && (
          <div className="badge-popular absolute top-3 left-3 text-white px-3 py-1 rounded-full text-xs font-bold">
            ⭐ POPULAR
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 h-12 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{product.unit}</p>
        <div className="flex items-center mb-4">
          <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through ml-2">
              ₹{product.originalPrice}
            </span>
          )}
        </div>
        {cartQuantity > 0 ? (
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl shadow-md">
            <button
              onClick={() => onUpdateQuantity(product.id, -1)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold transition-all"
            >
              <i className="fas fa-minus text-sm"></i>
            </button>
            <span className="font-bold text-lg">{cartQuantity} in cart</span>
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold transition-all"
            >
              <i className="fas fa-plus text-sm"></i>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(product.id)}
            className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md"
          >
            <i className="fas fa-plus mr-2"></i>Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
