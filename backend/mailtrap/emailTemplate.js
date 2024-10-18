const baseStyle = `
    body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f4f4f4;
    }
    .header {
        background-color: #1a1a1a;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
    }
    .content {
        background-color: #ffffff;
        padding: 30px;
        border-radius: 0 0 5px 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .button {
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        padding: 14px 20px;
        margin: 20px 0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        font-size: 16px;
        text-align: center;
    }
    .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 12px;
        color: #666;
    }
    .token {
        background-color: #e9e9e9;
        border: 1px solid #d5d5d5;
        border-radius: 4px;
        padding: 10px 15px;
        font-size: 24px;
        letter-spacing: 5px;
        text-align: center;
        margin: 20px 0;
        color: #333;
        font-weight: bold;
    }
`;

export const verifyEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - CryptoInsight</title>
    <style>${baseStyle}</style>
</head>
<body>
    <div class="header">
        <h1>CryptoInsight</h1>
    </div>
    <div class="content">
        <h2>Verify Your Email</h2>
        <p>Welcome to CryptoInsight! We're excited to have you on board. To get started, please verify your email address by clicking the button below or entering the verification code manually.</p>
        <a href="{verification_link}" class="button">Verify Email</a>
        <p>If the button doesn't work, you can also enter this verification code manually:</p>
        <div class="token">{verification_token}</div>
        <p>This code will expire in 24 hours for security reasons.</p>
    </div>
    <div class="footer">
        <p>&copy; 2024 CryptoInsight. All rights reserved.</p>
        <p>If you didn't create an account with CryptoInsight, please ignore this email.</p>
    </div>
</body>
</html>
`;

export const welcomeEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CryptoInsight</title>
    <style>${baseStyle}</style>
</head>
<body>
    <div class="header">
        <h1>CryptoInsight</h1>
    </div>
    <div class="content">
        <h2>Welcome to CryptoInsight, {name}!</h2>
        <p>Thank you for verifying your email address. We're thrilled to have you on board!</p>
        <p>With CryptoInsight, you'll be able to:</p>
        <ul>
            <li>Track your favorite cryptocurrencies</li>
            <li>Get real-time market updates</li>
            <li>Access in-depth analysis and insights</li>
        </ul>
        <p>Ready to get started?</p>
        <a href="https://your-frontend-url.com/dashboard" class="button">Go to Dashboard</a>
    </div>
    <div class="footer">
        <p>&copy; 2024 CryptoInsight. All rights reserved.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
    </div>
</body>
</html>
`;

export const passwordResetRequestTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request - CryptoInsight</title>
    <style>${baseStyle}</style>
</head>
<body>
    <div class="header">
        <h1>CryptoInsight</h1>
    </div>
    <div class="content">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
        <p>To reset your password, click the button below or enter the reset code manually:</p>
        <a href="{reset_link}" class="button">Reset Password</a>
        <p>Reset Code:</p>
        <div class="token">{reset_token}</div>
        <p>This code will expire in 1 hour for security reasons.</p>
    </div>
    <div class="footer">
        <p>&copy; 2024 CryptoInsight. All rights reserved.</p>
    </div>
</body>
</html>
`;

export const passwordResetSuccessTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful - CryptoInsight</title>
    <style>${baseStyle}</style>
</head>
<body>
    <div class="header">
        <h1>CryptoInsight</h1>
    </div>
    <div class="content">
        <h2>Password Reset Successful</h2>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change or if you believe an unauthorized person has accessed your account, please contact our support team immediately.</p>
        <a href="https://your-frontend-url.com/login" class="button">Go to Login</a>
    </div>
    <div class="footer">
        <p>&copy; 2024 CryptoInsight. All rights reserved.</p>
    </div>
</body>
</html>
`;

export const password_Reset_Success_Template = ``;

export const password_Reset_Failure_Template = ``;

export const password_Reset_Request_Success_Template = ``;

export const password_Reset_Request_Failure_Template = ``;
