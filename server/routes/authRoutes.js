const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let business = await Business.findOne({ vendorPhone: phone });
    
    if (business) {
      business.otp = otp;
      business.otpExpiry = otpExpiry;
      await business.save();
    } else {
      business = await Business.create({
        vendorPhone: phone,
        otp: otp,
        otpExpiry: otpExpiry
      });
    }

    // In production, send via SMS
    console.log(`OTP for ${phone}: ${otp}`);
    
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    const business = await Business.findOne({ vendorPhone: phone });
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    if (business.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    if (business.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    
    // Clear OTP after verification
    business.otp = null;
    business.otpExpiry = null;
    await business.save();
    
    // Generate simple token (in production use JWT)
    const token = Buffer.from(`${phone}:${Date.now()}`).toString('base64');
    
    res.json({ 
      success: true, 
      token,
      business: {
        id: business._id,
        phone: business.vendorPhone,
        hasBusiness: !!business.businessName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;