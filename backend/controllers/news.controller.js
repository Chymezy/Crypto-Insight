import axios from 'axios';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { redisClient } from '../config/redis.js';

const CRYPTO_COMPARE_API_KEY = process.env.CRYPTO_COMPARE_API_KEY;
const CRYPTO_COMPARE_URL = 'https://min-api.cryptocompare.com/data/v2/news/';

export const getNews = async (req, res) => {
    try {
        const { categories, excludeCategories, feeds, lang, sortOrder, page = 1, limit = 10, search } = req.query;
        
        // Create a cache key based on the query parameters
        const cacheKey = `news:${categories}:${excludeCategories}:${feeds}:${lang}:${sortOrder}:${page}:${limit}:${search}`;
        
        // Try to get the cached result
        const cachedResult = await redisClient.get(cacheKey);
        if (cachedResult) {
            return sendSuccessResponse(res, 200, 'News fetched from cache', JSON.parse(cachedResult));
        }

        const response = await axios.get(CRYPTO_COMPARE_URL, {
            params: {
                api_key: CRYPTO_COMPARE_API_KEY,
                categories,
                excludeCategories,
                feeds,
                lang: lang || 'EN',
                sortOrder: sortOrder || 'latest',
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

        console.log('API Response:', JSON.stringify(response.data, null, 2));

        if (!response.data || response.data.Response === 'Error') {
            throw new Error(response.data.Message || 'Invalid response from CryptoCompare API');
        }

        if (!Array.isArray(response.data.Data)) {
            throw new Error('Unexpected response structure from CryptoCompare API');
        }

        let news = response.data.Data;
        const totalCount = news.length;

        // Apply search filter if provided
        if (search) {
            const searchLower = search.toLowerCase();
            news = news.filter(item => 
                item.title.toLowerCase().includes(searchLower) || 
                item.body.toLowerCase().includes(searchLower)
            );
        }

        const result = {
            news,
            totalCount,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit))
        };

        // Cache the result
        await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600); // Cache for 1 hour

        sendSuccessResponse(res, 200, 'News fetched successfully', result);
    } catch (error) {
        console.error('Error fetching news:', error);
        sendErrorResponse(res, 500, 'Error fetching news', error.message);
    }
};