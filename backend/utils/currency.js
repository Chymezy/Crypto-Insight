import axios from 'axios';
import dotenv from 'dotenv';
import { redisClient } from '../config/redis.js';
import { FALLBACK_CURRENCIES } from '../config/constants.js';

dotenv.config();

const API_KEY = process.env.CURRENCY_API_KEY || 'fca_live_hxXu3uTfXLpg8T2kWSEmeTaAfVVuK5R6XansGgqz';
const FULL_URL = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}`;
const CACHE_KEY = 'latest_exchange_rates';
const CACHE_EXPIRATION = 4 * 60 * 60; // 4 hours in seconds

export const fetchLatestExchangeRates = async () => {
    try {
        console.log('Fetching latest exchange rates from API...');
        console.log('Full URL:', FULL_URL.replace(API_KEY, 'API_KEY_HIDDEN'));

        const response = await axios.get(FULL_URL, {
            timeout: 10000,
            headers: {
                'User-Agent': 'CryptoInsight/1.0',
            },
        });

        console.log('API Response Status:', response.status);
        console.log('API Response Data:', JSON.stringify(response.data, null, 2));

        const exchangeRates = response.data.data;

        // Store in cache
        await redisClient.set(CACHE_KEY, JSON.stringify(exchangeRates), 'EX', CACHE_EXPIRATION);

        return exchangeRates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error.message);
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
};

export const initializeCurrencies = async (retries = 3) => {
    try {
        // Check cache first
        const cachedRates = await redisClient.get(CACHE_KEY);
        if (cachedRates) {
            const exchangeRates = JSON.parse(cachedRates);
            global.SUPPORTED_CURRENCIES = Object.keys(exchangeRates);
            console.log('Supported currencies initialized from cache:', global.SUPPORTED_CURRENCIES);
            return;
        }

        const exchangeRates = await fetchLatestExchangeRates();
        if (exchangeRates) {
            global.SUPPORTED_CURRENCIES = Object.keys(exchangeRates);
            console.log('Supported currencies initialized:', global.SUPPORTED_CURRENCIES);
            return true;
        } else {
            throw new Error('No exchange rates fetched');
        }
    } catch (error) {
        console.error('Error initializing currencies:', error);
        if (retries > 0) {
            console.log(`Retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return initializeCurrencies(retries - 1);
        } else {
            console.log('All retry attempts failed. Using fallback currencies.');
            global.SUPPORTED_CURRENCIES = FALLBACK_CURRENCIES;
            console.log('Using fallback currencies:', global.SUPPORTED_CURRENCIES);
            return false;
        }
    }
};