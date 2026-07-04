const mongoose = require('mongoose');
const Order = require('./models/Order');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/vendor-website');
  console.log('Connected');

  const orders = await Order.find({ 'items.name': /vitamin/i });
  console.log(`Found ${orders.length} orders matching "vitamin":`);
  console.log(JSON.stringify(orders, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
