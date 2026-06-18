require('dotenv').config();
const mongoose = require('mongoose');
const Website = require('./models/Website');
const Business = require('./models/Business');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for slug migration');

    const websites = await Website.find().populate('businessId');
    let updatedCount = 0;

    for (const website of websites) {
      if (!website.businessId) continue;
      
      const business = website.businessId;
      const bNameStr = website.storeInfo?.businessName || business.businessName || 'store';
      const sNameStr = website.storeName || '';
      
      const bName = bNameStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const sName = sNameStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      let baseSlug = [bName, sName].filter(Boolean).join('-');
      if (!baseSlug) baseSlug = 'store';
      
      // Preserve the old suffix to maintain some identity (it's the last 9 characters: -xxxx-yyyy)
      // Actually, wait, old slug might be: maskm-41b5-zk7h
      // We can just extract the existing suffix to avoid creating entirely new random links if possible
      const parts = website.slug.split('-');
      let suffix = '';
      if (parts.length >= 3) {
        // usually it's base-id-random
        suffix = parts.slice(-2).join('-');
      } else {
        const randomStr = Math.random().toString(36).substring(2, 6);
        suffix = `${business._id.toString().slice(-4)}-${randomStr}`;
      }
      
      const newSlug = `${baseSlug}-${suffix}`;
      
      if (website.slug !== newSlug) {
        website.slug = newSlug;
        await website.save();
        updatedCount++;
        console.log(`Updated slug to: ${newSlug}`);
      }
    }

    console.log(`Slug migration complete! Updated ${updatedCount} websites.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
