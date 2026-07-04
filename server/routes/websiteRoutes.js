const express = require('express');
const router = express.Router();
const geoip = require('geoip-lite');
const axios = require('axios');
const Website = require('../models/Website');
const Business = require('../models/Business');
const Photo = require('../models/Photo');

const cache = new Map();

let cachedServerRegion = null;
async function resolveServerRegion() {
  if (cachedServerRegion) return cachedServerRegion;
  try {
    const res = await axios.get('http://ip-api.com/json/', { timeout: 2000 });
    if (res.data && res.data.status === 'success') {
      cachedServerRegion = res.data.city || res.data.regionName || 'Local Workspace';
      return cachedServerRegion;
    }
  } catch (err) {
    // Fail silently
  }
  cachedServerRegion = 'Local Workspace';
  return cachedServerRegion;
}

// Get published website by slug
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    
    const website = await Website.findOne({ slug: req.params.slug, published: true })
      .populate('businessId');
    
    if (!website) return res.status(404).json({ error: 'Website not found' });
    
    // Increment view count
    website.views += 1;

    // Resolve region/city name
    let regionName = req.query.region;

    if (!regionName) {
      // Resolve IP address fallback
      let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }

      const isLocal = !ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.');

      if (isLocal) {
        const serverRegion = await resolveServerRegion();
        regionName = `${serverRegion} (Local Workspace / Dev)`;
      } else {
        const geo = geoip.lookup(ip);
        if (geo) {
          regionName = geo.city || geo.region || 'Unknown Region';
        } else {
          regionName = 'Local Workspace (Dev & Self Tests)';
        }
      }
    }

    // Sanitize and map to standard Indian regions
    const lowerRegion = regionName.toLowerCase();
    const isDev = lowerRegion.includes('local workspace') || lowerRegion.includes('dev');
    
    if (lowerRegion.includes('bangalore') || lowerRegion.includes('karnataka') || lowerRegion.includes('bengaluru')) {
      regionName = isDev ? 'Bengaluru (Local Workspace / Dev)' : 'Bengaluru (Local Workspace / Dev)';
    } else if (lowerRegion.includes('mumbai') || lowerRegion.includes('maharashtra')) {
      regionName = isDev ? 'Mumbai Metro (Local Workspace / Dev)' : 'Mumbai Metro';
    } else if (lowerRegion.includes('delhi') || lowerRegion.includes('haryana') || lowerRegion.includes('uttar pradesh')) {
      regionName = isDev ? 'Delhi NCR (Local Workspace / Dev)' : 'Delhi NCR';
    } else if (lowerRegion.includes('chennai') || lowerRegion.includes('tamil nadu')) {
      regionName = isDev ? 'Chennai (Local Workspace / Dev)' : 'Chennai';
    } else if (lowerRegion.includes('kolkata') || lowerRegion.includes('west bengal')) {
      regionName = isDev ? 'Kolkata (Local Workspace / Dev)' : 'Kolkata';
    } else if (lowerRegion.includes('visakhapatnam') || lowerRegion.includes('rasapudipalem') || lowerRegion.includes('rasapūdipalem') || lowerRegion.includes('vizag')) {
      regionName = isDev ? 'Visakhapatnam (Local Workspace / Dev)' : 'Visakhapatnam Metro';
    } else {
      regionName = isDev ? `${regionName}` : regionName;
    }

    // Initialize viewsByRegion if missing
    if (!website.viewsByRegion) {
      website.viewsByRegion = [];
    }

    const regionEntry = website.viewsByRegion.find(r => r.regionName === regionName);
    if (regionEntry) {
      regionEntry.views += 1;
    } else {
      website.viewsByRegion.push({ regionName, views: 1 });
    }

    await website.save();
    
    res.json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get website by ID
router.get('/id/:websiteId', async (req, res) => {
  try {
    const website = await Website.findById(req.params.websiteId).populate('businessId');
    if (!website) return res.status(404).json({ error: 'Website not found' });
    res.json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all websites for a business
router.get('/business/:businessId/all', async (req, res) => {
  try {
    const websites = await Website.find({ businessId: req.params.businessId })
      .populate('businessId')
      .sort({ createdAt: -1 });
    res.json(websites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new website
router.post('/:businessId/new', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { template, theme, sections, html, css, storeName, storeInfo } = req.body;
    
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ error: 'Business not found' });
    
    // Generate slug from business name and store name, append part of businessId and random string
    const bName = business.businessName ? business.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
    const sName = storeName ? storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
    let baseSlug = [bName, sName].filter(Boolean).join('-');
    if (!baseSlug) baseSlug = 'store';
    
    const randomStr = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${businessId.toString().slice(-4)}-${randomStr}`;
    
    const website = await Website.create({
      businessId,
      template,
      theme,
      sections,
      html,
      css,
      slug,
      published: true,
      storeName,
      storeInfo: {
        businessName: storeInfo?.businessName || business.businessName,
        logo: storeInfo?.logo || business.logo,
        description: storeInfo?.description || business.description,
        category: storeInfo?.category || business.category,
        contact: {
          phone: storeInfo?.contact?.phone || business.contact?.phone,
          email: storeInfo?.contact?.email || business.contact?.email
        },
        location: {
          address: storeInfo?.location?.address || business.location?.address
        },
        socialMedia: storeInfo?.socialMedia || business.socialMedia,
        paymentInfo: storeInfo?.paymentInfo || business.paymentInfo
      },
      seo: {
        title: storeName || business.businessName || '',
        description: storeInfo?.description || business.description || '',
        keywords: storeInfo?.category || business.category || ''
      }
    });
    
    res.json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update specific website
router.put('/update/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { template, theme, sections, html, css, designConfig, designHistory, published, storeInfo, storeName, seo } = req.body;
    
    const website = await Website.findById(websiteId);
    if (!website) return res.status(404).json({ error: 'Website not found' });
    
    if (template) website.template = template;
    if (theme) website.theme = theme;
    if (sections) website.sections = sections;
    if (html !== undefined) website.html = html;
    if (css !== undefined) website.css = css;
    if (designConfig !== undefined) website.designConfig = designConfig;
    if (designHistory !== undefined) website.designHistory = designHistory;
    if (published !== undefined) website.published = published;
    if (storeInfo !== undefined) {
      website.storeInfo = storeInfo;
      website.markModified('storeInfo');
    }
    if (storeName !== undefined) website.storeName = storeName;
    if (seo !== undefined) {
      website.seo = seo;
      website.markModified('seo');
    }
    website.updatedAt = new Date();
    
    await website.save();
    
    // Invalidate cache so changes reflect on the live site immediately
    if (cache.has(website.slug)) {
      cache.delete(website.slug);
    }
    
    res.json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete specific website
router.delete('/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params;
    const website = await Website.findByIdAndDelete(websiteId);
    if (!website) return res.status(404).json({ error: 'Website not found' });
    
    // Remove from cache if exists
    if (cache.has(website.slug)) {
      cache.delete(website.slug);
    }
    
    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get website stats
router.get('/:businessId/stats', async (req, res) => {
  try {
    const website = await Website.findOne({ businessId: req.params.businessId });
    res.json({
      views: website?.views || 0,
      lastUpdated: website?.updatedAt || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;