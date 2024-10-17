import { User } from "../models/user.model.js";
import { redisClient } from "../config/redis.js";
import { fetchCryptoDataWithRetry, fetchHistoricalDataWithRetry, fetchAssetDetails } from "../services/cryptoApi.service.js";
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { validateCoinId } from '../services/coinIdService.js';
import { getCoinId } from '../services/coinIdService.js';

// Helper function to get detailed asset information
export const getDetailedAssetInfo = async (assets) => {
    const coinIds = assets.map(asset => asset.coinId);
    
    try {
        const prices = await fetchCryptoDataWithRetry(coinIds);
        
        return Promise.all(assets.map(async (asset) => {
            try {
                const details = await fetchAssetDetails(asset.coinId);
                const price = prices[asset.coinId];

                if (!price || !price.usd) {
                    console.warn(`Price data not available for ${asset.coinId}`);
                    return {
                        id: asset._id,
                        coinId: asset.coinId,
                        name: details?.name || 'Unknown',
                        symbol: details?.symbol || asset.coinId,
                        amount: asset.amount,
                        currentPrice: null,
                        value: null,
                        priceChange24h: null,
                        image: details?.image?.small || null,
                        lastUpdated: null,
                        error: 'Price data not available'
                    };
                }

                return {
                    id: asset._id,
                    coinId: asset.coinId,
                    name: details?.name || 'Unknown',
                    symbol: details?.symbol || asset.coinId,
                    amount: asset.amount,
                    currentPrice: price.usd,
                    value: asset.amount * price.usd,
                    priceChange24h: price.usd_24h_change,
                    image: details?.image?.small || null,
                    lastUpdated: price.last_updated_at
                };
            } catch (error) {
                console.error(`Error fetching details for ${asset.coinId}:`, error);
                return {
                    id: asset._id,
                    coinId: asset.coinId,
                    name: 'Unknown',
                    symbol: asset.coinId,
                    amount: asset.amount,
                    currentPrice: null,
                    value: null,
                    priceChange24h: null,
                    image: null,
                    error: 'Failed to fetch asset details'
                };
            }
        }));
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        return assets.map(asset => ({
            id: asset._id,
            coinId: asset.coinId,
            name: 'Unknown',
            symbol: asset.coinId,
            amount: asset.amount,
            currentPrice: null,
            value: null,
            priceChange24h: null,
            image: null,
            error: 'Failed to fetch crypto data'
        }));
    }
};

// Get all portfolios for the user
export const getAllPortfolios = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Try to get cached portfolios data
        const cachedPortfolios = await redisClient.get(`user:${userId}:portfolios`);
        if (cachedPortfolios) {
            console.log('Returning cached portfolios data');
            return sendSuccessResponse(res, 200, 'Portfolios retrieved from cache', JSON.parse(cachedPortfolios));
        }

        const user = await User.findById(userId);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const portfoliosWithDetails = await Promise.all(user.portfolios.map(async (portfolio) => {
            try {
                const detailedAssets = await getDetailedAssetInfo(portfolio.assets);
                const totalValue = detailedAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);

                return {
                    id: portfolio._id,
                    name: portfolio.name,
                    description: portfolio.description,
                    createdAt: portfolio.createdAt,
                    totalValue: totalValue,
                    assets: detailedAssets
                };
            } catch (error) {
                console.error(`Error processing portfolio ${portfolio._id}:`, error);
                return {
                    id: portfolio._id,
                    name: portfolio.name,
                    description: portfolio.description,
                    createdAt: portfolio.createdAt,
                    totalValue: 0,
                    assets: [],
                    error: 'Failed to fetch portfolio details'
                };
            }
        }));

        // Cache the portfolios data
        await redisClient.set(`user:${userId}:portfolios`, JSON.stringify(portfoliosWithDetails), 'EX', 300); // Cache for 5 minutes

        sendSuccessResponse(res, 200, 'Portfolios retrieved successfully', { portfolios: portfoliosWithDetails });
    } catch (error) {
        console.error('Error in getAllPortfolios:', error);
        sendErrorResponse(res, 500, 'Error retrieving portfolios', error);
    }
};

