import { mailtrapClient, sender } from "./mailtrap.config.js";
import { verifyEmailTemplate, welcomeEmailTemplate, passwordResetRequestTemplate, passwordResetSuccessTemplate } from "./emailTemplate.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];

    try {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
        
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify Your Email - CryptoInsight",
            html: verifyEmailTemplate
                .replace("{verification_link}", verificationLink)
                .replace("{verification_token}", verificationToken),
            template_variables: {
                verification_link: verificationLink,
                verification_token: verificationToken,
            },
            category: "Email Verification",
        });
        console.log("Verification email sent successfully", response);
    } catch (error) {
        console.error("Error sending verification email", error);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email: email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to CryptoInsight!",
            html: welcomeEmailTemplate.replace("{name}", name),
            template_variables: {
                name: name,
            }
        });
        console.log("Welcome email sent successfully", response);
    } catch (error) {
        console.log("Error sending welcome email", error);
    }
};

export const sendPasswordResetRequestEmail = async (email, resetToken) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Request - CryptoInsight",
            html: passwordResetRequestTemplate.replace("{reset_token}", resetToken),
            template_variables: {
                reset_link: `https://your-frontend-url.com/reset-password?token=${resetToken}`,
                reset_token: resetToken,
            },
            category: "Password Reset Request",
        });
        console.log("Password reset request email sent successfully", response);
    } catch (error) {
        console.log("Error sending password reset request email", error);
    }
};

export const sendPasswordResetSuccessEmail = async (email) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful - CryptoInsight",
            html: passwordResetSuccessTemplate,
            category: "Password Reset Success",
        });
        console.log("Password reset success email sent successfully", response);
    } catch (error) {
        console.log("Error sending password reset success email", error);
    }
};
