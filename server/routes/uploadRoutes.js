const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Photo = require('../models/Photo');

// Configure multer for memory storage (no disk write)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed'));
  }
});

// Upload photo
router.post('/:businessId', upload.single('image'), async (req, res) => {
  try {
    const { businessId } = req.params;
    const { type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    // Convert buffer to base64 for demo (in production, upload to Cloudinary)
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const photo = await Photo.create({
      businessId,
      type: type || 'gallery',
      url: base64Image,
      order: await Photo.countDocuments({ businessId })
    });
    
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all photos for business
router.get('/:businessId', async (req, res) => {
  try {
    const photos = await Photo.find({ businessId: req.params.businessId })
      .sort({ order: 1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete photo
router.delete('/:photoId', async (req, res) => {
  try {
    await Photo.findByIdAndDelete(req.params.photoId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;