// Create a new portfolio
export const createPortfolio = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return sendErrorResponse(res, 400, 'Portfolio name is required');
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const newPortfolio = {
            name,
            description,
            assets: []
        };

        user.portfolios.push(newPortfolio);
        await user.save();

        const createdPortfolio = user.portfolios[user.portfolios.length - 1];

        // Update Redis cache
        await redisClient.set(`user:${user._id}`, JSON.stringify(user), 'EX', 3600);

        sendSuccessResponse(res, 201, 'Portfolio created successfully', {
            portfolio: {
                id: createdPortfolio._id,
                name: createdPortfolio.name,
                description: createdPortfolio.description,
                createdAt: createdPortfolio.createdAt,
                totalValue: 0,
                assets: []
            }
        });
    } catch (error) {
        sendErrorResponse(res, 500, 'Error creating portfolio', error);
    }
};

// Get details of a specific portfolio
export const getPortfolio = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const userId = req.user._id;

        console.log(`Attempting to fetch portfolio: ${portfolioId} for user: ${userId}`);

        // Try to get cached portfolio data
        const cachedPortfolio = await redisClient.get(`portfolio:${portfolioId}`);
        if (cachedPortfolio) {
            console.log('Returning cached portfolio data');
            return sendSuccessResponse(res, 200, 'Portfolio retrieved from cache', JSON.parse(cachedPortfolio));
        }

        const user = await User.findById(userId);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        console.log(`Portfolio found: ${portfolio.name}`);

        let detailedAssets = [];
        let totalValue = 0;

        try {
            detailedAssets = await getDetailedAssetInfo(portfolio.assets);
            totalValue = detailedAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
        } catch (error) {
            console.error('Error fetching detailed asset info:', error);
            // Continue with the available data
        }

        const portfolioData = {
            id: portfolio._id,
            name: portfolio.name,
            description: portfolio.description,
            createdAt: portfolio.createdAt,
            totalValue: totalValue,
            assets: detailedAssets
        };

        // Cache the portfolio data with a TTL of 5 minutes
        await redisClient.set(`portfolio:${portfolioId}`, JSON.stringify(portfolioData), 'EX', 300);

        sendSuccessResponse(res, 200, 'Portfolio retrieved successfully', { portfolio: portfolioData });
    } catch (error) {
        console.error('Error in getPortfolio:', error);
        sendErrorResponse(res, 500, 'Error retrieving portfolio', error);
    }
};

const invalidatePortfolioCache = async (portfolioId) => {
    await redisClient.del(`portfolio:${portfolioId}`);
};

// Update a specific portfolio
export const updatePortfolio = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const { name, description } = req.body;
        if (!name) {
            return sendErrorResponse(res, 400, 'Portfolio name is required');
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        portfolio.name = name || portfolio.name;
        portfolio.description = description || portfolio.description;
        await user.save();
        await invalidatePortfolioCache(portfolioId);

        const detailedAssets = await getDetailedAssetInfo(portfolio.assets);
        const totalValue = detailedAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);

        const updatedPortfolioData = {
            id: portfolio._id,
            name: portfolio.name,
            description: portfolio.description,
            createdAt: portfolio.createdAt,
            updatedAt: portfolio.updatedAt,
            totalValue: totalValue,
            assets: detailedAssets
        };

        // Update cache
        await redisClient.set(`portfolio:${portfolioId}`, JSON.stringify(updatedPortfolioData), 'EX', 300); // Cache for 5 minutes
        await redisClient.del(`user:${user._id}:portfolios`); // Invalidate user's portfolios cache
        await invalidatePortfolioPerformanceCache(portfolioId);

        sendSuccessResponse(res, 200, 'Portfolio updated successfully', { portfolio: updatedPortfolioData });
    } catch (error) {
        console.error('Error updating portfolio:', error);
        sendErrorResponse(res, 500, 'Error updating portfolio', error);
    }
};

