// server/whatsapp.js
require('dotenv').config();
const axios = require('axios');

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Sends a WhatsApp text message using the Cloud API.
 * @param {string} to - The recipient's phone number in international format (e.g. "919876543210").
 * @param {string} message - The text content to send.
 */
async function sendWhatsAppMessage(to, message) {
  try {
    const url = `https://graph.facebook.com/v15.0/${phoneNumberId}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: message }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendWhatsAppMessage
};
