import { User } from '../models/user.model.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

export const updateWalletAddress = async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { walletAddress: walletAddress } },
            { new: true }
        );

        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        sendSuccessResponse(res, 200, 'Wallet address updated successfully', { walletAddress: user.walletAddress });
    } catch (error) {
        console.error('Error updating wallet address:', error);
        sendErrorResponse(res, 500, 'Error updating wallet address', error.message);
    }
};

// Add this new function
export const testWalletEndpoint = async (req, res) => {
    try {
        console.log('Wallet endpoint test accessed');
        sendSuccessResponse(res, 200, 'Wallet endpoint is working', { message: 'This is a test response from the wallet endpoint' });
    } catch (error) {
        console.error('Error in wallet endpoint test:', error);
        sendErrorResponse(res, 500, 'Error testing wallet endpoint', error.message);
    }
};
