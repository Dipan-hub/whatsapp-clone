// api/send-message.js
require('dotenv').config();
const axios = require('axios');
const { addRowToSheet } = require('./googleSheetOperation');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const SHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// A helper function to send a WhatsApp message via the Cloud API
async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v16.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to,
    text: { body: message }
  };
  console.log(`sendWhatsAppMessage: Sending message to ${to}: ${message}`);
  try {
    const response = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
    });
    console.log('sendWhatsAppMessage: Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('sendWhatsAppMessage: Error sending message:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = async (req, res) => {
  console.log('send-message.js: Received request', {
    method: req.method,
    body: req.body
  });
  if (req.method !== 'POST') {
    return res.status(405).send("Method Not Allowed");
  }
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message".' });
  }
  try {
    // 1. Send the WhatsApp message
    const sendResult = await sendWhatsAppMessage(to, message);

    // 2. Append the message to the Google Sheet as outbound (isOutbound = "1")
    const timestamp = Math.floor(Date.now() / 1000).toString();
    await addRowToSheet(
      [WHATSAPP_PHONE_NUMBER_ID, `${to} - ${message}`, timestamp, "1"],
      SHEET_ID
    );
    console.log('send-message.js: Message logged to Google Sheet.');

    return res.status(200).json({ success: true, result: sendResult });
  } catch (error) {
    console.error('send-message.js: Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
