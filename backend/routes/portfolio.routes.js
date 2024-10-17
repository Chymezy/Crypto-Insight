import express from "express";
import { 
    getAllPortfolios,
    createPortfolio,
    getPortfolio,
    updatePortfolio,
    deletePortfolio,
    addAssetToPortfolio,
    removeAssetFromPortfolio,
    getPortfolioPerformance,
    getPortfolioValue,
    updateMultipleAssets,
    getPortfolioAllocation,
    suggestRebalancing,
    getPortfolioAnalytics,
    getPortfolioRiskAssessment,
    getAIInsights,
    addTransaction,
    updateAsset  // Add this import
} from '../controllers/portfolio.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.route('/')
    .get(getAllPortfolios)
    .post(createPortfolio);

router.route('/:portfolioId')
    .get(getPortfolio)
    .put(updatePortfolio)
    .delete(deletePortfolio);

router.route('/:portfolioId/assets')
    .post(addAssetToPortfolio);

// Make sure this route is before the individual asset update route
router.put('/:portfolioId/assets/batch', updateMultipleAssets);

// Keep this route after the batch update route
router.route('/:portfolioId/assets/:assetId')
    .delete(removeAssetFromPortfolio)
    .put(updateAsset);

// Other routes remain the same
router.get('/:portfolioId/performance', getPortfolioPerformance);
router.get('/:portfolioId/value', getPortfolioValue);

router.get('/:portfolioId/allocation', getPortfolioAllocation);
router.post('/:portfolioId/rebalance', suggestRebalancing);

router.get('/:portfolioId/analytics', getPortfolioAnalytics);
router.get('/:portfolioId/risk-assessment', getPortfolioRiskAssessment);
router.get('/:portfolioId/ai-insights', getAIInsights);

router.post('/:portfolioId/transactions', addTransaction);

export default router;