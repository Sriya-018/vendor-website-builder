const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Product = require('../models/Product');
const Order = require('../models/Order');

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

// Delete product
router.delete('/products/:productId', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

module.exports = router;