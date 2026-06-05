const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Photo = require('../models/Photo');

// Configure multer for disk storage (for background removal)
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Memory storage for regular photos
const memoryStorage = multer.memoryStorage();

const diskUpload = multer({ 
  storage: diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed'));
  }
});

const memoryUpload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed'));
  }
});

// IMPORTANT: SPECIFIC ROUTES FIRST - These must come BEFORE the parameterized routes

// Product image upload with background removal
router.post('/product-image', diskUpload.single('image'), async (req, res) => {
  console.log('✅ Product image upload endpoint hit');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    console.log('File received:', req.file.filename);
    
    let finalImageUrl = `/uploads/${req.file.filename}`;
    
    // Try to remove background if API key is available
    if (process.env.REMOVE_BG_API_KEY) {
      console.log('Attempting background removal...');
      try {
        const removedBgPath = await removeBackground(req.file.path);
        if (removedBgPath) {
          finalImageUrl = `/uploads/${path.basename(removedBgPath)}`;
          console.log('Background removed successfully:', finalImageUrl);
        }
      } catch (bgError) {
        console.error('Background removal failed:', bgError);
      }
    } else {
      console.log('No REMOVE_BG_API_KEY found, skipping background removal');
    }

    res.json({ 
      success: true,
      url: finalImageUrl,
      filename: path.basename(finalImageUrl),
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Upload routes working!',
    hasApiKey: !!process.env.REMOVE_BG_API_KEY,
    uploadsDir: path.join(__dirname, '../uploads')
  });
});

// THEN parameterized routes (these come AFTER specific routes)

// Upload photo for business (with businessId parameter)
router.post('/:businessId', memoryUpload.single('image'), async (req, res) => {
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

// Background removal helper function
async function removeBackground(imagePath) {
  try {
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(imagePath));
    formData.append('size', 'auto');
    
    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVE_BG_API_KEY
      },
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const outputPath = imagePath.replace(/\.\w+$/, '-nobg.png');
    fs.writeFileSync(outputPath, response.data);
    
    return outputPath;
  } catch (error) {
    console.error('Remove.bg API error:', error.message);
    return null;
  }
}

module.exports = router;