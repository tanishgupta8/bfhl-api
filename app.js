const express = require('express');
const dotenv = require('dotenv');
const { OFFICIAL_EMAIL, processBfhl } = require('./lib/bfhl');

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

app.post('/bfhl', async (req, res) => {
  try {
    const result = await processBfhl(req.body);
    return res.status(result.status).json(result.payload);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      error: err.message || 'Internal Server Error.'
    });
  }
});

module.exports = app;
