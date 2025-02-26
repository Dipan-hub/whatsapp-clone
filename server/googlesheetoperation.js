// server/googlesheetoperation.js
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Loads service account JSON from environment or local file
function loadCredentials() {
  if (process.env.GOOGLE_CREDENTIALS) {
    // If you prefer storing the entire JSON in an env var
    return JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else {
    // Otherwise, read from credentials.json in your project
    const localPath = path.join(__dirname, '../wa-bot-picapoolsupport.json');
    const rawData = fs.readFileSync(localPath, 'utf8');
    return JSON.parse(rawData);
  }
}

async function getSheetsClient() {
  const credentials = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

/**
 * Appends a row to your Google Sheet.
 * @param {string[]} rowData - An array of strings to insert as one row.
 */
async function addRowToSheet(rowData) {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const range = 'Sheet1!A:C'; // Adjust if needed

    // Append the row
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      },
    });

    console.log('Row appended:', result.data.updates);
  } catch (error) {
    console.error('Error appending row to Google Sheet:', error);
    throw error;
  }
}

module.exports = {
  addRowToSheet
};
