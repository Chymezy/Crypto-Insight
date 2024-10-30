import { createClient } from 'redis';

let redisClient = null;

export const connectRedis = async () => {
    // Only try to connect to Redis if REDIS_URL is provided
    if (process.env.REDIS_URL) {
        try {
            redisClient = createClient({
                url: process.env.REDIS_URL
            });

            redisClient.on('error', (err) => {
                console.warn('Redis connection error:', err);
                redisClient = null; // Fall back to memory cache
            });

            await redisClient.connect();
            console.log('Redis connected successfully');
        } catch (error) {
            console.warn('Failed to connect to Redis:', error);
            redisClient = null; // Fall back to memory cache
        }
    } else {
        console.log('No Redis URL provided, using memory cache');
    }
};

// Simple in-memory cache as fallback
const memoryCache = new Map();

export const redisHelper = {
    get: async (key) => {
        if (redisClient) {
            return await redisClient.get(key);
        }
        return memoryCache.get(key);
    },
    set: async (key, value, options = {}) => {
        if (redisClient) {
            return await redisClient.set(key, value, options);
        }
        memoryCache.set(key, value);
    },
    del: async (key) => {
        if (redisClient) {
            return await redisClient.del(key);
        }
        memoryCache.delete(key);
    }
};

export { redisClient };