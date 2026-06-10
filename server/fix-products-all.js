const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = require('./models/Product');
  const Website = require('./models/Website');
  
  const products = await Product.find({ websiteId: { $exists: false } });
  console.log(`Found ${products.length} products without websiteId`);
  
  for (const product of products) {
    // find the first created website for this business
    const websites = await Website.find({ businessId: product.businessId }).sort({ createdAt: 1 });
    
    if (websites.length > 0) {
      const firstWebsite = websites[0];
      console.log(`Assigning '${product.name}' to the first website '${firstWebsite.slug}'`);
      product.websiteId = firstWebsite._id;
      await product.save();
    } else {
      console.log(`No websites found for product '${product.name}'`);
    }
  }
  
  console.log("Done");
  process.exit(0);
}
run().catch(console.error);
