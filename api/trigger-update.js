// api/trigger-update.js
require('dotenv').config();

module.exports = async (req, res) => {
  console.log('trigger-update.js: Received request', {
    method: req.method,
    body: req.body,
    query: req.query,
  });
  if (req.method !== 'POST') {
    return res.status(405).send("Method Not Allowed");
  }
  // You can optionally do additional validation (e.g., check a secret)
  const { timestamp } = req.body;
  console.log('trigger-update.js: New update triggered at timestamp:', timestamp);
  // For now, simply respond success.
  res.status(200).json({ success: true, timestamp });
};
