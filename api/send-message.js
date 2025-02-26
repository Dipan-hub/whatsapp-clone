require('dotenv').config();
const axios = require('axios');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ADMIN_NUMBER = '918917602924';

// Function to send WhatsApp message
async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v16.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to,
    text: { body: message }
  };
  console.log(`Sending WhatsApp message to ${to}: ${message}`);
  try {
    const response = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
    });
    console.log('Message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = async (req, res) => {
  console.log('send-message.js: Received request', req.body);
  if (req.method !== 'POST') {
    return res.status(405).send("Method Not Allowed");
  }
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message".' });
  }
  try {
    // Sending WhatsApp message
    const sendResult = await sendWhatsAppMessage(to, message);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Calling Heroku API to log message in Google Sheets
    const herokuUrl = 'https://heroku-whatsapp-bot-523b3af77ed7.herokuapp.com/api/update-sheet'; // Replace with actual Heroku URL
    await axios.post(herokuUrl, {
      phone: to,
      message: message,
      timestamp: timestamp || new Date().toISOString(),
      isOutbound: '1'  // outgoing message flag
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Message logged to Google Sheet on Heroku.');

    return res.status(200).json({ success: true, result: sendResult });
  } catch (error) {
    console.error('send-message.js: Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
