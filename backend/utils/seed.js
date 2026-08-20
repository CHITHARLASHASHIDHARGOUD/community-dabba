const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Meal = require('../models/Meal');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/community-dabba';

const users = [
  { name: 'Admin User', email: 'admin@communitydabba.com', password: 'admin123', phone: '9999999999', role: 'admin', isVerified: true },
  { name: 'Ravi Kumar', email: 'ravi@example.com', password: 'password123', phone: '9876543210', role: 'donor', isVerified: true, location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, India' } },
  { name: 'Priya Sharma', email: 'priya@example.com', password: 'password123', phone: '9876543211', role: 'donor', isVerified: true, location: { type: 'Point', coordinates: [77.6000, 12.9800], address: 'Indiranagar, Bangalore' } },
  { name: 'Amit Singh', email: 'amit@example.com', password: 'password123', phone: '9876543212', role: 'receiver', location: { type: 'Point', coordinates: [77.5800, 12.9600], address: 'Koramangala, Bangalore' } },
  { name: 'Sneha Reddy', email: 'sneha@example.com', password: 'password123', phone: '9876543213', role: 'receiver', location: { type: 'Point', coordinates: [77.6100, 12.9900], address: 'Whitefield, Bangalore' } },
  { name: 'Community Kitchen', email: 'kitchen@example.com', password: 'password123', phone: '9876543214', role: 'donor', isVerified: true, location: { type: 'Point', coordinates: [77.5700, 12.9500], address: 'JP Nagar, Bangalore' } },
];

const meals = [
  { title: 'Homemade Veg Biryani', description: 'Freshly made Hyderabadi veg biryani with raita', category: 'biryani', quantity: '3 kg', servings: 10, foodType: 'vegetarian', dietaryInfo: ['Homemade', 'Organic'], status: 'active' },
  { title: 'Chicken Curry', description: 'Spicy homemade chicken curry', category: 'meals', quantity: '2 kg', servings: 8, foodType: 'non-vegetarian', dietaryInfo: ['Homemade'], status: 'active' },
  { title: 'Fresh Fruits Basket', description: 'Mixed fruits - bananas, apples, oranges', category: 'fruits', quantity: '5 kg', servings: 15, foodType: 'vegan', dietaryInfo: ['Organic'], status: 'active' },
  { title: 'Bread & Buns', description: 'Freshly baked bread loaves and buns', category: 'bakery', quantity: '2 kg', servings: 12, foodType: 'vegetarian', dietaryInfo: ['Fresh'], status: 'active' },
  { title: 'Vegetable Rice', description: 'Simple and nutritious vegetable rice', category: 'rice', quantity: '4 kg', servings: 12, foodType: 'vegetarian', dietaryInfo: ['Homemade'], status: 'active' },
  { title: 'Milk & Curd', description: 'Fresh milk and curd packets', category: 'dairy', quantity: '3 liters', servings: 6, foodType: 'vegetarian', status: 'active' },
  { title: 'Snack Pack', description: 'Namkeen, chips, and biscuits', category: 'snacks', quantity: '2 kg', servings: 10, foodType: 'vegetarian', status: 'active' },
  { title: 'Packed Meals', description: 'Ready-to-eat packed meals with roti and dal', category: 'packed_food', quantity: '10 packs', servings: 10, foodType: 'vegetarian', status: 'active' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Meal.deleteMany({});

    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.name} (${user.role})`);
    }

    const donors = createdUsers.filter(u => u.role === 'donor' || u.role === 'admin');

    for (let i = 0; i < meals.length; i++) {
      const donor = donors[i % donors.length];
      const now = new Date();
      const expiry = new Date(now.getTime() + (4 + i * 2) * 60 * 60 * 1000);
      await Meal.create({
        ...meals[i],
        donor: donor._id,
        location: donor.location || { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore' },
        availableUntil: expiry,
        preparedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        contactPreference: 'chat',
      });
      console.log(`Created meal: ${meals[i].title}`);
    }

    console.log('\nSeed completed!');
    console.log('Admin login: admin@communitydabba.com / admin123');
    console.log('Donor login: ravi@example.com / password123');
    console.log('Receiver login: amit@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