// Delete a specific portfolio
export const deletePortfolio = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const userId = req.user._id;

        console.log(`Attempting to delete portfolio: ${portfolioId} for user: ${userId}`);

        const user = await User.findById(userId);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        // Find the index of the portfolio to remove
        const portfolioIndex = user.portfolios.findIndex(p => p._id.toString() === portfolioId);
        if (portfolioIndex === -1) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        // Remove the portfolio using the pull method
        user.portfolios.pull({ _id: portfolioId });
        await user.save();

        // Invalidate related caches
        await redisClient.del(`user:${userId}:portfolios`);
        await redisClient.del(`portfolio:${portfolioId}`);
        await invalidatePortfolioPerformanceCache(portfolioId);

        console.log(`Portfolio ${portfolioId} deleted successfully`);
        sendSuccessResponse(res, 200, 'Portfolio deleted successfully');
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        sendErrorResponse(res, 500, 'Error deleting portfolio', error);
    }
};

// Helper function to invalidate portfolio performance cache
async function invalidatePortfolioPerformanceCache(portfolioId) {
    const timeframes = ['1d', '7d', '30d', '90d', '1y'];
    for (const timeframe of timeframes) {
        await redisClient.del(`portfolio:${portfolioId}:performance:${timeframe}`);
    }
    console.log(`Invalidated performance cache for portfolio: ${portfolioId}`);
}

// Add asset to portfolio
export const addAssetToPortfolio = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const { coinId, amount } = req.body;  // Changed from coinIdOrSymbol to coinId
        
        console.log('Request body:', req.body);
        console.log(`Adding asset: portfolioId=${portfolioId}, coinId=${coinId}, amount=${amount}`);

        if (!coinId || coinId === 'undefined') {
            return sendErrorResponse(res, 400, 'CoinId is required');
        }

        if (amount === undefined || isNaN(parseFloat(amount))) {
            return sendErrorResponse(res, 400, 'Valid amount is required');
        }

        let resolvedCoinId = coinId;
        // Check if the input is a symbol or already a coinId
        if (coinId.length <= 10) { // Assuming symbols are typically shorter than coinIds
            try {
                resolvedCoinId = await getCoinId(redisClient, coinId);
            } catch (error) {
                console.log('Error getting coinId:', error);
                // If getCoinId fails, assume it's already a coinId
                resolvedCoinId = coinId;
            }
        }

        console.log('Resolved coinId:', resolvedCoinId);

        // Validate the coinId against CoinGecko
        const cryptoData = await fetchCryptoDataWithRetry([resolvedCoinId]);
        console.log('Fetched crypto data:', JSON.stringify(cryptoData, null, 2));

        if (!cryptoData[resolvedCoinId]) {
            return sendErrorResponse(res, 400, `Coin ID '${coinId}' is not recognized by CoinGecko`);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        // Add the asset to the portfolio
        const newAsset = { coinId: resolvedCoinId, amount: parseFloat(amount) };
        portfolio.assets.push(newAsset);
        await user.save();

        // Fetch detailed asset info for the newly added asset only
        const [addedAsset] = await getDetailedAssetInfo([newAsset]);

        // Update cache
        await redisClient.del(`portfolio:${portfolioId}`); // Invalidate specific portfolio cache
        await redisClient.del(`user:${user._id}:portfolios`); // Invalidate user's portfolios cache
        await invalidatePortfolioPerformanceCache(portfolioId);

        const message = addedAsset.error 
            ? `Asset added successfully, but with limited data: ${addedAsset.error}`
            : 'Asset added successfully';

        sendSuccessResponse(res, 201, message, { addedAsset });
    } catch (error) {
        console.error('Error adding asset to portfolio:', error);
        sendErrorResponse(res, 500, 'Error adding asset to portfolio', error);
    }
};

