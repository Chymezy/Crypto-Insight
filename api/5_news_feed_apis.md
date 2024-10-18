# News Feed APIs

## Get Cryptocurrency News

**Endpoint:** `GET /api/v1/news`

**Purpose:** Retrieve cryptocurrency news articles with various filtering options and search capability.

**Headers:**
- `Authorization: Bearer JWT_TOKEN`

**Query Parameters:**
- `categories` (optional): string (comma-separated list of news categories)
- `excludeCategories` (optional): string (comma-separated list of categories to exclude)
- `feeds` (optional): string (comma-separated list of news feeds)
- `lang` (optional): string (language code, default: 'EN')
- `sortOrder` (optional): string ('latest' or 'popular', default: 'latest')
- `page` (optional): number (page number for pagination, default: 1)
- `limit` (optional): number (number of articles per page, default: 10)
- `search` (optional): string (search term to filter news articles)

**Response:**
json
{
"success": true,
"data": [
{
"id": "news_article_id",
"guid": "unique_identifier",
"published_on": 1618504800,
"imageurl": "https://example.com/image.jpg",
"title": "Bitcoin Reaches New All-Time High",
"url": "https://example.com/article",
"body": "Bitcoin has reached a new all-time high of $64,000...",
"tags": "Bitcoin,Cryptocurrency,Market",
"categories": "Blockchain,Mining",
"upvotes": 150,
"downvotes": 10,
"lang": "EN",
"source_info": {
"name": "CryptoNews",
"lang": "EN",
"img": "https://example.com/source-logo.png"
}
}
],
"pagination": {
"currentPage": 1,
"totalPages": 10,
"totalItems": 100,
"itemsPerPage": 10
}
}

**Possible Errors:**
- 401 Unauthorized: Invalid or expired token
- 400 Bad Request: Invalid query parameters

## Usage Notes:
1. The `categories` and `excludeCategories` parameters allow filtering news by specific topics. Common categories include "Blockchain", "Mining", "Trading", "Regulation", etc.
2. The `feeds` parameter can be used to specify preferred news sources.
3. Use the `lang` parameter to retrieve news in a specific language. Default is English ('EN').
4. The `sortOrder` parameter determines whether to show the latest news first or the most popular articles.
5. Pagination is supported through the `page` and `limit` parameters, allowing you to retrieve a specific subset of articles.

## Testing with Postman or cURL

### Basic Request
1. Set up a GET request to: `http://localhost:5001/api/v1/news`
2. Add the Authorization header:
   Key: `Authorization`
   Value: `Bearer your_jwt_token_here`

### Example Requests

1. **Get latest news (default behavior)**
   ```
   GET http://localhost:5001/api/v1/news
   ```

2. **Search for news about Bitcoin**
   ```
   GET http://localhost:5001/api/v1/news?search=Bitcoin
   ```

3. **Get news in a specific category with a search term**
   ```
   GET http://localhost:5001/api/v1/news?categories=Blockchain&search=Ethereum
   ```

4. **Get news in multiple categories, excluding certain feeds, with pagination**
   ```
   GET http://localhost:5001/api/v1/news?categories=Trading,Mining&excludeCategories=Regulation&page=2&limit=15&search=NFT
   ```

5. **Get news in a specific language, sorted by popularity**
   ```
   GET http://localhost:5001/api/v1/news?lang=ES&sortOrder=popular&search=DeFi
   ```

### cURL Examples

1. **Basic request**
   ```bash
   curl -H "Authorization: Bearer your_jwt_token_here" http://localhost:5001/api/v1/news
   ```

2. **Search request**
   ```bash
   curl -H "Authorization: Bearer your_jwt_token_here" "http://localhost:5001/api/v1/news?search=Bitcoin"
   ```

3. **Complex request**
   ```bash
   curl -H "Authorization: Bearer your_jwt_token_here" "http://localhost:5001/api/v1/news?categories=Blockchain,Trading&excludeCategories=Regulation&page=2&limit=15&search=NFT&lang=EN&sortOrder=latest"
   ```

### Expected Response
The API should return a JSON object with the following structure:

This API provides a flexible way to retrieve and filter cryptocurrency news, allowing users to stay informed about the latest developments in the crypto world.