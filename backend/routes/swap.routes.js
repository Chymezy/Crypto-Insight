import express from 'express';
import { getSwapQuote, executeSwap, testApiKey } from '../controllers/swap.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/quote', getSwapQuote);
router.post('/execute', executeSwap);
router.get('/test-api', testApiKey);

export default router;