// Remove an asset from a portfolio
export const removeAssetFromPortfolio = async (req, res) => {
    try {
        const { portfolioId, assetId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }
        
        // Find the index of the asset to remove
        const assetIndex = portfolio.assets.findIndex(asset => asset._id.toString() === assetId);
        if (assetIndex === -1) {
            return sendErrorResponse(res, 404, 'Asset not found');
        }
        
        // Remove the asset using the pull method
        portfolio.assets.pull({ _id: assetId });
        
        await user.save();

        // Update cache
        await redisClient.del(`portfolio:${portfolioId}`); // Invalidate specific portfolio cache
        await redisClient.del(`user:${user._id}:portfolios`); // Invalidate user's portfolios cache
        await invalidatePortfolioPerformanceCache(portfolioId);
        
        sendSuccessResponse(res, 200, 'Asset removed successfully');
    } catch (error) {
        console.error('Error removing asset from portfolio:', error);
        sendErrorResponse(res, 500, 'Error removing asset from portfolio', error);
    }
};

// Get portfolio performance
export const getPortfolioPerformance = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const { timeframe = '30d' } = req.query;

        console.log(`Attempting to fetch portfolio performance for portfolioId: ${portfolioId}, userId: ${req.user._id}`);

        // Try to get cached performance data
        const cachedPerformance = await redisClient.get(`portfolio:${portfolioId}:performance:${timeframe}`);
        if (cachedPerformance) {
            console.log('Returning cached portfolio performance');
            return sendSuccessResponse(res, 200, 'Portfolio performance retrieved from cache', JSON.parse(cachedPerformance));
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            console.log(`User not found for id: ${req.user._id}`);
            return sendErrorResponse(res, 404, 'User not found');
        }

        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            console.log(`Portfolio not found for id: ${portfolioId} in user's portfolios`);
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        console.log(`Portfolio found: ${portfolio.name}`);

        // Calculate portfolio performance
        const performance = await calculatePortfolioPerformance(portfolio, timeframe);

        if (!performance) {
            return sendErrorResponse(res, 500, 'Unable to calculate portfolio performance');
        }

        // Cache the calculated performance
        await redisClient.set(`portfolio:${portfolioId}:performance:${timeframe}`, JSON.stringify(performance), 'EX', 3600); // Cache for 1 hour

        sendSuccessResponse(res, 200, 'Portfolio performance retrieved successfully', { performance });
    } catch (error) {
        console.error('Error getting portfolio performance:', error);
        sendErrorResponse(res, 500, 'Error retrieving portfolio performance', error);
    }
};

// Helper function to calculate portfolio performance
async function calculatePortfolioPerformance(portfolio, timeframe) {
    console.log('Entering calculatePortfolioPerformance');
    console.log('Portfolio:', JSON.stringify(portfolio));
    console.log('Timeframe:', timeframe);

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - getTimeframeInMilliseconds(timeframe));

    // Fetch historical data for each asset in the portfolio
    const assetPerformances = await Promise.all(portfolio.assets.map(async (asset) => {
        console.log('Fetching historical data for asset:', asset.coinId);
        const historicalData = await fetchHistoricalDataWithRetry(asset.coinId, getDaysFromTimeframe(timeframe));
        console.log('Historical data received:', historicalData);
        return calculateAssetPerformance(asset, historicalData, startDate, endDate);
    }));

    console.log('Asset performances:', assetPerformances);

    // Filter out any undefined or null asset performances
    const validAssetPerformances = assetPerformances.filter(perf => perf && typeof perf.startValue === 'number');

    if (validAssetPerformances.length === 0) {
        console.warn('No valid asset performances found');
        return null;
    }

    // Calculate overall portfolio performance
    const startValue = validAssetPerformances.reduce((total, perf) => total + perf.startValue, 0);
    const endValue = validAssetPerformances.reduce((total, perf) => total + perf.endValue, 0);

    const change = endValue - startValue;
    const changePercentage = startValue !== 0 ? ((endValue - startValue) / startValue) * 100 : 0;

    console.log('Calculated performance:', { startValue, endValue, change, changePercentage });

    return {
        timeframe,
        startValue,
        endValue,
        change,
        changePercentage,
        assetPerformances: validAssetPerformances
    };
}

