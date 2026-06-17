require('dotenv').config();
const axios = require('axios');

async function testToken() {
  const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID || "C-5AE799D0033A4EA";
  const password = process.env.MESSAGE_CENTRAL_PASSWORD || "rmVRKHDm@9h5pSL";
  const key = Buffer.from(password).toString('base64');

  console.log('Testing with Customer ID:', customerId);
  try {
    const url = `https://cpaas.messagecentral.com/auth/v1/authentication/token?customerId=${customerId}&key=${key}&scope=NEW`;
    const response = await axios.get(url);
    console.log('Success! Response:', response.data);
  } catch (err) {
    console.error('Error!', err.response ? err.response.data : err.message);
  }
}
testToken();
