import axios from 'axios';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export const getSwapQuote = async (req, res) => {
    try {
        const { fromTokenId, toTokenId, amount } = req.query;
        
        if (!fromTokenId || !toTokenId || !amount) {
            return sendErrorResponse(res, 400, 'Missing required parameters');
        }

        // Fetch current prices for both tokens
        const [fromTokenData, toTokenData] = await Promise.all([
            axios.get(`${COINGECKO_API_URL}/coins/${fromTokenId}`),
            axios.get(`${COINGECKO_API_URL}/coins/${toTokenId}`)
        ]);

        const fromTokenPrice = fromTokenData.data.market_data.current_price.usd;
        const toTokenPrice = toTokenData.data.market_data.current_price.usd;

        // Calculate the swap quote
        const fromAmount = parseFloat(amount);
        const toAmount = (fromAmount * fromTokenPrice) / toTokenPrice;

        const quoteData = {
            fromToken: fromTokenId,
            toToken: toTokenId,
            fromAmount,
            toAmount,
            exchangeRate: toTokenPrice / fromTokenPrice,
            timestamp: new Date().toISOString()
        };

        sendSuccessResponse(res, 200, 'Swap quote retrieved successfully', quoteData);
    } catch (error) {
        console.error('Error fetching swap quote:', error);
        sendErrorResponse(res, 500, 'Error fetching swap quote', error.message);
    }
};

export const getSupportedTokens = async (req, res) => {
    try {
        const response = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 100,
                page: 1,
                sparkline: false
            }
        });

        const supportedTokens = response.data.map(token => ({
            id: token.id,
            symbol: token.symbol,
            name: token.name,
            image: token.image
        }));

        sendSuccessResponse(res, 200, 'Supported tokens retrieved successfully', supportedTokens);
    } catch (error) {
        console.error('Error fetching supported tokens:', error);
        sendErrorResponse(res, 500, 'Error fetching supported tokens', error.message);
    }
};

// Note: Actual swap execution would require integration with a real exchange or liquidity provider
// This function provides a simulated response for demonstration purposes
export const executeSwap = async (req, res) => {
    try {
        const { fromTokenId, toTokenId, amount } = req.body;
        
        if (!fromTokenId || !toTokenId || !amount) {
            return sendErrorResponse(res, 400, 'Missing required parameters');
        }

        // Simulate swap execution
        const swapResult = {
            fromToken: fromTokenId,
            toToken: toTokenId,
            fromAmount: parseFloat(amount),
            toAmount: 0, // This would be calculated based on current exchange rates
            transactionHash: '0x' + Math.random().toString(16).substr(2, 64), // Simulated transaction hash
            timestamp: new Date().toISOString()
        };

        // In a real implementation, you would interact with a blockchain or exchange API here

        sendSuccessResponse(res, 200, 'Swap executed successfully', swapResult);
    } catch (error) {
        console.error('Error executing swap:', error);
        sendErrorResponse(res, 500, 'Error executing swap', error.message);
    }
};
