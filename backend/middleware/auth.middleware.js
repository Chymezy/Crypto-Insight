import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    console.log('protectRoute middleware called for:', req.originalUrl);
    let token = req.cookies.accessToken;

    if (!token) {
        console.log('No access token provided');
        return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user is already attached to the request
        if (req.user && req.user._id.toString() === decoded.userId) {
            console.log('User already authenticated, skipping database query');
            return next();
        }

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ success: false, message: "Not authorized, user not found" });
        }

        req.user = user;
        console.log('User authenticated successfully');
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
};
