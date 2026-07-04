const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  websiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'general' },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 10 },
  isBestseller: { type: Boolean, default: false },
  orderCount: { type: Number, default: 0 },
  sizes: { type: [String], default: [] },
  specs: { type: String, default: '' },
  dietary: { type: [String], default: [] },
  material: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);