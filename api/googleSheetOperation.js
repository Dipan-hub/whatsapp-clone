// api/googleSheetOperation.js
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

function loadCredentials() {
  if (process.env.GOOGLE_CREDENTIALS) {
    return JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else {
    const localPath = path.join(__dirname, '../wa-bot-picapoolsupport.json');
    console.log('Loading Google credentials from:', localPath);
    try {
      const rawData = fs.readFileSync(localPath, 'utf8');
      return JSON.parse(rawData);
    } catch (err) {
      console.error('Error reading credentials JSON:', err);
      throw err;
    }
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

async function addRowToSheet(rowData, spreadsheetId, range = 'Sheet1!A:D') {
  const sheets = await getSheetsClient();
  const result = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });
  console.log('addRowToSheet: Row appended successfully:', result.data.updates);
  return result.data;
}

module.exports = {
  getSheetsClient,
  addRowToSheet,
};
