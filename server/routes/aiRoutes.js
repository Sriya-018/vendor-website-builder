const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

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
        description: text
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Extract business information from: "${text}"
    Return ONLY JSON: {"businessName": "", "category": "restaurant/tailor/grocery/salon/mechanic/home_service", "location": "", "services": [], "description": ""}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const businessData = JSON.parse(response.text());

    res.json(businessData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate website
router.post('/generate-website', async (req, res) => {
  try {
    const { businessData, photos, template, theme } = req.body;

    if (!businessData) {
      return res.status(400).json({ error: 'businessData is required' });
    }

    // Generate HTML/CSS for the website
    const html = generateWebsiteHTML(businessData, photos, template, theme, req.body.heroImage);
    const css = generateWebsiteCSS(theme);

    res.json({ html, css });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Assistant - process natural language commands
router.post('/assistant', async (req, res) => {
  try {
    const { request, businessData } = req.body;

    const command = parseCommand(request);

    res.json({
      action: command.action,
      data: command.data,
      message: command.message
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions (without AI)
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

  return services.slice(0, 5);
}

function parseCommand(text) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('add') && (lowerText.includes('service') || lowerText.includes('product'))) {
    return {
      action: 'ADD_SERVICE',
      data: { service: text.replace(/add|service|product/gi, '').trim() },
      message: '✅ Service added successfully!'
    };
  }

  if (lowerText.includes('change') && lowerText.includes('phone')) {
    const phone = text.match(/\d{10}/);
    return {
      action: 'UPDATE_PHONE',
      data: { phone: phone ? phone[0] : '' },
      message: phone ? '✅ Phone number updated!' : '⚠️ Please provide a valid 10-digit phone number'
    };
  }

  if (lowerText.includes('color') || lowerText.includes('theme')) {
    const colors = {
      'red': '#FF4444', 'blue': '#4444FF', 'green': '#44FF44',
      'orange': '#FF9800', 'purple': '#9C27B0', 'pink': '#FF69B4'
    };

    for (const [colorName, colorCode] of Object.entries(colors)) {
      if (lowerText.includes(colorName)) {
        return {
          action: 'CHANGE_THEME',
          data: { color: colorCode },
          message: `✅ Theme changed to ${colorName}!`
        };
      }
    }
  }

  return {
    action: 'UNKNOWN',
    data: {},
    message: "I can help you add services, change phone number, or change theme color. Try saying 'Add tailoring service' or 'Change phone to 9876543210'"
  };
}

function generateWebsiteHTML(businessData, photos, template, theme, heroImage) {
  const businessName = businessData.businessName || 'My Store';
  const description = businessData.description || 'Welcome to our store';
  let services = businessData.services || [];

  if (services.length === 0) {
    services = [
      { name: 'Premium Collection', price: '49.99' },
      { name: 'Exclusive Deals', price: '89.99' },
      { name: 'New Arrivals', price: '129.99' }
    ];
  }

  const location = businessData.location || 'Online Store';
  const encodedLocation = encodeURIComponent(location);

  const primaryColor = theme?.primaryColor || '#111827';
  const secondaryColor = theme?.secondaryColor || '#F3F4F6';
  const accentColor = theme?.accentColor || '#3B82F6';
  const heroBg = heroImage || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80';

  // Generate product cards HTML
  const productsHtml = services.map((service, i) => {
    const productName = typeof service === 'object' ? service.name : service;
    const productPrice = typeof service === 'object' ? service.price : (Math.random() * 50 + 20).toFixed(2);
    return `
            <div class="bg-white rounded-2xl overflow-hidden hover-lift border border-gray-100 group shadow-sm">
                <div class="relative h-64 sm:h-72 bg-gray-100 overflow-hidden">
                    <img src="https://picsum.photos/seed/${encodeURIComponent(productName)}${i}/600/600" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${productName}" onerror="this.src='https://picsum.photos/seed/fallback/600/600'">
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
                    <p class="text-xl md:text-2xl font-bold text-gray-900">$${productPrice}</p>
                </div>
            </div>`;
  }).join('');

  // Advanced, ultra-premium template
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${businessName}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
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
              heading: ['"Plus Jakarta Sans"', 'sans-serif'],
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
                    <a href="#visit" class="hover:text-primary transition-colors py-2">Location</a>
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
                <a href="#visit" class="block px-3 py-3 rounded-md text-base font-bold text-gray-900 hover:bg-gray-50 hover:text-primary">Location</a>
            </div>
        </div>
    </nav>

    <!-- Full-screen Hero Section -->
    <header class="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0 w-full h-full">
            <img src="${heroBg}" class="w-full h-full object-cover scale-105 animate-pulse-slow" alt="Hero Background" onerror="this.src='https://picsum.photos/seed/${encodeURIComponent(businessName)}/1200/800'">
            <div class="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90 w-full h-full"></div>
        </div>
        
        <div class="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center pt-20">
            <div class="max-w-3xl mx-auto md:mx-0 animate-fade-in-up text-center md:text-left">
                <span class="inline-block py-1 px-4 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs md:text-sm font-bold tracking-wider uppercase mb-6 backdrop-blur-sm">
                    <i class="fas fa-star mr-1"></i> Welcome
                </span>
                <h1 class="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight font-heading tracking-tight">
                    ${description ? description : 'Discover the Extraordinary'}
                </h1>
                <p class="text-lg md:text-xl text-gray-300 mb-10 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                    Experience unparalleled quality and style. We bring the best directly to you.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <a href="#products" class="px-8 py-4 rounded-xl font-bold text-gray-900 bg-white transition-all hover:bg-gray-100 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
                        Shop Collection <i class="fas fa-arrow-right"></i>
                    </a>
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
            ${productsHtml}
        </div>
    </section>

    <!-- Dynamic Info Section -->
    <section id="visit" class="bg-secondary py-24 relative overflow-hidden w-full">
        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h3 class="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 font-heading">Visit Us</h3>
            <p class="text-lg md:text-xl text-gray-600 mb-10">Reach out to our premium support team or visit our location.</p>
            
            <div class="bg-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-center gap-8 border border-white">
                <a href="https://maps.google.com/?q=${encodedLocation}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-4 text-left group hover:opacity-80 transition-opacity">
                    <div class="w-14 h-14 bg-blue-50 text-accent rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div>
                        <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">Location</div>
                        <div class="font-semibold text-gray-900 text-lg md:text-xl">${location} <i class="fas fa-external-link-alt text-xs ml-1 text-gray-400"></i></div>
                    </div>
                </a>
                
                <div class="hidden md:block w-px h-16 bg-gray-200"></div>
                
                <div class="flex gap-4">
                    <a href="tel:+919876543210" class="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white hover:scale-110 transition-transform shadow-lg group relative">
                        <i class="fas fa-phone text-xl"></i>
                    </a>
                    <a href="https://wa.me/919876543210" class="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white hover:scale-110 transition-transform shadow-lg group relative">
                        <i class="fab fa-whatsapp text-2xl"></i>
                    </a>
                </div>
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
                    <p class="mb-6 max-w-sm leading-relaxed text-sm">Providing top-tier products and exceptional service to customers worldwide since 2026.</p>
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
                        <input type="email" placeholder="Email" class="bg-gray-800 border-none text-white px-3 py-2 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-primary text-sm">
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

module.exports = router;