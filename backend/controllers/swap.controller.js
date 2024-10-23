import axios from 'axios';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

const ZeroExApiUrl = 'https://api.0x.org';

export const getSwapQuote = async (req, res) => {
    try {
        const { sellToken, buyToken, sellAmount } = req.query;
        
        console.log('Swap quote request:', { sellToken, buyToken, sellAmount });
        console.log('API Key:', process.env.ZEROX_API_KEY);
        console.log('Full request URL:', `${ZeroExApiUrl}/swap/v1/quote`);

        if (!sellToken || !buyToken || !sellAmount) {
            return sendErrorResponse(res, 400, 'Missing required parameters');
        }

        const response = await axios.get(`${ZeroExApiUrl}/swap/v1/quote`, {
            params: {
                sellToken,
                buyToken,
                sellAmount,
            },
            headers: {
                '0x-api-key': process.env.ZEROX_API_KEY
            }
        });

        console.log('0x API response:', response.data);

        sendSuccessResponse(res, 200, 'Swap quote retrieved successfully', response.data);
    } catch (error) {
        console.error('Error fetching swap quote:', error.response ? error.response.data : error.message);
        
        if (error.response && error.response.status === 403) {
            console.error('API Key:', process.env.ZEROX_API_KEY);
            return sendErrorResponse(res, 403, 'Access to 0x API forbidden. Please check your API key and permissions.');
        }
        
        sendErrorResponse(res, error.response ? error.response.status : 500, 'Error fetching swap quote', error.response ? error.response.data : error.message);
    }
};

export const executeSwap = async (req, res) => {
    // Implement the swap execution logic here
    // This will depend on how you want to handle the actual swap process
    // It might involve signing transactions on the frontend and sending them here
};

export const testApiKey = async (req, res) => {
    try {
        console.log('Testing API key:', process.env.ZEROX_API_KEY);
        const response = await axios.get('https://api.0x.org/swap/v1/quote', {
            params: {
                sellToken: 'ETH',
                buyToken: 'DAI',
                sellAmount: '1000000000000000000'
            },
            headers: {
                '0x-api-key': process.env.ZEROX_API_KEY
            }
        });
        console.log('API test response:', response.data);
        res.json({ success: true, message: 'API key is working', data: response.data });
    } catch (error) {
        console.error('API test error:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            success: false, 
            message: 'API key test failed', 
            error: error.response ? error.response.data : error.message,
            statusCode: error.response ? error.response.status : 'Unknown'
        });
    }
};

export const getMockSwapQuote = async (req, res) => {
    const { sellToken, buyToken, sellAmount } = req.query;
    const mockQuote = {
        price: "1.2",
        guaranteedPrice: "1.19",
        estimatedPriceImpact: "0.01",
        to: "0x1234...5678",
        data: "0xabcdef...",
        value: "0",
        gas: "100000",
        estimatedGas: "100000",
        gasPrice: "20000000000",
        protocolFee: "0",
        minimumProtocolFee: "0",
        buyTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        sellTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        buyAmount: "1200000000000000000",
        sellAmount: "1000000000000000000",
        sources: [{ name: "0x", proportion: "1" }],
        orders: [{ /* mock order data */ }]
    };
    
    sendSuccessResponse(res, 200, 'Mock swap quote retrieved successfully', mockQuote);
};
