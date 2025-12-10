# Brave Search API Integration

Integration module for Brave Search API based on the MCP Brave Search server implementation.

## Installation

The Brave Search API client is included in the API cycler. No additional installation needed.

## Environment Setup

Add to your `.env` file:

```bash
BRAVE_API_KEY=your-brave-api-key-here
```

Get your API key from: https://brave.com/search/api/

## Usage

### Direct Usage

```javascript
const { BraveSearchAPI } = require('./lib/brave/brave-search-api');

const brave = new BraveSearchAPI({
  apiKey: process.env.BRAVE_API_KEY
});

// Web search
const results = await brave.webSearch('THEOS Sovereign OS', {
  count: 10,
  country: 'US'
});

// Image search
const images = await brave.imageSearch('blockchain oracle', {
  count: 5
});

// News search
const news = await brave.newsSearch('cryptocurrency', {
  count: 10
});
```

### Via API Cycler

```javascript
const { APICycler } = require('./lib/api-cycler/api-cycler');

const cycler = new APICycler({
  braveApiKey: process.env.BRAVE_API_KEY
});

// Web search
const search = await cycler.execute({
  type: 'brave-web-search',
  query: 'THEOS Sovereign OS',
  options: { count: 10 }
}, {
  serviceType: 'search'
});
```

## Available Operations

### Web Search

```javascript
const results = await brave.webSearch(query, {
  count: 10,        // Number of results (default: 10)
  offset: 0,         // Offset for pagination
  country: 'US',     // Country code
  searchLang: 'en',  // Search language
  safesearch: 'moderate', // 'strict', 'moderate', 'off'
  freshness: null,  // 'pd' (past day), 'pw' (past week), 'pm' (past month), 'py' (past year)
  resultFilter: null // Filter results
});
```

### Image Search

```javascript
const images = await brave.imageSearch(query, options);
```

### Video Search

```javascript
const videos = await brave.videoSearch(query, options);
```

### News Search

```javascript
const news = await brave.newsSearch(query, options);
```

### Search Suggestions

```javascript
const suggestions = await brave.getSuggestions(query);
```

## Response Format

### Web Search Response

```json
{
  "success": true,
  "query": "THEOS Sovereign OS",
  "results": [
    {
      "title": "Result Title",
      "url": "https://example.com",
      "description": "Result description",
      "age": "2 days ago"
    }
  ],
  "totalResults": 1000,
  "queryContext": {}
}
```

## Configuration Options

```javascript
const brave = new BraveSearchAPI({
  apiKey: process.env.BRAVE_API_KEY,
  apiBase: 'https://api.search.brave.com/res/v1', // API base URL
  country: 'US',      // Default country
  searchLang: 'en',   // Default search language
  safesearch: 'moderate', // Default safesearch setting
  freshness: null,    // Default freshness filter
  textDecorations: true // Include text decorations
});
```

## Rate Limits

The API cycler automatically handles rate limits. You can also check manually:

```javascript
const rateLimited = await brave.isRateLimited();
```

## Integration with API Cycler

Brave Search is automatically available in the API cycler when `braveApiKey` is provided:

```javascript
const cycler = new APICycler({
  braveApiKey: process.env.BRAVE_API_KEY,
  // ... other services
});

// Search operations
const search = await cycler.execute({
  type: 'brave-web-search',
  query: 'your query',
  options: { count: 10 }
}, {
  serviceType: 'search'
});
```

## Files

- `brave-search-api.js` - Main Brave Search API client
- `README.md` - This file

## License

MIT
