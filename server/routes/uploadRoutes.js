const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Photo = require('../models/Photo');
const Image = require('../models/Image');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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
    
    let imageToReadPath = req.file.path;
    let finalImageUrl = `/uploads/${req.file.filename}`;
    let bgRemovedPath = null;
    
    // Attempt local OpenCV background removal
    console.log('Attempting local OpenCV background removal...');
    try {
      const removedBgPath = await removeBackground(req.file.path);
      if (removedBgPath) {
        imageToReadPath = removedBgPath;
        bgRemovedPath = removedBgPath;
        finalImageUrl = `/uploads/${path.basename(removedBgPath)}`;
        console.log('Background removed successfully:', finalImageUrl);
      }
    } catch (bgError) {
      console.error('Background removal failed:', bgError);
    }

    // Read the final file from disk
    const imageBuffer = fs.readFileSync(imageToReadPath);
    
    // Store in MongoDB
    const imageDoc = await Image.create({
      data: imageBuffer,
      contentType: req.file.mimetype
    });
    
    // Clean up temporary files from disk
    try {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (bgRemovedPath && fs.existsSync(bgRemovedPath)) fs.unlinkSync(bgRemovedPath);
    } catch (cleanupError) {
      console.error('Failed to clean up temporary files:', cleanupError);
    }

    res.json({ 
      success: true,
      url: `/api/upload/image/${imageDoc._id}`,
      filename: imageDoc._id.toString(),
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get image by ID
router.get('/image/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
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

// Background removal helper function using local OpenCV script
async function removeBackground(imagePath) {
  try {
    const outputPath = imagePath.replace(/\.\w+$/, '-nobg.png');
    const scriptPath = path.join(__dirname, '../scripts/remove_bg.py');
    
    // Execute the OpenCV/rembg python script locally
    const command = `python "${scriptPath}" "${imagePath}" "${outputPath}"`;
    await execPromise(command);
    
    if (fs.existsSync(outputPath)) {
      return outputPath;
    }
    return null;
  } catch (error) {
    console.error('Local OpenCV background removal error:', error.message);
    return null;
  }
}

module.exports = router;