import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { User } from '../models/user.model.js';
import { fetchCryptoDataWithRetry, fetchHistoricalDataWithRetry } from '../services/cryptoApi.service.js';
import { generateContent } from '../services/geminiService.js';
import { getDetailedAssetInfo } from '../controllers/portfolio.controller.js';

export const getAIPortfolioAnalysis = async (req, res) => {
    console.log('getAIPortfolioAnalysis function called');
    try {
        console.log('Starting AI portfolio analysis');
        const { portfolioId } = req.params;
        const userId = req.user._id;
        console.log(`PortfolioId: ${portfolioId}, UserId: ${userId}`);

        // Fetch the user and find the specific portfolio
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return sendErrorResponse(res, 404, 'User not found');
        }

        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            console.log('Portfolio not found');
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        console.log('Fetching detailed asset info');
        const detailedAssets = await getDetailedAssetInfo(portfolio.assets);
        console.log('Detailed assets:', detailedAssets);

        // Combine duplicate assets and filter out low-value assets
        const MIN_VALUE_THRESHOLD = 1; // $1 minimum value
        const combinedAssets = {};
        let totalValue = 0;

        detailedAssets.forEach(asset => {
            if (asset.value >= MIN_VALUE_THRESHOLD) {
                if (combinedAssets[asset.coinId]) {
                    combinedAssets[asset.coinId].amount += asset.amount;
                    combinedAssets[asset.coinId].value += asset.value;
                } else {
                    combinedAssets[asset.coinId] = { ...asset };
                }
                totalValue += asset.value;
            }
        });

        const filteredAssets = Object.values(combinedAssets).map(asset => ({
            ...asset,
            percentage: (asset.value / totalValue) * 100
        }));

        // Generate AI analysis
        const prompt = `
        Analyze the following cryptocurrency portfolio:
        Total Portfolio Value: $${totalValue.toFixed(2)}
        Assets: ${JSON.stringify(filteredAssets)}

        Please provide insights on:
        1. Overall portfolio health and diversification
        2. Risk assessment (low, medium, high) and explanation
        3. Top performing and underperforming assets
        4. Suggestions for portfolio rebalancing or optimization
        5. Potential opportunities or risks based on current market trends
        6. Any notable patterns or concerns in the portfolio composition

        Format the analysis in a clear, concise manner suitable for a financial report.
        `;

        console.log('Generating AI analysis');
        const aiAnalysis = await generateContent(prompt);
        console.log('AI analysis generated');

        sendSuccessResponse(res, 200, 'AI portfolio analysis completed', {
            portfolioValue: totalValue,
            assets: filteredAssets,
            aiAnalysis: aiAnalysis
        });
    } catch (error) {
        console.error('Error in AI portfolio analysis:', error);
        sendErrorResponse(res, 500, 'Error performing AI portfolio analysis', error.message);
    }
};

export const getAIMarketInsights = async (req, res) => {
    try {
        // Fetch top 10 cryptocurrencies by market cap
        const topCoins = await fetchCryptoDataWithRetry(['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'ripple', 'polkadot', 'dogecoin', 'avalanche-2', 'chainlink']);

        // Fetch 7-day historical data for top coins
        const historicalData = await Promise.all(
            Object.keys(topCoins).map(coinId => fetchHistoricalDataWithRetry(coinId, '7'))
        );

        // Calculate trading volume (last 24 hours)
        const volumeData = Object.entries(topCoins).reduce((acc, [coinId, data]) => {
            acc[coinId] = data.total_volume;
            return acc;
        }, {});

        const prompt = `
        Analyze the current state of the cryptocurrency market based on these top 10 coins: ${JSON.stringify(topCoins)}. 
        Consider the following additional data:
        - 7-day historical data: ${JSON.stringify(historicalData)}
        - Trading volume (last 24 hours): ${JSON.stringify(volumeData)}

        Provide insights on:
        1. Current market trends and overall sentiment
        2. Potential short-term (1-7 days) and medium-term (1-3 months) opportunities
        3. Key risks and challenges in the market
        4. Notable events or developments affecting the market
        5. Basic technical analysis for the top 3 coins by market cap
        6. Recommendations for different types of investors (conservative, moderate, aggressive)
        `;

        const aiInsights = await generateContent(prompt);

        sendSuccessResponse(res, 200, 'AI market insights generated', { topCoins, historicalData, volumeData, aiInsights });
    } catch (error) {
        console.error('Error generating AI market insights:', error);
        sendErrorResponse(res, 500, 'Error generating AI market insights', error.message);
    }
};

export const getAINewsAnalysis = async (req, res) => {
    try {
        // TODO: Implement integration with a real crypto news API
        sendErrorResponse(res, 501, 'AI news analysis not yet implemented');
    } catch (error) {
        console.error('Error in AI news analysis:', error);
        sendErrorResponse(res, 500, 'Error performing AI news analysis', error.message);
    }
};