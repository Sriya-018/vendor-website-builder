const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Website = require('../models/Website');

// Get all vendors and their stats
router.get('/dashboard', async (req, res) => {
  const { pin } = req.query;
  const adminPin = process.env.ADMIN_PIN || '12345';
  
  if (pin !== adminPin) {
    return res.status(401).json({ message: 'Unauthorized: Invalid Admin PIN' });
  }

  try {
    const businesses = await Business.find().sort({ createdAt: -1 }).lean();
    const websites = await Website.find().lean();
    
    // Map websites to their businesses
    const websiteMap = {};
    websites.forEach(site => {
      const bId = site.businessId.toString();
      if (!websiteMap[bId]) websiteMap[bId] = [];
      websiteMap[bId].push(site);
    });

    // Merge data for the dashboard
    const dashboardData = businesses.map(bus => {
      const sites = websiteMap[bus._id.toString()] || [];
      return {
        _id: bus._id,
        businessName: bus.businessName,
        vendorPhone: bus.vendorPhone,
        category: bus.category,
        isActive: bus.isActive,
        createdAt: bus.createdAt,
        websites: sites.map(site => ({
          _id: site._id,
          template: site.template,
          slug: site.slug,
          published: site.published,
          views: site.views,
          createdAt: site.createdAt,
          updatedAt: site.updatedAt
        }))
      };
    });

    const stats = {
      totalVendors: businesses.length,
      publishedSites: websites.filter(w => w.published).length,
      totalViews: websites.reduce((acc, curr) => acc + (curr.views || 0), 0)
    };

    res.json({ stats, vendors: dashboardData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching admin dashboard data' });
  }
});

module.exports = router;
