import bcrypt from 'bcryptjs';
import { User } from "../models/user.model.js";
import { redisClient } from "../config/redis.js";
import { isPasswordStrong } from "../utils/auth.lib.js";
import cloudinary from "../utils/cloudinary.js";
import fs from 'fs';

// Update user profile picture
export const updateProfilePicture = async (req, res) => {
    console.log('updateProfilePicture function called');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const file = req.files[0]; // Get the first file

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'profile_pictures',
            width: 300,
            crop: "scale"
        });

        // Update user profile with new image URL
        user.profilePicture = result.secure_url;
        await user.save();

        // Update cache
        await redisClient.set(`user:${user._id}`, JSON.stringify(user), 'EX', 3600);

        // Delete the temporary file
        fs.unlinkSync(file.path);

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePicture: user.profilePicture
        });
    } catch (error) {
        console.error('Error in updateProfilePicture:', error);
        res.status(500).json({ success: false, message: 'Error updating profile picture', error: error.message });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, email, preferredCurrency, language, notificationPreferences } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            
            if (req.file) {
                // Upload new profile picture if provided
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'profile_pictures',
                    width: 300,
                    crop: "scale"
                });
                user.profilePicture = result.secure_url;
            }

            if (language) user.language = language;
            if (notificationPreferences) user.notificationPreferences = notificationPreferences;

            if (preferredCurrency) {
                if (global.SUPPORTED_CURRENCIES.includes(preferredCurrency)) {
                    user.preferredCurrency = preferredCurrency;
                } else {
                    return res.status(400).json({ message: 'Unsupported currency' });
                }
            }

            const updatedUser = await user.save();

            // Update cache
            await redisClient.set(`user:${updatedUser._id}`, JSON.stringify(updatedUser), 'EX', 3600);

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                preferredCurrency: updatedUser.preferredCurrency,
                language: updatedUser.language,
                notificationPreferences: updatedUser.notificationPreferences
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// Change user's password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Check if both passwords are provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Both current password and new password are required"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found"
            });
        }

        // Check if the current password is correct
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ 
                success: false, 
                message: "Current password is incorrect"
            });
        }

        // Check password strength
        const passwordStrengthResult = isPasswordStrong(newPassword);
        if (!passwordStrengthResult.isStrong) {
            return res.status(400).json({ 
                success: false, 
                message: "Password does not meet security requirements",
                details: passwordStrengthResult.reasons
            });
        }

        // Hash and save the new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // Invalidate cache
        await redisClient.del(`user:${user._id}`);

        res.json({ success: true, message: 'Password updated successfully' });
        
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({ success: false, message: 'Error changing password', error: error.message });
    }
};

// Get user's active sessions
export const getSessions = async (req, res) => {
    try {
        const sessions = await redisClient.lRange(`sessions:${req.user._id}`, 0, -1);
        res.json(sessions.map(session => JSON.parse(session)));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions', error: error.message });
    }
};

// Logout from all devices
export const logoutAll = async (req, res) => {
    try {
        await redisClient.del(`sessions:${req.user._id}`);
        res.json({ message: 'Logged out from all devices' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out from all devices', error: error.message });
    }
};

// Update user settings
export const updateSettings = async (req, res) => {
    try {
        const { theme, defaultPortfolio, defaultTimeframe, defaultChart } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            if (theme && ['light', 'dark'].includes(theme)) {
                user.settings.theme = theme;
            }
            if (defaultPortfolio) {
                user.settings.defaultPortfolio = defaultPortfolio;
            }
            if (defaultTimeframe && ['24h', '7d', '30d', '90d', '1y', 'all'].includes(defaultTimeframe)) {
                user.settings.defaultTimeframe = defaultTimeframe;
            }
            if (defaultChart && ['line', 'candle', 'bar', 'area'].includes(defaultChart)) {
                user.settings.defaultChart = defaultChart;
            }

            const updatedUser = await user.save();

            // Update cache
            await redisClient.set(`user:${updatedUser._id}`, JSON.stringify(updatedUser), 'EX', 3600);

            res.json({
                success: true,
                settings: updatedUser.settings
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating settings', error: error.message });
    }
};

// Get user portfolio
export const getPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('portfolios');
        if (user) {
            res.json({
                success: true,
                portfolios: user.portfolios
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching portfolio', error: error.message });
    }
};

// Add item to watchlist
export const addToWatchlist = async (req, res) => {
    try {
        const { coinId } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            if (!user.watchlist.includes(coinId)) {
                user.watchlist.push(coinId);
                await user.save();

                // Update cache
                await redisClient.set(`user:${user._id}`, JSON.stringify(user), 'EX', 3600);

                res.json({
                    success: true,
                    message: 'Coin added to watchlist',
                    watchlist: user.watchlist
                });
            } else {
                res.status(400).json({ success: false, message: 'Coin already in watchlist' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding to watchlist', error: error.message });
    }
};

// Remove item from watchlist
export const removeFromWatchlist = async (req, res) => {
    try {
        const { coinId } = req.params;
        const user = await User.findById(req.user._id);

        if (user) {
            const index = user.watchlist.indexOf(coinId);
            if (index > -1) {
                user.watchlist.splice(index, 1);
                await user.save();

                // Update cache
                await redisClient.set(`user:${user._id}`, JSON.stringify(user), 'EX', 3600);

                res.json({
                    success: true,
                    message: 'Coin removed from watchlist',
                    watchlist: user.watchlist
                });
            } else {
                res.status(400).json({ success: false, message: 'Coin not found in watchlist' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error removing from watchlist', error: error.message });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json({
                success: true,
                user
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
    }
};

// Get transaction history
export const getTransactions = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('transactions');
        if (user) {
            res.json({
                success: true,
                transactions: user.transactions
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching transactions', error: error.message });
    }
};

// Record a new transaction
export const addTransaction = async (req, res) => {
    try {
        const { coinId, type, amount, price, date, notes, fee, from, to } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.transactions.push({ coinId, type, amount, price, date, notes, fee, from, to });
            await user.save();

            // Update cache
            await redisClient.set(`user:${user._id}`, JSON.stringify(user), 'EX', 3600);

            res.json({ success: true, message: 'Transaction added successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding transaction', error: error.message });
    }
};

// Update portfolio
export const updatePortfolio = async (req, res) => {
    try {
        const { portfolioId, name, assets } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            const portfolio = user.portfolios.id(portfolioId);
            if (portfolio) {
                portfolio.name = name || portfolio.name;
                portfolio.assets = assets || portfolio.assets;
                await user.save();

                // Update cache
                await redisClient.set(`user:${user._id}`, JSON.stringify(user), 'EX', 3600);

                res.json({ success: true, portfolio });
            } else {
                res.status(404).json({ success: false, message: 'Portfolio not found' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating portfolio', error: error.message });
    }
};

// Get watchlist
export const getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('watchlist');
        if (user) {
            res.json({
                success: true,
                watchlist: user.watchlist
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching watchlist', error: error.message });
    }
};

export const upgradePlan = async (req, res) => {
  try {
    const { planName, isAnnual } = req.body;
    const userId = req.user._id;

    // Implement your plan upgrade logic here
    // This might involve updating the user's plan in the database,
    // initiating a payment process, etc.

    // For now, let's just update the user's plan in the database
    await User.findByIdAndUpdate(userId, { plan: planName, isAnnualBilling: isAnnual });

    res.status(200).json({ message: 'Plan upgraded successfully' });
  } catch (error) {
    console.error('Error upgrading plan:', error);
    res.status(500).json({ message: 'Failed to upgrade plan' });
  }
};
