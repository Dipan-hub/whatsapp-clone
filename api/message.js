// api/messages.js
require('dotenv').config();
const { getSheetsClient } = require('./googleSheetOperation.js');
const SHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

module.exports = async (req, res) => {
  try {
    console.log("messages.js: Fetching messages from Google Sheet...");
    const sheets = await getSheetsClient();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:D', // Columns: Phone, Message, Timestamp, isOutbound
    });
    let rows = result.data.values;
    console.log("messages.js: Raw rows:", rows);
    // If rows exist, map them into objects:
    const messages = rows ? rows.map(row => ({
      phone: row[0],
      message: row[1],
      time: row[2],
      isOutbound: row[3] || '0'
    })) : [];
    console.log("messages.js: Transformed messages:", messages);
    res.status(200).json(messages);
  } catch (err) {
    console.error("messages.js: Error fetching messages:", err);
    res.status(500).send("Error fetching messages");
  }
};
