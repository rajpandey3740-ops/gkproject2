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
