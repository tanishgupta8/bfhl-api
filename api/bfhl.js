const { processBfhl } = require('../lib/bfhl');

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve(null);
      }
    });
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      is_success: false,
      official_email: require('../lib/bfhl').OFFICIAL_EMAIL,
      error: 'Method Not Allowed'
    }));
    return;
  }

  const body = await readJson(req);
  if (body === null) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      is_success: false,
      official_email: require('../lib/bfhl').OFFICIAL_EMAIL,
      error: 'Invalid JSON.'
    }));
    return;
  }

  try {
    const result = await processBfhl(body);
    res.statusCode = result.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.payload));
  } catch (err) {
    res.statusCode = err.status || 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      is_success: false,
      official_email: require('../lib/bfhl').OFFICIAL_EMAIL,
      error: err.message || 'Internal Server Error.'
    }));
  }
};
