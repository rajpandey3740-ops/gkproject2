import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const app = express();
app.use(express.json());

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 👇 Default route
app.get('/', (req, res) => {
  res.send('Server is running and MongoDB is connected!');
});

// 👇 Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product created successfully!', product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 👇 Get all products
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


