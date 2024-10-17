import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from 'http';
import { initializeWebSocket } from './websocket/websocket.js';

import { connectDB } from "./db/connectDB.js";
import { connectRedis } from "./config/redis.js";
import { initializeCurrencies } from "./utils/currency.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import cryptoRoutes from './routes/crypto.routes.js';
import newsRoutes from './routes/news.routes.js';
import aiRoutes from './routes/ai.routes.js';
import socialRoutes from './routes/social.routes.js';  // Add this line

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Error handling middleware (add this before starting the server)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Routes
app.get("/", (req, res) => {
    res.send("Crypto-Insight API");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/portfolios", portfolioRoutes);
app.use('/api/v1/crypto', cryptoRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/ai', aiRoutes);
console.log('AI routes mounted');
app.use('/api/v1/social', socialRoutes);  // Add this line

// Add this route before your catch-all route
app.get('/auth/me', (req, res) => {
  res.status(401).json({ message: 'Not authenticated' });
});

// Your existing catch-all route
app.use('*', (req, res) => {
    console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Route not found' });
});

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
