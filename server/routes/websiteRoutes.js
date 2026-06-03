const express = require('express');
const router = express.Router();
const Website = require('../models/Website');
const Business = require('../models/Business');
const Photo = require('../models/Photo');

// Get published website by slug
router.get('/:slug', async (req, res) => {
  try {
    const website = await Website.findOne({ slug: req.params.slug, published: true })
      .populate('businessId');
    
    if (!website) return res.status(404).json({ error: 'Website not found' });
    
    // Increment view count
    website.views += 1;
    await website.save();
    
    res.json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update website
router.post('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { template, theme, sections, html, css } = req.body;
    
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ error: 'Business not found' });
    
    // Generate slug from business name
    const slug = business.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    let website = await Website.findOne({ businessId });
    
    if (website) {
      website.template = template || website.template;
      website.theme = theme || website.theme;
      website.sections = sections || website.sections;
      website.html = html || website.html;
      website.css = css || website.css;
      website.slug = slug;
      website.updatedAt = new Date();
      await website.save();
    } else {
      website = await Website.create({
        businessId,
        template,
        theme,
        sections,
        html,
        css,
        slug,
        published: true
      });
    }
    
    res.json(website);
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