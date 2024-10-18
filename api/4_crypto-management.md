# Cryptocurrency Data APIs (Crypto routes)

## 1. Get Current Prices

**Endpoint:** `GET /api/v1/crypto/prices`

**Purpose:** Get current prices for specified cryptocurrencies

**Headers:**
- `Authorization: Bearer JWT_TOKEN`

**Query Parameters:**
- `ids`: string (comma-separated list of coin IDs)

**Response:**
```
{
  "success": true,
  "data": {
    "bitcoin": {
      "usd": 50000,
      "usd_24h_change": 2.5,
      "last_updated_at": 1618504800
    },
    "ethereum": {
      "usd": 3000,
      "usd_24h_change": 1.8,
      "last_updated_at": 1618504800
    }
  }
}
```

**Possible Errors:**
- 401 Unauthorized: Invalid or expired token
- 400 Bad Request: Invalid input data

## 2. Get Asset Details

**Endpoint:** `GET /api/v1/crypto/assets/:coinId`

**Purpose:** Get detailed information about a specific cryptocurrency

**Headers:**
- `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "description": "Bitcoin is a decentralized cryptocurrency...",
    "market_data": {
      "current_price": {
        "usd": 50000
      },
      "market_cap": {
        "usd": 1000000000000
      },
      "total_volume": {
        "usd": 50000000000
      }
    }
  }
}
```

**Possible Errors:**
- 401 Unauthorized: Invalid or expired token
- 404 Not Found: Asset not found

## 3. Get Historical Data

**Endpoint:** `GET /api/v1/crypto/historical/:coinId`

**Purpose:** Get historical price data for a cryptocurrency

**Headers:**
- `Authorization: Bearer JWT_TOKEN`

**Query Parameters:**
- `days`: number (number of days of historical data to retrieve)

**Response:**
```json
{
  "success": true,
  "data": {
    "prices": [
      [1618418400000, 50000],
      [1618504800000, 51000]
    ],
    "market_caps": [
      [1618418400000, 1000000000000],
      [1618504800000, 1020000000000]
    ],
    "total_volumes": [
      [1618418400000, 50000000000],
      [1618504800000, 52000000000]
    ]
  }
}
```

**Possible Errors:**
- 401 Unauthorized: Invalid or expired token
- 400 Bad Request: Invalid input data
- 404 Not Found: Asset not found

## 4. Get Multi-Timeframe Data

**Endpoint:** `GET /api/v1/crypto/multi-timeframe/:coinId`

**Purpose:** Get price data for multiple timeframes for a cryptocurrency

**Headers:**
- `Authorization: Bearer JWT_TOKEN`

**Query Parameters:**
- `timeframes`: string (comma-separated list of timeframes, e.g., "1d,7d,30d")

**Response:**
```json
{
  "success": true,
  "data": {
    "1d": {
      "prices": [[1618418400000, 50000], [1618504800000, 51000]],
      "market_caps": [[1618418400000, 1000000000000], [1618504800000, 1020000000000]],
      "total_volumes": [[1618418400000, 50000000000], [1618504800000, 52000000000]]
    },
    "7d": {
      // Similar structure for 7-day data
    },
    "30d": {
      // Similar structure for 30-day data
    }
  }
}
```

**Possible Errors:**
- 401 Unauthorized: Invalid or expired token
- 400 Bad Request: Invalid input data
- 404 Not Found: Asset not found

This documentation covers the main Cryptocurrency Data APIs, including getting current prices, asset details, historical data, and multi-timeframe data. Each API endpoint is described with its purpose, request format, response format, and possible error scenarios.