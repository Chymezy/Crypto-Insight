import https from 'https';
import dns from 'dns';

const COINGECKO_API_URL = 'api.coingecko.com';
const API_KEY = 'CG-eMonueVdT6Bw4YkhF1REurGg'; // Your CoinGecko API key

dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google's DNS servers

const makeRequest = (path, params) => {
    return new Promise((resolve, reject) => {
        const queryString = new URLSearchParams(params).toString();
        const options = {
            hostname: COINGECKO_API_URL,
            port: 443,
            path: `/api/v3${path}?${queryString}`,
            method: 'GET',
            headers: {
                'User-Agent': 'TestScript/1.0',
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
                    console.log('Received data chunk');
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

const testCoinGeckoEndpoint = async () => {
    try {
        console.log('Testing CoinGecko API ping endpoint...');
        const pingResponse = await makeRequest('/ping', {});
        console.log('Ping response:', pingResponse);

        console.log('Testing CoinGecko API price endpoint...');
        const priceResponse = await makeRequest('/simple/price', {
            ids: 'bitcoin,ethereum,cardano',
            vs_currencies: 'usd',
            include_24hr_change: 'true'
        });
        console.log('Price response:', priceResponse);

        return true;
    } catch (error) {
        console.error('Error fetching data from CoinGecko API:', error);
        return false;
    }
};

const runTests = async () => {
    console.log('Starting CoinGecko API tests...');
    
    const coinGeckoSuccess = await testCoinGeckoEndpoint();
    
    if (coinGeckoSuccess) {
        console.log('All tests passed successfully. CoinGecko API is accessible and functioning.');
    } else {
        console.log('Some tests failed. Please check the error messages above.');
    }
};

runTests();