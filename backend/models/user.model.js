import mongoose from "mongoose";
import { FALLBACK_CURRENCIES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    passwordResetAttempts: {
        count: { type: Number, default: 0 },
        lastAttempt: { type: Date }
    },
    profilePicture: {
        type: String,
        default: 'default.jpg'
    },
    language: {
        type: String,
        default: 'en'
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
    },
    preferredCurrency: {
        type: String,
        validate: {
            validator: function(v) {
                return global.SUPPORTED_CURRENCIES ? 
                    global.SUPPORTED_CURRENCIES.includes(v) : 
                    FALLBACK_CURRENCIES.includes(v);
            },
            message: props => `${props.value} is not a supported currency`
        },
        default: 'USD'
    },
    watchlist: [{
        type: String,
        trim: true,
        uppercase: true
    }],
    portfolios: [{
        name: { type: String, required: true },
        description: { type: String, default: "" },
        isDefault: { type: Boolean, default: false },
        assets: [{
            coinId: { type: String, required: true },
            amount: { type: Number, required: true },
            purchasePrice: { type: Number },
            purchaseDate: { type: Date }
        }],
        createdAt: { type: Date, default: Date.now },
    }],
    transactions: [{
        coinId: { type: String, required: true },
        type: { type: String, enum: ['buy', 'sell', 'transfer'], required: true },
        amount: { type: Number, required: true },
        price: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        notes: String,
        fee: Number,
        from: String,
        to: String
    }],
    alerts: [{
        coinId: { type: String, required: true },
        condition: { type: String, enum: ['above', 'below'], required: true },
        price: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    }],
    connectedExchanges: [{
        name: { type: String, required: true },
        apiKey: { type: String, required: true },
        apiSecret: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    }],
    settings: {
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        defaultPortfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
        defaultTimeframe: { type: String, enum: ['24h', '7d', '30d', '90d', '1y', 'all'], default: '24h' },
        defaultChart: { type: String, enum: ['line', 'candle', 'bar', 'area'], default: 'line' }
    },
    subscriptionTier: {
        type: String,
        enum: ['free', 'premium', 'pro'],
        default: 'free'
    },
    lastSyncDate: Date,
    
}, {timestamps: true});

export const User = mongoose.model("User", userSchema);

