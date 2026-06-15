const express = require('express');
const router = express.Router();
const Website = require('../models/Website');
const Business = require('../models/Business');
const Photo = require('../models/Photo');

const cache = new Map();

// Get published website by slug
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    
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
    const websites = await Website.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
    res.json(websites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new website
router.post('/:businessId/new', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { template, theme, sections, html, css } = req.body;
    
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ error: 'Business not found' });
    
    // Generate slug from business name, append part of businessId and random string
    const baseSlug = (business.businessName || 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
      published: true
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
    const { template, theme, sections, html, css, designConfig, designHistory, published } = req.body;
    
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