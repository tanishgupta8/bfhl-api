const fetch = require('node-fetch');

const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL || 'YOUR_CHITKARA_EMAIL';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const ALLOWED_KEYS = new Set(['fibonacci', 'prime', 'lcm', 'hcf', 'AI']);

function isInt(n) {
  return Number.isInteger(n);
}

function validateSingleKey(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, message: 'Request body must be a JSON object.' };
  }
  const keys = Object.keys(body);
  if (keys.length !== 1 || !ALLOWED_KEYS.has(keys[0])) {
    return { ok: false, message: 'Body must contain exactly one valid key.' };
  }
  return { ok: true, key: keys[0] };
}

function fibonacci(n) {
  if (n === 0) return [];
  if (n === 1) return [0];
  const seq = [0, 1];
  while (seq.length < n) {
    seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  }
  return seq;
}

function isPrime(num) {
  if (!isInt(num) || num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  for (let i = 3; i * i <= num; i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

async function handleAI(question) {
  if (!GEMINI_API_KEY) {
    const err = new Error('AI API key is not configured.');
    err.status = 502;
    throw err;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Answer with exactly one word. If unsure, still return a single word.\nQuestion: ${question}`
          }
        ]
      }
    ]
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = new Error('AI provider error.');
    err.status = 502;
    throw err;
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const firstWord = String(text).trim().split(/\s+/)[0] || '';
  return firstWord;
}

async function processBfhl(body) {
  const validation = validateSingleKey(body);
  if (!validation.ok) {
    return {
      status: 400,
      payload: {
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        error: validation.message
      }
    };
  }

  const key = validation.key;
  const value = body[key];

  if (key === 'fibonacci') {
    if (!isInt(value) || value < 0) {
      return {
        status: 400,
        payload: {
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: 'fibonacci must be a non-negative integer.'
        }
      };
    }
    const data = fibonacci(value);
    return {
      status: 200,
      payload: { is_success: true, official_email: OFFICIAL_EMAIL, data }
    };
  }

  if (key === 'prime') {
    if (!Array.isArray(value) || value.length === 0 || !value.every(isInt)) {
      return {
        status: 400,
        payload: {
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: 'prime must be a non-empty integer array.'
        }
      };
    }
    const data = value.filter(isPrime);
    return {
      status: 200,
      payload: { is_success: true, official_email: OFFICIAL_EMAIL, data }
    };
  }

  if (key === 'lcm') {
    if (!Array.isArray(value) || value.length === 0 || !value.every(isInt)) {
      return {
        status: 400,
        payload: {
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: 'lcm must be a non-empty integer array.'
        }
      };
    }
    const data = value.reduce((acc, v) => lcm(acc, v), value[0]);
    return {
      status: 200,
      payload: { is_success: true, official_email: OFFICIAL_EMAIL, data }
    };
  }

  if (key === 'hcf') {
    if (!Array.isArray(value) || value.length === 0 || !value.every(isInt)) {
      return {
        status: 400,
        payload: {
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: 'hcf must be a non-empty integer array.'
        }
      };
    }
    const data = value.reduce((acc, v) => gcd(acc, v), value[0]);
    return {
      status: 200,
      payload: { is_success: true, official_email: OFFICIAL_EMAIL, data }
    };
  }

  if (key === 'AI') {
    if (typeof value !== 'string' || !value.trim()) {
      return {
        status: 400,
        payload: {
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: 'AI must be a non-empty string.'
        }
      };
    }
    const data = await handleAI(value.trim());
    return {
      status: 200,
      payload: { is_success: true, official_email: OFFICIAL_EMAIL, data }
    };
  }

  return {
    status: 400,
    payload: {
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      error: 'Unsupported key.'
    }
  };
}

module.exports = {
  OFFICIAL_EMAIL,
  processBfhl
};
