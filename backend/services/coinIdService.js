import { makeRequest } from './cryptoApi.service.js';

const COINS_LIST_CACHE_KEY = 'coingecko_coins_list';
const CACHE_EXPIRATION = 24 * 60 * 60; // 24 hours in seconds

export const fetchCoinsList = async (redisClient) => {
    try {
        // Check cache first
        const cachedList = await redisClient.get(COINS_LIST_CACHE_KEY);
        if (cachedList) {
            console.log('Using cached coins list');
            return JSON.parse(cachedList);
        }

        console.log('Fetching coins list from CoinGecko API');
        const response = await makeRequest('/coins/list', {});
        
        if (response.statusCode !== 200) {
            throw new Error(`API returned status code ${response.statusCode}`);
        }

        const coinsList = response.data;

        // Cache the result
        await redisClient.set(COINS_LIST_CACHE_KEY, JSON.stringify(coinsList), 'EX', CACHE_EXPIRATION);

        return coinsList;
    } catch (error) {
        console.error('Error fetching coins list:', error);
        throw error;
    }
};

export const getCoinId = async (redisClient, symbol) => {
    try {
        const coinsList = await fetchCoinsList(redisClient);
        const coin = coinsList.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
        
        if (!coin) {
            throw new Error(`Coin with symbol ${symbol} not found`);
        }

        return coin.id;
    } catch (error) {
        console.error(`Error getting coin ID for symbol ${symbol}:`, error);
        throw error;
    }
};

export const validateCoinId = async (redisClient, coinId) => {
    try {
        const coinsList = await fetchCoinsList(redisClient);
        return coinsList.some(coin => coin.id === coinId);
    } catch (error) {
        console.error(`Error validating coin ID ${coinId}:`, error);
        throw error;
    }
};