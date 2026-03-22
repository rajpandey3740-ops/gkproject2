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
  createdAt: Date;
  updatedAt: Date;
}
