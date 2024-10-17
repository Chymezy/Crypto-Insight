import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    console.log('protectRoute middleware called');
    let token;

    if (req.cookies.token) {
        try {
            token = req.cookies.token;

            if (!token) {
                console.log('No token provided');
                return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                console.log('Invalid token');
                return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
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
    }

    if (!token) {
        console.log('No token in cookies');
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};