function getDaysFromTimeframe(timeframe) {
    const timeframes = {
        '1d': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
    };
    return timeframes[timeframe] || 30;
}

function calculateAssetPerformance(asset, historicalData, startDate, endDate) {
    console.log('Calculating asset performance for:', asset.coinId);
    console.log('Historical data:', historicalData);

    if (!historicalData || !historicalData.prices || historicalData.prices.length < 2) {
        console.warn('Insufficient historical data for', asset.coinId);
        return null;
    }

    const startPrice = findClosestPrice(historicalData.prices, startDate);
    const endPrice = findClosestPrice(historicalData.prices, endDate);

    if (!startPrice || !endPrice) {
        console.warn('Unable to find start or end price for', asset.coinId);
        return null;
    }

    const startValue = asset.amount * startPrice;
    const endValue = asset.amount * endPrice;
    const change = endValue - startValue;
    const changePercentage = ((endValue - startValue) / startValue) * 100;

    console.log('Asset performance:', { startValue, endValue, change, changePercentage });

    return { startValue, endValue, change, changePercentage };
}

function findClosestPrice(prices, targetDate) {
    const targetTime = targetDate.getTime();
    return prices.reduce((closest, [timestamp, price]) => {
        return Math.abs(timestamp - targetTime) < Math.abs(closest[0] - targetTime) ? [timestamp, price] : closest;
    }, [0, null])[1];
}

function getTimeframeInMilliseconds(timeframe) {
    const timeframes = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe] || timeframes['30d'];
}

// Get portfolio allocation
export const getPortfolioAllocation = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        const assetIds = portfolio.assets.map(asset => asset.coinId);
        let currentPrices;
        try {
            currentPrices = await fetchCryptoDataWithRetry(assetIds);
        } catch (error) {
            console.error('Failed to fetch current prices:', error);
            currentPrices = {}; // Use an empty object if fetch fails
        }

        const allocation = portfolio.assets.map(asset => {
            const currentPrice = currentPrices[asset.coinId]?.usd || 0;
            const value = asset.amount * currentPrice;
            return {
                coinId: asset.coinId,
                amount: asset.amount,
                value: value
            };
        });

        const totalValue = allocation.reduce((sum, asset) => sum + asset.value, 0);

        const allocationPercentages = allocation.map(asset => ({
            ...asset,
            percentage: (asset.value / totalValue) * 100
        }));

        sendSuccessResponse(res, 200, 'Portfolio allocation retrieved successfully', { allocation: allocationPercentages });
    } catch (error) {
        console.error('Error in getPortfolioAllocation:', error);
        sendErrorResponse(res, 500, 'Error fetching portfolio allocation', error);
    }
};

// Suggest portfolio rebalancing
export const suggestRebalancing = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const { targetAllocation } = req.body;
        if (!targetAllocation || Object.keys(targetAllocation).length === 0) {
            return sendErrorResponse(res, 400, 'Target allocation is required');
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }
        const assetIds = portfolio.assets.map(asset => asset.coinId);
        const currentPrices = await fetchCryptoDataWithRetry(assetIds);

        const totalValue = portfolio.assets.reduce((sum, asset) => {
            const currentPrice = currentPrices[asset.coinId]?.usd || 0;
            return sum + (asset.amount * currentPrice);
        }, 0);

        const suggestions = portfolio.assets.map(asset => {
            const currentPrice = currentPrices[asset.coinId]?.usd || 0;
            const currentValue = asset.amount * currentPrice;
            const currentPercentage = (currentValue / totalValue) * 100;
            const targetPercentage = targetAllocation[asset.coinId] || 0;
            const difference = targetPercentage - currentPercentage;
            const amountChange = (difference / 100) * totalValue / currentPrice;

            return {
                coinId: asset.coinId,
                currentPercentage,
                targetPercentage,
                amountChange
            };
        });

        res.json({
            success: true,
            suggestions
        });
    } catch (error) {
        sendErrorResponse(res, 500, 'Error generating rebalancing suggestions', error);
    }
};

