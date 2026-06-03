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

// Get all products for a business
router.get('/:businessId/products', async (req, res) => {
  try {
    const products = await Product.find({ businessId: req.params.businessId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add product
router.post('/:businessId/products', async (req, res) => {
  try {
    const product = await Product.create({
      businessId: req.params.businessId,
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

// Update order status
router.put('/orders/:orderId', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;