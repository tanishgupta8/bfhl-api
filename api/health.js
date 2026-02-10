const { OFFICIAL_EMAIL } = require('../lib/bfhl');

module.exports = async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  }));
};
