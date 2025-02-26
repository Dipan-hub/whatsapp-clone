// api/googleSheetOperation.js
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

function loadCredentials() {
  if (process.env.GOOGLE_CREDENTIALS) {
    console.log('Loading Google credentials from environment variable.');
    try {
      const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
      console.log('Successfully parsed credentials from env variable.');
      return creds;
    } catch (err) {
      console.error('Error parsing GOOGLE_CREDENTIALS env variable:', err);
      throw err;
    }
  } else {
    // Fallback to local file
    const localPath = path.join(__dirname, '../wa-bot-picapoolsupport.json');
    console.log('Loading Google credentials from file:', localPath);
    try {
      const rawData = fs.readFileSync(localPath, 'utf8');
      const creds = JSON.parse(rawData);
      console.log('Successfully loaded credentials from file.');
      return creds;
    } catch (err) {
      console.error('Error reading credentials file at', localPath, ':', err);
      throw err;
    }
  }
}

async function getSheetsClient() {
  try {
    const credentials = loadCredentials();
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    console.log('Google Sheets client authenticated successfully.');
    return google.sheets({ version: 'v4', auth: authClient });
  } catch (error) {
    console.error('Error setting up Google Sheets client:', error);
    throw error;
  }
}

async function addRowToSheet(rowData, spreadsheetId, range = 'Sheet1!A:D') {
  try {
    const sheets = await getSheetsClient();
    console.log('Appending row to sheet:', rowData);
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });
    console.log('Row appended successfully:', result.data.updates);
    return result.data;
  } catch (error) {
    console.error('Error appending row to Google Sheet:', error);
    throw error;
  }
}

module.exports = {
  getSheetsClient,
  addRowToSheet,
};
