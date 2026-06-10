const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const FormData = require('form-data');

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Extract business info from voice/text
router.post('/extract-business', async (req, res) => {
  try {
    const { text } = req.body;

    // For demo without API key, return mock data
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

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Extract business information from: "${text}"
    Return ONLY JSON: {"businessName": "", "category": "restaurant/tailor/grocery/salon/mechanic/home_service", "location": "", "services": [], "description": "", "phone": "", "email": ""}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const businessData = JSON.parse(response.text());

    res.json(businessData);
  } catch (error) {
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
    
    // Try to remove background if API key is available
    if (process.env.REMOVE_BG_API_KEY) {
      try {
        const removedBgPath = await removeBackground(req.file.path);
        if (removedBgPath) {
          finalImageUrl = `/uploads/${path.basename(removedBgPath)}`;
        }
      } catch (bgError) {
        console.error('Background removal failed:', bgError);
        // Continue with original image
      }
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

// Remove background from image
async function removeBackground(imagePath) {
  try {
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(imagePath));
    formData.append('size', 'auto');
    
    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVE_BG_API_KEY
      },
      responseType: 'arraybuffer'
    });
    
    const outputPath = imagePath.replace(/\.\w+$/, '-nobg.png');
    fs.writeFileSync(outputPath, response.data);
    
    return outputPath;
  } catch (error) {
    console.error('Remove.bg API error:', error.message);
    return null;
  }
}

