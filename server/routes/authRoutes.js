const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// DEMO MODE - Always use 123456 as OTP for testing
const DEMO_OTP = '123456';
const DEMO_MODE = true; // Set to false for production

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // Use demo OTP or generate random one
    const otp = DEMO_MODE ? DEMO_OTP : Math.floor(100000 + Math.random() * 900000).toString();
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

    // Log OTP for testing
    console.log(`OTP for ${phone}: ${otp}`);
    console.log(`💡 Demo Mode: Use OTP: ${DEMO_OTP} for any phone number`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Only include demo OTP in response for testing (remove in production)
      ...(DEMO_MODE && { demoOtp: DEMO_OTP })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // For testing, always accept demo OTP
    let isValidOtp = false;

    if (DEMO_MODE && otp === DEMO_OTP) {
      isValidOtp = true;
    } else {
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

      isValidOtp = true;

      // Clear OTP after verification
      business.otp = null;
      business.otpExpiry = null;
      await business.save();
    }

    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Get or create business for demo OTP
    let business = await Business.findOne({ vendorPhone: phone });
    if (!business && DEMO_MODE && otp === DEMO_OTP) {
      // Auto-create business for demo OTP testing
      business = await Business.create({
        vendorPhone: phone,
        otp: null,
        otpExpiry: null
      });
      console.log(`Demo: Auto-created business for ${phone}`);
    }

    // Generate simple token (in production use JWT)
    const token = Buffer.from(`${phone}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      token,
      business: {
        id: business._id,
        phone: business.vendorPhone,
        hasBusiness: !!business.businessName
      },
      ...(DEMO_MODE && { demoMode: true, message: 'Demo mode: OTP 123456 works for any number' })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Additional test endpoint to check demo status
router.get('/demo-status', (req, res) => {
  res.json({
    demoMode: DEMO_MODE,
    demoOtp: DEMO_MODE ? DEMO_OTP : null,
    message: DEMO_MODE ? `Test with any phone number using OTP: ${DEMO_OTP}` : 'Production mode'
  });
});

module.exports = router;