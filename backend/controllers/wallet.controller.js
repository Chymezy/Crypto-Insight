import { User } from '../models/user.model.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import axios from 'axios';
import Web3 from 'web3';

const ETHEREUM_NODE_URL = 'https://cloudflare-eth.com';
const BLOCKCHAIN_INFO_API = 'https://blockchain.info/balance?active=';

const web3 = new Web3(new Web3.providers.HttpProvider(ETHEREUM_NODE_URL));

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
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const userObject = user.toObject();
        if (!userObject.walletAddresses || Object.keys(userObject.walletAddresses).length === 0) {
            // Instead of sending an error, we'll return an empty balances array
            return sendSuccessResponse(res, 200, 'No wallet addresses found', { balances: [] });
        }

        const balances = [];

        for (const [currency, address] of Object.entries(userObject.walletAddresses)) {
            let balance;
            let usdValue;

            if (currency === 'ethereum') {
                balance = await web3.eth.getBalance(address);
                balance = web3.utils.fromWei(balance, 'ether');
                usdValue = await convertToUSD(balance, 'ethereum');
            } else if (currency === 'bitcoin') {
                // For Bitcoin, you'd need to use a Bitcoin API to fetch the balance
                // This is a placeholder
                balance = '0';
                usdValue = '0';
            }

            balances.push({
                currency,
                balance: {
                    amount: balance,
                    usdValue: usdValue
                }
            });
        }

        sendSuccessResponse(res, 200, 'Wallet balances retrieved successfully', { balances });
    } catch (error) {
        console.error('Error fetching wallet balances:', error);
        sendErrorResponse(res, 500, 'Error fetching wallet balances', error.message);
    }
};

async function getERC20Balance(tokenAddress, walletAddress) {
    const minABI = [
        {
            constant: true,
            inputs: [{ name: "_owner", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
            type: "function",
        },
    ];
    const contract = new web3.eth.Contract(minABI, tokenAddress);
    const balance = await contract.methods.balanceOf(walletAddress).call();
    return web3.utils.fromWei(balance, 'ether');
}

async function convertToUSD(amount, currency) {
    // This is a placeholder. In a real-world scenario, you'd use a price API to get current exchange rates
    const mockExchangeRates = {
        ethereum: 2000, // 1 ETH = $2000 USD
        bitcoin: 30000 // 1 BTC = $30000 USD
    };

    const rate = mockExchangeRates[currency] || 1;
    return (parseFloat(amount) * rate).toFixed(2);
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

export const addCustomToken = async (req, res) => {
    try {
        const { name, address } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        user.customTokens.push({ name, address });
        await user.save();

        sendSuccessResponse(res, 200, 'Custom token added successfully', { customTokens: user.customTokens });
    } catch (error) {
        console.error('Error adding custom token:', error);
        sendErrorResponse(res, 500, 'Error adding custom token', error.message);
    }
};

export const validateTokenAddress = async (req, res) => {
    try {
        const { address } = req.body;
        const isValid = web3.utils.isAddress(address);
        sendSuccessResponse(res, 200, 'Address validation completed', { isValid });
    } catch (error) {
        console.error('Error validating token address:', error);
        sendErrorResponse(res, 500, 'Error validating token address', error.message);
    }
};
