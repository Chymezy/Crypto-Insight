import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { User } from "../models/user.model.js";
import { generateJwtTokenAndSetCookie, isPasswordStrong } from "../utils/auth.lib.js";
import { 
    sendWelcomeEmail, 
    sendVerificationEmail, 
    sendPasswordResetRequestEmail, 
    sendPasswordResetSuccessEmail } from "../mailtrap/emails.js";
import { MAX_DAILY_PASSWORD_RESET_ATTEMPTS } from '../config/constants.js';

// @desc    Signup user
export const signup = async (req, res) => {
    const { email: rawEmail, password, name } = req.body;
    const email = rawEmail.trim(); // Trim the email
    try {
        if(!email || !password || !name){
            throw new Error("All fields are required"); // returns error if any field is empty
        }

        const userAlreadyExists = await User.findOne({ email }); // checks for duplicates
        if(userAlreadyExists){
            return res.status(400).json({success: false, message: "User already exists"}); // returns error if user already exists
        }

        const hashedPassword = await bcryptjs.hash(password, 10); // hashed user password
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // creates verification token
        const user = new User({
            email: email.trim(),        // Trim the email before saving
            password: hashedPassword,   // saves hashed password
            name,                       // saves user name
            lastLogin: new Date(),      // default value for new users
            isVerified: false,          // default value for new users
            verificationToken,          //  temporal save verification token on database
            verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hrs expiration

        });

        await user.save(); // saves user to database
        // res.status(201).json({success: true, message: "User created successfully"}); // returns success message

        // generate jwt token
        generateJwtTokenAndSetCookie(res, user._id);

        // send verification email
        await sendVerificationEmail(user.email, verificationToken);

        // return response
        res.status(201).json({
            success: true,
            message: "User created successfully. Please check your email for verification.",
            user: {
              ...user._doc,
              password: undefined,
            },
        });

    } catch (error) {
        res.status(400).json({success: false, message: error.message});
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

        // Generate JWT token and set cookie
        generateJwtTokenAndSetCookie(res, user._id);

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
