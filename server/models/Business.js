const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  vendorPhone: { type: String, sparse: true, unique: true },
  vendorEmail: { type: String, sparse: true, unique: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  businessName: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['restaurant', 'tailor', 'grocery', 'salon', 'mechanic', 'home_service', 'tea_shop', 'stationery', 'clinic', 'other'],
    default: 'other'
  },
  location: {
    address: { type: String, default: '' },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    landmark: { type: String, default: '' }
  },
  contact: {
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  paymentInfo: {
    upiId: { type: String, default: '' },
    bankDetails: { type: String, default: '' },
    instructions: { type: String, default: '' }
  },
  services: [{ type: String }],
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isClosed: { type: Boolean, default: false },
  shopHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '21:00' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', BusinessSchema);