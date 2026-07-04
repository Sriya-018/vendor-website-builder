const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');
const Website = require('../models/Website');
const Business = require('../models/Business');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Scrape and recommend template, details and products
router.post('/scrape-and-recommend', async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // Prefix protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 8000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Clean up unnecessary tags
    $('script, style, nav, footer, header, noscript, iframe').remove();
    const rawText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 10000);

    if (!rawText) {
      return res.status(400).json({ error: 'No readable text content found on this page' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Re-load the html with cheerio to get full document (since elements were removed from $)
      const full$ = cheerio.load(html);

      // 1. Extract Business Name
      let businessName = '';
      businessName = full$('meta[property="og:site_name"]').attr('content') || 
                     full$('meta[name="application-name"]').attr('content') || '';
      
      if (!businessName) {
        const titleText = full$('title').text().trim();
        if (titleText) {
          const parts = titleText.split(/[-|•—]/);
          businessName = parts[0].trim();
        }
      }
      
      if (!businessName) {
        businessName = full$('h1').first().text().trim();
      }
      
      if (!businessName) {
        businessName = 'Scraped Store';
      }

      if (businessName.length > 50) {
        businessName = businessName.slice(0, 47) + '...';
      }

      // 2. Extract Description/Tagline
      let description = full$('meta[name="description"]').attr('content') || 
                        full$('meta[property="og:description"]').attr('content') || '';
      
      if (!description) {
        const firstP = full$('p').first().text().trim();
        if (firstP && firstP.length > 20 && firstP.length < 200) {
          description = firstP;
        } else {
          description = `Welcome to our custom store. Discover our premium collections and services!`;
        }
      }

      // 3. Extract Contact Details using regex
      const textToSearch = full$('body').text();
      
      // Email regex
      const emailMatch = textToSearch.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
      const email = emailMatch ? emailMatch[0] : 'hello@' + businessName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';

      // Phone regex
      const phoneMatch = textToSearch.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91\s?\d{10}|\b\d{10}\b/);
      const phone = phoneMatch ? phoneMatch[0].trim() : '9876543210';

      // Location address
      let address = '';
      const addressMeta = full$('meta[property="business:contact_data:street_address"]').attr('content');
      if (addressMeta) {
        address = addressMeta;
      } else {
        const footerText = full$('footer').text().trim();
        const addressMatch = footerText.match(/(?:address|location|visit us|street|road|city|state|pincode|zipcode)\b.*?[0-9]{5,6}/gi);
        if (addressMatch) {
          address = addressMatch[0].replace(/\s+/g, ' ').trim().slice(0, 100);
        } else {
          address = 'Main Street, City Center';
        }
      }

      // 4. Category & Template Detection
      const lowerText = textToSearch.toLowerCase() + ' ' + url.toLowerCase();
      let recommendedTemplate = 'grocery'; // fallback default

      const isFlorist = lowerText.includes('flower') || lowerText.includes('florist') || lowerText.includes('bouquet') || lowerText.includes('blossom') || lowerText.includes('rose') || lowerText.includes('lily');

      if (lowerText.includes('restaurant') || lowerText.includes('food') || lowerText.includes('menu') || lowerText.includes('dine') || lowerText.includes('cuisine') || lowerText.includes('delicacy') || lowerText.includes('dish') || lowerText.includes('baking') || lowerText.includes('bakery')) {
        recommendedTemplate = 'restaurant';
      } else if (lowerText.includes('tailor') || lowerText.includes('boutique') || lowerText.includes('fashion') || lowerText.includes('clothing') || lowerText.includes('apparel') || lowerText.includes('wear') || lowerText.includes('suit') || lowerText.includes('dress')) {
        recommendedTemplate = 'tailor';
      } else if (lowerText.includes('salon') || lowerText.includes('spa') || lowerText.includes('beauty') || lowerText.includes('hair') || lowerText.includes('makeup') || lowerText.includes('nail') || lowerText.includes('parlor') || lowerText.includes('wellness')) {
        recommendedTemplate = 'salon';
      } else if (lowerText.includes('mechanic') || lowerText.includes('car') || lowerText.includes('auto') || lowerText.includes('repair') || lowerText.includes('garage') || lowerText.includes('wheel') || lowerText.includes('brake') || lowerText.includes('vehicle')) {
        recommendedTemplate = 'mechanic';
      } else if (lowerText.includes('tea') || lowerText.includes('coffee') || lowerText.includes('cafe') || lowerText.includes('bistro') || lowerText.includes('brew')) {
        recommendedTemplate = 'tea_shop';
      } else if (isFlorist || lowerText.includes('grocery') || lowerText.includes('supermarket') || lowerText.includes('fruit') || lowerText.includes('vegetable') || lowerText.includes('organic')) {
        recommendedTemplate = 'grocery';
      }

      // 5. Product Extraction / Generation
      let extractedProducts = [];

      // Try parsing JSON-LD product data
      full$('script[type="application/ld+json"]').each((_, elem) => {
        try {
          const json = JSON.parse(full$(elem).html());
          const parseNode = (node) => {
            if (!node) return;
            if (node['@type'] === 'Product' || node.type === 'Product') {
              const name = node.name || '';
              const desc = node.description || '';
              let price = 99;
              if (node.offers) {
                const offersObj = Array.isArray(node.offers) ? node.offers[0] : node.offers;
                price = parseFloat(offersObj.price) || parseFloat(offersObj.lowPrice) || 99;
              }
              if (name && extractedProducts.length < 4) {
                extractedProducts.push({ name, price, description: desc.slice(0, 150) || 'Premium product from store.' });
              }
            }
            if (node['@graph'] && Array.isArray(node['@graph'])) {
              node['@graph'].forEach(parseNode);
            }
          };
          parseNode(json);
        } catch (e) {}
      });

      // Generate context-matching fallback products if we didn't extract enough
      if (extractedProducts.length < 2) {
        if (isFlorist) {
          extractedProducts = [
            { name: 'Red Roses Elegant Bouquet', price: 799, description: 'A beautiful arrangement of hand-picked long-stemmed fresh red roses wrapped elegantly.' },
            { name: 'Pure White Lilies Bunch', price: 999, description: 'Exquisite fresh white lilies matched with rich seasonal foliage, perfect for tables and gifts.' },
            { name: 'Assorted Carnations Gift Box', price: 649, description: 'A mixed color box of fresh carnations designed to bring joy and color to any room.' },
            { name: 'Purple Orchids Premium Vase', price: 1200, description: 'Long-lasting premium purple orchids styled inside a tall sleek clear glass vase.' }
          ];
        } else {
          switch (recommendedTemplate) {
            case 'restaurant':
              extractedProducts = [
                { name: 'Signature Butter Chicken', price: 380, description: 'Succulent chicken cooked in a rich, buttery, spiced tomato gravy. Serves 1-2.' },
                { name: 'Paneer Tikka Sizzler', price: 320, description: 'Grilled spiced cottage cheese cubes served on a sizzling hot plate with onions and mint chutney.' },
                { name: 'Dum Veg Biryani', price: 280, description: 'Fragrant long-grain basmati rice cooked slowly with layered spiced vegetables and saffron.' },
                { name: 'Hot Fudge Brownie', price: 190, description: 'Warm gooey chocolate brownie topped with chocolate fudge sauce and vanilla bean ice cream.' }
              ];
              break;
            case 'salon':
              extractedProducts = [
                { name: 'Hair Cut & Style Consultation', price: 500, description: 'Professional haircut, refreshing wash, head massage, and blowout style by senior stylist.' },
                { name: 'Detoxifying Facial Spa', price: 1200, description: 'Deep cleansing, exfoliation, face massage, and nourishing cream mask for bright, glowing skin.' },
                { name: 'Classic Pedicure & Manicure', price: 850, description: 'Soothing organic scrub, nail trimming, shaping, cuticle care, and nourishing lotion massage.' },
                { name: 'Smoothing Keratin Treatment', price: 2500, description: 'Hair repair treatment that eliminates frizz, restores shine, and smooths split ends.' }
              ];
              break;
            case 'mechanic':
              extractedProducts = [
                { name: 'Full Engine Oil Service', price: 1800, description: 'Engine oil replacement, oil filter change, fluid top-up, and 20-point safety check.' },
                { name: 'Laser Wheel Alignment', price: 750, description: 'Precision laser wheel alignment and balancing for smooth driving and tires longevity.' },
                { name: 'Front Brake Pads Install', price: 2200, description: 'Replacement of worn front brake pads with premium quality parts and rotor inspection.' },
                { name: 'Car AC Gas Top-up', price: 1200, description: 'AC system pressure test, leak check, and eco-friendly refrigerant gas top-up.' }
              ];
              break;
            case 'tailor':
              extractedProducts = [
                { name: 'Bespoke Suit Stitching', price: 5000, description: 'Premium custom-tailored two-piece suit with high-grade interlining, collar and cuff choices.' },
                { name: 'Custom Fitted Dress Shirt', price: 800, description: 'Fine custom shirt stitched to your exact body shape with choice of collar and pocket styles.' },
                { name: 'Tailored Trousers / Pants', price: 700, description: 'Stitching of formal or casual pants with customizable fit, cuffs, and pocket depths.' },
                { name: 'Premium Dress Alterations', price: 350, description: 'Resizing, sleeve alterations, hemming, or fitting modifications for premium garments.' }
              ];
              break;
            case 'tea_shop':
              extractedProducts = [
                { name: 'Masala Chai Pot', price: 90, description: 'Traditional milk tea infused with cardamom, cloves, cinnamon, and fresh ginger. Serves 2.' },
                { name: 'Aromatic Filter Coffee', price: 50, description: 'Freshly brewed strong South Indian chicory-blend coffee served in traditional brass container.' },
                { name: 'Whole Leaf Green Tea', price: 80, description: 'Light, antioxidant-rich green tea leaves brewed to a clean, refreshing golden infusion.' },
                { name: 'Butter Croissant Basket', price: 120, description: 'Golden flaky pastries baked fresh daily, served warm with mixed fruit jam and butter.' }
              ];
              break;
            case 'grocery':
            default:
              extractedProducts = [
                { name: 'Premium Organic Apples (1kg)', price: 180, description: 'Crisp, sweet, naturally grown red organic apples imported from premium orchards.' },
                { name: 'Fresh Whole Wheat Bread', price: 45, description: 'Freshly baked whole wheat sliced loaf, rich in fiber with no artificial preservatives.' },
                { name: 'Organic Honey Jar (250g)', price: 250, description: '100% pure, raw, unfiltered forest honey collected ethically from natural beehives.' },
                { name: 'Farm Fresh Milk (1L)', price: 68, description: 'Pasteurized homogenized full-cream cow milk sourced directly from local organic farms.' }
              ];
              break;
          }
        }
      }

      return res.json({
        recommendedTemplate,
        business: {
          businessName,
          description,
          phone,
          email,
          address
        },
        extractedProducts
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const prompt = `You are an expert website builder assistant for "VendorBuild".
Analyze the text content scraped from a business webpage:
"${rawText}"

Based on the context, extract and recommend:
1. A template category from this exact list: 'restaurant', 'tailor', 'grocery', 'salon', 'mechanic', 'tea_shop'.
2. The business information (businessName, a short description, phone number, email address, physical location address).
3. A list of up to 4 actual products or services they offer, including their name, price (as a number), and description. If prices are not explicitly mentioned in the text, guess realistic prices based on their industry.

Return ONLY a valid JSON object (no markdown blocks, no other text) following this exact schema:
{
  "recommendedTemplate": "restaurant/tailor/grocery/salon/mechanic/tea_shop",
  "business": {
    "businessName": "Extracted Business Name",
    "description": "Extracted Short Description",
    "phone": "Extracted Phone",
    "email": "Extracted Email",
    "address": "Extracted Address"
  },
  "extractedProducts": [
    { "name": "Product Name", "price": 99, "description": "Product Description" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const resText = result.response.text();
    const jsonMatch = resText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : resText;
    const extractedData = JSON.parse(cleanJson);

    res.json(extractedData);
  } catch (error) {
    console.error('Scrape and recommend error:', error);
    res.status(500).json({ error: error.message || 'Failed to scrape and process the URL.' });
  }
});

// Extract business info from voice/text
router.post('/extract-business', async (req, res) => {
  try {
    const { text } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        businessName: extractNameFromText(text),
        category: detectCategory(text),
        location: extractLocation(text),
        services: extractServices(text),
        description: text,
        phone: extractPhoneNumber(text),
        email: extractEmail(text)
      });
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const prompt = `Extract business information from: "${text}"
    Return ONLY JSON: {"businessName": "", "category": "restaurant/tailor/grocery/salon/mechanic/home_service", "location": "", "services": [], "description": "", "phone": "", "email": ""}`;
    const result = await model.generateContent(prompt);
    let responseText = response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    const businessData = JSON.parse(cleanJson);
    res.json(businessData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract product info from voice/text
router.post('/extract-product', async (req, res) => {
  try {
    const { text } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        name: "Voice Product",
        price: "99",
        category: "General",
        description: text
      });
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const prompt = `Extract product information from the following text: "${text}"
    Return ONLY valid JSON with this exact structure: {"name": "", "price": "", "category": "", "description": ""}. Ensure price is just a number string without currency symbols.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    const productData = JSON.parse(cleanJson);
    res.json(productData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// General AI Chatbot for Website Building Assistant
router.post('/chat', async (req, res) => {
  try {
    const { messages, storeContext, businessId } = req.body;
    const latestMessage = messages[messages.length - 1].text;

    // Fetch existing websites context for this businessId
    let userWebsites = [];
    let websitesCount = 0;
    if (businessId) {
      try {
        userWebsites = await Website.find({ businessId });
        websitesCount = userWebsites.length;
      } catch (dbErr) {
        console.error('Failed to query user websites in chat:', dbErr);
      }
    }

    // Detect URL in the message
    const urlRegex = /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
    const urlMatch = latestMessage.match(urlRegex);
    let scrapedUrl = '';
    let scrapedContent = '';
    let scrapedTitle = '';
    let html = '';

    if (urlMatch) {
      let matchedUrl = urlMatch[0];
      if (/\.[a-z]{2,6}/i.test(matchedUrl)) {
        if (!/^https?:\/\//i.test(matchedUrl)) {
          matchedUrl = 'https://' + matchedUrl;
        }
        scrapedUrl = matchedUrl;
        try {
          const fetchRes = await axios.get(matchedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 6000
          });
          html = fetchRes.data;
          const $ = cheerio.load(html);
          scrapedTitle = $('title').text().trim();
          $('script, style, nav, footer, header, noscript, iframe').remove();
          scrapedContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 6000);
        } catch (err) {
          console.error('Chat URL scrape error:', err.message);
        }
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      if (scrapedUrl && html) {
        const full$ = cheerio.load(html);
        let businessName = '';
        businessName = full$('meta[property="og:site_name"]').attr('content') || 
                       full$('meta[name="application-name"]').attr('content') || '';
        if (!businessName) {
          if (scrapedTitle) {
            const parts = scrapedTitle.split(/[-|•—]/);
            businessName = parts[0].trim();
          }
        }
        if (!businessName) {
          businessName = full$('h1').first().text().trim();
        }
        if (!businessName) {
          businessName = 'Scraped Store';
        }
        if (businessName.length > 50) {
          businessName = businessName.slice(0, 47) + '...';
        }

        let description = full$('meta[name="description"]').attr('content') || 
                          full$('meta[property="og:description"]').attr('content') || '';
        if (!description) {
          const firstP = full$('p').first().text().trim();
          if (firstP && firstP.length > 20 && firstP.length < 200) {
            description = firstP;
          } else {
            description = `Welcome to our custom store. Discover our premium collections and services!`;
          }
        }

        const textToSearch = full$('body').text();
        const emailMatch = textToSearch.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
        const email = emailMatch ? emailMatch[0] : 'hello@' + businessName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        const phoneMatch = textToSearch.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91\s?\d{10}|\b\d{10}\b/);
        const phone = phoneMatch ? phoneMatch[0].trim() : '9876543210';

        const lowerText = textToSearch.toLowerCase() + ' ' + scrapedUrl.toLowerCase();
        let recommendedTemplate = 'grocery';
        let templateName = 'Flora';
        const isFlorist = lowerText.includes('flower') || lowerText.includes('florist') || lowerText.includes('bouquet') || lowerText.includes('blossom') || lowerText.includes('rose') || lowerText.includes('lily');

        if (lowerText.includes('restaurant') || lowerText.includes('food') || lowerText.includes('menu') || lowerText.includes('dine') || lowerText.includes('cuisine') || lowerText.includes('delicacy') || lowerText.includes('dish') || lowerText.includes('baking') || lowerText.includes('bakery')) {
          recommendedTemplate = 'restaurant';
          templateName = 'Crave';
        } else if (lowerText.includes('tailor') || lowerText.includes('boutique') || lowerText.includes('fashion') || lowerText.includes('clothing') || lowerText.includes('apparel') || lowerText.includes('wear') || lowerText.includes('suit') || lowerText.includes('dress')) {
          recommendedTemplate = 'tailor';
          templateName = 'Aurora';
        } else if (lowerText.includes('salon') || lowerText.includes('spa') || lowerText.includes('beauty') || lowerText.includes('hair') || lowerText.includes('makeup') || lowerText.includes('nail') || lowerText.includes('parlor') || lowerText.includes('wellness')) {
          recommendedTemplate = 'salon';
          templateName = 'Bloom';
        } else if (lowerText.includes('mechanic') || lowerText.includes('car') || lowerText.includes('auto') || lowerText.includes('repair') || lowerText.includes('garage') || lowerText.includes('wheel') || lowerText.includes('brake') || lowerText.includes('vehicle')) {
          recommendedTemplate = 'mechanic';
          templateName = 'Pulse';
        } else if (lowerText.includes('tea') || lowerText.includes('coffee') || lowerText.includes('cafe') || lowerText.includes('bistro') || lowerText.includes('brew')) {
          recommendedTemplate = 'tea_shop';
          templateName = 'Bistro';
        } else if (isFlorist || lowerText.includes('grocery') || lowerText.includes('supermarket') || lowerText.includes('fruit') || lowerText.includes('vegetable') || lowerText.includes('organic')) {
          recommendedTemplate = 'grocery';
          templateName = isFlorist ? 'Flora' : 'Harvest';
        }

        return res.json({
          reply: `I have scraped and analyzed **${scrapedUrl}** locally!\n\nHere is what I found:\n\n* **Business Name**: ${businessName}\n* **Tagline/Description**: ${description}\n* **Contact Details**: Phone \`${phone}\` | Email \`${email}\`\n* **Recommended Template**: **${templateName}** (matches the detected business type)\n\nI have also prepared a list of customized products for your catalog.\n\nTo build your website with these details instantly, simply click the **"Import details from a website"** button on the setup drawer and paste **${scrapedUrl}**! I will auto-fill your details and set up the product catalog instantly. Let me know if you have any questions!`
        });
      }

      // If no URL, check if the user is asking about stores list
      const msgLower = latestMessage.toLowerCase();
      
      // Check if user is asking why it is offline, or explaining the offline behavior
      if (msgLower.includes('offline') || msgLower.includes('y are you') || msgLower.includes('why are you') || msgLower.includes('why is it') || msgLower.includes('y is it') || msgLower.includes('not the answer')) {
        const storeList = userWebsites.map((w, idx) => `• **${w.storeName || w.slug}** (${w.template || 'Default'} design) - [Live Site](http://localhost:5000/site/${w.slug})`).join('\n');
        return res.json({
          reply: `I am currently running in a smart local offline mode. This ensures you can build and set up your stores without needing external LLM API keys (no rate limits or costs!).\n\nEven in offline mode, I can query your data directly! Here are your active stores in my database:\n\n${storeList || 'You have not launched any stores yet. Choose a template or click "Import from Website" on the dashboard to get started!'}\n\nTo enable full conversational AI guidance, you can add a valid \`GEMINI_API_KEY\` to your \`.env\` file.`
        });
      }

      if (msgLower.includes('how many store') || msgLower.includes('my store') || msgLower.includes('list store') || msgLower.includes('what are my store') || msgLower.includes('how many website') || msgLower.includes('which website') || msgLower.includes('which store')) {
        const storeList = userWebsites.map((w, idx) => `• **${w.storeName || w.slug}** (${w.template || 'Default'} design) - [Live Site](http://localhost:5000/site/${w.slug})`).join('\n');
        return res.json({
          reply: `I checked the database! 🏪 You currently have **${websitesCount}** store(s) created under your business profile:\n\n${storeList || 'You have not launched any stores yet. Choose a template or click "Import from Website" on the dashboard to get started!'}`
        });
      }

      // Offline FAQ / Guide Matcher
      if (msgLower.includes('how to add') || msgLower.includes('how do i add') || msgLower.includes('add product') || msgLower.includes('add item') || msgLower.includes('adding product') || msgLower.includes('adding item')) {
        return res.json({
          reply: `To **add or manage products** for your store:\n\n1. In the setup drawer on the left, navigate to **Step 2 (Product Catalog)**.\n2. Fill in the product's **Name**, **Price**, and optional **Description**.\n3. (Optional) Click the **Voice Microphone icon** next to the input to add items hands-free via voice recording!\n4. Click **"Add Product"** and they will appear in your live preview instantly.`
        });
      }

      if (msgLower.includes('change template') || msgLower.includes('change layout') || msgLower.includes('switch template') || msgLower.includes('choose template') || msgLower.includes('another template') || msgLower.includes('select template') || msgLower.includes('change theme')) {
        return res.json({
          reply: `To **change your template layout**:\n\n1. Close the current store configuration drawer (click the 'X' or click outside).\n2. Browse the template library and click the **"Preview"** button on any card (e.g. *Flora*, *Crave*, *Aurora*, *Bloom*).\n3. When you decide on a template, click **"Use this Template"** in the top bar. Your store details and catalog will automatically carry over to the new design layout!`
        });
      }

      if (msgLower.includes('logo') || msgLower.includes('profile') || msgLower.includes('contact') || msgLower.includes('phone') || msgLower.includes('email') || msgLower.includes('address') || msgLower.includes('change info') || msgLower.includes('update info') || msgLower.includes('update detail')) {
        return res.json({
          reply: `To **update your business info, logo, or contact details**:\n\n1. Open the setup drawer and look under **Step 1 (Store Details)**.\n2. You can upload a new logo image, or change your **Business Name**, **Tagline/Description**, **Phone Number**, **Email**, and **Location Address**.\n3. Scroll down to update your social media links (WhatsApp, Instagram, Facebook, etc.). All changes will sync in real-time in the editor preview!`
        });
      }

      if (msgLower.includes('publish') || msgLower.includes('launch') || msgLower.includes('live') || msgLower.includes('go live') || msgLower.includes('save my store')) {
        return res.json({
          reply: `To **publish and launch your store live**:\n\n1. After filling in your details (Step 1) and catalog products (Step 2), click the green **"Publish Store"** button at the bottom of the drawer.\n2. This will save your custom configuration and create a live public URL (e.g. \`http://localhost:5000/site/your-store-slug\`).\n3. You will be redirected to the **Dashboard** where you can view live orders, customer inquiries, update products, and customize your site further.`
        });
      }

      if (msgLower.includes('import') || msgLower.includes('website import') || msgLower.includes('how to import') || msgLower.includes('scrape') || msgLower.includes('link')) {
        return res.json({
          reply: `To **import your business details and products from an existing website link**:\n\n1. Go to your **Dashboard Overview** page.\n2. Click the **"Import from Website"** button next to the standard create button.\n3. Enter your website's URL (e.g. \`https://example.com\`) and click **"Scrape & Import"**.\n4. Our system will analyze the page, select a matching template, auto-fill your contact details, generate products catalog items, and redirect you straight to the builder customized for you!`
        });
      }

      // If no URL, but we have storeContext, answer questions about their own store
      if (storeContext) {
        if (msgLower.includes('product') || msgLower.includes('catalog') || msgLower.includes('item') || msgLower.includes('list')) {
          const prodList = (storeContext.products || []).map((p, i) => `${i + 1}. **${p.name}** (₹${p.price}) ${p.description ? `- *${p.description}*` : ''}`).join('\n');
          return res.json({
            reply: `I checked your current store catalog! 📦 You currently have **${storeContext.products?.length || 0}** product(s) added:\n\n${prodList || 'Your product catalog is empty right now. You can add items in Step 2 of the setup drawer!'}`
          });
        }
        
        if (msgLower.includes('template') || msgLower.includes('theme') || msgLower.includes('layout') || msgLower.includes('design')) {
          return res.json({
            reply: `Your active layout design is set to the **${storeContext.template}** template.\n\nTo change templates, close the current setup drawer and pick another card from the templates selection list!`
          });
        }
        
        if (msgLower.includes('detail') || msgLower.includes('info') || msgLower.includes('business') || msgLower.includes('profile') || msgLower.includes('contact') || msgLower.includes('phone') || msgLower.includes('email') || msgLower.includes('address')) {
          return res.json({
            reply: `Here is what is currently inside your store profile details:\n\n* **Business Name**: ${storeContext.businessName}\n* **Tagline/Description**: ${storeContext.description}\n* **Phone Number**: ${storeContext.phone}\n* **Email Address**: ${storeContext.email}\n* **Physical Location**: ${storeContext.address}`
          });
        }

        if (msgLower.includes('help') || msgLower.includes('doubt') || msgLower.includes('question') || msgLower.includes('what can you do')) {
          return res.json({
            reply: `I can read your current store's details to help you out! Ask me things like:\n\n* *"What products do I have?"* to list your catalog.\n* *"Which template am I using?"* to see your active layout.\n* *"What are my business details?"* to inspect your profile fields.`
          });
        }
      }

      return res.json({
        reply: `I am currently running in local offline mode to avoid hitting API limits. I can help query your store info, catalog, and setup choices directly. Try asking:\n\n• *"How many stores do I have?"* to list all your registered stores.\n• *"What products do I have?"* to see your current template's catalog.\n• *"Which template am I using?"* to inspect your active layout design.`
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    let contextPrompt = '';
    if (storeContext || websitesCount > 0) {
      contextPrompt = `\n\n[Active Store Context]:
The vendor is currently editing/building their store on our platform with the following configurations:
- Template: ${storeContext?.template || 'None selected'}
- Business Name: ${storeContext?.businessName || 'Not set'}
- Tagline/Description: ${storeContext?.description || 'Not set'}
- Contact: Phone ${storeContext?.phone || 'Not set'} | Email ${storeContext?.email || 'Not set'}
- Address: ${storeContext?.address || 'Not set'}
- Products Catalog (${(storeContext?.products || []).length} products):
${(storeContext?.products || []).map((p, idx) => `  ${idx + 1}. ${p.name} (₹${p.price}) ${p.description ? `- ${p.description}` : ''}`).join('\n') || '  No products configured yet.'}

[Vendor's Stores List]:
The vendor has created a total of ${websitesCount} store(s) on our platform:
${userWebsites.map((w, idx) => `  ${idx + 1}. Name: "${w.storeName || w.slug}", Template: "${w.template}", Live URL: "http://localhost:5000/site/${w.slug}"`).join('\n') || '  No stores created yet.'}

Use this context to address any doubts, list their other stores, explain choices, suggest improvements to their texts or catalog, and directly reference their products or settings in your answers.`;
    }

    const systemPrompt = `You are an expert website building assistant for "VendorBuild", a platform that helps vendors create modern, beautiful stores easily without coding. 
Your goal is to help users choose templates (like Aurora, Slate, Bloom, Crave, Haven, Nexus, Vogue, Pixel, Glow, Bistro, Loft, Zenith, Trend, Spark, Flora), explain website features, and provide general advice on setting up an online business.
CRITICAL: If the user explicitly asks you to build a website or choose a template for them, ask them for their business name and what they sell (if they haven't provided it yet).
Once you have their business details and know which template fits best, reply normally with a helpful message, but append this EXACT string to the very end of your response:
___BUILD___ {"template": "template_id_here", "businessName": "their_business_name", "description": "a_short_tagline"} ___BUILD___

Template IDs: Aurora (t1), Slate (t2), Bloom (t3), Crave (t4), Haven (t5), Nexus (t6), Vogue (t7), Pixel (t8), Glow (t9), Bistro (t10), Loft (t11), Zenith (t12), Trend (t13), Spark (t14), Flora (t15).

Keep your answers very concise, friendly, and formatted nicely with markdown.`;

    let history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
    
    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }
    
    let promptToSend = latestMessage;
    if (scrapedUrl && scrapedContent) {
      promptToSend = `The user asked: "${latestMessage}"\n\nI have fetched and scraped the webpage content of "${scrapedUrl}" for context:\n\n=== SCRAPED CONTENT ===\n${scrapedContent}\n========================\n\nAnalyze this content, summarize/guide the user about this business, suggest which template fits best (e.g. Flora/Bloom for flowers, Crave for restaurant/food, etc.), and ask them if they want to build the site or customize it based on this. If they decide to build, you can trigger the ___BUILD___ payload.`;
    }

    const chat = model.startChat({
      history: history,
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt + contextPrompt }]
      }
    });

    const result = await chat.sendMessage(promptToSend);
    const response = await result.response;
    
    res.json({ reply: response.text() });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload product image with background removal
router.post('/upload/product-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    let finalImageUrl = `/uploads/${req.file.filename}`;
    // Attempt local OpenCV background removal
    console.log('Attempting local OpenCV background removal...');
    try {
      const removedBgPath = await removeBackground(req.file.path);
      if (removedBgPath) {
        finalImageUrl = `/uploads/${path.basename(removedBgPath)}`;
        console.log('Background removed successfully:', finalImageUrl);
      }
    } catch (bgError) {
      console.error('Background removal failed:', bgError);
    }
    res.json({
      url: finalImageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function removeBackground(imagePath) {
  try {
    const outputPath = imagePath.replace(/\.\w+$/, '-nobg.png');
    const scriptPath = path.join(__dirname, '../scripts/remove_bg.py');
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    // Execute the OpenCV/rembg python script locally
    const command = `python "${scriptPath}" "${imagePath}" "${outputPath}"`;
    await execPromise(command);
    
    if (fs.existsSync(outputPath)) {
      return outputPath;
    }
    return null;
  } catch (error) {
    console.error('Local OpenCV background removal error:', error.message);
    return null;
  }
}

// Generate website with all features
router.post('/generate-website', async (req, res) => {
  try {
    const { businessData, productImages, template, templateName, theme, heroImage, products } = req.body;
    if (!businessData) {
      return res.status(400).json({ error: 'businessData is required' });
    }
    const html = generateWebsiteHTML(businessData, productImages, template, templateName, theme, heroImage, products);
    const css = generateWebsiteCSS(theme);
    res.json({ html, css });
  } catch (error) {
    console.error('Generate website error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI Assistant
router.post('/assistant', async (req, res) => {
  try {
    const { message, businessData } = req.body;
    const command = parseCommand(message);
    let response = {};
    switch (command.action) {
      case 'ADD_PRODUCT':
      case 'CHANGE_THEME':
      case 'UPDATE_PHONE':
      case 'ADD_SOCIAL_MEDIA':
        response = { action: command.action, data: command.data, message: command.message };
        break;
      default:
        response = {
          action: 'UNKNOWN',
          data: {},
          message: "I can help you:\n• Add products (e.g., 'Add a blue shirt for ₹25')\n• Change theme colors (e.g., 'Change theme to red')\n• Update phone number (e.g., 'Change phone to 9876543210')\n• Add social media links"
        };
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
//  SHARED HELPERS
// ─────────────────────────────────────────────

function resolveProducts(products, businessData) {
  if (products && products.length > 0) return products;
  if (businessData.services && businessData.services.length > 0) return businessData.services;
  return [
    { name: 'Premium Collection', price: '49.99', description: 'High quality premium product' },
    { name: 'Exclusive Deals', price: '89.99', description: 'Limited edition exclusive items' },
    { name: 'New Arrivals', price: '129.99', description: 'Latest collection just arrived' }
  ];
}

function buildSocialLinks(socialMedia, phoneNumber, whatsappUrl) {
  const links = [];
  if (socialMedia.whatsapp || phoneNumber) {
    links.push(`<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;width:3rem;height:3rem;border-radius:9999px;background:#22c55e;color:white;text-decoration:none;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-whatsapp" style="font-size:1.25rem;"></i></a>`);
  }
  if (socialMedia.instagram) {
    links.push(`<a href="${socialMedia.instagram}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;width:3rem;height:3rem;border-radius:9999px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;text-decoration:none;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-instagram" style="font-size:1.25rem;"></i></a>`);
  }
  if (socialMedia.facebook) {
    links.push(`<a href="${socialMedia.facebook}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;width:3rem;height:3rem;border-radius:9999px;background:#1d4ed8;color:white;text-decoration:none;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-facebook-f" style="font-size:1.25rem;"></i></a>`);
  }
  if (socialMedia.twitter) {
    links.push(`<a href="${socialMedia.twitter}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;width:3rem;height:3rem;border-radius:9999px;background:#374151;color:white;text-decoration:none;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-twitter" style="font-size:1.25rem;"></i></a>`);
  }
  return links.join('');
}
// ─────────────────────────────────────────────

function buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, primaryColor) {
  let html = '';
  if (phoneNumber) html += `<p style="margin:0.5rem 0;"><i class="fas fa-phone" style="margin-right:0.5rem;color:${primaryColor};"></i>${phoneNumber}</p>`;
  if (email) html += `<p style="margin:0.5rem 0;"><i class="fas fa-envelope" style="margin-right:0.5rem;color:${primaryColor};"></i><a href="mailto:${email}" style="color:inherit;text-decoration:none;">${email}</a></p>`;
  if (address) html += `<p style="margin:0.5rem 0;"><i class="fas fa-map-marker-alt" style="margin-right:0.5rem;color:${primaryColor};"></i><a href="https://maps.google.com/?q=${encodedLocation}" target="_blank" style="color:inherit;text-decoration:none;">${address}</a></p>`;
  return html;
}

function buildLogoBlock(businessData, primaryColor, accentColor) {
  if (businessData && businessData.logo) {
    const fullLogoUrl = businessData.logo.startsWith('http') ? businessData.logo : `http://localhost:5000${businessData.logo}`;
    return `<img src="${fullLogoUrl}" alt="Store Logo" style="width:2.5rem;height:2.5rem;object-fit:contain;border-radius:0.4rem;background:transparent;">`;
  }
  return `<div style="width:2.5rem;height:2.5rem;border-radius:0.6rem;background:linear-gradient(135deg,${primaryColor},${accentColor});display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-store"></i></div>`;
}

function generateWebsiteHTML(businessData, productImages, templateId, templateName, theme, heroImage, products) {
  switch (templateId) {
    case 't2':
    case 't14': return generateSlateTemplate(businessData, productImages, theme, heroImage, products);
    case 't3':
    case 't15': return generateBloomTemplate(businessData, productImages, theme, heroImage, products);
    case 't4':
    case 't10': return generateCraveTemplate(businessData, productImages, theme, heroImage, products);
    case 't5':
    case 't11': return generateHavenTemplate(businessData, productImages, theme, heroImage, products);
    case 't6':
    case 't12': return generateNexusTemplate(businessData, productImages, theme, heroImage, products);
    case 't7': return generateVogueTemplate(businessData, productImages, theme, heroImage, products);
    case 't8': return generatePixelTemplate(businessData, productImages, theme, heroImage, products);
    case 't9': return generateGlowTemplate(businessData, productImages, theme, heroImage, products);
    case 't13':
    case 't1':
    default: return generateAuroraTemplate(businessData, productImages, theme, heroImage, products);
  }
}

// ─────────────────────────────────────────────
//  T1 — AURORA  (clean fashion, light, minimal)
// ─────────────────────────────────────────────
function generateAuroraTemplate(businessData, productImages, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Store';
  const storeName = businessData.storeName || businessName;
  const description = businessData.description || 'Welcome to our store';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  const services = resolveProducts(products, businessData);

  const primaryColor = theme?.primaryColor || '#111827';
  const secondaryColor = theme?.secondaryColor || '#F3F4F6';
  const accentColor = theme?.accentColor || '#3B82F6';
  const heroBg = heroImage || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80';
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  const encodedLocation = encodeURIComponent(address || businessData.location || '');

  const productsHtml = services.map((service, i) => {
    const name = typeof service === 'object' ? service.name : service;
    const price = typeof service === 'object' ? service.price : (Math.random() * 50 + 20).toFixed(2);
    const desc = typeof service === 'object' ? (service.description || '') : '';
    let img = `https://picsum.photos/seed/${encodeURIComponent(name)}${i}/600/600`;
    if (productImages && productImages[i]) img = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    return `
    <div style="background:#fff;border-radius:1rem;overflow:hidden;border:1px solid #f1f5f9;box-shadow:0 1px 3px rgba(0,0,0,0.07);transition:transform 0.3s,box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 20px 40px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.07)'">
      <div style="position:relative;height:260px;overflow:hidden;background:#f8fafc;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" alt="${name}" onerror="this.src='https://picsum.photos/seed/fallback${i}/600/600'">
      </div>
      <div style="padding:1.5rem;text-align:center;">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${accentColor};margin-bottom:0.4rem;">Product</div>
        <h4 style="font-size:1.1rem;font-weight:800;color:#111827;margin:0 0 0.5rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${name}">${name}</h4>
        ${desc ? `<p style="font-size:0.85rem;color:#6b7280;margin:0 0 0.75rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${desc}</p>` : ''}
        <p style="font-size:1.25rem;font-weight:800;color:${primaryColor};margin:0 0 1rem;">₹${price}</p>
        <button data-cart-add="true" data-product-name="${name}" data-product-price="${price}" data-product-image="${img}" style="width:100%;padding:0.75rem;background:${primaryColor};color:#fff;border:none;border-radius:0.5rem;font-weight:700;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
          <i class="fas fa-shopping-cart" style="margin-right:0.4rem;"></i> Add to Cart
        </button>
      </div>
    </div>`;
  }).join('');

  const socialLinksHtml = buildSocialLinks(socialMedia, phoneNumber, whatsappUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',sans-serif;background:#f9fafb;color:#111827;overflow-x:hidden;}
    html{scroll-behavior:smooth;}
    #navbar{position:fixed;top:0;width:100%;z-index:1000;background:transparent;transition:background 0.3s,box-shadow 0.3s;border-bottom:1px solid rgba(255,255,255,0.1);}
    #navbar.scrolled{background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);box-shadow:0 2px 10px rgba(0,0,0,0.08);}
    #navbar.scrolled .nav-link{color:#111827!important;}
    #navbar.scrolled .nav-brand{color:#111827!important;}
    #mobile-menu{max-height:0;overflow:hidden;transition:max-height 0.3s ease;}
    #mobile-menu.open{max-height:300px;}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:2rem;}
    @media(max-width:640px){.products-grid{grid-template-columns:1fr;}}
    .contact-flex{display:flex;flex-wrap:wrap;gap:2rem;justify-content:center;align-items:flex-start;}
    .contact-item{display:flex;flex-direction:column;align-items:center;gap:0.75rem;min-width:140px;}
    .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem;}
    @media(max-width:768px){.footer-grid{grid-template-columns:1fr;gap:2rem;}}
  </style>
</head>
<body>
  <!-- NAV -->
  <nav id="navbar">
    <div style="max-width:1280px;margin:0 auto;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:4.5rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        ${buildLogoBlock(businessData, primaryColor, accentColor)}
        <span class="nav-brand" style="font-family:'Poppins',sans-serif;font-weight:800;font-size:1.3rem;color:#fff;letter-spacing:-0.03em;">${storeName}</span>
      </div>
      <div class="desktop-menu" style="display:flex;gap:2rem;">
        <a href="#" class="nav-link" style="color:#fff;text-decoration:none;font-weight:600;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">Home</a>
        <a href="#products" class="nav-link" style="color:#fff;text-decoration:none;font-weight:600;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">Shop</a>
        <a href="#contact" class="nav-link" style="color:#fff;text-decoration:none;font-weight:600;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">Contact</a>
      </div>
      <button id="mob-btn" style="display:none;background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;" class="nav-link"><i class="fas fa-bars"></i></button>
    </div>
    <div id="mobile-menu" style="background:#fff;border-top:1px solid #e5e7eb;">
      <div style="padding:1rem 2rem;display:flex;flex-direction:column;gap:0.5rem;">
        <a href="#" style="padding:0.75rem;color:#111827;text-decoration:none;font-weight:700;border-radius:0.5rem;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">Home</a>
        <a href="#products" style="padding:0.75rem;color:#111827;text-decoration:none;font-weight:700;border-radius:0.5rem;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">Shop</a>
        <a href="#contact" style="padding:0.75rem;color:#111827;text-decoration:none;font-weight:700;border-radius:0.5rem;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">Contact</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <header style="position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;">
    <div style="position:absolute;inset:0;">
      <img src="${heroBg}" style="width:100%;height:100%;object-fit:cover;" alt="Hero" onerror="this.style.display='none'">
      <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.45) 100%);"></div>
    </div>
    <div style="position:relative;z-index:10;max-width:1280px;margin:0 auto;padding:6rem 2rem 4rem;">
      <span style="display:inline-block;padding:0.25rem 1rem;border-radius:9999px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1.5rem;backdrop-filter:blur(4px);">
        <i class="fas fa-star" style="margin-right:0.3rem;color:${accentColor};"></i> Welcome
      </span>
      <h1 style="font-family:'Poppins',sans-serif;font-size:clamp(2.5rem,6vw,5rem);font-weight:800;color:#fff;line-height:1.1;margin-bottom:1.5rem;letter-spacing:-0.02em;">${description}</h1>
      <p style="font-size:1.15rem;color:rgba(255,255,255,0.85);margin-bottom:2.5rem;max-width:500px;line-height:1.7;">Experience unparalleled quality and style. We bring the best directly to you.</p>
      <div style="display:flex;flex-wrap:wrap;gap:1rem;">
        <a href="#products" style="padding:1rem 2rem;background:#fff;color:#111827;border-radius:0.75rem;font-weight:800;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 0 20px rgba(255,255,255,0.2);" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">Shop Collection <i class="fas fa-arrow-right" style="margin-left:0.3rem;"></i></a>
        ${phoneNumber ? `<a href="${whatsappUrl}" target="_blank" style="padding:1rem 2rem;background:#16a34a;color:#fff;border-radius:0.75rem;font-weight:800;text-decoration:none;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-whatsapp" style="margin-right:0.4rem;"></i>Chat on WhatsApp</a>` : ''}
      </div>
    </div>
  </header>

  <!-- PRODUCTS -->
  <section id="products" style="max-width:1280px;margin:0 auto;padding:5rem 2rem;">
    <div style="text-align:center;margin-bottom:3.5rem;">
      <h2 style="font-family:'Poppins',sans-serif;font-size:clamp(2rem,4vw,3rem);font-weight:800;color:#111827;margin-bottom:0.75rem;">Featured Offerings</h2>
      <div style="width:5rem;height:0.35rem;background:${accentColor};border-radius:9999px;margin:0 auto 1rem;"></div>
      <p style="color:#6b7280;font-size:1.1rem;max-width:500px;margin:0 auto;">Handpicked selections guaranteed to elevate your lifestyle.</p>
    </div>
    <div class="products-grid">${productsHtml}</div>
  </section>

  <!-- CONTACT -->
  <section id="contact" style="background:${secondaryColor};padding:5rem 2rem;">
    <div style="max-width:56rem;margin:0 auto;text-align:center;">
      <h3 style="font-family:'Poppins',sans-serif;font-size:2rem;font-weight:800;color:#111827;margin-bottom:0.5rem;">Get in Touch</h3>
      <p style="color:#6b7280;font-size:1.1rem;margin-bottom:2.5rem;">We'd love to hear from you. Reach out anytime!</p>
      <div style="background:#fff;border-radius:1.5rem;padding:2.5rem;box-shadow:0 4px 24px rgba(0,0,0,0.07);border:1px solid #f1f5f9;">
        <div class="contact-flex">
          ${phoneNumber ? `<div class="contact-item"><div style="width:3.5rem;height:3.5rem;background:#f0fdf4;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#16a34a;font-size:1.3rem;"><i class="fas fa-phone-alt"></i></div><div><div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;">Call Us</div><a href="tel:${formattedPhone}" style="font-weight:700;color:#111827;text-decoration:none;font-size:1rem;">${phoneNumber}</a></div></div>` : ''}
          ${email ? `<div class="contact-item"><div style="width:3.5rem;height:3.5rem;background:#eff6ff;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#2563eb;font-size:1.3rem;"><i class="fas fa-envelope"></i></div><div><div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;">Email Us</div><a href="mailto:${email}" style="font-weight:700;color:#111827;text-decoration:none;font-size:1rem;">${email}</a></div></div>` : ''}
          ${address ? `<div class="contact-item"><div style="width:3.5rem;height:3.5rem;background:#fff7ed;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#ea580c;font-size:1.3rem;"><i class="fas fa-map-marker-alt"></i></div><div><div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;">Visit Us</div><a href="https://maps.google.com/?q=${encodedLocation}" target="_blank" style="font-weight:700;color:#111827;text-decoration:none;font-size:1rem;">${address}</a></div></div>` : ''}
        </div>
        ${socialLinksHtml ? `<div style="margin-top:2rem;padding-top:2rem;border-top:1px solid #f1f5f9;text-align:center;"><div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:1rem;">Follow Us</div><div style="display:flex;gap:1rem;justify-content:center;">${socialLinksHtml}</div></div>` : ''}
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer style="background:#111827;padding:4rem 2rem 2rem;color:#9ca3af;">
    <div style="max-width:1280px;margin:0 auto;">
      <div class="footer-grid" style="margin-bottom:3rem;">
        <div>
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
            ${buildLogoBlock(businessData, primaryColor, accentColor)}
            <span style="font-family:'Poppins',sans-serif;font-weight:800;color:#fff;font-size:1.2rem;">${storeName}</span>
          </div>
          <p style="font-size:0.9rem;line-height:1.7;max-width:300px;">Providing top-tier products and exceptional service to customers worldwide.</p>
          ${phoneNumber ? `<p style="margin-top:1rem;font-size:0.9rem;"><i class="fas fa-phone" style="margin-right:0.5rem;color:${accentColor};"></i>${phoneNumber}</p>` : ''}
        </div>
        <div>
          <h4 style="color:#fff;font-weight:700;margin-bottom:1.5rem;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;">Quick Links</h4>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:0.75rem;font-size:0.9rem;">
            <li><a href="#" style="color:#9ca3af;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#9ca3af'">Home</a></li>
            <li><a href="#products" style="color:#9ca3af;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#9ca3af'">Shop</a></li>
            <li><a href="#contact" style="color:#9ca3af;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#9ca3af'">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-weight:700;margin-bottom:1.5rem;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;">Newsletter</h4>
          <div style="display:flex;">
            <input type="email" placeholder="Your email" style="background:#1f2937;border:none;color:#fff;padding:0.6rem 0.75rem;border-radius:0.5rem 0 0 0.5rem;flex:1;outline:none;font-size:0.85rem;">
            <button style="background:${accentColor};color:#fff;border:none;padding:0.6rem 0.9rem;border-radius:0 0.5rem 0.5rem 0;cursor:pointer;"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid #1f2937;padding-top:2rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;font-size:0.85rem;">
        <p>© 2026 ${storeName}. All rights reserved.</p>
        <p>Powered by <span style="color:#fff;font-weight:700;">VendorBuild</span></p>
      </div>
    </div>
  </footer>

  <script>
    const navbar=document.getElementById('navbar');
    window.addEventListener('scroll',()=>{ navbar.classList.toggle('scrolled',window.scrollY>50); });
    const mobBtn=document.getElementById('mob-btn');
    const mobMenu=document.getElementById('mobile-menu');
    if(mobBtn){ mobBtn.addEventListener('click',()=>mobMenu.classList.toggle('open')); }
    // show hamburger on mobile
    const dMenu=document.querySelector('.desktop-menu');
    function checkWidth(){ if(window.innerWidth<768){ dMenu.style.display='none'; mobBtn.style.display='block'; } else { dMenu.style.display='flex'; mobBtn.style.display='none'; } }
    checkWidth(); window.addEventListener('resize',checkWidth);
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); const t=document.querySelector(a.getAttribute('href')); if(t){ t.scrollIntoView({behavior:'smooth'}); mobMenu.classList.remove('open'); } }));
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  T2 — SLATE  (dark, tech/electronics)
// ─────────────────────────────────────────────
function generateSlateTemplate(businessData, productImages, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Store';
  const storeName = businessData.storeName || businessName;
  const description = businessData.description || 'Next-gen products for a modern world.';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  const services = resolveProducts(products, businessData);
  const primaryColor = theme?.primaryColor || '#0F172A';
  const accentColor = theme?.accentColor || '#38BDF8';
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  const encodedLocation = encodeURIComponent(address);

  const productsHtml = services.map((service, i) => {
    const name = typeof service === 'object' ? service.name : service;
    const price = typeof service === 'object' ? service.price : (Math.random() * 80 + 20).toFixed(2);
    const desc = typeof service === 'object' ? (service.description || '') : '';
    let img = `https://picsum.photos/seed/${encodeURIComponent(name)}${i}/600/600`;
    if (productImages && productImages[i]) img = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    return `
    <div style="background:#1e293b;border:1px solid #334155;border-radius:0.75rem;overflow:hidden;transition:transform 0.25s,border-color 0.25s;" onmouseover="this.style.transform='translateY(-6px)';this.style.borderColor='${accentColor}'" onmouseout="this.style.transform='translateY(0)';this.style.borderColor='#334155'">
      <div style="height:220px;overflow:hidden;background:#0f172a;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;opacity:0.9;transition:opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'" alt="${name}" onerror="this.src='https://picsum.photos/seed/tech${i}/600/600'">
      </div>
      <div style="padding:1.25rem;">
        <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${accentColor};margin-bottom:0.4rem;">Product</div>
        <h4 style="font-weight:800;color:#f1f5f9;font-size:1rem;margin:0 0 0.4rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</h4>
        ${desc ? `<p style="font-size:0.8rem;color:#94a3b8;margin:0 0 0.75rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${desc}</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:800;color:${accentColor};font-size:1.15rem;">₹${price}</span>
          <button data-cart-add="true" data-product-name="${name}" data-product-price="${price}" data-product-image="${img}" style="background:${accentColor};color:#0f172a;border:none;padding:0.5rem 1rem;border-radius:0.4rem;font-weight:700;font-size:0.8rem;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">Buy Now</button>
        </div>
      </div>
    </div>`;
  }).join('');

  const socialLinksHtml = buildSocialLinks(socialMedia, phoneNumber, whatsappUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${businessName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Space Grotesk',sans-serif;background:#0f172a;color:#e2e8f0;overflow-x:hidden;}
    html{scroll-behavior:smooth;}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.5rem;}
    @media(max-width:600px){.products-grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <!-- NAV -->
  <nav style="position:sticky;top:0;z-index:100;background:#0f172a;border-bottom:1px solid #1e293b;padding:0 2rem;">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:4rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        ${buildLogoBlock(businessData, primaryColor, accentColor)}
      <span style="font-weight:800;font-size:1.3rem;color:${accentColor};letter-spacing:-0.02em;">${storeName}</span>
      </div>
      <div style="display:flex;gap:2rem;font-size:0.9rem;font-weight:600;color:#94a3b8;">
        <a href="#" style="color:#94a3b8;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#f1f5f9'" onmouseout="this.style.color='#94a3b8'">Home</a>
        <a href="#products" style="color:#94a3b8;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#f1f5f9'" onmouseout="this.style.color='#94a3b8'">Catalog</a>
        <a href="#contact" style="color:#94a3b8;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#f1f5f9'" onmouseout="this.style.color='#94a3b8'">Contact</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <header style="min-height:90vh;display:flex;align-items:center;padding:4rem 2rem;background:linear-gradient(135deg,#0f172a 50%,#1e293b);">
    <div style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;width:100%;">
      <div>
        <div style="display:inline-block;padding:0.3rem 0.8rem;border-radius:0.3rem;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:${accentColor};font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1.5rem;">Next-Gen Store</div>
        <h1 style="font-size:clamp(2rem,5vw,3.75rem);font-weight:800;line-height:1.1;color:#f1f5f9;margin-bottom:1.25rem;letter-spacing:-0.03em;">${storeName}</h1>
        <p style="color:#94a3b8;font-size:1.1rem;line-height:1.7;margin-bottom:2.5rem;max-width:480px;">${description}</p>
        <div style="display:flex;flex-wrap:wrap;gap:1rem;">
          <a href="#products" style="padding:0.85rem 1.75rem;background:${accentColor};color:#0f172a;border-radius:0.5rem;font-weight:800;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">Browse Catalog</a>
          ${phoneNumber ? `<a href="${whatsappUrl}" target="_blank" style="padding:0.85rem 1.75rem;background:#1e293b;border:1px solid #334155;color:#f1f5f9;border-radius:0.5rem;font-weight:700;text-decoration:none;transition:border-color 0.2s;" onmouseover="this.style.borderColor='${accentColor}'" onmouseout="this.style.borderColor='#334155'"><i class="fab fa-whatsapp" style="margin-right:0.4rem;color:#22c55e;"></i>WhatsApp</a>` : ''}
        </div>
      </div>
      <div style="display:flex;justify-content:center;">
        <div style="width:380px;height:380px;border-radius:1rem;overflow:hidden;border:2px solid #1e293b;box-shadow:0 0 60px rgba(56,189,248,0.15);">
          <img src="${heroImage || `https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80`}" style="width:100%;height:100%;object-fit:cover;" alt="hero" onerror="this.src='https://picsum.photos/seed/slate/600/600'">
        </div>
      </div>
    </div>
  </header>

  <!-- PRODUCTS -->
  <section id="products" style="max-width:1280px;margin:0 auto;padding:5rem 2rem;">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:2.5rem;">
      <div>
        <h2 style="font-size:2rem;font-weight:800;color:#f1f5f9;margin-bottom:0.3rem;">Product Catalog</h2>
        <div style="width:3rem;height:3px;background:${accentColor};border-radius:9999px;"></div>
      </div>
      <span style="font-size:0.85rem;color:#64748b;">${services.length} items</span>
    </div>
    <div class="products-grid">${productsHtml}</div>
  </section>

  <!-- CONTACT -->
  <section id="contact" style="background:#020617;padding:4rem 2rem;margin-top:4rem;">
    <div style="max-width:48rem;margin:0 auto;text-align:center;">
      <h3 style="font-size:1.75rem;font-weight:800;color:#f1f5f9;margin-bottom:0.5rem;">Get in Touch</h3>
      <p style="color:#64748b;margin-bottom:2rem;">Questions? We're always online.</p>
      <div style="background:#1e293b;border:1px solid #334155;border-radius:1rem;padding:2rem;text-align:left;line-height:2;">
        ${buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, accentColor)}
        ${socialLinksHtml ? `<div style="margin-top:1.5rem;display:flex;gap:0.75rem;">${socialLinksHtml}</div>` : ''}
      </div>
    </div>
  </section>

  <footer style="background:#020617;border-top:1px solid #1e293b;padding:2rem;text-align:center;color:#475569;font-size:0.85rem;">
    <p>© 2026 ${storeName}. Powered by <span style="color:${accentColor};font-weight:700;">VendorBuild</span></p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  T3 — BLOOM  (soft pink, beauty/cosmetics)
// ─────────────────────────────────────────────
function generateBloomTemplate(businessData, productImages, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Store';
  const storeName = businessData.storeName || businessName;
  const description = businessData.description || 'Radiant beauty, naturally curated.';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  const services = resolveProducts(products, businessData);
  const primaryColor = theme?.primaryColor || '#831843';
  const accentColor = theme?.accentColor || '#EC4899';
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  const encodedLocation = encodeURIComponent(address);

  const productsHtml = services.map((service, i) => {
    const name = typeof service === 'object' ? service.name : service;
    const price = typeof service === 'object' ? service.price : (Math.random() * 60 + 15).toFixed(2);
    const desc = typeof service === 'object' ? (service.description || '') : '';
    let img = `https://picsum.photos/seed/${encodeURIComponent(name)}${i}/600/600`;
    if (productImages && productImages[i]) img = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    return `
    <div style="background:#fff;border-radius:1.5rem;overflow:hidden;box-shadow:0 2px 12px rgba(236,72,153,0.08);transition:box-shadow 0.3s,transform 0.3s;" onmouseover="this.style.boxShadow='0 20px 40px rgba(236,72,153,0.18)';this.style.transform='translateY(-6px)'" onmouseout="this.style.boxShadow='0 2px 12px rgba(236,72,153,0.08)';this.style.transform='translateY(0)'">
      <div style="height:240px;overflow:hidden;background:#fce7f3;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'" alt="${name}" onerror="this.src='https://picsum.photos/seed/beauty${i}/600/600'">
      </div>
      <div style="padding:1.5rem;text-align:center;">
        <h4 style="font-family:'Playfair Display',serif;font-size:1.1rem;color:${primaryColor};margin:0 0 0.4rem;">${name}</h4>
        ${desc ? `<p style="font-size:0.82rem;color:#9d8189;margin:0 0 0.75rem;">${desc}</p>` : ''}
        <p style="font-weight:700;color:${accentColor};font-size:1.1rem;margin:0 0 1rem;">₹${price}</p>
        <button data-cart-add="true" data-product-name="${name}" data-product-price="${price}" data-product-image="${img}" style="padding:0.65rem 1.5rem;background:${accentColor};color:#fff;border:none;border-radius:9999px;font-weight:700;cursor:pointer;font-size:0.85rem;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">Add to Bag</button>
      </div>
    </div>`;
  }).join('');

  const socialLinksHtml = buildSocialLinks(socialMedia, phoneNumber, whatsappUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${businessName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Lato',sans-serif;background:#fff0f6;color:#3d1a27;overflow-x:hidden;}
    html{scroll-behavior:smooth;}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:2rem;}
    @media(max-width:600px){.products-grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <!-- NAV -->
  <nav style="position:sticky;top:0;z-index:100;background:rgba(255,240,246,0.95);backdrop-filter:blur(10px);border-bottom:1px solid #fbcfe8;padding:0 2rem;">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:4rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        ${buildLogoBlock(businessData, primaryColor, accentColor)}
      <span style="font-family:'Playfair Display',serif;font-weight:800;font-size:1.5rem;color:${primaryColor};">${storeName}</span>
      </div>
      <div style="display:flex;gap:2rem;font-size:0.9rem;font-weight:700;color:${primaryColor};">
        <a href="#" style="color:${primaryColor};text-decoration:none;opacity:0.8;transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Home</a>
        <a href="#products" style="color:${primaryColor};text-decoration:none;opacity:0.8;transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Shop</a>
        <a href="#contact" style="color:${primaryColor};text-decoration:none;opacity:0.8;transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Contact</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <header style="padding:5rem 2rem;text-align:center;background:linear-gradient(180deg,#fff0f6,#fce7f3);">
    <p style="font-size:0.75rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${accentColor};margin-bottom:1rem;">✦ Beauty & Wellness ✦</p>
    <h1 style="font-family:'Playfair Display',serif;font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;color:${primaryColor};line-height:1.1;margin-bottom:1.25rem;">${storeName}</h1>
    <p style="color:#9d8189;font-size:1.1rem;max-width:480px;margin:0 auto 2.5rem;line-height:1.7;">${description}</p>
    <div style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;">
      <a href="#products" style="padding:0.9rem 2rem;background:${accentColor};color:#fff;border-radius:9999px;font-weight:700;text-decoration:none;box-shadow:0 4px 14px rgba(236,72,153,0.35);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">Explore Collection</a>
      ${phoneNumber ? `<a href="${whatsappUrl}" target="_blank" style="padding:0.9rem 2rem;background:#fff;color:${primaryColor};border:2px solid ${accentColor};border-radius:9999px;font-weight:700;text-decoration:none;transition:background 0.2s;" onmouseover="this.style.background='${accentColor}';this.style.color='#fff'" onmouseout="this.style.background='#fff';this.style.color='${primaryColor}'"><i class="fab fa-whatsapp" style="margin-right:0.4rem;"></i>Chat with Us</a>` : ''}
    </div>
  </header>

  <!-- PRODUCTS -->
  <section id="products" style="max-width:1280px;margin:0 auto;padding:5rem 2rem;">
    <div style="text-align:center;margin-bottom:3rem;">
      <h2 style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:800;color:${primaryColor};margin-bottom:0.5rem;">Our Collection</h2>
      <p style="color:#9d8189;">Handpicked with love, just for you</p>
    </div>
    <div class="products-grid">${productsHtml}</div>
  </section>

  <!-- CONTACT -->
  <section id="contact" style="background:#fce7f3;padding:4rem 2rem;text-align:center;">
    <h3 style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:${primaryColor};margin-bottom:1.5rem;">Say Hello 👋</h3>
    <div style="display:inline-block;background:#fff;border-radius:1.25rem;padding:2rem;box-shadow:0 4px 20px rgba(236,72,153,0.1);text-align:left;min-width:280px;line-height:2.2;">
      ${buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, accentColor)}
      ${socialLinksHtml ? `<div style="margin-top:1rem;display:flex;gap:0.75rem;">${socialLinksHtml}</div>` : ''}
    </div>
  </section>

  <footer style="background:${primaryColor};padding:2rem;text-align:center;color:rgba(255,255,255,0.7);font-size:0.85rem;">
    <p>© 2026 ${storeName}. Powered by <span style="color:#fbcfe8;font-weight:700;">VendorBuild</span></p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  T4 — CRAVE  (warm, food/restaurant)
// ─────────────────────────────────────────────
function generateCraveTemplate(businessData, productImages, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Restaurant';
  const storeName = businessData.storeName || businessName;
  const description = businessData.description || 'Fresh flavors, unforgettable taste.';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  const services = resolveProducts(products, businessData);
  const primaryColor = theme?.primaryColor || '#7C2D12';
  const accentColor = theme?.accentColor || '#F97316';
  const heroBg = heroImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  const encodedLocation = encodeURIComponent(address);

  const productsHtml = services.map((service, i) => {
    const name = typeof service === 'object' ? service.name : service;
    const price = typeof service === 'object' ? service.price : (Math.random() * 30 + 8).toFixed(2);
    const desc = typeof service === 'object' ? (service.description || '') : '';
    let img = `https://picsum.photos/seed/${encodeURIComponent(name)}${i}/600/600`;
    if (productImages && productImages[i]) img = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    return `
    <div style="background:#fff;border-radius:1rem;overflow:hidden;border:1px solid #fed7aa;transition:transform 0.2s,box-shadow 0.2s;" onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 12px 30px rgba(249,115,22,0.15)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none'">
      <div style="height:200px;overflow:hidden;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" alt="${name}" onerror="this.src='https://picsum.photos/seed/food${i}/600/600'">
      </div>
      <div style="padding:1.25rem;">
        <h4 style="font-family:'Lobster',cursive;font-size:1.2rem;color:${primaryColor};margin:0 0 0.4rem;">${name}</h4>
        ${desc ? `<p style="font-size:0.82rem;color:#92400e;margin:0 0 0.75rem;">${desc}</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:800;color:${accentColor};font-size:1.1rem;">₹${price}</span>
          <button data-cart-add="true" data-product-name="${name}" data-product-price="${price}" data-product-image="${img}" style="background:${accentColor};color:#fff;border:none;padding:0.5rem 1.1rem;border-radius:0.4rem;font-weight:700;font-size:0.82rem;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">Order Now</button>
        </div>
      </div>
    </div>`;
  }).join('');

  const socialLinksHtml = buildSocialLinks(socialMedia, phoneNumber, whatsappUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${businessName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Open Sans',sans-serif;background:#fffbf5;color:#3d1c0a;overflow-x:hidden;}
    html{scroll-behavior:smooth;}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.75rem;}
    @media(max-width:600px){.products-grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <!-- NAV -->
  <nav style="position:sticky;top:0;z-index:100;background:${primaryColor};padding:0 2rem;">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:4rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        ${buildLogoBlock(businessData, primaryColor, accentColor)}
      <span style="font-family:'Lobster',cursive;font-size:1.8rem;color:${accentColor};">${storeName}</span>
      </div>
      <div style="display:flex;gap:2rem;font-size:0.9rem;font-weight:700;color:rgba(255,255,255,0.8);">
        <a href="#" style="color:rgba(255,255,255,0.8);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.8)'">Home</a>
        <a href="#menu" style="color:rgba(255,255,255,0.8);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.8)'">Menu</a>
        <a href="#contact" style="color:rgba(255,255,255,0.8);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.8)'">Find Us</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <header style="position:relative;min-height:70vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;">
    <img src="${heroBg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" alt="hero" onerror="this.style.display='none'">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(124,45,18,0.72),rgba(0,0,0,0.85));"></div>
    <div style="position:relative;z-index:10;padding:2rem;">
      <span style="font-family:'Lobster',cursive;font-size:clamp(3rem,8vw,6rem);color:${accentColor};display:block;margin-bottom:0.5rem;">${storeName}</span>
      <p style="color:rgba(255,255,255,0.88);font-size:1.2rem;margin-bottom:2rem;">${description}</p>
      <div style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;">
        <a href="#menu" style="padding:0.9rem 2rem;background:${accentColor};color:#fff;border-radius:9999px;font-weight:700;text-decoration:none;font-size:1rem;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">View Menu</a>
        ${phoneNumber ? `<a href="${whatsappUrl}" target="_blank" style="padding:0.9rem 2rem;background:rgba(255,255,255,0.15);color:#fff;border:2px solid rgba(255,255,255,0.4);border-radius:9999px;font-weight:700;text-decoration:none;backdrop-filter:blur(4px);transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'"><i class="fab fa-whatsapp" style="margin-right:0.4rem;"></i>Order via WhatsApp</a>` : ''}
      </div>
    </div>
  </header>

  <!-- MENU -->
  <section id="menu" style="max-width:1280px;margin:0 auto;padding:5rem 2rem;">
    <div style="text-align:center;margin-bottom:3rem;">
      <h2 style="font-family:'Lobster',cursive;font-size:2.75rem;color:${primaryColor};margin-bottom:0.5rem;">Our Menu</h2>
      <div style="width:5rem;height:3px;background:${accentColor};border-radius:9999px;margin:0 auto;"></div>
    </div>
    <div class="products-grid">${productsHtml}</div>
  </section>

  <!-- CONTACT -->
  <section id="contact" style="background:#ffedd5;padding:4rem 2rem;text-align:center;">
    <h3 style="font-family:'Lobster',cursive;font-size:2rem;color:${primaryColor};margin-bottom:1.5rem;">Find Us 📍</h3>
    <div style="display:inline-block;background:#fff;border-radius:1rem;padding:2rem;box-shadow:0 4px 16px rgba(249,115,22,0.12);text-align:left;min-width:280px;line-height:2.2;">
      ${buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, accentColor)}
      ${socialLinksHtml ? `<div style="margin-top:1rem;display:flex;gap:0.75rem;">${socialLinksHtml}</div>` : ''}
    </div>
  </section>

  <footer style="background:${primaryColor};padding:2rem;text-align:center;color:rgba(255,255,255,0.65);font-size:0.85rem;">
    <p>© 2026 ${storeName}. Powered by <span style="color:${accentColor};font-weight:700;">VendorBuild</span></p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  T5 — HAVEN  (warm earthy, home decor)
// ─────────────────────────────────────────────
function generateHavenTemplate(businessData, productImages, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Store';
  const storeName = businessData.storeName || businessName;
  const description = businessData.description || 'Warm, inviting spaces for the modern home.';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  const services = resolveProducts(products, businessData);
  const primaryColor = theme?.primaryColor || '#451A03';
  const accentColor = theme?.accentColor || '#D97706';
  const heroBg = heroImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80';
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  const encodedLocation = encodeURIComponent(address);

  const productsHtml = services.map((service, i) => {
    const name = typeof service === 'object' ? service.name : service;
    const price = typeof service === 'object' ? service.price : (Math.random() * 150 + 50).toFixed(2);
    const desc = typeof service === 'object' ? (service.description || '') : '';
    let img = `https://picsum.photos/seed/${encodeURIComponent(name)}${i}/600/600`;
    if (productImages && productImages[i]) img = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    return `
    <div style="background:#fefce8;border-radius:0.5rem;overflow:hidden;border:1px solid #fef08a;transition:box-shadow 0.3s;" onmouseover="this.style.boxShadow='0 16px 40px rgba(217,119,6,0.2)'" onmouseout="this.style.boxShadow='none'">
      <div style="height:240px;overflow:hidden;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'" alt="${name}" onerror="this.src='https://picsum.photos/seed/home${i}/600/600'">
      </div>
      <div style="padding:1.25rem;">
        <h4 style="font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:700;color:${primaryColor};margin:0 0 0.4rem;">${name}</h4>
        ${desc ? `<p style="font-size:0.82rem;color:#92400e;margin:0 0 0.75rem;">${desc}</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:700;color:${accentColor};font-size:1.1rem;">₹${price}</span>
          <button data-cart-add="true" data-product-name="${name}" data-product-price="${price}" data-product-image="${img}" style="background:${primaryColor};color:#fef3c7;border:none;padding:0.5rem 1.1rem;border-radius:0.3rem;font-weight:700;font-size:0.82rem;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Shop Now</button>
        </div>
      </div>
    </div>`;
  }).join('');

  const socialLinksHtml = buildSocialLinks(socialMedia, phoneNumber, whatsappUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${businessName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Jost',sans-serif;background:#fefce8;color:#451a03;overflow-x:hidden;}
    html{scroll-behavior:smooth;}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:2rem;}
    @media(max-width:600px){.products-grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <!-- NAV -->
  <nav style="position:sticky;top:0;z-index:100;background:#fef3c7;border-bottom:2px solid #fde68a;padding:0 2rem;">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:4.5rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        ${buildLogoBlock(businessData, primaryColor, accentColor)}
      <span style="font-family:'Cormorant Garamond',serif;font-weight:700;font-size:1.6rem;color:${primaryColor};">${storeName}</span>
      </div>
      <div style="display:flex;gap:2rem;font-size:0.9rem;font-weight:500;color:#92400e;">
        <a href="#" style="color:#92400e;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${primaryColor}'" onmouseout="this.style.color='#92400e'">Home</a>
        <a href="#products" style="color:#92400e;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${primaryColor}'" onmouseout="this.style.color='#92400e'">Shop</a>
        <a href="#contact" style="color:#92400e;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${primaryColor}'" onmouseout="this.style.color='#92400e'">Contact</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <header style="position:relative;min-height:80vh;display:flex;align-items:center;overflow:hidden;">
    <img src="${heroBg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" alt="hero" onerror="this.style.display='none'">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(69,26,3,0.85) 40%,rgba(69,26,3,0.3));"></div>
    <div style="position:relative;z-index:10;max-width:1280px;margin:0 auto;padding:4rem 2rem;">
      <p style="font-size:0.75rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:${accentColor};margin-bottom:1rem;">Home & Living</p>
      <h1 style="font-family:'Cormorant Garamond',serif;font-size:clamp(2.5rem,6vw,5rem);font-weight:700;color:#fef3c7;line-height:1.15;margin-bottom:1.25rem;">${storeName}</h1>
      <p style="color:rgba(254,243,199,0.85);font-size:1.1rem;max-width:440px;line-height:1.7;margin-bottom:2.5rem;">${description}</p>
      <div style="display:flex;flex-wrap:wrap;gap:1rem;">
        <a href="#products" style="padding:0.9rem 2rem;background:${accentColor};color:#fff;border-radius:0.4rem;font-weight:600;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">Browse Collection</a>
        ${phoneNumber ? `<a href="${whatsappUrl}" target="_blank" style="padding:0.9rem 2rem;background:rgba(254,243,199,0.15);color:#fef3c7;border:1px solid rgba(254,243,199,0.4);border-radius:0.4rem;font-weight:600;text-decoration:none;transition:background 0.2s;" onmouseover="this.style.background='rgba(254,243,199,0.25)'" onmouseout="this.style.background='rgba(254,243,199,0.15)'"><i class="fab fa-whatsapp" style="margin-right:0.4rem;"></i>WhatsApp Us</a>` : ''}
      </div>
    </div>
  </header>

  <!-- PRODUCTS -->
  <section id="products" style="max-width:1280px;margin:0 auto;padding:5rem 2rem;">
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:2.5rem;font-weight:700;color:${primaryColor};margin-bottom:0.5rem;text-align:center;">Our Collection</h2>
    <div style="width:4rem;height:2px;background:${accentColor};margin:0 auto 3rem;"></div>
    <div class="products-grid">${productsHtml}</div>
  </section>

  <!-- CONTACT -->
  <section id="contact" style="background:#fef3c7;padding:4rem 2rem;text-align:center;">
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:2rem;color:${primaryColor};margin-bottom:1.5rem;">Get in Touch</h3>
    <div style="display:inline-block;background:#fffbf0;border:1px solid #fde68a;border-radius:0.75rem;padding:2rem;text-align:left;min-width:280px;line-height:2.2;">
      ${buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, accentColor)}
      ${socialLinksHtml ? `<div style="margin-top:1rem;display:flex;gap:0.75rem;">${socialLinksHtml}</div>` : ''}
    </div>
  </section>

  <footer style="background:${primaryColor};padding:2rem;text-align:center;color:rgba(254,243,199,0.65);font-size:0.85rem;">
    <p>© 2026 ${storeName}. Powered by <span style="color:${accentColor};font-weight:700;">VendorBuild</span></p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  T6 — NEXUS  (professional, corporate, blue)
// ─────────────────────────────────────────────
function generateNexusTemplate(businessData, productImages, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Business';
  const storeName = businessData.storeName || businessName;
  const description = businessData.description || 'Professional services you can trust.';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  const services = resolveProducts(products, businessData);
  const primaryColor = theme?.primaryColor || '#1E3A8A';
  const accentColor = theme?.accentColor || '#2563EB';
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  const encodedLocation = encodeURIComponent(address);

  const productsHtml = services.map((service, i) => {
    const name = typeof service === 'object' ? service.name : service;
    const price = typeof service === 'object' ? service.price : (Math.random() * 200 + 50).toFixed(2);
    const desc = typeof service === 'object' ? (service.description || '') : '';
    let img = `https://picsum.photos/seed/${encodeURIComponent(name)}${i}/600/600`;
    if (productImages && productImages[i]) img = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    return `
    <div style="background:#fff;border-radius:0.75rem;overflow:hidden;border:1px solid #dbeafe;box-shadow:0 1px 4px rgba(37,99,235,0.06);transition:box-shadow 0.3s,transform 0.3s;" onmouseover="this.style.boxShadow='0 12px 30px rgba(37,99,235,0.15)';this.style.transform='translateY(-4px)'" onmouseout="this.style.boxShadow='0 1px 4px rgba(37,99,235,0.06)';this.style.transform='translateY(0)'">
      <div style="height:200px;overflow:hidden;background:#eff6ff;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;" alt="${name}" onerror="this.src='https://picsum.photos/seed/service${i}/600/600'">
      </div>
      <div style="padding:1.25rem;">
        <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${accentColor};margin-bottom:0.35rem;">Service</div>
        <h4 style="font-weight:800;color:#1e3a8a;font-size:1rem;margin:0 0 0.4rem;">${name}</h4>
        ${desc ? `<p style="font-size:0.82rem;color:#64748b;margin:0 0 0.75rem;">${desc}</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:800;color:${accentColor};font-size:1.05rem;">₹${price}</span>
          <button data-cart-add="true" data-product-name="${name}" data-product-price="${price}" data-product-image="${img}" style="background:${accentColor};color:#fff;border:none;padding:0.5rem 1rem;border-radius:0.35rem;font-weight:700;font-size:0.8rem;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='${primaryColor}'" onmouseout="this.style.background='${accentColor}'">Get Quote</button>
        </div>
      </div>
    </div>`;
  }).join('');

  const socialLinksHtml = buildSocialLinks(socialMedia, phoneNumber, whatsappUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${businessName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Manrope',sans-serif;background:#f8fafc;color:#1e3a8a;overflow-x:hidden;}
    html{scroll-behavior:smooth;}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.75rem;}
    @media(max-width:600px){.products-grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <!-- NAV -->
  <nav style="position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #dbeafe;padding:0 2rem;box-shadow:0 1px 4px rgba(37,99,235,0.06);">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:4rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="width:2rem;height:2rem;background:${accentColor};border-radius:0.4rem;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.9rem;">
          <i class="fas fa-briefcase"></i>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          ${buildLogoBlock(businessData, primaryColor, accentColor)}
        <span style="font-weight:800;font-size:1.2rem;color:${primaryColor};">${storeName}</span>
        </div>
      </div>
      <div style="display:flex;gap:2rem;font-size:0.9rem;font-weight:600;color:#64748b;">
        <a href="#" style="color:#64748b;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='#64748b'">Home</a>
        <a href="#services" style="color:#64748b;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='#64748b'">Services</a>
        <a href="#contact" style="color:#64748b;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='#64748b'">Contact</a>
      </div>
      ${phoneNumber ? `<a href="tel:${formattedPhone}" style="padding:0.6rem 1.25rem;background:${accentColor};color:#fff;border-radius:0.4rem;font-weight:700;font-size:0.85rem;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'"><i class="fas fa-phone" style="margin-right:0.4rem;"></i>${phoneNumber}</a>` : ''}
    </div>
  </nav>

  <!-- HERO -->
  <header style="background:linear-gradient(135deg,${primaryColor} 0%,${accentColor} 100%);padding:6rem 2rem;color:#fff;">
    <div style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
      <div>
        <div style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.3rem 0.9rem;background:rgba(255,255,255,0.15);border-radius:9999px;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1.5rem;border:1px solid rgba(255,255,255,0.25);">
          <i class="fas fa-shield-alt"></i> Trusted Business
        </div>
        <h1 style="font-size:clamp(2rem,4.5vw,3.5rem);font-weight:800;line-height:1.15;margin-bottom:1.25rem;">${storeName}</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:1.05rem;line-height:1.7;margin-bottom:2.5rem;max-width:460px;">${description}</p>
        <div style="display:flex;flex-wrap:wrap;gap:1rem;">
          <a href="#services" style="padding:0.9rem 1.75rem;background:#fff;color:${primaryColor};border-radius:0.5rem;font-weight:800;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Our Services</a>
          <a href="#contact" style="padding:0.9rem 1.75rem;background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.35);border-radius:0.5rem;font-weight:700;text-decoration:none;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'">Get in Touch</a>
        </div>
      </div>
      <div style="display:flex;justify-content:center;">
        <div style="width:360px;height:320px;border-radius:1rem;overflow:hidden;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
          <img src="${heroImage || `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80`}" style="width:100%;height:100%;object-fit:cover;" alt="hero" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </header>

  <!-- SERVICES -->
  <section id="services" style="max-width:1280px;margin:0 auto;padding:5rem 2rem;">
    <div style="text-align:center;margin-bottom:3rem;">
      <h2 style="font-size:2rem;font-weight:800;color:${primaryColor};margin-bottom:0.5rem;">Our Services</h2>
      <div style="width:4rem;height:3px;background:${accentColor};border-radius:9999px;margin:0 auto;"></div>
    </div>
    <div class="products-grid">${productsHtml}</div>
  </section>

  <!-- CONTACT -->
  <section id="contact" style="background:#eff6ff;padding:4rem 2rem;text-align:center;">
    <h3 style="font-size:1.75rem;font-weight:800;color:${primaryColor};margin-bottom:1.5rem;">Contact Us</h3>
    <div style="display:inline-block;background:#fff;border:1px solid #dbeafe;border-radius:0.75rem;padding:2rem;box-shadow:0 4px 16px rgba(37,99,235,0.07);text-align:left;min-width:280px;line-height:2.2;">
      ${buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, accentColor)}
      ${socialLinksHtml ? `<div style="margin-top:1rem;display:flex;gap:0.75rem;">${socialLinksHtml}</div>` : ''}
    </div>
  </section>

  <footer style="background:${primaryColor};padding:2rem;text-align:center;color:rgba(255,255,255,0.6);font-size:0.85rem;">
    <p>© 2026 ${storeName}. Powered by <span style="color:#93c5fd;font-weight:700;">VendorBuild</span></p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  T7 — VOGUE  (editorial fashion, black & white)
// ─────────────────────────────────────────────
function generateVogueTemplate(businessData, productImages, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Store';
  const storeName = businessData.storeName || businessName;
  const description = businessData.description || 'Curated fashion for the bold.';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  const services = resolveProducts(products, businessData);
  const primaryColor = theme?.primaryColor || '#000000';
  const accentColor = theme?.accentColor || '#6B7280';
  const heroBg = heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80';
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  const encodedLocation = encodeURIComponent(address);

  const productsHtml = services.map((service, i) => {
    const name = typeof service === 'object' ? service.name : service;
    const price = typeof service === 'object' ? service.price : (Math.random() * 200 + 50).toFixed(2);
    const desc = typeof service === 'object' ? (service.description || '') : '';
    let img = `https://picsum.photos/seed/${encodeURIComponent(name)}${i}/600/800`;
    if (productImages && productImages[i]) img = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    return `
    <div style="background:#fff;overflow:hidden;border-bottom:2px solid #000;transition:transform 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
      <div style="height:300px;overflow:hidden;background:#f5f5f5;position:relative;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(20%);transition:filter 0.4s,transform 0.5s;" onmouseover="this.style.filter='grayscale(0%)';this.style.transform='scale(1.05)'" onmouseout="this.style.filter='grayscale(20%)';this.style.transform='scale(1)'" alt="${name}" onerror="this.src='https://picsum.photos/seed/fashion${i}/600/800'">
        <div style="position:absolute;top:1rem;left:1rem;background:#000;color:#fff;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:0.25rem 0.6rem;">New</div>
      </div>
      <div style="padding:1.25rem 1rem;">
        <h4 style="font-family:'Bodoni Moda',serif;font-size:1.05rem;font-weight:600;color:#000;margin:0 0 0.3rem;letter-spacing:0.02em;">${name}</h4>
        ${desc ? `<p style="font-size:0.78rem;color:#6b7280;margin:0 0 0.6rem;">${desc}</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:700;color:#000;font-size:1rem;">₹${price}</span>
          <button data-cart-add="true" data-product-name="${name}" data-product-price="${price}" data-product-image="${img}" style="background:#000;color:#fff;border:none;padding:0.45rem 0.9rem;font-size:0.78rem;font-weight:700;cursor:pointer;letter-spacing:0.05em;transition:background 0.2s;" onmouseover="this.style.background='#333'" onmouseout="this.style.background='#000'">ADD TO BAG</button>
        </div>
      </div>
    </div>`;
  }).join('');

  const socialLinksHtml = buildSocialLinks(socialMedia, phoneNumber, whatsappUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${businessName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'DM Sans',sans-serif;background:#fff;color:#000;overflow-x:hidden;}
    html{scroll-behavior:smooth;}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:0.1rem;}
    @media(max-width:600px){.products-grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <!-- TOP BAR -->
  <div style="background:#000;color:#fff;text-align:center;padding:0.5rem;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;">Free shipping on orders over ₹100</div>

  <!-- NAV -->
  <nav style="position:sticky;top:0;z-index:100;background:#fff;border-bottom:2px solid #000;padding:0 2rem;">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:4.5rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        ${buildLogoBlock(businessData, primaryColor, accentColor)}
      <span style="font-family:'Bodoni Moda',serif;font-size:1.8rem;font-weight:700;color:#000;letter-spacing:-0.02em;">${storeName}</span>
      </div>
      <div style="display:flex;gap:2.5rem;font-size:0.8rem;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#000;">
        <a href="#" style="color:#000;text-decoration:none;border-bottom:1px solid transparent;transition:border-color 0.2s;" onmouseover="this.style.borderColor='#000'" onmouseout="this.style.borderColor='transparent'">Home</a>
        <a href="#collection" style="color:#000;text-decoration:none;border-bottom:1px solid transparent;transition:border-color 0.2s;" onmouseover="this.style.borderColor='#000'" onmouseout="this.style.borderColor='transparent'">Collection</a>
        <a href="#contact" style="color:#000;text-decoration:none;border-bottom:1px solid transparent;transition:border-color 0.2s;" onmouseover="this.style.borderColor='#000'" onmouseout="this.style.borderColor='transparent'">Contact</a>
      </div>
      <i class="fas fa-shopping-bag" style="font-size:1.25rem;cursor:pointer;"></i>
    </div>
  </nav>

  <!-- HERO -->
  <header style="position:relative;height:90vh;display:flex;align-items:flex-end;overflow:hidden;">
    <img src="${heroBg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(30%);" alt="hero" onerror="this.style.display='none'">
    <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.8) 30%,rgba(0,0,0,0.1));"></div>
    <div style="position:relative;z-index:10;max-width:1280px;margin:0 auto;padding:4rem 2rem;width:100%;">
      <p style="font-size:0.7rem;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:0.75rem;">New Season</p>
      <h1 style="font-family:'Bodoni Moda',serif;font-size:clamp(3rem,7vw,6rem);font-weight:700;color:#fff;line-height:1.05;margin-bottom:1.5rem;letter-spacing:-0.02em;">${description}</h1>
      <a href="#collection" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.9rem 2rem;background:#fff;color:#000;font-weight:700;font-size:0.85rem;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;transition:background 0.2s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='#fff'">Shop Collection <i class="fas fa-arrow-right"></i></a>
    </div>
  </header>

  <!-- COLLECTION -->
  <section id="collection" style="padding:4rem 0;">
    <div style="max-width:1280px;margin:0 auto;padding:0 2rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;border-bottom:1px solid #e5e7eb;padding-bottom:1rem;">
        <h2 style="font-family:'Bodoni Moda',serif;font-size:1.75rem;font-weight:600;">The Collection</h2>
        <span style="font-size:0.8rem;color:#6b7280;">${services.length} pieces</span>
      </div>
    </div>
    <div style="max-width:1280px;margin:0 auto;padding:0 2rem;">
      <div class="products-grid">${productsHtml}</div>
    </div>
  </section>

  <!-- CONTACT -->
  <section id="contact" style="background:#f9fafb;padding:4rem 2rem;text-align:center;border-top:1px solid #e5e7eb;">
    <h3 style="font-family:'Bodoni Moda',serif;font-size:2rem;margin-bottom:1.5rem;">Contact & Stockists</h3>
    <div style="display:inline-block;text-align:left;min-width:280px;line-height:2.2;color:#374151;">
      ${buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, '#000')}
      ${socialLinksHtml ? `<div style="margin-top:1rem;display:flex;gap:0.75rem;">${socialLinksHtml}</div>` : ''}
    </div>
  </section>

  <footer style="background:#000;padding:2rem;text-align:center;color:rgba(255,255,255,0.5);font-size:0.8rem;letter-spacing:0.06em;text-transform:uppercase;">
    <p>© 2026 ${storeName}. Powered by <span style="color:#fff;font-weight:700;">VendorBuild</span></p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  T8 — PIXEL  (dark green tech, grid-heavy)
// ─────────────────────────────────────────────
function generatePixelTemplate(businessData, productImages, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Store';
  const storeName = businessData.storeName || businessName;
  const description = businessData.description || 'High-performance gear for every setup.';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  const services = resolveProducts(products, businessData);
  const primaryColor = theme?.primaryColor || '#020617';
  const accentColor = theme?.accentColor || '#10B981';
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  const encodedLocation = encodeURIComponent(address);

  const productsHtml = services.map((service, i) => {
    const name = typeof service === 'object' ? service.name : service;
    const price = typeof service === 'object' ? service.price : (Math.random() * 300 + 50).toFixed(2);
    const desc = typeof service === 'object' ? (service.description || '') : '';
    let img = `https://picsum.photos/seed/${encodeURIComponent(name)}${i}/600/600`;
    if (productImages && productImages[i]) img = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    return `
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:0.5rem;overflow:hidden;transition:border-color 0.25s,box-shadow 0.25s;" onmouseover="this.style.borderColor='${accentColor}';this.style.boxShadow='0 0 20px rgba(16,185,129,0.15)'" onmouseout="this.style.borderColor='#1e293b';this.style.boxShadow='none'">
      <div style="height:200px;overflow:hidden;background:#020617;position:relative;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;" alt="${name}" onerror="this.src='https://picsum.photos/seed/pixel${i}/600/600'">
        <div style="position:absolute;top:0.6rem;right:0.6rem;background:rgba(16,185,129,0.2);border:1px solid ${accentColor};border-radius:0.25rem;padding:0.15rem 0.5rem;font-size:0.65rem;font-weight:700;color:${accentColor};letter-spacing:0.08em;">IN STOCK</div>
      </div>
      <div style="padding:1rem;">
        <h4 style="font-weight:700;color:#e2e8f0;font-size:0.95rem;margin:0 0 0.35rem;font-family:'Share Tech Mono',monospace;">${name}</h4>
        ${desc ? `<p style="font-size:0.78rem;color:#64748b;margin:0 0 0.75rem;font-family:monospace;">${desc}</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.5rem;">
          <span style="font-weight:800;color:${accentColor};font-size:1.05rem;font-family:'Share Tech Mono',monospace;">₹${price}</span>
          <button data-cart-add="true" data-product-name="${name}" data-product-price="${price}" data-product-image="${img}" style="background:transparent;color:${accentColor};border:1px solid ${accentColor};padding:0.4rem 0.85rem;border-radius:0.3rem;font-size:0.78rem;font-weight:700;cursor:pointer;transition:background 0.2s,color 0.2s;" onmouseover="this.style.background='${accentColor}';this.style.color='#020617'" onmouseout="this.style.background='transparent';this.style.color='${accentColor}'">Add to Cart</button>
        </div>
      </div>
    </div>`;
  }).join('');

  const socialLinksHtml = buildSocialLinks(socialMedia, phoneNumber, whatsappUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${businessName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Sora',sans-serif;background:#020617;color:#e2e8f0;overflow-x:hidden;}
    html{scroll-behavior:smooth;}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.25rem;}
    @media(max-width:600px){.products-grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <!-- NAV -->
  <nav style="position:sticky;top:0;z-index:100;background:#020617;border-bottom:1px solid #0f172a;padding:0 2rem;">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:3.75rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        ${buildLogoBlock(businessData, primaryColor, accentColor)}
      <span style="font-family:'Share Tech Mono',monospace;font-size:1.2rem;color:${accentColor};">&gt; ${storeName}_</span>
      </div>
      <div style="display:flex;gap:2rem;font-size:0.82rem;font-weight:600;color:#64748b;letter-spacing:0.06em;text-transform:uppercase;">
        <a href="#" style="color:#64748b;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='#64748b'">Home</a>
        <a href="#products" style="color:#64748b;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='#64748b'">Store</a>
        <a href="#contact" style="color:#64748b;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='#64748b'">Contact</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <header style="padding:5rem 2rem;background:linear-gradient(180deg,#020617,#0f172a);border-bottom:1px solid #1e293b;">
    <div style="max-width:1280px;margin:0 auto;">
      <div style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;color:${accentColor};margin-bottom:1rem;letter-spacing:0.1em;">// WELCOME TO ${businessName.toUpperCase()}</div>
      <h1 style="font-size:clamp(2.5rem,5vw,4rem);font-weight:800;color:#f8fafc;line-height:1.1;margin-bottom:1.25rem;letter-spacing:-0.03em;">${storeName}<span style="color:${accentColor};">.</span></h1>
      <p style="color:#94a3b8;font-size:1rem;max-width:500px;line-height:1.7;margin-bottom:2.5rem;">${description}</p>
      <div style="display:flex;flex-wrap:wrap;gap:1rem;">
        <a href="#products" style="padding:0.8rem 1.75rem;background:${accentColor};color:#020617;border-radius:0.35rem;font-weight:800;text-decoration:none;font-size:0.9rem;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">Browse Store</a>
        ${phoneNumber ? `<a href="${whatsappUrl}" target="_blank" style="padding:0.8rem 1.75rem;background:transparent;border:1px solid ${accentColor};color:${accentColor};border-radius:0.35rem;font-weight:700;text-decoration:none;font-size:0.9rem;transition:background 0.2s,color 0.2s;" onmouseover="this.style.background='${accentColor}';this.style.color='#020617'" onmouseout="this.style.background='transparent';this.style.color='${accentColor}'"><i class="fab fa-whatsapp" style="margin-right:0.4rem;"></i>WhatsApp</a>` : ''}
      </div>
    </div>
  </header>

  <!-- PRODUCTS -->
  <section id="products" style="max-width:1280px;margin:0 auto;padding:4rem 2rem;">
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;">
      <div style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:${accentColor};letter-spacing:0.1em;">// PRODUCT_CATALOG</div>
      <div style="flex:1;height:1px;background:#1e293b;"></div>
      <span style="font-size:0.78rem;color:#475569;">${services.length} items</span>
    </div>
    <div class="products-grid">${productsHtml}</div>
  </section>

  <!-- CONTACT -->
  <section id="contact" style="background:#0f172a;border-top:1px solid #1e293b;padding:4rem 2rem;">
    <div style="max-width:48rem;margin:0 auto;">
      <div style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:${accentColor};margin-bottom:1rem;">// CONTACT_INFO</div>
      <div style="background:#020617;border:1px solid #1e293b;border-radius:0.5rem;padding:2rem;line-height:2.2;color:#94a3b8;">
        ${buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, accentColor)}
        ${socialLinksHtml ? `<div style="margin-top:1rem;display:flex;gap:0.75rem;">${socialLinksHtml}</div>` : ''}
      </div>
    </div>
  </section>

  <footer style="background:#020617;border-top:1px solid #0f172a;padding:1.5rem;text-align:center;color:#334155;font-size:0.78rem;font-family:'Share Tech Mono',monospace;">
    <p>// © 2026 ${storeName}. Powered by VendorBuild</p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  T9 — GLOW  (fresh green, organic/natural)
// ─────────────────────────────────────────────
function generateGlowTemplate(businessData, productImages, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Store';
  const storeName = businessData.storeName || businessName;
  const description = businessData.description || 'Pure. Natural. Sustainable.';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  const services = resolveProducts(products, businessData);
  const primaryColor = theme?.primaryColor || '#064E3B';
  const accentColor = theme?.accentColor || '#10B981';
  const heroBg = heroImage || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80';
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  const encodedLocation = encodeURIComponent(address);

  const productsHtml = services.map((service, i) => {
    const name = typeof service === 'object' ? service.name : service;
    const price = typeof service === 'object' ? service.price : (Math.random() * 60 + 15).toFixed(2);
    const desc = typeof service === 'object' ? (service.description || '') : '';
    let img = `https://picsum.photos/seed/${encodeURIComponent(name)}${i}/600/600`;
    if (productImages && productImages[i]) img = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    return `
    <div style="background:#fff;border-radius:1rem;overflow:hidden;border:1px solid #d1fae5;transition:box-shadow 0.3s,transform 0.3s;" onmouseover="this.style.boxShadow='0 16px 36px rgba(16,185,129,0.15)';this.style.transform='translateY(-5px)'" onmouseout="this.style.boxShadow='none';this.style.transform='translateY(0)'">
      <div style="height:230px;overflow:hidden;background:#ecfdf5;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'" alt="${name}" onerror="this.src='https://picsum.photos/seed/organic${i}/600/600'">
      </div>
      <div style="padding:1.25rem;">
        <div style="display:inline-block;background:#d1fae5;color:${primaryColor};font-size:0.65rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:9999px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">🌿 Natural</div>
        <h4 style="font-weight:700;color:${primaryColor};font-size:1rem;margin:0 0 0.4rem;">${name}</h4>
        ${desc ? `<p style="font-size:0.82rem;color:#6b7280;margin:0 0 0.75rem;">${desc}</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:800;color:${accentColor};font-size:1.1rem;">₹${price}</span>
          <button data-cart-add="true" data-product-name="${name}" data-product-price="${price}" data-product-image="${img}" style="background:${accentColor};color:#fff;border:none;padding:0.5rem 1.1rem;border-radius:9999px;font-weight:700;font-size:0.82rem;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='${primaryColor}'" onmouseout="this.style.background='${accentColor}'">Add to Cart</button>
        </div>
      </div>
    </div>`;
  }).join('');

  const socialLinksHtml = buildSocialLinks(socialMedia, phoneNumber, whatsappUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${businessName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Nunito',sans-serif;background:#f0fdf4;color:#064e3b;overflow-x:hidden;}
    html{scroll-behavior:smooth;}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.75rem;}
    @media(max-width:600px){.products-grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <!-- NAV -->
  <nav style="position:sticky;top:0;z-index:100;background:#fff;border-bottom:2px solid #d1fae5;padding:0 2rem;">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:4rem;">
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <span style="font-size:1.4rem;">🌿</span>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          ${buildLogoBlock(businessData, primaryColor, accentColor)}
        <span style="font-weight:900;font-size:1.3rem;color:${primaryColor};">${storeName}</span>
        </div>
      </div>
      <div style="display:flex;gap:2rem;font-size:0.9rem;font-weight:700;color:#065f46;">
        <a href="#" style="color:#065f46;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='#065f46'">Home</a>
        <a href="#products" style="color:#065f46;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='#065f46'">Shop</a>
        <a href="#contact" style="color:#065f46;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='#065f46'">Contact</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <header style="position:relative;min-height:80vh;display:flex;align-items:center;overflow:hidden;">
    <img src="${heroBg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" alt="hero" onerror="this.style.display='none'">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(6,78,59,0.88) 40%,rgba(16,185,129,0.4));"></div>
    <div style="position:relative;z-index:10;max-width:1280px;margin:0 auto;padding:4rem 2rem;">
      <div style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.35rem 0.9rem;background:rgba(255,255,255,0.15);border-radius:9999px;font-size:0.75rem;font-weight:700;color:#a7f3d0;border:1px solid rgba(167,243,208,0.3);margin-bottom:1.5rem;backdrop-filter:blur(4px);">
        🌱 100% Natural & Organic
      </div>
      <h1 style="font-size:clamp(2.5rem,5.5vw,4.5rem);font-weight:900;color:#fff;line-height:1.1;margin-bottom:1.25rem;letter-spacing:-0.02em;">${storeName}</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:1.1rem;max-width:480px;line-height:1.7;margin-bottom:2.5rem;">${description}</p>
      <div style="display:flex;flex-wrap:wrap;gap:1rem;">
        <a href="#products" style="padding:0.9rem 2rem;background:#fff;color:${primaryColor};border-radius:9999px;font-weight:800;text-decoration:none;box-shadow:0 4px 14px rgba(255,255,255,0.3);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">Shop Natural 🌿</a>
        ${phoneNumber ? `<a href="${whatsappUrl}" target="_blank" style="padding:0.9rem 2rem;background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.4);border-radius:9999px;font-weight:700;text-decoration:none;backdrop-filter:blur(4px);transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'"><i class="fab fa-whatsapp" style="margin-right:0.4rem;"></i>Chat with Us</a>` : ''}
      </div>
    </div>
  </header>

  <!-- PRODUCTS -->
  <section id="products" style="max-width:1280px;margin:0 auto;padding:5rem 2rem;">
    <div style="text-align:center;margin-bottom:3rem;">
      <h2 style="font-size:2.25rem;font-weight:900;color:${primaryColor};margin-bottom:0.5rem;">Natural Collection</h2>
      <p style="color:#6b7280;">Ethically sourced. Sustainably packaged.</p>
    </div>
    <div class="products-grid">${productsHtml}</div>
  </section>

  <!-- CONTACT -->
  <section id="contact" style="background:#ecfdf5;padding:4rem 2rem;text-align:center;">
    <h3 style="font-size:2rem;font-weight:900;color:${primaryColor};margin-bottom:1.5rem;">🌿 Get in Touch</h3>
    <div style="display:inline-block;background:#fff;border:1px solid #d1fae5;border-radius:1rem;padding:2rem;box-shadow:0 4px 20px rgba(16,185,129,0.08);text-align:left;min-width:280px;line-height:2.2;">
      ${buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, accentColor)}
      ${socialLinksHtml ? `<div style="margin-top:1rem;display:flex;gap:0.75rem;">${socialLinksHtml}</div>` : ''}
    </div>
  </section>

  <footer style="background:${primaryColor};padding:2rem;text-align:center;color:rgba(167,243,208,0.7);font-size:0.85rem;">
    <p>© 2026 ${storeName}. Powered by <span style="color:#a7f3d0;font-weight:700;">VendorBuild</span></p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  REMAINING HELPERS
// ─────────────────────────────────────────────

function generateWebsiteCSS(theme) {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
    .btn-primary { background: ${theme?.primaryColor || '#4CAF50'}; color: white; }
  `;
}

function extractNameFromText(text) {
  const patterns = [
    /(?:shop|store|business) name (?:is|called) ([^.]+)/i,
    /my (?:shop|store) (?:is|called) ([^.]+)/i,
    /^([^.]+) (?:shop|store)/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return text.split('.')[0].split(' ').slice(0, 3).join(' ');
}

function detectCategory(text) {
  const t = text.toLowerCase();
  if (t.includes('restaurant') || t.includes('food') || t.includes('hotel')) return 'restaurant';
  if (t.includes('tailor') || t.includes('stitch')) return 'tailor';
  if (t.includes('grocery') || t.includes('vegetable') || t.includes('fruit')) return 'grocery';
  if (t.includes('salon') || t.includes('hair') || t.includes('beauty')) return 'salon';
  if (t.includes('mechanic') || t.includes('repair')) return 'mechanic';
  if (t.includes('tea') || t.includes('chai')) return 'tea_shop';
  return 'other';
}

function extractLocation(text) {
  const patterns = [/(?:in|at|near) ([^.]+?)(?:\.|$)/i, /located (?:in|at) ([^.]+?)(?:\.|$)/i];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return '';
}

function extractPhoneNumber(text) {
  const match = text.match(/(\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g);
  return match ? match[0] : '';
}

function extractEmail(text) {
  const match = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
  return match ? match[0] : '';
}

function extractServices(text) {
  const services = [];
  const indicators = ['sell', 'provide', 'offer', 'service', 'make', 'stitch', 'repair'];
  for (const sentence of text.split(/[.,;]/)) {
    for (const indicator of indicators) {
      if (sentence.toLowerCase().includes(indicator)) { services.push(sentence.trim()); break; }
    }
  }
  return services.slice(0, 10);
}

function parseCommand(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('add') && (lowerText.includes('product') || lowerText.includes('item'))) {
    let productName = text.replace(/add|product|item/gi, '').trim();
    const priceMatch = productName.match(/\$?(\d+(?:\.\d{2})?)/);
    let price = null;
    if (priceMatch) { price = priceMatch[1]; productName = productName.replace(priceMatch[0], '').trim(); }
    return { action: 'ADD_PRODUCT', data: { productName: productName || 'New Product', price: price || '49.99' }, message: price ? `✅ Added "${productName}" for ₹${price}!` : `✅ Added "${productName}" to your catalog!` };
  }
  if (lowerText.includes('change') && (lowerText.includes('theme') || lowerText.includes('color'))) {
    const colors = { 'red': '#FF4444', 'blue': '#3B82F6', 'green': '#10B981', 'orange': '#F97316', 'purple': '#8B5CF6', 'pink': '#EC4899', 'yellow': '#F59E0B', 'indigo': '#6366F1', 'teal': '#14B8A6' };
    for (const [colorName, colorCode] of Object.entries(colors)) {
      if (lowerText.includes(colorName)) return { action: 'CHANGE_THEME', data: { color: colorCode, colorName }, message: `✅ Theme color changed to ${colorName}!` };
    }
  }
  if (lowerText.includes('phone') || lowerText.includes('whatsapp')) {
    const phoneMatch = text.match(/\d{10,12}/);
    if (phoneMatch) return { action: 'UPDATE_PHONE', data: { phone: phoneMatch[0] }, message: `✅ Phone number updated to ${phoneMatch[0]}!` };
  }
  if (lowerText.includes('instagram') || lowerText.includes('facebook') || lowerText.includes('twitter')) {
    let platform = lowerText.includes('instagram') ? 'instagram' : lowerText.includes('facebook') ? 'facebook' : 'twitter';
    return { action: 'ADD_SOCIAL_MEDIA', data: { platform }, message: `✅ You can add your ${platform} link in the store details section!` };
  }
  return { action: 'UNKNOWN', data: {}, message: "I can help you:\n• Add products (e.g., 'Add a blue shirt for ₹25')\n• Change theme colors (e.g., 'Change theme to red')\n• Update phone number (e.g., 'Change phone to 9876543210')\n• Add social media links" };
}

// AI Image Generator for custom website backgrounds
router.post('/generate-background', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    let finalPrompt = prompt;
    if (style && style !== 'default') {
      finalPrompt += `, styled as ${style}`;
    }

    // Optimize user prompt using Gemini if API key is present
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo-key') {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        const systemPrompt = `Optimize this user prompt to generate a beautiful, clean, high-quality, professional website hero background banner. Keep it clean, atmospheric, and suitable to overlay text on it. Output ONLY the optimized prompt text. User prompt: "${finalPrompt}"`;
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text().trim();
        if (text) {
          finalPrompt = text;
        }
      } catch (err) {
        console.error('Gemini optimization failed, fallback to original prompt:', err);
      }
    }

    // Call Pollinations AI to generate the image
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1200&height=800&nologo=true&private=true&seed=${Math.floor(Math.random() * 100000)}`;
    const imageRes = await axios.get(pollinationsUrl, { responseType: 'arraybuffer' });

    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save image locally
    const filename = `ai-bg-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, imageRes.data);

    res.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error('AI background generation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;