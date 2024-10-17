import https from 'https';
import dns from 'dns';
import axios from 'axios';

const COINGECKO_API_URL = 'api.coingecko.com';
const API_KEY = 'CG-eMonueVdT6Bw4YkhF1REurGg'; // Your CoinGecko API key

dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google's DNS servers

export const makeRequest = (path, params) => {
    return new Promise((resolve, reject) => {
        const queryString = new URLSearchParams(params).toString();
        const options = {
            hostname: COINGECKO_API_URL,
            port: 443,
            path: `/api/v3${path}?${queryString}`,
            method: 'GET',
            headers: {
                'User-Agent': 'CryptoInsight/1.0',
                'x-cg-demo-api-key': API_KEY
            },
            timeout: 120000, // 120 seconds timeout
            family: 4 // Force IPv4
        };

        console.log(`Making request to: ${options.hostname}${options.path}`);

        dns.lookup(options.hostname, { family: 4 }, (err, address) => {
            if (err) {
                console.error('DNS lookup failed:', err);
                reject(err);
                return;
            }
            console.log(`Resolved ${options.hostname} to ${address}`);

            const req = https.request(options, (res) => {
                console.log('Connection established');
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    console.log(`Response received. Status: ${res.statusCode}`);
                    try {
                        const parsedData = JSON.parse(data);
                        resolve({ statusCode: res.statusCode, data: parsedData });
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                console.error('Request error:', error);
                reject(error);
            });

            req.on('timeout', () => {
                console.error('Request timed out');
                req.destroy();
                reject(new Error('Request timed out'));
            });

            console.log('Sending request');
            req.end();
        });
    });
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const fetchCryptoDataWithRetry = async (coinIds, retries = 3, delay = 5000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            console.log(`Attempt ${attempt + 1}: Fetching data for coins: ${coinIds.join(', ')}`);
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
                params: {
                    ids: coinIds.join(','),
                    vs_currencies: 'usd',
                    include_24hr_change: true,
                    include_last_updated_at: true
                },
                headers: {
                    'x-cg-demo-api-key': API_KEY
                }
            });
            console.log(`Data fetched successfully on attempt ${attempt + 1}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching crypto data (Attempt ${attempt + 1}/${retries}):`, error.response ? error.response.data : error.message);
            if (attempt < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error('Failed to fetch crypto data after multiple attempts');
            }
        }
    }
};

export const fetchHistoricalDataWithRetry = async (coinId, days, retries = 3, delay = 5000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await makeRequest(`/coins/${coinId}/market_chart`, {
                vs_currency: 'usd',
                days: days
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching historical data (Attempt ${attempt + 1}/${retries}):`, error);
            if (attempt < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await wait(delay);
            } else {
                throw error;
            }
        }
    }
};

export const fetchAssetDetails = async (coinId, retries = 3, delay = 5000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await makeRequest(`/coins/${coinId}`, {
                localization: 'false',
                tickers: 'false',
                market_data: 'true',
                community_data: 'false',
                developer_data: 'false',
                sparkline: 'false'
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching asset details (Attempt ${attempt + 1}/${retries}):`, error);
            if (attempt < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await wait(delay);
            } else {
                throw error;
            }
        }
    }
};

// New function to fetch top cryptocurrencies
export const fetchTopCryptosWithRetry = async (limit = 10, retries = 3, delay = 5000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            console.log(`Attempt ${attempt + 1}: Fetching top ${limit} cryptocurrencies`);
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: limit,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: '24h'
                },
                headers: {
                    'x-cg-demo-api-key': API_KEY
                }
            });
            console.log(`Top cryptocurrencies fetched successfully on attempt ${attempt + 1}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching top cryptocurrencies (Attempt ${attempt + 1}/${retries}):`, error.response ? error.response.data : error.message);
            if (attempt < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error('Failed to fetch top cryptocurrencies after multiple attempts');
            }
        }
    }
};