// Generate website with all features
router.post('/generate-website', async (req, res) => {
  try {
    const { businessData, productImages, template, theme, heroImage, products } = req.body;

    if (!businessData) {
      return res.status(400).json({ error: 'businessData is required' });
    }

    // Generate HTML/CSS for the website
    const html = generateWebsiteHTML(businessData, productImages, template, theme, heroImage, products);
    const css = generateWebsiteCSS(theme);

    res.json({ html, css });
  } catch (error) {
    console.error('Generate website error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI Assistant - process natural language commands
router.post('/assistant', async (req, res) => {
  try {
    const { message, businessData } = req.body;

    const command = parseCommand(message);

    // Process based on command type
    let response = {};
    
    switch (command.action) {
      case 'ADD_PRODUCT':
        response = {
          action: command.action,
          data: command.data,
          message: command.message
        };
        break;
      case 'CHANGE_THEME':
        response = {
          action: command.action,
          data: command.data,
          message: command.message
        };
        break;
      case 'UPDATE_PHONE':
        response = {
          action: command.action,
          data: command.data,
          message: command.message
        };
        break;
      case 'ADD_SOCIAL_MEDIA':
        response = {
          action: command.action,
          data: command.data,
          message: command.message
        };
        break;
      default:
        response = {
          action: 'UNKNOWN',
          data: {},
          message: "I can help you:\n• Add products (e.g., 'Add a blue shirt for $25')\n• Change theme colors (e.g., 'Change theme to red')\n• Update phone number (e.g., 'Change phone to 9876543210')\n• Add social media links"
        };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
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
  const lowerText = text.toLowerCase();
  if (lowerText.includes('restaurant') || lowerText.includes('food') || lowerText.includes('hotel')) return 'restaurant';
  if (lowerText.includes('tailor') || lowerText.includes('stitch')) return 'tailor';
  if (lowerText.includes('grocery') || lowerText.includes('vegetable') || lowerText.includes('fruit')) return 'grocery';
  if (lowerText.includes('salon') || lowerText.includes('hair') || lowerText.includes('beauty')) return 'salon';
  if (lowerText.includes('mechanic') || lowerText.includes('repair')) return 'mechanic';
  if (lowerText.includes('tea') || lowerText.includes('chai')) return 'tea_shop';
  return 'other';
}

function extractLocation(text) {
  const patterns = [
    /(?:in|at|near) ([^.]+?)(?:\.|$)/i,
    /located (?:in|at) ([^.]+?)(?:\.|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return '';
}

function extractPhoneNumber(text) {
  const phoneRegex = /(\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g;
  const match = text.match(phoneRegex);
  return match ? match[0] : '';
}

function extractEmail(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
}

function extractServices(text) {
  const services = [];
  const serviceIndicators = ['sell', 'provide', 'offer', 'service', 'make', 'stitch', 'repair'];

  const sentences = text.split(/[.,;]/);
  for (const sentence of sentences) {
    for (const indicator of serviceIndicators) {
      if (sentence.toLowerCase().includes(indicator)) {
        services.push(sentence.trim());
        break;
      }
    }
  }

  return services.slice(0, 10); // Unlimited products now
}

function parseCommand(text) {
  const lowerText = text.toLowerCase();

  // Add product command
  if (lowerText.includes('add') && (lowerText.includes('product') || lowerText.includes('item'))) {
    // Extract product name
    let productName = text.replace(/add|product|item/gi, '').trim();
    // Extract price if exists
    const priceMatch = productName.match(/\$?(\d+(?:\.\d{2})?)/);
    let price = null;
    if (priceMatch) {
      price = priceMatch[1];
      productName = productName.replace(priceMatch[0], '').trim();
    }
    
    return {
      action: 'ADD_PRODUCT',
      data: { productName: productName || 'New Product', price: price || '49.99' },
      message: price ? `✅ Added "${productName}" for $${price}!` : `✅ Added "${productName}" to your catalog!`
    };
  }

  // Change theme command
  if (lowerText.includes('change') && (lowerText.includes('theme') || lowerText.includes('color'))) {
    const colors = {
      'red': '#FF4444', 'blue': '#3B82F6', 'green': '#10B981',
      'orange': '#F97316', 'purple': '#8B5CF6', 'pink': '#EC4899',
      'yellow': '#F59E0B', 'indigo': '#6366F1', 'teal': '#14B8A6'
    };

    for (const [colorName, colorCode] of Object.entries(colors)) {
      if (lowerText.includes(colorName)) {
        return {
          action: 'CHANGE_THEME',
          data: { color: colorCode, colorName: colorName },
          message: `✅ Theme color changed to ${colorName}!`
        };
      }
    }
  }

  // Update phone command
  if (lowerText.includes('phone') || lowerText.includes('whatsapp')) {
    const phoneMatch = text.match(/\d{10,12}/);
    if (phoneMatch) {
      return {
        action: 'UPDATE_PHONE',
        data: { phone: phoneMatch[0] },
        message: `✅ Phone number updated to ${phoneMatch[0]}!`
      };
    }
  }

  // Add social media command
  if (lowerText.includes('instagram') || lowerText.includes('facebook') || lowerText.includes('twitter')) {
    let platform = '';
    if (lowerText.includes('instagram')) platform = 'instagram';
    if (lowerText.includes('facebook')) platform = 'facebook';
    if (lowerText.includes('twitter')) platform = 'twitter';
    
    return {
      action: 'ADD_SOCIAL_MEDIA',
      data: { platform: platform },
      message: `✅ You can add your ${platform} link in the store details section!`
    };
  }

  return {
    action: 'UNKNOWN',
    data: {},
    message: "I can help you:\n• Add products (e.g., 'Add a blue shirt for $25')\n• Change theme colors (e.g., 'Change theme to red')\n• Update phone number (e.g., 'Change phone to 9876543210')\n• Add social media links"
  };
}

function generateWebsiteHTML(businessData, productImages, template, theme, heroImage, products) {
  const businessName = businessData.businessName || 'My Store';
  const description = businessData.description || 'Welcome to our store';
  const phoneNumber = businessData.phone || businessData.socialMedia?.whatsapp || '+1234567890';
  const email = businessData.email || '';
  const address = businessData.address || '';
  const socialMedia = businessData.socialMedia || {};
  
  let services = businessData.services || [];
  
  // Use products from frontend if provided
  if (products && products.length > 0) {
    services = products;
  } else if (services.length === 0) {
    services = [
      { name: 'Premium Collection', price: '49.99', description: 'High quality premium product', image: null },
      { name: 'Exclusive Deals', price: '89.99', description: 'Limited edition exclusive items', image: null },
      { name: 'New Arrivals', price: '129.99', description: 'Latest collection just arrived', image: null }
    ];
  }

  const location = address || businessData.location || 'Online Store';
  const encodedLocation = encodeURIComponent(location);
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;

  const primaryColor = theme?.primaryColor || '#111827';
  const secondaryColor = theme?.secondaryColor || '#F3F4F6';
  const accentColor = theme?.accentColor || '#3B82F6';
  const heroBg = heroImage || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80';

  // Generate product cards HTML with images
  const productsHtml = services.map((service, i) => {
    const productName = typeof service === 'object' ? service.name : service;
    const productPrice = typeof service === 'object' ? service.price : (Math.random() * 50 + 20).toFixed(2);
    const productDescription = typeof service === 'object' && service.description ? service.description : 'Premium quality product';
    let productImage = `https://picsum.photos/seed/${encodeURIComponent(productName)}${i}/600/600`;
    if (productImages && productImages[i]) {
      productImage = productImages[i].startsWith('http') ? productImages[i] : `http://localhost:5000${productImages[i]}`;
    }
    
    return `
            <div class="bg-white rounded-2xl overflow-hidden hover-lift border border-gray-100 group shadow-sm">
                <div class="relative h-64 sm:h-72 bg-gray-100 overflow-hidden">
                    <img src="${productImage}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${productName}" onerror="this.src='https://picsum.photos/seed/fallback/600/600'">
                    <div class="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/20 transition-colors duration-300"></div>
                    <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all cursor-pointer shadow-sm z-10">
                        <i class="far fa-heart"></i>
                    </div>
                    <div class="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                        <button class="w-full bg-white/95 backdrop-blur-md text-gray-900 py-3 rounded-xl font-bold shadow-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
                <div class="p-6 md:p-8 text-center bg-white relative z-20 border-t border-gray-50">
                    <div class="text-accent text-xs font-bold uppercase tracking-wider mb-2">Product</div>
                    <h4 class="font-extrabold text-xl md:text-2xl mb-3 text-gray-900 font-heading truncate" title="${productName}">${productName}</h4>
                    ${productDescription ? `<p class="text-gray-500 text-sm mb-4 line-clamp-2">${productDescription}</p>` : ''}
                    <p class="text-xl md:text-2xl font-bold text-gray-900">$${productPrice}</p>
                </div>
            </div>`;
  }).join('');

  // Social media links HTML
  const socialLinksHtml = [];
  if (socialMedia.whatsapp || phoneNumber) {
    socialLinksHtml.push(`
      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white hover:scale-110 transition-transform shadow-lg">
        <i class="fab fa-whatsapp text-2xl"></i>
      </a>
    `);
  }
  if (socialMedia.instagram) {
    socialLinksHtml.push(`
      <a href="${socialMedia.instagram}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white hover:scale-110 transition-transform shadow-lg">
        <i class="fab fa-instagram text-2xl"></i>
      </a>
    `);
  }
  if (socialMedia.facebook) {
    socialLinksHtml.push(`
      <a href="${socialMedia.facebook}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-14 h-14 rounded-full bg-blue-700 text-white hover:scale-110 transition-transform shadow-lg">
        <i class="fab fa-facebook-f text-2xl"></i>
      </a>
    `);
  }
  if (socialMedia.twitter) {
    socialLinksHtml.push(`
      <a href="${socialMedia.twitter}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-14 h-14 rounded-full bg-gray-700 text-white hover:scale-110 transition-transform shadow-lg">
        <i class="fab fa-twitter text-2xl"></i>
      </a>
    `);
  }

  // Advanced, ultra-premium template
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${businessName}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '${primaryColor}',
              secondary: '${secondaryColor}',
              accent: '${accentColor}'
            },
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
              heading: ['"Poppins"', 'sans-serif'],
            },
            animation: {
              'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
              'pulse-slow': 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
              fadeInUp: {
                '0%': { opacity: '0', transform: 'translateY(20px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
              }
            }
          }
        }
      }
    </script>
    <style>
      .glass-nav {
        background: transparent;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
      }
      .glass-nav.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .glass-nav.scrolled .nav-text {
        color: #111827;
      }
      .hover-lift {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .hover-lift:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      #mobile-menu {
        transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
        max-height: 0;
        opacity: 0;
        overflow: hidden;
      }
      #mobile-menu.open {
        max-height: 300px;
        opacity: 1;
      }
      html {
        scroll-behavior: smooth;
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    </style>
</head>
<body class="bg-gray-50 font-sans text-gray-900 antialiased overflow-x-hidden">
    <!-- Sticky Navbar -->
    <nav id="navbar" class="fixed w-full z-[100] glass-nav border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <div class="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <i class="fas fa-store text-xl"></i>
                    </div>
                    <span class="font-extrabold text-2xl tracking-tighter text-white nav-text font-heading group-hover:text-primary transition-colors">${businessName}</span>
                </div>
                
                <!-- Desktop Menu -->
                <div class="hidden md:flex gap-8 font-semibold text-white nav-text">
                    <a href="#" class="hover:text-primary transition-colors py-2">Home</a>
                    <a href="#products" class="hover:text-primary transition-colors py-2">Shop</a>
                    <a href="#visit" class="hover:text-primary transition-colors py-2">Contact</a>
                </div>
                
                <div class="hidden md:flex items-center gap-4">
                    <button class="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white shadow-md hover:shadow-lg hover:scale-105 transition-all">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                </div>

                <!-- Mobile Hamburger -->
                <div class="md:hidden flex items-center gap-4">
                    <button class="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white shadow-md">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                    <button id="mobile-menu-btn" class="text-white nav-text text-2xl focus:outline-none">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="md:hidden bg-white shadow-xl absolute w-full">
            <div class="px-4 pt-2 pb-6 space-y-2">
                <a href="#" class="block px-3 py-3 rounded-md text-base font-bold text-gray-900 hover:bg-gray-50 hover:text-primary">Home</a>
                <a href="#products" class="block px-3 py-3 rounded-md text-base font-bold text-gray-900 hover:bg-gray-50 hover:text-primary">Shop</a>
                <a href="#visit" class="block px-3 py-3 rounded-md text-base font-bold text-gray-900 hover:bg-gray-50 hover:text-primary">Contact</a>
            </div>
        </div>
    </nav>

    <!-- Full-screen Hero Section -->
    <header class="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0 w-full h-full">
            <img src="${heroBg}" class="w-full h-full object-cover scale-105 animate-pulse-slow" alt="Hero Background" onerror="this.src='https://picsum.photos/seed/${encodeURIComponent(businessName)}/1200/800'">
            <div class="absolute inset-0 bg-black/60 sm:bg-gradient-to-b sm:from-black/70 sm:via-black/50 sm:to-black/80 w-full h-full"></div>
        </div>
        
        <div class="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center pt-20">
            <div class="max-w-3xl mx-auto md:mx-0 animate-fade-in-up text-center md:text-left">
                <span class="inline-block py-1 px-4 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs md:text-sm font-bold tracking-wider uppercase mb-6 backdrop-blur-sm">
                    <i class="fas fa-star mr-1"></i> Welcome
                </span>
                <h1 class="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight font-heading tracking-tight drop-shadow-2xl">
                    ${description ? description : 'Discover the Extraordinary'}
                </h1>
                <p class="text-lg md:text-xl text-gray-100 mb-10 font-medium leading-relaxed max-w-xl mx-auto md:mx-0 drop-shadow-md">
                    Experience unparalleled quality and style. We bring the best directly to you.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <a href="#products" class="px-8 py-4 rounded-xl font-bold text-gray-900 bg-white transition-all hover:bg-gray-100 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
                        Shop Collection <i class="fas fa-arrow-right"></i>
                    </a>
                    ${phoneNumber ? `<a href="${whatsappUrl}" target="_blank" class="px-8 py-4 rounded-xl font-bold bg-green-600 text-white transition-all hover:bg-green-700 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                        <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                    </a>` : ''}
                </div>
            </div>
        </div>
        
        <!-- Scroll indicator -->
        <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-70">
            <span class="text-white text-xs font-bold uppercase tracking-widest mb-2">Scroll</span>
            <div class="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
                <div class="w-1 h-2 bg-white rounded-full transition-transform duration-1000 ease-in-out"></div>
            </div>
        </div>
    </header>

    <!-- Premium Products Grid -->
    <section id="products" class="w-full max-w-7xl mx-auto px-4 lg:px-8 py-24">
        <div class="text-center mb-16 animate-fade-in-up" style="animation-delay: 0.2s;">
            <h2 class="text-3xl md:text-5xl font-extrabold mb-4 text-gray-900 font-heading tracking-tight">Featured Offerings</h2>
            <div class="w-24 h-1.5 bg-accent mx-auto rounded-full mb-6"></div>
            <p class="text-lg text-gray-500 max-w-2xl mx-auto">Handpicked selections guaranteed to elevate your lifestyle.</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            ${productsHtml || '<div class="text-center col-span-full">No products added yet.</div>'}
        </div>
    </section>

    <!-- Contact & Location Section -->
    <section id="visit" class="bg-secondary py-24 relative overflow-hidden w-full">
        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h3 class="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 font-heading">Get in Touch</h3>
            <p class="text-lg md:text-xl text-gray-600 mb-10">We'd love to hear from you. Reach out anytime!</p>
            
            <div class="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100">
                <div class="flex flex-col md:flex-row items-center justify-center gap-8">
                    ${phoneNumber ? `
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-2xl">
                            <i class="fas fa-phone-alt"></i>
                        </div>
                        <div>
                            <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">Call Us</div>
                            <a href="tel:${formattedPhone}" class="font-semibold text-gray-900 text-lg hover:text-primary transition-colors">${phoneNumber}</a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${email ? `
                    <div class="hidden md:block w-px h-16 bg-gray-200"></div>
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div>
                            <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">Email Us</div>
                            <a href="mailto:${email}" class="font-semibold text-gray-900 text-lg hover:text-primary transition-colors">${email}</a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${address ? `
                    <div class="hidden md:block w-px h-16 bg-gray-200"></div>
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-2xl">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">Visit Us</div>
                            <a href="https://maps.google.com/?q=${encodedLocation}" target="_blank" class="font-semibold text-gray-900 text-lg hover:text-primary transition-colors">${address}</a>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                ${socialLinksHtml.length > 0 ? `
                <div class="mt-8 pt-8 border-t border-gray-200">
                    <div class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Follow Us</div>
                    <div class="flex gap-4 justify-center">
                        ${socialLinksHtml.join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    </section>

    <!-- Rich Footer -->
    <footer class="bg-gray-900 pt-16 pb-8 text-gray-400 w-full">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
                <div class="col-span-1 sm:col-span-2">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white">
                            <i class="fas fa-store"></i>
                        </div>
                        <span class="font-extrabold text-2xl tracking-tighter text-white font-heading">${businessName}</span>
                    </div>
                    <p class="mb-6 max-w-sm leading-relaxed text-sm">Providing top-tier products and exceptional service to customers worldwide.</p>
                    ${phoneNumber ? `<div class="flex items-center gap-2 text-sm"><i class="fas fa-phone"></i> <span>${phoneNumber}</span></div>` : ''}
                </div>
                <div>
                    <h4 class="text-white font-bold mb-6 font-heading uppercase tracking-wider text-sm">Quick Links</h4>
                    <ul class="space-y-3 text-sm">
                        <li><a href="#" class="hover:text-white transition-colors">Home</a></li>
                        <li><a href="#products" class="hover:text-white transition-colors">Shop</a></li>
                        <li><a href="#visit" class="hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-white font-bold mb-6 font-heading uppercase tracking-wider text-sm">Newsletter</h4>
                    <div class="flex">
                        <input type="email" placeholder="Your email" class="bg-gray-800 border-none text-white px-3 py-2 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-primary text-sm">
                        <button class="bg-primary text-white px-3 py-2 rounded-r-lg hover:bg-opacity-90 transition-opacity">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm">
                <p class="mb-4 md:mb-0">© 2026 ${businessName}. All rights reserved.</p>
                <div class="flex items-center gap-2">
                    <span>Powered by</span>
                    <span class="font-bold text-white tracking-tight">VendorBuild</span>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scroll & Mobile Menu JS -->
    <script>
        // Navbar Scroll Effect
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile Menu Toggle
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        const icon = btn.querySelector('i');

        btn.addEventListener('click', () => {
            menu.classList.toggle('open');
            if(menu.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                navbar.classList.add('scrolled');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                if (window.scrollY <= 50) navbar.classList.remove('scrolled');
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    if (menu.classList.contains('open')) {
                        menu.classList.remove('open');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                        if (window.scrollY <= 50) navbar.classList.remove('scrolled');
                    }
                }
            });
        });
    </script>
</body>
</html>`;
}

function generateWebsiteCSS(theme) {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
    .btn-primary { background: ${theme?.primaryColor || '#4CAF50'}; color: white; }
  `;
}

// Serve static files for uploads
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;