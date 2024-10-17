import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getLeaderboard, followTrader, unfollowTrader, getFollowedTraders } from '../controllers/social.controller.js';

const router = express.Router();

// Protect all routes
router.use(protectRoute);

// Define routes
router.get('/leaderboard', getLeaderboard);
router.post('/follow/:userId', followTrader);
router.delete('/unfollow/:userId', unfollowTrader);
router.get('/following/:userId?', getFollowedTraders);

export default router;