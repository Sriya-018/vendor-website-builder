const mongoose = require('mongoose');
const Website = require('./models/Website');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor-website-builder')
.then(async () => {
  console.log('Connected to DB');
  
  const websites = await Website.find({});
  let updatedCount = 0;
  
  for (let site of websites) {
    if (site.designConfig && site.designConfig.navbar && site.designConfig.navbar.logoText) {
      if (site.designConfig.navbar.logoText === site.storeName) {
        site.designConfig.navbar.logoText = '';
        await site.save();
        updatedCount++;
      }
    }
  }
  
  console.log(`Reset logoText for ${updatedCount} websites`);
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
