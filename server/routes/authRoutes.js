const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const nodemailer = require('nodemailer');

// DEMO MODE - Always use 123456 as OTP for testing (only applies to phone numbers)
const DEMO_OTP = '123456';
const DEMO_MODE = true; // Set to false for production

// Email Transporter Configuration
let transporter;

async function initEmail() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('✅ Real Gmail SMTP configured.');
  } else {
    console.log('⚠️ No Gmail credentials found. Generating a free Ethereal Test Email account automatically...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('✅ Ethereal Test Email configured successfully!');
  }
}

initEmail();

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Phone or email is required' });
    }

    // Use demo OTP for phone/email if DEMO_MODE is true (and no email credentials for email)
    const isPhoneDemo = phone && DEMO_MODE;
    const isEmailDemo = email && DEMO_MODE && !process.env.EMAIL_USER;
    const isDemo = isPhoneDemo || isEmailDemo;

    const otp = isDemo ? DEMO_OTP : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let query = phone ? { vendorPhone: phone } : { vendorEmail: email };
    let business = await Business.findOne(query);

    if (business) {
      business.otp = otp;
      business.otpExpiry = otpExpiry;
      await business.save();
    } else {
      business = await Business.create({
        ...(phone && { vendorPhone: phone }),
        ...(email && { vendorEmail: email }),
        otp: otp,
        otpExpiry: otpExpiry
      });
    }

    if (email && !isEmailDemo) {
      if (!transporter) {
        return res.status(500).json({ success: false, message: 'Email service is still initializing. Please try again in a moment.' });
      }

      // Send real email OTP (or Ethereal mock)
      try {
        const info = await transporter.sendMail({
          from: `"VendorBuild" <noreply@vendorbuild.com>`,
          to: email,
          subject: "Your VendorBuild Login OTP",
          text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
              <h2>Welcome to VendorBuild!</h2>
              <p>Your login verification code is:</p>
              <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
              <p>This code will expire in 10 minutes.</p>
            </div>
          `
        });
        
        if (!process.env.EMAIL_USER) {
          console.log(`\n📧 ETHEREAL EMAIL SENT!`);
          console.log(`View your email here: ${nodemailer.getTestMessageUrl(info)}\n`);
        } else {
          console.log(`Real email OTP sent to ${email}`);
        }
        
      } catch (mailErr) {
        console.error('Failed to send email:', mailErr);
        return res.status(500).json({ success: false, message: 'Failed to send email OTP. Check SMTP settings.' });
      }
    } else {
      // Phone/Email mock logic
      console.log(`Demo OTP generated for ${phone || email}: ${otp}`);
      console.log(`💡 Demo Mode: Use OTP: ${DEMO_OTP}`);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Only include demo OTP in response for testing
      ...(isDemo && { demoOtp: DEMO_OTP })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, email, otp } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Phone or email is required' });
    }

    let query = phone ? { vendorPhone: phone } : { vendorEmail: email };
    let isValidOtp = false;

    const isPhoneDemo = phone && DEMO_MODE;
    const isEmailDemo = email && DEMO_MODE && !process.env.EMAIL_USER;
    const isDemo = isPhoneDemo || isEmailDemo;

    // For testing, always accept demo OTP
    if (isDemo && otp === DEMO_OTP) {
      isValidOtp = true;
    } else {
      const business = await Business.findOne(query);

      if (!business) {
        return res.status(404).json({ success: false, message: 'Account not found' });
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
    let business = await Business.findOne(query);
    if (!business && isDemo && otp === DEMO_OTP) {
      business = await Business.create({
        ...(phone && { vendorPhone: phone }),
        ...(email && { vendorEmail: email }),
        otp: null,
        otpExpiry: null
      });
      console.log(`Demo: Auto-created business for ${phone || email}`);
    }

    const tokenPayload = phone ? phone : email;
    // Generate simple token (in production use JWT)
    const token = Buffer.from(`${tokenPayload}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      token,
      business: {
        id: business._id,
        phone: business.vendorPhone,
        email: business.vendorEmail,
        hasBusiness: !!business.businessName
      },
      ...(isDemo && { demoMode: true, message: 'Demo mode: OTP 123456 works for any input' })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;