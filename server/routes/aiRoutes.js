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
    
    // Generate HTML/CSS for the website
    const html = generateWebsiteHTML(businessData, photos, template, theme);
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

function generateWebsiteHTML(businessData, photos, template, theme) {
  const businessName = businessData.businessName || 'My Business';
  const description = businessData.description || 'Welcome to our business';
  const services = businessData.services || ['Quality Service', 'Best Price', 'Customer Satisfaction'];
  const location = businessData.location || 'Your Location';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${businessName}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        
        .header {
            background: ${theme?.primaryColor || '#4CAF50'};
            color: white;
            padding: 60px 20px;
            text-align: center;
            border-radius: 0 0 30px 30px;
        }
        
        .shop-icon {
            font-size: 80px;
            background: white;
            width: 120px;
            height: 120px;
            border-radius: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .business-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .location {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .contact-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .contact-btn {
            background: white;
            color: ${theme?.primaryColor || '#4CAF50'};
            padding: 12px 25px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 16px;
        }
        
        .section {
            background: white;
            margin: 20px;
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .section-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #333;
        }
        
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .service-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            font-weight: 500;
        }
        
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .gallery-item {
            background: #f0f0f0;
            border-radius: 15px;
            height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #888;
            font-size: 12px;
        }
        
        @media (max-width: 480px) {
            .header { padding: 40px 15px; }
            .business-name { font-size: 24px; }
            .contact-btn { padding: 10px 20px; font-size: 14px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="shop-icon">
            <i class="fas fa-store" style="font-size: 60px; color: ${theme?.primaryColor || '#4CAF50'};"></i>
        </div>
        <div class="business-name">${businessName}</div>
        <div class="location"><i class="fas fa-map-marker-alt"></i> ${location}</div>
        <div class="contact-buttons">
            <a href="tel:+919876543210" class="contact-btn"><i class="fas fa-phone"></i> Call</a>
            <a href="https://wa.me/919876543210" class="contact-btn"><i class="fab fa-whatsapp"></i> WhatsApp</a>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">About Us</div>
        <p style="line-height: 1.6; color: #666;">${description}</p>
    </div>
    
    <div class="section">
        <div class="section-title">Our Services</div>
        <div class="services-grid">
            ${services.map(service => `<div class="service-card"><i class="fas fa-check-circle" style="color: ${theme?.primaryColor || '#4CAF50'}; margin-right: 8px;"></i> ${service}</div>`).join('')}
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Gallery</div>
        <div class="gallery-grid">
            ${photos && photos.length > 0 ? photos.slice(0, 4).map(photo => `<div class="gallery-item"><img src="${photo.url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;" /></div>`).join('') : 
            ['📷', '📷', '📷', '📷'].map(icon => `<div class="gallery-item"><i class="fas fa-camera" style="font-size: 40px; color: #ccc;"></i></div>`).join('')}
        </div>
    </div>
    
    <div class="footer">
        <p>Powered by YourWebsiteBuilder</p>
    </div>
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