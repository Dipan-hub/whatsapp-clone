// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sendWhatsAppMessage } = require('./whatsapp');
const { addRowToSheet } = require('./googlesheetoperation');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * POST /api/send-message
 * Body: { "to": "91XXXXXXXXXX", "message": "Hello there" }
 */
app.post('/api/send-message', async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing "to" or "message" in request body.' });
    }

    // 1) Send the WhatsApp message
    await sendWhatsAppMessage(to, message);

    // 2) Append a new row to your sheet:
    //    Column A: "918917602924"
    //    Column B: "91XXXXXXXXXX - {message}"
    //    Column C: Unix timestamp
    const timestamp = Math.floor(Date.now() / 1000).toString();
    await addRowToSheet([
      '918917602924',
      `${to} - ${message}`,
      timestamp
    ]);

    // 3) Return success
    return res.json({ success: true, to, message });
  } catch (error) {
    console.error('Error in /api/send-message:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
