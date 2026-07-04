const mongoose = require('mongoose');
const Product = require('./models/Product');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/vendor-website');
  console.log('Connected');

  const products = await Product.find();
  console.log('PRODUCTS:');
  products.forEach(p => console.log(`- ID: ${p._id}, Name: "${p.name}", orderCount: ${p.orderCount}, isBestseller: ${p.isBestseller}, websiteId: ${p.websiteId}`));

  await mongoose.disconnect();
}

run().catch(console.error);
