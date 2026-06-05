const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testBackgroundRemoval() {
  console.log('=== Testing Background Removal API ===\n');
  
  // Check if API key exists
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    console.error('❌ REMOVE_BG_API_KEY not found in .env file');
    console.log('\nPlease add to your .env file:');
    console.log('REMOVE_BG_API_KEY=your_api_key_here\n');
    return;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  
  // Try multiple possible locations for test image
  const possiblePaths = [
    path.join(__dirname, 'test-image.jpg'),
    path.join(__dirname, 'test-image.png'),
    path.join(__dirname, '../test-image.jpg'),
    path.join(__dirname, '../uploads/test-image.jpg'),
    path.join(__dirname, '../../test-image.jpg'),
    // Add your specific path if different
    'C:\\Users\\malle\\OneDrive\\Desktop\\vendor\\vendor-website-builder\\server\\test-image.jpg'
  ];
  
  let testImagePath = null;
  
  for (const imgPath of possiblePaths) {
    if (fs.existsSync(imgPath)) {
      testImagePath = imgPath;
      break;
    }
  }
  
  if (!testImagePath) {
    console.error('\n❌ Test image not found!');
    console.log('\nPlease create a test image or provide the correct path:');
    console.log('\nOption 1: Create a test image using this command:');
    console.log('  - Download a sample image from internet');
    console.log('  - Or create a simple image using Paint/Photoshop');
    console.log('  - Save it as "test-image.jpg" in the server folder');
    console.log('\nOption 2: Update the testImagePath variable with your image path');
    console.log('\nCurrent working directory:', __dirname);
    console.log('Files in current directory:');
    
    // List files in current directory
    try {
      const files = fs.readdirSync(__dirname);
      console.log(files.filter(f => f.match(/\.(jpg|png|jpeg|gif)$/i)));
    } catch (err) {
      console.log('Could not read directory:', err.message);
    }
    return;
  }
  
  console.log('✅ Test image found at:', testImagePath);
  console.log(`📏 File size: ${(fs.statSync(testImagePath).size / 1024).toFixed(2)} KB`);
  
  console.log('\n🔄 Sending request to remove.bg API...\n');
  
  try {
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(testImagePath));
    formData.append('size', 'auto');
    
    const startTime = Date.now();
    
    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': apiKey
      },
      responseType: 'arraybuffer',
      timeout: 30000 // 30 second timeout
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ API call successful!');
    console.log(`⏱️  Time taken: ${duration}ms`);
    console.log(`📦 Response size: ${(response.data.length / 1024).toFixed(2)} KB`);
    
    // Save the processed image
    const outputPath = path.join(__dirname, 'test-output-nobg.png');
    fs.writeFileSync(outputPath, response.data);
    console.log(`💾 Processed image saved to: ${outputPath}`);
    
    console.log('\n✨ Background removal test PASSED!\n');
    
  } catch (error) {
    console.error('❌ API call failed!\n');
    
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Status Message:', error.response.statusText);
      
      // Try to parse error message
      if (error.response.data) {
        try {
          const errorText = Buffer.from(error.response.data).toString();
          console.error('Error Details:', errorText);
        } catch (e) {
          console.error('Error Details:', error.response.data);
        }
      }
      
      // Common error codes
      if (error.response.status === 401) {
        console.error('\n⚠️  Unauthorized - Invalid API key');
        console.log('Please check your REMOVE_BG_API_KEY in .env file');
      } else if (error.response.status === 403) {
        console.error('\n⚠️  Forbidden - API key may be invalid or expired');
        console.log('Please verify your API key at: https://www.remove.bg/dashboard');
      } else if (error.response.status === 402) {
        console.error('\n⚠️  Payment Required - You may have exceeded your free credits');
        console.log('Check your credit usage at: https://www.remove.bg/dashboard');
      } else if (error.response.status === 429) {
        console.error('\n⚠️  Too Many Requests - Rate limit exceeded');
        console.log('Please wait a moment and try again');
      }
    } else if (error.request) {
      console.error('No response received from remove.bg API');
      console.error('Please check your internet connection');
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\n❌ Background removal test FAILED!\n');
  }
}

// Run the test
testBackgroundRemoval();