// Get portfolio analytics
export const getPortfolioAnalytics = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }
        const assetIds = portfolio.assets.map(asset => asset.coinId);
        const historicalData = await Promise.all(assetIds.map(id => fetchHistoricalDataWithRetry(id, '365')));

        const analytics = calculatePortfolioAnalytics(portfolio, historicalData);

        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        sendErrorResponse(res, 500, 'Error fetching portfolio analytics', error);
    }
};

function calculatePortfolioAnalytics(portfolio, historicalData) {
    const dailyReturns = calculateDailyReturns(portfolio, historicalData);

    const averageReturn = dailyReturns.reduce((sum, return_) => sum + return_, 0) / dailyReturns.length;
    const standardDeviation = Math.sqrt(dailyReturns.reduce((sum, return_) => sum + Math.pow(return_ - averageReturn, 2), 0) / dailyReturns.length);
    const sharpeRatio = (averageReturn - 0.0001) / standardDeviation * Math.sqrt(252); // Assuming risk-free rate of 0.01% daily
    const maxDrawdown = calculateMaxDrawdown(dailyReturns);

    return {
        averageReturn: averageReturn * 252, // Annualized
        volatility: standardDeviation * Math.sqrt(252), // Annualized
        sharpeRatio,
        maxDrawdown
    };
}

function calculateDailyReturns(portfolio, historicalData) {
    const dailyValues = new Array(365).fill(0);

    portfolio.assets.forEach((asset, index) => {
        const prices = historicalData[index].prices;
        prices.forEach((price, day) => {
            dailyValues[day] += asset.amount * price[1];
        });
    });

    return dailyValues.slice(1).map((value, index) => (value - dailyValues[index]) / dailyValues[index]);
}

function calculateMaxDrawdown(returns) {
    let peak = -Infinity;
    let maxDrawdown = 0;

    returns.reduce((acc, return_) => {
        const total = acc * (1 + return_);
        peak = Math.max(peak, total);
        maxDrawdown = Math.max(maxDrawdown, (peak - total) / peak);
        return total;
    }, 1);

    return maxDrawdown;
}

// Get portfolio risk assessment
export const getPortfolioRiskAssessment = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }
        const assetIds = portfolio.assets.map(asset => asset.coinId);
        const historicalData = await Promise.all(assetIds.map(id => fetchHistoricalDataWithRetry(id, '365')));

        const riskAssessment = calculateRiskAssessment(portfolio, historicalData);

        res.json({
            success: true,
            riskAssessment
        });
    } catch (error) {
        sendErrorResponse(res, 500, 'Error fetching portfolio risk assessment', error);
    }
};

function calculateRiskAssessment(portfolio, historicalData) {
    const dailyReturns = calculateDailyReturns(portfolio, historicalData);
    const volatility = Math.sqrt(dailyReturns.reduce((sum, return_) => sum + Math.pow(return_, 2), 0) / dailyReturns.length) * Math.sqrt(252);
    const valueAtRisk = calculateValueAtRisk(dailyReturns);
    const betaToMarket = calculateBetaToMarket(dailyReturns, historicalData[0].prices); // Assuming first asset is market proxy

    return {
        volatility,
        valueAtRisk,
        betaToMarket
    };
}

function calculateValueAtRisk(returns, confidenceLevel = 0.95) {
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    return -sortedReturns[index];
}

