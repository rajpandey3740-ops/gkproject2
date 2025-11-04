export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  description: string;
  unit: string;
  popular?: boolean;
  inStock?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  type: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  pin: string;
  state: string;
  isDefault: boolean;
}

export interface User {
  name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  unit: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pin: string;
}

export interface Order {
  orderId: string;
  userId?: string;
  username?: string;
  items: OrderItem[];
  address: OrderAddress;
  paymentMethod: 'cod' | 'upi';
  subtotal: number;
  savings: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Owner {
  phone: string;
  isAuthenticated: boolean;
}

export interface ProductUpdate {
  id: number;
  inStock?: boolean;
  image?: string;
  price?: number;
  originalPrice?: number;
  name?: string;
  description?: string;
}
