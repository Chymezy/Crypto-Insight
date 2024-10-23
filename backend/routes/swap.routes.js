import express from 'express';
import { getSwapQuote, getSupportedTokens, executeSwap } from '../controllers/swap.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/quote', getSwapQuote);
router.get('/supported-tokens', getSupportedTokens);
router.post('/execute', executeSwap);

export default router;
