const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Image = require('../models/Image');

// Get business details
router.get('/:businessId', async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update business details
router.put('/:businessId', async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.businessId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    // If businessName was updated, cascade to all related websites
    if (req.body.businessName) {
      const Website = require('../models/Website');
      await Website.updateMany(
        { businessId: req.params.businessId },
        { $set: { 'storeInfo.businessName': req.body.businessName } }
      );
    }

    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products for a business (optionally filtered by websiteId)
router.get('/:businessId/products', async (req, res) => {
  try {
    const query = { businessId: req.params.businessId };
    if (req.query.websiteId) {
      query.websiteId = req.query.websiteId;
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add product
router.post('/:businessId/products', async (req, res) => {
  try {
    if (!req.body.websiteId) {
      return res.status(400).json({ error: 'websiteId is required to add a product' });
    }
    const product = await Product.create({
      businessId: req.params.businessId,
      websiteId: req.body.websiteId,
      ...req.body
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/products/:productId', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (and clean up associated image files & MongoDB image document)
router.delete('/products/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated image from MongoDB or disk if present
    if (product.imageUrl) {
      const urlStr = product.imageUrl;

      // 1. If stored in Image collection in MongoDB (/api/upload/image/:id)
      if (urlStr.includes('/api/upload/image/')) {
        const imageId = urlStr.split('/api/upload/image/')[1]?.split('?')[0];
        if (imageId) {
          try {
            await Image.findByIdAndDelete(imageId);
          } catch (imgErr) {
            console.error('Error deleting image document from MongoDB:', imgErr);
          }
        }
      }

      // 2. If stored as static file on disk (/uploads/filename.ext)
      if (urlStr.includes('/uploads/')) {
        const filename = urlStr.split('/uploads/')[1]?.split('?')[0];
        if (filename) {
          const filePath = path.join(__dirname, '../uploads', filename);
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (fileErr) {
            console.error('Error deleting image file from uploads folder:', fileErr);
          }
        }
      }
    }

    await Product.findByIdAndDelete(req.params.productId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//
// Get orders
router.get('/:businessId/orders', async (req, res) => {
  try {
    const orders = await Order.find({ businessId: req.params.businessId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/:businessId/orders', async (req, res) => {
  try {
    const { items, totalAmount, customerPhone, customerName, notes, websiteId, storeName, paymentMethod, paymentStatus } = req.body;

    const newOrder = await Order.create({
      businessId: req.params.businessId,
      websiteId: websiteId || null,
      storeName: storeName || '',
      customerPhone: customerPhone || 'Unknown',
      customerName: customerName || 'WhatsApp Customer',
      items: items || [],
      totalAmount: totalAmount || 0,
      notes: notes || '',
      status: 'pending',
      paymentMethod: paymentMethod || 'manual',
      paymentStatus: paymentStatus || 'unpaid'
    });

    // Increment order count and decrement stock quantity for each item purchased
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const qty = item.quantity || 1;
        let productObj = null;
        if (item.productId) {
          productObj = await Product.findById(item.productId);
        } else if (item.name) {
          // Fallback to update by name and websiteId/businessId if productId is missing
          const query = { name: item.name };
          if (websiteId) {
            query.websiteId = websiteId;
          } else {
            query.businessId = req.params.businessId;
          }
          productObj = await Product.findOne(query);
        }

        if (productObj) {
          productObj.orderCount += qty;
          if (productObj.stockQuantity !== undefined && productObj.stockQuantity !== null) {
            productObj.stockQuantity = Math.max(0, productObj.stockQuantity - qty);
            if (productObj.stockQuantity <= 0) {
              productObj.inStock = false;
            }
          }
          await productObj.save();
        }
      }
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put('/orders/:orderId', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    let updateFields = { updatedAt: new Date() };
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateFields,
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inquiries for a business
router.get('/:businessId/inquiries', async (req, res) => {
  try {
    const Inquiry = require('../models/Inquiry');
    const inquiries = await Inquiry.find({ businessId: req.params.businessId })
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a new inquiry
router.post('/:businessId/inquiries', async (req, res) => {
  try {
    const Inquiry = require('../models/Inquiry');
    const { name, email, message, websiteId } = req.body;

    if (!name || !email || !message || !websiteId) {
      return res.status(400).json({ error: 'All fields (name, email, message, websiteId) are required.' });
    }

    const newInquiry = await Inquiry.create({
      businessId: req.params.businessId,
      websiteId,
      name,
      email,
      message
    });

    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer inquiry
router.delete('/inquiries/:inquiryId', async (req, res) => {
  try {
    const Inquiry = require('../models/Inquiry');
    await Inquiry.findByIdAndDelete(req.params.inquiryId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;