function calculateBetaToMarket(portfolioReturns, marketPrices) {
    const marketReturns = marketPrices.slice(1).map((price, index) => (price[1] - marketPrices[index][1]) / marketPrices[index][1]);
    const covariance = calculateCovariance(portfolioReturns, marketReturns);
    const marketVariance = calculateVariance(marketReturns);
    return covariance / marketVariance;
}

function calculateCovariance(returns1, returns2) {
    const mean1 = returns1.reduce((sum, return_) => sum + return_, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, return_) => sum + return_, 0) / returns2.length;
    return returns1.reduce((sum, return_, index) => sum + (return_ - mean1) * (returns2[index] - mean2), 0) / returns1.length;
}

function calculateVariance(returns) {
    const mean = returns.reduce((sum, return_) => sum + return_, 0) / returns.length;
    return returns.reduce((sum, return_) => sum + Math.pow(return_ - mean, 2), 0) / returns.length;
}

// Get AI insights (mock function)
export const getAIInsights = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }
        const insights = await generateAIInsights(portfolio);

        res.json({
            success: true,
            insights
        });
    } catch (error) {
        sendErrorResponse(res, 500, 'Error generating AI insights', error);
    }
};

async function generateAIInsights(portfolio) {
    // This is a mock function. In a real implementation, you would call the Gemini AI API here.
    return {
        overallAssessment: "Your portfolio is well-diversified across major cryptocurrencies. Consider increasing exposure to DeFi tokens for potential growth.",
        riskAnalysis: "The portfolio shows moderate risk. Bitcoin dominance provides stability, while altcoin allocation offers growth potential.",
        recommendations: [
            "Consider taking some profits from high-performing assets",
            "Research emerging blockchain projects in the NFT space for potential opportunities",
            "Set up regular rebalancing to maintain your target asset allocation"
        ]
    };
}

export const addTransaction = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const { coinId, type, amount, price, date } = req.body;

        // Validate input
        if (!coinId || !type || !amount || !price || !date) {
            return sendErrorResponse(res, 400, 'All fields are required: coinId, type, amount, price, date');
        }

        if (type !== 'buy' && type !== 'sell') {
            return sendErrorResponse(res, 400, 'Transaction type must be either "buy" or "sell"');
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        // Find the asset in the portfolio
        let asset = portfolio.assets.find(a => a.coinId === coinId);

        // If the asset doesn't exist and it's a sell transaction, return an error
        if (!asset && type === 'sell') {
            return sendErrorResponse(res, 400, 'Cannot sell an asset that is not in the portfolio');
        }

        // If the asset doesn't exist and it's a buy transaction, create it
        if (!asset && type === 'buy') {
            asset = { coinId, amount: 0 };
            portfolio.assets.push(asset);
        }

        // Update asset amount
        if (type === 'buy') {
            asset.amount += parseFloat(amount);
        } else {
            // Check if there's enough balance to sell
            if (asset.amount < parseFloat(amount)) {
                return sendErrorResponse(res, 400, 'Insufficient balance for this sell transaction');
            }
            asset.amount -= parseFloat(amount);
        }

        // Add transaction to history
        const transaction = {
            coinId,
            type,
            amount: parseFloat(amount),
            price: parseFloat(price),
            date: new Date(date)
        };

        if (!portfolio.transactions) {
            portfolio.transactions = [];
        }
        portfolio.transactions.push(transaction);

        // Save changes
        await user.save();

        // Update cache
        await redisClient.set(`user:${user._id}`, JSON.stringify(user), 'EX', 3600);
        await invalidatePortfolioPerformanceCache(portfolioId);

        res.status(201).json({
            success: true,
            message: 'Transaction added successfully',
            transaction
        });
    } catch (error) {
        sendErrorResponse(res, 500, 'Error adding transaction', error);
    }
};

