const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  type: { 
    type: String, 
    enum: ['shop_front', 'product', 'owner', 'price_list', 'gallery'],
    default: 'gallery'
  },
  url: { type: String, required: true },
  cloudinaryId: { type: String },
  enhanced: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', PhotoSchema);