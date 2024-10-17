import dotenv from 'dotenv';
import axios from 'axios';
import { FALLBACK_CURRENCIES } from '../config/constants.js';

dotenv.config();

const API_KEY = process.env.CURRENCY_API_KEY || 'fca_live_hxXu3uTfXLpg8T2kWSEmeTaAfVVuK5R6XansGgqz';
const FULL_URL = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}`;

const fetchLatestExchangeRates = async () => {
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

        return response.data.data;
    } catch (error) {
        console.error('Error fetching exchange rates:', error.message);
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
};

const testCurrencyFetch = async () => {
    try {
        const exchangeRates = await fetchLatestExchangeRates();
        if (exchangeRates) {
            console.log('Fetched supported currencies:', Object.keys(exchangeRates));
        } else {
            console.log('Failed to fetch exchange rates. Using fallback currencies:', FALLBACK_CURRENCIES);
        }
    } catch (error) {
        console.error('Error in testCurrencyFetch:', error);
    }
};

testCurrencyFetch();