export const getPortfolioValue = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        const assetIds = portfolio.assets.map(asset => asset.coinId);
        const currentPrices = await fetchCryptoDataWithRetry(assetIds);

        const totalValue = portfolio.assets.reduce((sum, asset) => {
            const currentPrice = currentPrices[asset.coinId]?.usd || 0;
            return sum + (asset.amount * currentPrice);
        }, 0);

        res.json({
            success: true,
            totalValue
        });
    } catch (error) {
        sendErrorResponse(res, 500, 'Error calculating portfolio value', error);
    }
};

export const updateMultipleAssets = async (req, res) => {
    console.log('Entering updateMultipleAssets function');
    try {
        const { portfolioId } = req.params;
        const { assets } = req.body;
        console.log(`Received request to update multiple assets: portfolioId=${portfolioId}, assets=`, assets);

        if (!Array.isArray(assets) || assets.length === 0) {
            console.log('Invalid assets data, sending 400 response');
            return sendErrorResponse(res, 400, 'Invalid assets data. Expected an array of assets.');
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            console.log('User not found, sending 404 response');
            return sendErrorResponse(res, 404, 'User not found');
        }

        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            console.log('Portfolio not found, sending 404 response');
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        // Update multiple assets
        assets.forEach(updatedAsset => {
            if (!updatedAsset.coinId || updatedAsset.amount === undefined) {
                console.log(`Invalid asset data: ${JSON.stringify(updatedAsset)}`);
                throw new Error('Invalid asset data. Each asset must have coinId and amount.');
            }

            const existingAsset = portfolio.assets.find(asset => asset.coinId === updatedAsset.coinId);
            if (existingAsset) {
                existingAsset.amount = updatedAsset.amount;
            } else {
                portfolio.assets.push(updatedAsset);
            }
        });

        await user.save();

        // Update cache
        await redisClient.del(`portfolio:${portfolioId}`); // Invalidate specific portfolio cache
        await redisClient.del(`user:${user._id}:portfolios`); // Invalidate user's portfolios cache
        await invalidatePortfolioPerformanceCache(portfolioId);

        console.log('Assets updated successfully, sending response');
        sendSuccessResponse(res, 200, 'Assets updated successfully', { portfolio });
    } catch (error) {
        console.error('Error in updateMultipleAssets:', error);
        sendErrorResponse(res, 500, 'Error updating multiple assets', error);
    }
};

// Update a specific asset in a portfolio
export const updateAsset = async (req, res) => {
    console.log('Entering updateAsset function');
    try {
        const { portfolioId, assetId } = req.params;
        const { amount } = req.body;
        console.log(`Received request to update asset: portfolioId=${portfolioId}, assetId=${assetId}, amount=${amount}`);

        if (amount === undefined) {
            console.log('Amount is undefined, sending 400 response');
            return sendErrorResponse(res, 400, 'Asset amount is required');
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            console.log('User not found, sending 404 response');
            return sendErrorResponse(res, 404, 'User not found');
        }

        const portfolio = user.portfolios.id(portfolioId);
        if (!portfolio) {
            console.log('Portfolio not found, sending 404 response');
            return sendErrorResponse(res, 404, 'Portfolio not found');
        }

        const asset = portfolio.assets.id(assetId);
        if (!asset) {
            console.log('Asset not found, sending 404 response');
            return sendErrorResponse(res, 404, 'Asset not found');
        }

        asset.amount = amount;
        console.log(`Updating asset amount to ${amount}`);

        await user.save();
        await redisClient.set(`user:${user._id}`, JSON.stringify(user), 'EX', 3600);
        await invalidatePortfolioPerformanceCache(portfolioId);

        console.log('Asset updated successfully, sending response');
        res.json({
            success: true,
            message: 'Asset updated successfully',
            asset
        });
    } catch (error) {
        console.error('Error in updateAsset:', error);
        sendErrorResponse(res, 500, 'Error updating asset', error);
    }
};