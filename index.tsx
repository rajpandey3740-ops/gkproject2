// @ts-nocheck
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { readFileSync } from 'fs';
import { join } from 'path';

const app = new Hono();

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
  
  // Namkeen (10 products)
  { id: 51, name: 'Haldiram Bhujia', category: 'namkeen', price: 50, originalPrice: 60, discount: 17, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80', description: 'Traditional Indian savory snack', unit: '200g' },
  { id: 52, name: 'Aloo Bhujia', category: 'namkeen', price: 45, originalPrice: 55, discount: 18, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80', description: 'Crispy potato sev', unit: '200g' },
  { id: 53, name: 'Mixture Namkeen', category: 'namkeen', price: 40, originalPrice: 50, discount: 20, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=400&q=80', description: 'Spicy mixed namkeen', unit: '200g' },
  { id: 54, name: 'Sev Bhujia', category: 'namkeen', price: 45, originalPrice: 55, discount: 18, image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', description: 'Thin crispy noodles', unit: '200g' },
  { id: 55, name: 'Moong Dal Namkeen', category: 'namkeen', price: 50, originalPrice: 60, discount: 17, image: 'https://images.unsplash.com/photo-1595855759920-86582396756e?auto=format&fit=crop&w=400&q=80', description: 'Fried moong dal', unit: '200g' },
  { id: 56, name: 'Chana Dal Namkeen', category: 'namkeen', price: 48, originalPrice: 58, discount: 17, image: 'https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&w=400&q=80', description: 'Roasted chana dal', unit: '200g' },
  { id: 57, name: 'Sing Bhujia', category: 'namkeen', price: 55, originalPrice: 65, discount: 15, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80', description: 'Peanut bhujia', unit: '200g' },
  { id: 58, name: 'Bombay Mix', category: 'namkeen', price: 45, originalPrice: 55, discount: 18, image: 'https://images.unsplash.com/photo-1596797882870-8c33e1b8c22b?auto=format&fit=crop&w=400&q=80', description: 'Mumbai style mix', unit: '200g' },
  { id: 59, name: 'Ratlami Sev', category: 'namkeen', price: 50, originalPrice: 60, discount: 17, image: 'https://images.unsplash.com/photo-1585503418537-88331351ad99?auto=format&fit=crop&w=400&q=80', description: 'Spicy Ratlam sev', unit: '200g' },
  { id: 60, name: 'Pudina Sev', category: 'namkeen', price: 48, originalPrice: 58, discount: 17, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80', description: 'Mint flavored sev', unit: '200g' },
  
  // Biscuits & Cookies (15 products)
  { id: 61, name: 'Parle-G Gold', category: 'biscuits', price: 10, originalPrice: 12, discount: 17, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', description: 'Classic glucose biscuits', unit: '100g' },
  { id: 62, name: 'Britannia Good Day', category: 'biscuits', price: 30, originalPrice: 35, discount: 14, image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=400&q=80', description: 'Butter cookies', unit: '150g' },
  { id: 63, name: 'Oreo Original', category: 'biscuits', price: 40, originalPrice: 45, discount: 11, image: 'https://images.unsplash.com/photo-1606312619070-d48b4863feab?auto=format&fit=crop&w=400&q=80', description: 'Chocolate sandwich cookies', unit: '120g' },
  { id: 64, name: 'Monaco Salted', category: 'biscuits', price: 15, originalPrice: 18, discount: 17, image: 'https://images.unsplash.com/photo-1621939513615-f0cfb0c58816?auto=format&fit=crop&w=400&q=80', description: 'Crispy salted crackers', unit: '75g' },
  { id: 65, name: 'Marie Light Biscuits', category: 'biscuits', price: 20, originalPrice: 25, discount: 20, image: 'https://images.unsplash.com/photo-1590080876856-235251d3e85c?auto=format&fit=crop&w=400&q=80', description: 'Light and crispy tea biscuits', unit: '100g' },
  { id: 66, name: 'Dark Fantasy Choco', category: 'biscuits', price: 50, originalPrice: 60, discount: 17, image: 'https://images.unsplash.com/photo-1623246123320-0d0ec1baf9b6?auto=format&fit=crop&w=400&q=80', description: 'Premium chocolate cookies', unit: '150g' },
  { id: 67, name: 'Bourbon Biscuits', category: 'biscuits', price: 35, originalPrice: 40, discount: 13, image: 'https://images.unsplash.com/photo-1600859604301-05f8f5bb2677?auto=format&fit=crop&w=400&q=80', description: 'Chocolate cream biscuits', unit: '120g' },
  { id: 68, name: 'Hide & Seek', category: 'biscuits', price: 30, originalPrice: 35, discount: 14, image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=400&q=80', description: 'Choco chip cookies', unit: '100g' },
  { id: 69, name: 'Digestive Biscuits', category: 'biscuits', price: 40, originalPrice: 45, discount: 11, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', description: 'Wholemeal digestive', unit: '150g' },
  { id: 70, name: 'Cream Crackers', category: 'biscuits', price: 25, originalPrice: 30, discount: 17, image: 'https://images.unsplash.com/photo-1590080876856-235251d3e85c?auto=format&fit=crop&w=400&q=80', description: 'Plain cream crackers', unit: '100g' },
  { id: 71, name: 'Butter Cookies', category: 'biscuits', price: 45, originalPrice: 55, discount: 18, image: 'https://images.unsplash.com/photo-1564355808900-7e807a19e27a?auto=format&fit=crop&w=400&q=80', description: 'Danish butter cookies', unit: '200g' },
  { id: 72, name: 'Oat Cookies', category: 'biscuits', price: 50, originalPrice: 60, discount: 17, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=400&q=80', description: 'Healthy oats cookies', unit: '150g' },
  { id: 73, name: 'Coconut Cookies', category: 'biscuits', price: 40, originalPrice: 48, discount: 17, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', description: 'Coconut flavored cookies', unit: '150g' },
  { id: 74, name: 'Jeera Biscuits', category: 'biscuits', price: 20, originalPrice: 25, discount: 20, image: 'https://images.unsplash.com/photo-1621939513615-f0cfb0c58816?auto=format&fit=crop&w=400&q=80', description: 'Cumin seed crackers', unit: '100g' },
  { id: 75, name: 'Rusk Toast', category: 'biscuits', price: 35, originalPrice: 40, discount: 13, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', description: 'Crispy bread rusk', unit: '200g' },
  
  // Beverages (15 products)
  { id: 76, name: 'Tata Tea Gold', category: 'beverages', price: 180, originalPrice: 200, discount: 10, image: 'https://images.unsplash.com/photo-1597318285927-2bc99bf1f0e7?auto=format&fit=crop&w=400&q=80', description: 'Premium blend tea leaves', unit: '500g' },
  { id: 77, name: 'Bru Instant Coffee', category: 'beverages', price: 220, originalPrice: 250, discount: 12, image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80', description: 'Rich instant coffee', unit: '200g' },
  { id: 78, name: 'Red Label Tea', category: 'beverages', price: 150, originalPrice: 170, discount: 12, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80', description: 'Strong blend tea', unit: '500g' },
  { id: 79, name: 'Horlicks Health Drink', category: 'beverages', price: 280, originalPrice: 320, discount: 13, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=400&q=80', description: 'Nutritious malted drink', unit: '500g' },
  { id: 80, name: 'Nestle Milo', category: 'beverages', price: 240, originalPrice: 270, discount: 11, image: 'https://images.unsplash.com/photo-1556910110-a5a63dfd393c?auto=format&fit=crop&w=400&q=80', description: 'Chocolate malt drink', unit: '400g' },
  { id: 81, name: 'Taj Mahal Tea', category: 'beverages', price: 170, originalPrice: 190, discount: 11, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=400&q=80', description: 'Premium tea blend', unit: '500g' },
  { id: 82, name: 'Nescafe Classic', category: 'beverages', price: 250, originalPrice: 280, discount: 11, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80', description: 'Pure instant coffee', unit: '200g' },
  { id: 83, name: 'Green Tea', category: 'beverages', price: 200, originalPrice: 230, discount: 13, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80', description: 'Organic green tea', unit: '100g' },
  { id: 84, name: 'Bournvita', category: 'beverages', price: 260, originalPrice: 300, discount: 13, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80', description: 'Health drink', unit: '500g' },
  { id: 85, name: 'Complan', category: 'beverages', price: 300, originalPrice: 340, discount: 12, image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=400&q=80', description: 'Nutrition drink', unit: '500g' },
  { id: 86, name: 'Boost', category: 'beverages', price: 270, originalPrice: 310, discount: 13, image: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=400&q=80', description: 'Energy drink', unit: '500g' },
  { id: 87, name: 'Masala Tea', category: 'beverages', price: 190, originalPrice: 220, discount: 14, image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80', description: 'Spiced tea blend', unit: '500g' },
  { id: 88, name: 'Ginger Tea', category: 'beverages', price: 180, originalPrice: 200, discount: 10, image: 'https://images.unsplash.com/photo-1597318285927-2bc99bf1f0e7?auto=format&fit=crop&w=400&q=80', description: 'Ginger flavored tea', unit: '500g' },
  { id: 89, name: 'Lemon Tea', category: 'beverages', price: 200, originalPrice: 230, discount: 13, image: 'https://images.unsplash.com/photo-1575487426028-aa37f76c0ca1?auto=format&fit=crop&w=400&q=80', description: 'Lemon tea bags', unit: '50 bags' },
  { id: 90, name: 'Herbal Tea', category: 'beverages', price: 220, originalPrice: 250, discount: 12, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80', description: 'Herbal tea mix', unit: '100g' },
  
  // Cold Drinks (10 products)
  { id: 91, name: 'Coca Cola (2L)', category: 'colddrinks', price: 90, originalPrice: 100, discount: 10, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80', description: 'Classic cola drink', unit: '2L' },
  { id: 92, name: 'Pepsi (2L)', category: 'colddrinks', price: 85, originalPrice: 95, discount: 11, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=400&q=80', description: 'Refreshing cola', unit: '2L' },
  { id: 93, name: 'Sprite (2L)', category: 'colddrinks', price: 85, originalPrice: 95, discount: 11, image: 'https://images.unsplash.com/photo-1625740902767-6ab8c6ad1de0?auto=format&fit=crop&w=400&q=80', description: 'Lemon lime soda', unit: '2L' },
  { id: 94, name: 'Fanta Orange (2L)', category: 'colddrinks', price: 85, originalPrice: 95, discount: 11, image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=400&q=80', description: 'Orange flavored drink', unit: '2L' },
  { id: 95, name: 'Thumbs Up (2L)', category: 'colddrinks', price: 90, originalPrice: 100, discount: 10, image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=400&q=80', description: 'Strong cola flavor', unit: '2L' },
  { id: 96, name: 'Limca (2L)', category: 'colddrinks', price: 85, originalPrice: 95, discount: 11, image: 'https://images.unsplash.com/photo-1622597467836-f3c7ca9d2d8c?auto=format&fit=crop&w=400&q=80', description: 'Lemon fresh drink', unit: '2L' },
  { id: 97, name: 'Maaza Mango (1L)', category: 'colddrinks', price: 60, originalPrice: 70, discount: 14, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80', description: 'Mango fruit drink', unit: '1L' },
  { id: 98, name: 'Frooti Mango (1L)', category: 'colddrinks', price: 55, originalPrice: 65, discount: 15, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80', description: 'Fresh mango drink', unit: '1L' },
  { id: 99, name: 'Real Juice (1L)', category: 'colddrinks', price: 80, originalPrice: 95, discount: 16, image: 'https://images.unsplash.com/photo-1622597467836-f3c7ca9d2d8c?auto=format&fit=crop&w=400&q=80', description: 'Mixed fruit juice', unit: '1L' },
  { id: 100, name: 'Tropicana Orange (1L)', category: 'colddrinks', price: 100, originalPrice: 120, discount: 17, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80', description: 'Fresh orange juice', unit: '1L' },
  
  // Spices (6 products)
  { id: 101, name: 'Rajesh Meat Masala', category: 'spices', price: 25, originalPrice: 30, discount: 17, image: 'https://images.unsplash.com/photo-1596040033229-a0b525d7c462?auto=format&fit=crop&w=400&q=80', description: 'Premium meat masala blend', unit: '50g' },
  { id: 102, name: 'Rajesh Chicken Masala', category: 'spices', price: 25, originalPrice: 30, discount: 17, image: 'https://images.unsplash.com/photo-1599909533730-f9d49be0c34f?auto=format&fit=crop&w=400&q=80', description: 'Authentic chicken masala spice', unit: '50g' },
  { id: 103, name: 'Rajesh Garam Masala', category: 'spices', price: 25, originalPrice: 30, discount: 17, image: 'https://images.unsplash.com/photo-1596040033229-a0b525d7c462?auto=format&fit=crop&w=400&q=80', description: 'Traditional garam masala blend', unit: '50g' },
  { id: 104, name: 'Rajesh Meat Masala 5 Wala', category: 'spices', price: 50, originalPrice: 60, discount: 14, image: 'https://images.unsplash.com/photo-1596040033229-a0b525d7c462?auto=format&fit=crop&w=400&q=80', description: 'Premium meat masala sachets', unit: '12 pieces' },
  { id: 105, name: 'Rajesh Chicken Masala 5 Wala', category: 'spices', price: 50, originalPrice: 60, discount: 14, image: 'https://images.unsplash.com/photo-1599909533730-f9d49be0c34f?auto=format&fit=crop&w=400&q=80', description: 'Chicken masala sachets', unit: '12 pieces' },
  { id: 106, name: 'Rajesh Chicken Masala Paach Wala', category: 'spices', price: 50, originalPrice: 60, discount: 14, image: 'https://images.unsplash.com/photo-1599909533730-f9d49be0c34f?auto=format&fit=crop&w=400&q=80', description: 'Chicken masala small sachets', unit: '12 pieces' },
  
  // Cooking & Refinery (20 products)
  { id: 107, name: 'Gulshan Oil 1 Litre Bottle', category: 'cooking', price: 180, originalPrice: 200, discount: 10, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', description: 'Premium cooking oil', unit: '1L' },
  { id: 108, name: 'Gulshan Oil 500ml Bottle', category: 'cooking', price: 95, originalPrice: 105, discount: 10, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', description: 'Premium cooking oil', unit: '500ml' },
  { id: 109, name: 'Gulshan Oil 2 Litre Jar', category: 'cooking', price: 350, originalPrice: 390, discount: 10, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', description: 'Premium cooking oil jar', unit: '2L' },
  { id: 110, name: 'Gulshan Oil 5 Litre Jar', category: 'cooking', price: 850, originalPrice: 950, discount: 11, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', description: 'Premium cooking oil jar', unit: '5L' },
  { id: 111, name: 'Gulshan Oil 15 Litre Jar', category: 'cooking', price: 2450, originalPrice: 2700, discount: 9, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', description: 'Premium cooking oil jar', unit: '15L' },
  { id: 112, name: 'Fortune Kacchi Ghani Oil 1 Litre Bottle', category: 'cooking', price: 200, originalPrice: 220, discount: 9, image: 'https://images.unsplash.com/photo-1598887142487-3c854d51c512?auto=format&fit=crop&w=400&q=80', description: 'Premium cold-pressed cooking oil', unit: '1L' },
  { id: 113, name: 'Fortune Kacchi Ghani Oil 5 Litre Jar', category: 'cooking', price: 950, originalPrice: 1050, discount: 10, image: 'https://images.unsplash.com/photo-1598887142487-3c854d51c512?auto=format&fit=crop&w=400&q=80', description: 'Premium cold-pressed cooking oil jar', unit: '5L' },
  { id: 114, name: 'Fortune Soybean Refined 1L Pouch', category: 'cooking', price: 170, originalPrice: 190, discount: 11, image: 'https://images.unsplash.com/photo-1598887142487-3c854d51c512?auto=format&fit=crop&w=400&q=80', description: 'Refined soybean oil pouch', unit: '1L' },
  { id: 115, name: 'Fortune Refined 5 Litre Jar', category: 'cooking', price: 800, originalPrice: 900, discount: 11, image: 'https://images.unsplash.com/photo-1598887142487-3c854d51c512?auto=format&fit=crop&w=400&q=80', description: 'Refined cooking oil jar', unit: '5L' },
  { id: 116, name: 'Fortune Refined 15 Litre Jar', category: 'cooking', price: 2350, originalPrice: 2600, discount: 10, image: 'https://images.unsplash.com/photo-1598887142487-3c854d51c512?auto=format&fit=crop&w=400&q=80', description: 'Refined cooking oil jar', unit: '15L' },
  { id: 117, name: 'King Refined 500ml Bottle', category: 'cooking', price: 90, originalPrice: 100, discount: 10, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', description: 'Refined cooking oil bottle', unit: '500ml' },
  { id: 118, name: 'King Refined 500ml Pouch', category: 'cooking', price: 85, originalPrice: 95, discount: 11, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', description: 'Refined cooking oil pouch', unit: '500ml' },
  { id: 119, name: 'King Refined 1 Litre Bottle', category: 'cooking', price: 175, originalPrice: 195, discount: 10, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', description: 'Refined cooking oil bottle', unit: '1L' },
  { id: 120, name: 'King Refined 1 Litre Pouch', category: 'cooking', price: 165, originalPrice: 185, discount: 11, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', description: 'Refined cooking oil pouch', unit: '1L' },
  { id: 121, name: 'Dalda Ghee 200g', category: 'cooking', price: 110, originalPrice: 125, discount: 12, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80', description: 'Premium vegetable ghee', unit: '200g' },
  { id: 122, name: 'Dalda Ghee 500g', category: 'cooking', price: 260, originalPrice: 290, discount: 10, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80', description: 'Premium vegetable ghee', unit: '500g' },
  { id: 123, name: 'Dalda Ghee 1 Litre Pouch', category: 'cooking', price: 500, originalPrice: 560, discount: 11, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80', description: 'Premium vegetable ghee pouch', unit: '1L' },
  { id: 124, name: 'Dalda Ghee 2 Litre Jar', category: 'cooking', price: 980, originalPrice: 1100, discount: 11, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80', description: 'Premium vegetable ghee jar', unit: '2L' },
  { id: 125, name: 'Dalda Ghee 5 Litre Jar', category: 'cooking', price: 2400, originalPrice: 2700, discount: 11, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80', description: 'Premium vegetable ghee jar', unit: '5L' },
  { id: 126, name: 'Dalda 15 Litre Jar', category: 'cooking', price: 7000, originalPrice: 7900, discount: 11, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80', description: 'Premium vegetable ghee jar', unit: '15L' },
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


// Serve static files
app.use('/css/*', serveStatic({ root: './' }));
app.use('/js/*', serveStatic({ root: './' }));

// Homepage route
app.get('/', (c) => {
  const html = readFileSync(join(process.cwd(), 'html', 'home.html'), 'utf-8');
  return c.html(html);
});

// API Routes
app.get('/api/products', (c) => {
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

app.get('/api/products/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }
  
  return c.json(product);
});

app.get('/api/categories', (c) => {
  const allCategories = [
    { id: 'all', name: 'All Products', icon: '🛒' },
    ...categories
  ];
  return c.json(allCategories);
});

// Login page
app.get('/login', (c) => {
  const html = readFileSync(join(process.cwd(), 'html', 'login.html'), 'utf-8');
  return c.html(html);
});

// Shop page - redirect to home for now (can be enhanced with SSR later)
app.get('/shop', (c) => {
  return c.redirect('/');
});

const port = 3001;
console.log(`🚀 Server running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
