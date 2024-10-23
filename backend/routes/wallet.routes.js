import express from 'express';
import { updateWalletAddress, testWalletEndpoint } from '../controllers/wallet.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/update-address', updateWalletAddress);
router.get('/test', testWalletEndpoint); // Add this line

export default router;
