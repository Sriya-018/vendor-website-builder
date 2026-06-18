require('dotenv').config();
const mongoose = require('mongoose');
const Website = require('./models/Website');
const Business = require('./models/Business');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const websites = await Website.find().populate('businessId');
    let updatedCount = 0;

    for (const website of websites) {
      if (!website.businessId) continue;
      
      const business = website.businessId;
      let needsUpdate = false;
      const newStoreInfo = website.storeInfo ? website.storeInfo.toObject() : {};

      // We only backfill if the storeInfo field doesn't already have an explicit value
      if (!newStoreInfo.businessName && business.businessName) { newStoreInfo.businessName = business.businessName; needsUpdate = true; }
      if (!newStoreInfo.description && business.description) { newStoreInfo.description = business.description; needsUpdate = true; }
      if (!newStoreInfo.category && business.category) { newStoreInfo.category = business.category; needsUpdate = true; }
      
      if (!newStoreInfo.contact) newStoreInfo.contact = {};
      if (!newStoreInfo.contact.phone && business.contact?.phone) { newStoreInfo.contact.phone = business.contact.phone; needsUpdate = true; }
      if (!newStoreInfo.contact.email && business.contact?.email) { newStoreInfo.contact.email = business.contact.email; needsUpdate = true; }
      
      if (!newStoreInfo.location) newStoreInfo.location = {};
      if (!newStoreInfo.location.address && business.location?.address) { newStoreInfo.location.address = business.location.address; needsUpdate = true; }

      if (needsUpdate) {
        website.storeInfo = newStoreInfo;
        website.markModified('storeInfo');
        await website.save();
        updatedCount++;
        console.log(`Updated website: ${website.slug}`);
      }
    }

    console.log(`Migration complete! Updated ${updatedCount} websites.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
