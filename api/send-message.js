// api/send-message.js
require('dotenv').config();
const axios = require('axios');
const { addRowToSheet } = require('./googleSheetOperation.js');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const SHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const ADMIN_NUMBER = '918917602924';

function sendMessage(to, msgBody) {
  const url = `https://graph.facebook.com/v16.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to,
    text: { body: msgBody }
  };
  console.log(`send-message.js: Sending message to ${to}: ${msgBody}`);
  return axios.post(url, data, {
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
  })
  .then(response => {
    console.log('send-message.js: Message sent:', response.data);
    return response.data;
  })
  .catch(error => {
    console.error('send-message.js: Error sending message:', error.response?.data || error.message);
    throw error;
  });
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send("Method Not Allowed");
    }
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing "to" or "message".' });
    }
    const result = await sendMessage(to, message);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // Log as outbound (isOutbound = 1)
    await addRowToSheet([ADMIN_NUMBER, `${to} - ${message}`, timestamp, '1'], SHEET_ID);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('send-message.js: Error:', error);
    res.status(500).json({ error: error.message });
  }
};
