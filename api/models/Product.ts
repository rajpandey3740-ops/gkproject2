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
  inStock?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
