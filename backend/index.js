import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from 'http';
import { initializeWebSocket } from './websocket/websocket.js';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from "./db/connectDB.js";
import { connectRedis } from "./config/redis.js";
import { initializeCurrencies } from "./utils/currency.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import cryptoRoutes from './routes/crypto.routes.js';
import newsRoutes from './routes/news.routes.js';
import aiRoutes from './routes/ai.routes.js';
import socialRoutes from './routes/social.routes.js';
import swapRoutes from './routes/swap.routes.js';
import walletRoutes from './routes/wallet.routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://crypto-insight-9wvr.onrender.com'
    : 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// API Routes first
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/portfolios", portfolioRoutes);
app.use('/api/v1/crypto', cryptoRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/swap', swapRoutes);
app.use('/api/v1/wallet', walletRoutes);

// Catch-all route for unmatched API routes - MOVE THIS HERE
app.use('/api/*', (req, res) => {  // Changed to only catch /api/* routes
    console.log(`Unmatched API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Route not found' });
});

// Then static file serving for production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // This should catch ALL non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

try {
    const startServer = async () => {
        try {
            await connectDB();
            console.log("MongoDB connected successfully");

            await connectRedis();
            // The console.log for Redis connection is now in the connectRedis function

            const currenciesInitialized = await initializeCurrencies();
            if (!currenciesInitialized) {
                console.warn("Using fallback currencies. Some features may be limited.");
            }

            initializeWebSocket(server);
            console.log("WebSocket server initialized successfully");

            server.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        } catch (error) {
            console.error("Failed to start the server:", error);
            process.exit(1);
        }
    };

    startServer();
} catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
}
