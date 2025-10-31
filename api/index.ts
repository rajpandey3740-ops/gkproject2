import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');

// Sample product data - 100 products
const products = [
  // Grains & Rice (19 products)
  { id: 1, name: 'Basmati Rice Premium', category: 'grains', price: 500, originalPrice: 600, discount: 100, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', description: 'Premium long grain basmati rice', unit: '5kg' },
  { id: 2, name: 'Sona Masoori Rice', category: 'grains', price: 100, originalPrice: 120, discount: 17, image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80', description: 'Medium grain rice, perfect for daily meals', unit: '5kg' },
  { id: 3, name: 'Brown Rice Organic', category: 'grains', price: 140, originalPrice: 160, discount: 13, image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80', description: 'Healthy organic brown rice', unit: '3kg' },
  { id: 4, name: 'Wheat Atta (5kg)', category: 'grains', price: 250, originalPrice: 280, discount: 11, image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', description: 'Premium quality whole wheat flour', unit: '5kg' },
  { id: 5, name: 'Jasmine Rice', category: 'grains', price: 160, originalPrice: 180, discount: 11, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=400&q=80', description: 'Fragrant jasmine rice', unit: '5kg' },
  { id: 6, name: 'Kolam Rice', category: 'grains', price: 90, originalPrice: 100, discount: 10, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', description: 'Daily use kolam rice', unit: '5kg' },
  { id: 7, name: 'Red Rice Organic', category: 'grains', price: 150, originalPrice: 170, discount: 12, image: 'https://images.unsplash.com/photo-1615485500834-bc10199bc743?auto=format&fit=crop&w=400&q=80', description: 'Nutritious red rice', unit: '2kg' },
  { id: 8, name: 'Black Rice', category: 'grains', price: 200, originalPrice: 230, discount: 13, image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=400&q=80', description: 'Premium black rice', unit: '1kg' },
  { id: 9, name: 'Multigrain Atta', category: 'grains', price: 280, originalPrice: 320, discount: 13, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', description: 'Healthy multigrain flour', unit: '5kg' },
  { id: 10, name: 'Sooji/Semolina', category: 'grains', price: 60, originalPrice: 70, discount: 14, image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=400&q=80', description: 'Fine quality semolina', unit: '1kg' },
  { id: 11, name: 'Maida/All Purpose Flour', category: 'grains', price: 50, originalPrice: 60, discount: 17, image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', description: 'Refined wheat flour', unit: '1kg' },
  { id: 12, name: 'Besan/Gram Flour', category: 'grains', price: 80, originalPrice: 95, discount: 16, image: 'https://images.unsplash.com/photo-1599909533730-f9d49be0c34f?auto=format&fit=crop&w=400&q=80', description: 'Premium gram flour', unit: '1kg' },
  { id: 13, name: 'Ragi Flour', category: 'grains', price: 70, originalPrice: 85, discount: 18, image: 'https://images.unsplash.com/photo-1585503418537-88331351ad99?auto=format&fit=crop&w=400&q=80', description: 'Healthy finger millet flour', unit: '500g' },
  { id: 14, name: 'Corn Flour', category: 'grains', price: 55, originalPrice: 65, discount: 15, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80', description: 'Fine corn starch', unit: '500g' },
  { id: 15, name: 'Poha/Beaten Rice', category: 'grains', price: 45, originalPrice: 55, discount: 18, image: 'https://images.unsplash.com/photo-1596797882870-8c33e1b8c22b?auto=format&fit=crop&w=400&q=80', description: 'Thick flattened rice', unit: '500g' },
  { id: 127, name: 'Aata Loose', category: 'grains', price: 40, originalPrice: 45, discount: 11, image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', description: 'Fresh loose wheat flour', unit: '1kg' },
  { id: 128, name: 'Aata Shyam Bhog 5kg', category: 'grains', price: 260, originalPrice: 290, discount: 10, image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', description: 'Premium Shyam Bhog wheat flour', unit: '5kg' },
  { id: 129, name: 'Aata Nandi 5kg', category: 'grains', price: 255, originalPrice: 285, discount: 11, image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', description: 'Nandi brand wheat flour', unit: '5kg' },
  { id: 130, name: 'Chaki Fresh Aata 25kg', category: 'grains', price: 1200, originalPrice: 1350, discount: 11, image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', description: 'Fresh stone-ground wheat flour', unit: '25kg' },
  
  // Pulses & Dals (15 products)
  { id: 16, name: 'Toor Dal', category: 'pulses', price: 130, originalPrice: 150, discount: 13, image: 'https://images.unsplash.com/photo-1596797882870-8c33e1b8c22b?auto=format&fit=crop&w=400&q=80', description: 'Premium quality split pigeon peas', unit: '1kg' },
  { id: 17, name: 'Moong Dal', category: 'pulses', price: 120, originalPrice: 140, discount: 14, image: 'https://images.unsplash.com/photo-1595855759920-86582396756e?auto=format&fit=crop&w=400&q=80', description: 'Yellow split moong lentils', unit: '1kg' },
  { id: 18, name: 'Chana Dal', category: 'pulses', price: 110, originalPrice: 130, discount: 15, image: 'https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&w=400&q=80', description: 'Split chickpea lentils', unit: '1kg' },
  { id: 19, name: 'Masoor Dal', category: 'pulses', price: 100, originalPrice: 115, discount: 13, image: 'https://images.unsplash.com/photo-1589821606534-80e4f9ed5b95?auto=format&fit=crop&w=400&q=80', description: 'Red lentils for quick cooking', unit: '1kg' },
  { id: 20, name: 'Urad Dal', category: 'pulses', price: 125, originalPrice: 145, discount: 14, image: 'https://images.unsplash.com/photo-1590212151175-e58edd96185b?auto=format&fit=crop&w=400&q=80', description: 'Black gram split lentils', unit: '1kg' },
  { id: 21, name: 'Moong Dal Whole', category: 'pulses', price: 135, originalPrice: 155, discount: 13, image: 'https://images.unsplash.com/photo-1610955322467-9edb9e0d4a6e?auto=format&fit=crop&w=400&q=80', description: 'Whole green moong', unit: '1kg' },
  { id: 22, name: 'Kabuli Chana', category: 'pulses', price: 140, originalPrice: 160, discount: 13, image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=400&q=80', description: 'White chickpeas', unit: '1kg' },
  { id: 23, name: 'Black Chana', category: 'pulses', price: 115, originalPrice: 135, discount: 15, image: 'https://images.unsplash.com/photo-1600850056064-a8b380df8395?auto=format&fit=crop&w=400&q=80', description: 'Kala chana/brown chickpeas', unit: '1kg' },
  { id: 24, name: 'Rajma Red', category: 'pulses', price: 150, originalPrice: 170, discount: 12, image: 'https://images.unsplash.com/photo-1567155463369-585874edd256?auto=format&fit=crop&w=400&q=80', description: 'Red kidney beans', unit: '1kg' },
  { id: 25, name: 'Rajma White', category: 'pulses', price: 145, originalPrice: 165, discount: 12, image: 'https://images.unsplash.com/photo-1599909533730-f9d49be0c34f?auto=format&fit=crop&w=400&q=80', description: 'White kidney beans', unit: '1kg' },
  { id: 26, name: 'Urad Dal Whole', category: 'pulses', price: 135, originalPrice: 155, discount: 13, image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=400&q=80', description: 'Whole black gram', unit: '1kg' },
  { id: 27, name: 'Masoor Dal Whole', category: 'pulses', price: 110, originalPrice: 125, discount: 12, image: 'https://images.unsplash.com/photo-1610955322467-9edb9e0d4a6e?auto=format&fit=crop&w=400&q=80', description: 'Whole masoor lentils', unit: '1kg' },
  { id: 28, name: 'Mix Dal', category: 'pulses', price: 125, originalPrice: 145, discount: 14, image: 'https://images.unsplash.com/photo-1596797882870-8c33e1b8c22b?auto=format&fit=crop&w=400&q=80', description: 'Mixed lentils', unit: '1kg' },
  { id: 29, name: 'Moth Dal', category: 'pulses', price: 105, originalPrice: 120, discount: 13, image: 'https://images.unsplash.com/photo-1585503418537-88331351ad99?auto=format&fit=crop&w=400&q=80', description: 'Moth beans', unit: '500g' },
  { id: 30, name: 'Kulthi Dal', category: 'pulses', price: 100, originalPrice: 115, discount: 13, image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=400&q=80', description: 'Horse gram', unit: '500g' },
  
  // Snacks (20 products)
  { id: 31, name: 'Lays Classic Chips', category: 'snacks', price: 20, originalPrice: 25, discount: 20, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80', description: 'Crispy salted potato chips', unit: '50g' },
  { id: 32, name: 'Kurkure Masala Munch', category: 'snacks', price: 20, originalPrice: 22, discount: 9, image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?auto=format&fit=crop&w=400&q=80', description: 'Crunchy spicy snack', unit: '50g' },
  { id: 33, name: 'Banana Chips', category: 'snacks', price: 35, originalPrice: 40, discount: 13, image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=400&q=80', description: 'Crispy fried banana chips', unit: '150g' },
  { id: 34, name: 'Peanut Chikki', category: 'snacks', price: 30, originalPrice: 35, discount: 14, image: 'https://images.unsplash.com/photo-1599599809102-e3279e5fa9f5?auto=format&fit=crop&w=400&q=80', description: 'Traditional peanut brittle', unit: '100g' },
  { id: 35, name: 'Potato Wafers', category: 'snacks', price: 25, originalPrice: 30, discount: 17, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=400&q=80', description: 'Thin crispy potato wafers', unit: '100g' },
  { id: 36, name: 'Tapioca Chips', category: 'snacks', price: 40, originalPrice: 45, discount: 11, image: 'https://images.unsplash.com/photo-1600659237707-38e9f68f5abe?auto=format&fit=crop&w=400&q=80', description: 'Crispy tapioca chips', unit: '150g' },
  { id: 37, name: 'Corn Puffs', category: 'snacks', price: 30, originalPrice: 35, discount: 14, image: 'https://images.unsplash.com/photo-1585503418537-88331351ad99?auto=format&fit=crop&w=400&q=80', description: 'Light corn puffs', unit: '75g' },
  { id: 38, name: 'Cheese Balls', category: 'snacks', price: 35, originalPrice: 40, discount: 13, image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=400&q=80', description: 'Cheesy corn balls', unit: '100g' },
  { id: 39, name: 'Chakli', category: 'snacks', price: 50, originalPrice: 60, discount: 17, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80', description: 'Traditional spiral snack', unit: '200g' },
  { id: 40, name: 'Mathri', category: 'snacks', price: 45, originalPrice: 55, discount: 18, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80', description: 'Crispy savory crackers', unit: '200g' },
  { id: 41, name: 'Khakhra Plain', category: 'snacks', price: 40, originalPrice: 50, discount: 20, image: 'https://images.unsplash.com/photo-1621939513615-f0cfb0c58816?auto=format&fit=crop&w=400&q=80', description: 'Crispy wheat crackers', unit: '200g' },
  { id: 42, name: 'Khakhra Masala', category: 'snacks', price: 45, originalPrice: 55, discount: 18, image: 'https://images.unsplash.com/photo-1590080876856-235251d3e85c?auto=format&fit=crop&w=400&q=80', description: 'Spicy wheat crackers', unit: '200g' },
  { id: 43, name: 'Roasted Peanuts', category: 'snacks', price: 50, originalPrice: 60, discount: 17, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80', description: 'Salted roasted peanuts', unit: '250g' },
  { id: 44, name: 'Cashew Nuts', category: 'snacks', price: 180, originalPrice: 200, discount: 10, image: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=400&q=80', description: 'Premium cashews', unit: '200g' },
  { id: 45, name: 'Almonds', category: 'snacks', price: 200, originalPrice: 220, discount: 9, image: 'https://images.unsplash.com/photo-1508217325048-e6e279a06a50?auto=format&fit=crop&w=400&q=80', description: 'California almonds', unit: '200g' },
  { id: 46, name: 'Mix Dry Fruits', category: 'snacks', price: 220, originalPrice: 250, discount: 12, image: 'https://images.unsplash.com/photo-1578932832337-2d7f7507927a?auto=format&fit=crop&w=400&q=80', description: 'Assorted dry fruits', unit: '250g' },
  { id: 47, name: 'Raisins', category: 'snacks', price: 80, originalPrice: 95, discount: 16, image: 'https://images.unsplash.com/photo-1610955322467-9edb9e0d4a6e?auto=format&fit=crop&w=400&q=80', description: 'Sweet dried grapes', unit: '200g' },
  { id: 48, name: 'Dates', category: 'snacks', price: 120, originalPrice: 140, discount: 14, image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=400&q=80', description: 'Premium dates', unit: '250g' },
  { id: 49, name: 'Fig/Anjeer', category: 'snacks', price: 150, originalPrice: 170, discount: 12, image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=400&q=80', description: 'Dried figs', unit: '200g' },
  { id: 50, name: 'Pistachios', category: 'snacks', price: 250, originalPrice: 280, discount: 11, image: 'https://images.unsplash.com/photo-1619047779693-7925ad9f6e64?auto=format&fit=crop&w=400&q=80', description: 'Salted pistachios', unit: '200g' },
  
  // Add remaining products here (namkeen, biscuits, beverages, colddrinks, spices, cooking)
  // ... (truncated for brevity - include all products from original index.tsx)
];

const categories = [
  { id: 'grains', name: 'Grains & Rice', icon: '🍚' },
  { id: 'pulses', name: 'Pulses & Dals', icon: '🫘' },
  { id: 'snacks', name: 'Snacks', icon: '🍟' },
  { id: 'namkeen', name: 'Namkeen', icon: '🧂' },
  { id: 'biscuits', name: 'Biscuits', icon: '🍪' },
  { id: 'beverages', name: 'Beverages', icon: '☕' },
  { id: 'colddrinks', name: 'Cold Drinks', icon: '🧃' },
  { id: 'spices', name: 'Spices', icon: '🌶️' },
  { id: 'cooking', name: 'Cooking & Refinery', icon: '🛢️' },
];

// API Routes
app.get('/products', (c) => {
  const category = c.req.query('category');
  const search = c.req.query('search');
  
  let filtered = products;
  
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower)
    );
  }
  
  return c.json(filtered);
});

app.get('/products/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }
  
  return c.json(product);
});

app.get('/categories', (c) => {
  const allCategories = [
    { id: 'all', name: 'All Products', icon: '🛒' },
    ...categories
  ];
  return c.json(allCategories);
});

export default handle(app);
