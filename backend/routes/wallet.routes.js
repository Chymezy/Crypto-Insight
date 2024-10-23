import express from 'express';
import { updateWalletAddress, getWalletBalance, addCustomToken, validateTokenAddress } from '../controllers/wallet.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/update-address', updateWalletAddress);
router.get('/balance', getWalletBalance);
router.post('/custom-token', addCustomToken);
router.post('/validate-address', validateTokenAddress);

export default router;
