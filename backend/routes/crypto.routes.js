import express from 'express';
import { getCryptoPrices, getAssetDetails, getHistoricalData, getMultiTimeframeData, getCoinId, getTopCryptos } from '../controllers/crypto.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/top', getTopCryptos);
router.get('/assets/:coinId', getAssetDetails);
router.get('/historical/:coinId', getHistoricalData); // Move this route to public

// Protected routes
router.use(protectRoute);

router.get('/prices', getCryptoPrices);
router.get('/multi-timeframe/:coinId', getMultiTimeframeData);
router.get('/coin-id/:symbol', getCoinId);

export default router;
