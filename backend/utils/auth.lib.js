import jwt from "jsonwebtoken";

// @desc    Generate JWT token and set cookie
export const generateJwtTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { 
        expiresIn: "7d", 
    }); // create token
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return token;
}

// Helper function to check password strength
export function isPasswordStrong(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    const reasons = [];
    if (password.length < minLength) reasons.push(`Password must be at least ${minLength} characters long.`);

    let criteriaCount = 0;
    if (hasUpperCase) criteriaCount++;
    if (hasLowerCase) criteriaCount++;
    if (hasNumbers) criteriaCount++;
    if (hasNonalphas) criteriaCount++;

    if (criteriaCount < 3) {
        reasons.push("Password must meet at least 3 of the following criteria: contain an uppercase letter, a lowercase letter, a number, and a special character.");
    }

    return {
        isStrong: reasons.length === 0,
        reasons: reasons
    };
}


// @desc    Change password when already logged in
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await bcrypt.compare(currentPassword, user.password))) {
            // Check password strength
            const passwordStrengthResult = isPasswordStrong(newPassword);
            if (!passwordStrengthResult.isStrong) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Password does not meet security requirements",
                    details: passwordStrengthResult.reasons
                });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            // Invalidate cache
            await redisClient.del(`user:${user._id}`);

            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(400).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};