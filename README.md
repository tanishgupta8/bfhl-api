# BFHL API

Implements the required endpoints for the Chitkara Qualifier.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set `OFFICIAL_EMAIL` and `GEMINI_API_KEY`.

3. Run the server:

```bash
npm start
```

## Endpoints

### `GET /health`

Response:

```json
{
  "is_success": true,
  "official_email": "YOUR_CHITKARA_EMAIL"
}
```

### `POST /bfhl`

Body must contain exactly one key: `fibonacci`, `prime`, `lcm`, `hcf`, or `AI`.

Examples:

```json
{ "fibonacci": 7 }
```

```json
{ "prime": [2, 4, 7, 9, 11] }
```

```json
{ "lcm": [12, 18, 24] }
```

```json
{ "hcf": [24, 36, 60] }
```

```json
{ "AI": "What is the capital city of Maharashtra?" }
```

All successful responses:

```json
{
  "is_success": true,
  "official_email": "YOUR_CHITKARA_EMAIL",
  "data": "..."
}
```
