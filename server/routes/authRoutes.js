const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const nodemailer = require('nodemailer');
const axios = require('axios');

// DEMO MODE - Change to false when you want real SMS to send!
const DEMO_MODE = false; 
const DEMO_OTP = '1234';

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

// MessageCentral Token Management
let messageCentralToken = null;

async function getMessageCentralToken() {
  if (messageCentralToken) return messageCentralToken;
  try {
    const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;
    const password = process.env.MESSAGE_CENTRAL_PASSWORD;
    
    if (!customerId || !password) {
      console.warn("⚠️ MESSAGE_CENTRAL_CUSTOMER_ID or MESSAGE_CENTRAL_PASSWORD missing from .env");
      return null;
    }
    
    // The password must be base64 encoded for the API request
    const key = Buffer.from(password).toString('base64');
    
    console.log('Fetching MessageCentral Auth Token...');
    const response = await axios.get(`https://cpaas.messagecentral.com/auth/v1/authentication/token?customerId=${customerId}&key=${key}&scope=NEW`);
    
    if (response.data && response.data.status === 200) {
      messageCentralToken = response.data.token;
      return messageCentralToken;
    } else {
      console.error('Failed to authenticate with MessageCentral:', response.data);
    }
  } catch (err) {
    console.error('Error getting MessageCentral token:', err.response?.data || err.message);
  }
  return null;
}

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Phone or email is required' });
    }

    const isPhoneDemo = phone && DEMO_MODE;
    const isEmailDemo = email && DEMO_MODE && !process.env.EMAIL_USER;
    const isDemo = isPhoneDemo || isEmailDemo;

    const otp = isDemo ? DEMO_OTP : Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let query = phone ? { vendorPhone: phone } : { vendorEmail: email };
    let business = await Business.findOne(query);

    // REAL SMS FLOW via MessageCentral
    if (phone && !isPhoneDemo) {
      try {
        console.log(`Sending real SMS via MessageCentral to ${phone}...`);
        
        const token = await getMessageCentralToken();
        if (!token) {
           return res.status(500).json({ success: false, message: 'MessageCentral API keys missing or invalid in .env' });
        }

        const cleanPhone = phone.replace(/^\+?91/, '');
        const mcResponse = await axios.post(`https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&flowType=SMS&mobileNumber=${cleanPhone}`, null, {
          headers: { 'authToken': token }
        });
        
        if (mcResponse.data.responseCode !== 200) {
           console.error("MessageCentral response error:", mcResponse.data);
           return res.status(500).json({ success: false, message: mcResponse.data.message || 'Failed to send OTP' });
        }
        
        const verificationId = mcResponse.data.data.verificationId;
        console.log(`✅ MessageCentral SMS Sent! Verification ID: ${verificationId}`);

        if (business) {
          business.messageCentralVerificationId = verificationId;
          await business.save();
        } else {
          business = await Business.create({
            vendorPhone: phone,
            messageCentralVerificationId: verificationId
          });
        }
        
      } catch (mcError) {
        console.error('MessageCentral Send Error:', mcError.response?.data || mcError.message);
        return res.status(500).json({ success: false, message: 'Failed to send SMS OTP via MessageCentral.' });
      }
    } else {
      // EMAIL OR DEMO FLOW
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
          return res.status(500).json({ success: false, message: 'Email service is still initializing.' });
        }
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
            console.log(`\n📧 ETHEREAL EMAIL SENT! View here: ${nodemailer.getTestMessageUrl(info)}\n`);
          } else {
            console.log(`Real email OTP sent to ${email}`);
          }
        } catch (mailErr) {
          console.error('Failed to send email:', mailErr);
          return res.status(500).json({ success: false, message: 'Failed to send email OTP.' });
        }
      } else {
        console.log(`Demo OTP generated for ${phone || email}: ${otp}`);
        console.log(`💡 Demo Mode: Use OTP: ${DEMO_OTP}`);
      }
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
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

    let business = await Business.findOne(query);

    // For testing, always accept demo OTP
    if (isDemo && otp === DEMO_OTP) {
      isValidOtp = true;
    } else {
      if (!business) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }

      // REAL SMS VERIFY FLOW via MessageCentral
      if (phone && !isPhoneDemo) {
        try {
          console.log(`Verifying MessageCentral OTP for ${phone}...`);
          
          const token = await getMessageCentralToken();
          if (!token) return res.status(500).json({ success: false, message: 'MessageCentral API keys missing' });

          if (!business.messageCentralVerificationId) {
             return res.status(400).json({ success: false, message: 'No active OTP request found. Please request a new OTP.' });
          }

          const mcResponse = await axios.get(`https://cpaas.messagecentral.com/verification/v3/validateOtp?verificationId=${business.messageCentralVerificationId}&code=${otp}`, {
            headers: { 'authToken': token }
          });
          
          if (mcResponse.data.responseCode !== 200) {
            console.error("MessageCentral validation failed:", mcResponse.data);
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
          }
          
          console.log(`✅ MessageCentral OTP Verified Successfully!`);
          isValidOtp = true;
          business.messageCentralVerificationId = null; // Clear it after success
          await business.save();
          
        } catch (mcError) {
          console.error('MessageCentral Verify Error:', mcError.response?.data || mcError.message);
          return res.status(500).json({ success: false, message: 'Failed to verify SMS OTP via MessageCentral.' });
        }
      } else {
        // EMAIL / DEMO FLOW Verification
        if (business.otp !== otp) {
          return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        if (business.otpExpiry < new Date()) {
          return res.status(400).json({ success: false, message: 'OTP expired' });
        }
        isValidOtp = true;
        business.otp = null;
        business.otpExpiry = null;
        await business.save();
      }
    }

    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Get or create business for demo OTP if it didn't exist
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
      ...(isDemo && { demoMode: true, message: 'Demo mode active' })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;