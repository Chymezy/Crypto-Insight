import express from 'express';
import { getAIPortfolioAnalysis, getAIMarketInsights, getAINewsAnalysis } from '../controllers/ai.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

console.log('AI routes are being loaded');

// Custom middleware for AI routes
const aiRouteHandler = (handler) => async (req, res, next) => {
    console.log(`AI route handler called for: ${req.path}`);
    try {
        await handler(req, res, next);
    } catch (error) {
        console.error('Error in AI route:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing the AI request',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

router.get('/', (req, res) => {
    console.log('Root AI route hit');
    res.json({ message: 'AI routes are working' });
});

router.get('/portfolio-analysis/:portfolioId', protectRoute, aiRouteHandler(getAIPortfolioAnalysis));
console.log('Portfolio analysis route registered');

router.get('/market-insights', protectRoute, aiRouteHandler(getAIMarketInsights));
console.log('Market insights route registered');

router.get('/news-analysis', protectRoute, aiRouteHandler(getAINewsAnalysis));
console.log('News analysis route registered');

export default router;