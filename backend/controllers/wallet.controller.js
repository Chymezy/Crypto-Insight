import { User } from '../models/user.model.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Rate limiter for CoinGecko API
const coinGeckoLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests to CoinGecko API, please try again later.'
});

export const updateWalletAddress = async (req, res) => {
    try {
        const { walletAddresses } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { walletAddresses: walletAddresses } },
            { new: true }
        );

        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        sendSuccessResponse(res, 200, 'Wallet addresses updated successfully', { walletAddresses: user.walletAddresses });
    } catch (error) {
        console.error('Error updating wallet addresses:', error);
        sendErrorResponse(res, 500, 'Error updating wallet addresses', error.message);
    }
};

export const getWalletBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.walletAddresses) {
            return sendErrorResponse(res, 404, 'Wallet addresses not found');
        }

        const balances = [];
        const supportedCurrencies = ['ethereum', 'bitcoin', 'litecoin']; // Add more as needed

        for (const currency of supportedCurrencies) {
            const address = user.walletAddresses[currency];
            if (address) {
                const balance = await getBalance(currency, address);
                balances.push({ currency, balance });
            }
        }

        sendSuccessResponse(res, 200, 'Wallet balances retrieved successfully', { balances });
    } catch (error) {
        console.error('Error fetching wallet balances:', error);
        sendErrorResponse(res, 500, 'Error fetching wallet balances', error.message);
    }
};

async function getBalance(currency, address) {
    const cacheKey = `balance_${currency}_${address}`;
    const cachedBalance = cache.get(cacheKey);
    if (cachedBalance) return cachedBalance;

    // This is a placeholder. In a real-world scenario, you'd use a blockchain explorer API or Web3 library
    // to fetch the actual balance for each currency.
    const balance = Math.random() * 10; // Simulated balance

    // Fetch current price
    const priceData = await coinGeckoLimiter(async () => {
        const response = await axios.get(`${COINGECKO_API_URL}/simple/price?ids=${currency}&vs_currencies=usd`);
        return response.data[currency].usd;
    });

    const balanceUSD = balance * priceData;

    const result = {
        amount: balance.toFixed(8),
        usdValue: balanceUSD.toFixed(2)
    };

    cache.set(cacheKey, result);
    return result;
}

export const testWalletEndpoint = async (req, res) => {
    try {
        console.log('Wallet endpoint test accessed');
        sendSuccessResponse(res, 200, 'Wallet endpoint is working', { message: 'This is a test response from the wallet endpoint' });
    } catch (error) {
        console.error('Error in wallet endpoint test:', error);
        sendErrorResponse(res, 500, 'Error testing wallet endpoint', error.message);
    }
};
