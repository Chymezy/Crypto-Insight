import express from "express";
import { 
    updateProfile, 
    changePassword, 
    getSessions, 
    logoutAll, 
    updateSettings, 
    getPortfolio, 
    addToWatchlist, 
    removeFromWatchlist,
    getWatchlist,
    getProfile,
    getTransactions,
    addTransaction
} from '../controllers/user.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkCurrenciesInitialized } from "../middleware/currencyCheck.middleware.js";

const router = express.Router();

router.use(checkCurrenciesInitialized);

// Profile routes
router.get('/profile', protectRoute, getProfile);
router.put('/profile', protectRoute, updateProfile);
router.put('/change-password', protectRoute, changePassword);

// Settings route
router.put('/settings', protectRoute, updateSettings);

// Session routes
router.get('/sessions', protectRoute, getSessions);
router.post('/logout-all', protectRoute, logoutAll);

// Portfolio route
router.get('/portfolio', protectRoute, getPortfolio);

// Watchlist routes
router.get('/watchlist', protectRoute, getWatchlist);
router.post('/watchlist', protectRoute, addToWatchlist);
router.delete('/watchlist/:coinId', protectRoute, removeFromWatchlist);

// Transaction routes
router.get('/transactions', protectRoute, getTransactions);
router.post('/transactions', protectRoute, addTransaction);

export default router;