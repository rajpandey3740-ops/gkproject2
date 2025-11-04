import mongoose, { Schema, Document } from 'mongoose';
import { Order } from './Order';

export interface IOrder extends Omit<Order, 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  unit: { type: String, required: true }
});

const OrderAddressSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pin: { type: String, required: true }
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String },
    username: { type: String },
    items: { type: [OrderItemSchema], required: true },
    address: { type: OrderAddressSchema, required: true },
    paymentMethod: { type: String, enum: ['cod', 'upi'], required: true },
    subtotal: { type: Number, required: true },
    savings: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
