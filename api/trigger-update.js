// api/trigger-update.js
require('dotenv').config();

module.exports = async (req, res) => {
  console.log('trigger-update.js: Received request', {
    method: req.method,
    body: req.body,
    query: req.query,
  });
  if (req.method === 'GET') {
    return res.status(200).send("GET is not supported for production; use POST.");
  }
  if (req.method !== 'POST') {
    return res.status(405).send("Method Not Allowed");
  }
  const { timestamp } = req.body;
  console.log('trigger-update.js: New update triggered at timestamp:', timestamp);
  res.status(200).json({ success: true, timestamp });
};
