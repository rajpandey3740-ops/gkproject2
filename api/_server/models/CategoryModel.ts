import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  icon: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: false, // Make icon optional
      default: '🛒',   // Set default icon
    },
  },
  {
    timestamps: true,
  }
);

// Export model with check for existing model to avoid re-definition error in Vercel
export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);