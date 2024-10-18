# AI-Powered Feature APIs

This document provides details on the AI-powered feature APIs, which leverage the Gemini AI to provide advanced insights and analysis for cryptocurrency portfolios and market trends.

## 1. Get AI Portfolio Analysis

**Endpoint:** `GET /api/v1/ai/portfolio-analysis/:portfolioId`

**Purpose:** Retrieve AI-generated analysis and insights for a specific portfolio.

### Headers:
- `Authorization: Bearer JWT_TOKEN`

### Response:
json
{
"success": true,
"message": "AI portfolio analysis completed",
"data": {
"portfolioData": {
"totalValue": 123906.34,
"assetCount": 14,
"assets": [
{
"coinId": "bitcoin",
"name": "Bitcoin",
"symbol": "BTC",
"amount": 1.5,
"value": 75000,
"currentPrice": 50000,
"percentage": 60.53
},
// ... other assets
],
"historicalData": [
// ... 30-day historical data
]
},
"aiAnalysis": {
"diversification": "Your portfolio is heavily weighted towards Bitcoin...",
"riskAssessment": "The portfolio has a high risk profile due to...",
"historicalPerformance": "Over the past 30 days, your portfolio has...",
"assetAllocation": "Current allocation is suboptimal. Consider...",
"recommendations": [
"Diversify by adding more altcoins",
"Reduce Bitcoin exposure to 40%",
// ... other recommendations
]
}
}
}

### Possible Errors:
- 401 Unauthorized: Invalid or expired token
- 404 Not Found: Portfolio not found
- 500 Internal Server Error: Error performing AI analysis

## 2. Get AI Market Insights

**Endpoint:** `GET /api/v1/ai/market-insights`

**Purpose:** Retrieve AI-generated market insights and analysis.

### Headers:
- `Authorization: Bearer JWT_TOKEN`

### Response:
json
{
"success": true,
"message": "AI market insights generated",
"data": {
"topCoins": {
"bitcoin": {
"usd": 50000,
"usd_24h_change": 2.5
},
// ... other top coins
},
"historicalData": [
// ... 7-day historical data for top coins
],
"volumeData": {
"bitcoin": 28000000000,
// ... volume data for other coins
},
"sentimentData": {
"bitcoin": 0.7,
// ... sentiment data for other coins
},
"aiInsights": {
"marketTrends": "The cryptocurrency market is showing signs of...",
"opportunities": {
"shortTerm": "Consider taking profits on...",
"mediumTerm": "Accumulating altcoins may be beneficial..."
},
"risks": [
"Regulatory uncertainty in major markets",
"Potential correction after recent bull run"
],
"technicalAnalysis": {
"bitcoin": "BTC is approaching a key resistance level...",
// ... analysis for other top coins
},
"recommendations": {
"conservative": "Maintain a balanced portfolio with...",
"moderate": "Consider increasing exposure to...",
"aggressive": "Look for opportunities in emerging DeFi projects..."
}
}
}
}

### Possible Errors:
- 401 Unauthorized: Invalid or expired token
- 500 Internal Server Error: Error generating AI market insights

## 3. Get AI News Analysis

**Endpoint:** `GET /api/v1/ai/news-analysis`

**Purpose:** Retrieve AI-generated analysis of recent cryptocurrency news.

### Headers:
- `Authorization: Bearer JWT_TOKEN`

### Response:
json
{
"success": true,
"message": "AI news analysis completed",
"data": {
"recentNews": [
{
"title": "Bitcoin reaches new all-time high",
"sentiment": "positive"
},
// ... other news items
],
"aiAnalysis": {
"overallSentiment": "The recent news cycle has been predominantly positive...",
"keyTrends": [
"Increasing institutional adoption of cryptocurrencies",
"Growing interest in DeFi projects",
// ... other trends
],
"potentialImpacts": {
"bitcoin": "The new all-time high could lead to increased FOMO...",
"ethereum": "The successful upgrade might drive more developers...",
// ... impacts on other cryptocurrencies
},
"recommendedActions": [
"Monitor Bitcoin's price action closely for potential profit-taking opportunities",
"Research emerging DeFi projects for potential investment",
// ... other recommendations
]
}
}
}
### Possible Errors:
- 401 Unauthorized: Invalid or expired token
- 500 Internal Server Error: Error performing AI news analysis

---

## Notes on AI-Powered Features:
- These endpoints leverage the Gemini AI to provide advanced analysis and insights.
- The AI models are trained on historical cryptocurrency data, market trends, and news articles.
- While the AI provides valuable insights, users should always conduct their own research and not rely solely on AI-generated recommendations for investment decisions.
- The quality and accuracy of AI insights may vary and improve over time as the models are refined and updated.