import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from 'jsonwebtoken';

import { User } from "../models/user.model.js";
import { generateJwtToken, isPasswordStrong } from "../utils/auth.lib.js";
import { 
    sendWelcomeEmail, 
    sendVerificationEmail, 
    sendPasswordResetRequestEmail, 
    sendPasswordResetSuccessEmail } from "../mailtrap/emails.js";
import { MAX_DAILY_PASSWORD_RESET_ATTEMPTS } from '../config/constants.js';

// @desc    Signup user
export const signup = async (req, res) => {
    const { email: rawEmail, password, name } = req.body;
    const email = rawEmail.trim();
    try {
        console.log('Received signup request:', { email, name }); // Don't log password
        if(!email || !password || !name){
            console.log('Missing required fields');
            return res.status(400).json({success: false, message: "All fields are required"});
        }

        const userAlreadyExists = await User.findOne({ email });
        if(userAlreadyExists){
            console.log('User already exists:', email);
            return res.status(400).json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const user = new User({
            email: email.trim(),
            password: hashedPassword,
            name,
            lastLogin: new Date(),
            isVerified: false,
            verificationToken,
            verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        await user.save();

        // Generate JWT token
        const { accessToken, refreshToken } = generateJwtToken(user._id);

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully. Please check your email for verification.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            },
        });

    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// New function for email verification
export const verifyEmail = async (req, res) => {
    const { email: rawEmail, token } = req.body;
    const email = rawEmail.trim(); // Trim the email

    try {
        console.log("Attempting to verify email:", email);
        console.log("With token:", token);

        // Use a case-insensitive query
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        
        console.log("User found:", user ? "Yes" : "No");

        if (!user) {
            console.log("All users in database:");
            const allUsers = await User.find({}, 'email');
            console.log(allUsers.map(u => u.email));
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("User verification status:", user.isVerified);
        console.log("Stored verification token:", user.verificationToken);

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "User is already verified" });
        }

        if (user.verificationToken !== token) {
            return res.status(400).json({ success: false, message: "Invalid verification token" });
        }

        if (user.verificationTokenExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "Verification token has expired" });
        }

        // Verify the user
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        // Send welcome email
        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({ success: true, message: "Email verified successfully. Welcome email sent." });
    } catch (error) {
        console.error("Error during email verification:", error);
        res.status(500).json({ success: false, message: "An error occurred during email verification", error: error.message });
    }
};

// @desc    Login user
export const login = async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail.trim(); // Trim the email

    try {
        console.log("Login attempt started");
        console.log("Login attempt for email:", email);

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // Use case-insensitive query for email
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        console.log("User found:", user ? "Yes" : "No");

        if (!user) {
            console.log("User not found in database");
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcryptjs.compare(password, user.password);
        console.log("Password correct:", isPasswordCorrect ? "Yes" : "No");

        if (!isPasswordCorrect) {
            console.log("Incorrect password");
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT tokens
        console.log("Generating JWT tokens");
        const { accessToken, refreshToken } = generateJwtToken(user._id);
        console.log("JWT tokens generated successfully");

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send welcome email if user is not verified
        if (!user.isVerified) {
            await sendWelcomeEmail(user.email, user.name);
            console.log("Welcome email sent to unverified user");
        }

        console.log("Login successful for user:", user.email);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "An error occurred during login", error: error.message });
    }
};

// @desc    Logout user
export const logout = (req, res) => {
    try {
        // Clear the token cookie
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Prevent CSRF attacks
            expires: new Date(0) // Expire the cookie immediately
        });

        // If you're keeping track of sessions or valid tokens, invalidate it here
        // For example: await invalidateToken(req.user.id);

        // Send a success response
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ success: false, message: "An error occurred during logout" });
    }
};

// @desc    Request password reset
export const forgotPassword = async (req, res) => {
    const { email: rawEmail } = req.body;
    const email = rawEmail.trim(); // Trim the email

    console.log("Forgot password request for email:", email);

    try {
        // Log all users in the database
        const allUsers = await User.find({}, 'email');
        console.log("All users in database:", allUsers.map(u => u.email.trim()));

        // Use a more forgiving regex that allows for trailing spaces
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email.trim()}\\s*$`, 'i') } });

        console.log("User found:", user ? "Yes" : "No");

        if (!user) {
            console.log("User not found, sending generic response");
            return res.status(200).json({ 
                success: true, 
                message: "If an account with that email exists, a password reset link has been sent." 
            });
        }

        if (!user.isVerified) {
            console.log("User not verified");
            return res.status(400).json({ 
                success: false, 
                message: "Account is not verified. Please verify your email first." 
            });
        }

        // Check if the user has exceeded the daily limit
        const today = new Date().setHours(0, 0, 0, 0);
        if (user.passwordResetAttempts.lastAttempt &&
            user.passwordResetAttempts.lastAttempt.setHours(0, 0, 0, 0) === today) {
            if (user.passwordResetAttempts.count >= MAX_DAILY_PASSWORD_RESET_ATTEMPTS) {
                console.log("Daily reset attempt limit exceeded");
                return res.status(429).json({
                    success: false,
                    message: "Maximum password reset attempts for today reached. Please try again tomorrow."
                });
            }
        } else {
            // Reset the count if it's a new day
            user.passwordResetAttempts.count = 0;
        }

        // Increment the attempt count
        user.passwordResetAttempts.count += 1;
        user.passwordResetAttempts.lastAttempt = new Date();

        // Generate a shorter reset token (6-digit number)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = Date.now() + 3600000; // 1 hour

        console.log("Saving user with new reset token");
        await user.save();

        console.log("Attempting to send password reset email");
        await sendPasswordResetRequestEmail(user.email, resetToken);
        console.log("Password reset email sent successfully");

        res.status(200).json({ 
            success: true, 
            message: "Password reset link has been sent to your email." 
        });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ success: false, message: "An error occurred while processing your request" });
    }
};

// @desc    Reset password
export const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    
    try {
        const user = await User.findOne({
            email: email,
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
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

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        user.passwordResetAttempts.count = 0; // Reset the attempt count after successful password change

        await user.save();

        await sendPasswordResetSuccessEmail(user.email);

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ success: false, message: "An error occurred while resetting your password" });
    }
};

// @desc    Get current user
export const getCurrentUser = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Error in getCurrentUser:", error.message);
        res.status(500).json({ success: false, message: "An error occurred while fetching the user" });
    }
}

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Refresh token not found" });
        }

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Find the user
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateJwtToken(user._id);

        // Set new cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({ success: true, accessToken });
    } catch (error) {
        console.error("Error in refreshToken:", error);
        res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
};
