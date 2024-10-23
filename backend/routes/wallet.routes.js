import express from 'express';
import { updateWalletAddress, getWalletBalance, testWalletEndpoint } from '../controllers/wallet.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/update-address', updateWalletAddress);
router.get('/balance', getWalletBalance);
router.get('/test', testWalletEndpoint);

export default router;
