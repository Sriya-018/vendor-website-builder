const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  storeName: { type: String },
  template: { type: String, default: 'default' },
  theme: {
    primaryColor: { type: String, default: '#4CAF50' },
    secondaryColor: { type: String, default: '#FF9800' },
    backgroundColor: { type: String, default: '#FFFFFF' }
  },
  sections: {
    hero: { type: Boolean, default: true },
    services: { type: Boolean, default: true },
    products: { type: Boolean, default: false },
    gallery: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
    map: { type: Boolean, default: true }
  },
  html: { type: String, default: '' },
  css: { type: String, default: '' },
  slug: { type: String, unique: true },
  published: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  viewsByRegion: [{
    regionName: { type: String },
    views: { type: Number, default: 0 }
  }],
  designConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  storeInfo: {
    businessName: { type: String },
    logo: { type: String },
    description: { type: String },
    category: { type: String },
    contact: {
      phone: { type: String },
      email: { type: String }
    },
    location: {
      address: { type: String }
    },
    socialMedia: {
      instagram: { type: String },
      facebook: { type: String },
      twitter: { type: String },
      whatsapp: { type: String }
    },
    paymentInfo: {
      upiId: { type: String },
      bankDetails: { type: String },
      instructions: { type: String }
    }
  },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: { type: String, default: '' }
  },
  designHistory: [{
    config: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Website', WebsiteSchema);