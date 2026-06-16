require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('businesses');
    
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Drop vendorPhone_1 index if it exists
    if (indexes.some(i => i.name === 'vendorPhone_1')) {
      await collection.dropIndex('vendorPhone_1');
      console.log('Dropped old vendorPhone_1 index');
    }
    
    // Drop vendorEmail_1 index if it exists to be safe
    if (indexes.some(i => i.name === 'vendorEmail_1')) {
      await collection.dropIndex('vendorEmail_1');
      console.log('Dropped old vendorEmail_1 index');
    }

    console.log('Indexes fixed. Mongoose will rebuild them automatically on next start.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing index:', err);
    process.exit(1);
  }
}

fixIndex();
