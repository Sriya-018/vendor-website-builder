const mongoose = require('mongoose');
const Website = require('../server/models/Website');

mongoose.connect('mongodb://127.0.0.1:27017/vendor_website_builder')
  .then(async () => {
    console.log('Connected to DB');
    
    // Find all websites where theme.primary is the default blue
    const websites = await Website.find({ 'config.theme.primary': '#2563eb' });
    
    console.log(`Found ${websites.length} websites with default blue theme.`);
    
    for (const w of websites) {
      // Clear the theme object so it uses template defaults
      w.config.theme = undefined;
      await w.save();
      console.log(`Cleared theme for website ${w._id}`);
    }
    
    mongoose.disconnect();
    console.log('Done.');
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
