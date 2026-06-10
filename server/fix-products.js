const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = require('./models/Product');
  const Website = require('./models/Website');
  
  const products = await Product.find({ websiteId: { $exists: false } });
  console.log(`Found ${products.length} products without websiteId`);
  
  const websites = await Website.find();
  
  for (const product of products) {
    const productTime = product._id.getTimestamp().getTime();
    
    // Find website created closest to product creation time
    let closestWebsite = null;
    let minDiff = Infinity;
    
    for (const website of websites) {
      const diff = Math.abs(website._id.getTimestamp().getTime() - productTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestWebsite = website;
      }
    }
    
    if (closestWebsite && minDiff < 60000) { // within 60 seconds
      console.log(`Matching product '${product.name}' to website '${closestWebsite.slug}' (Diff: ${minDiff}ms)`);
      product.websiteId = closestWebsite._id;
      await product.save();
    } else if (closestWebsite) {
      console.log(`Closest match for '${product.name}' is '${closestWebsite.slug}' but diff is ${minDiff}ms (Too large)`);
    } else {
      console.log(`No websites found for product '${product.name}'`);
    }
  }
  
  console.log("Done");
  process.exit(0);
}
run().catch(console.error);
