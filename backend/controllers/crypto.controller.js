import { fetchCryptoDataWithRetry, fetchHistoricalDataWithRetry, fetchAssetDetails, fetchTopCryptosWithRetry } from '../services/cryptoApi.service.js';
import { getCoinId as getCoinIdFromService } from '../services/coinIdService.js';
import { redisClient } from '../config/redis.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import CoinGecko from 'coingecko-api';

const CoinGeckoClient = new CoinGecko();

export const getCryptoPrices = async (req, res) => {
    try {
        const { ids } = req.query; // Expect comma-separated list of coin IDs
        const coinIds = ids.split(',');
        // const prices = await fetchCryptoData(coinIds);
        const prices = await fetchCryptoDataWithRetry(coinIds);
        res.json({ success: true, data: prices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching crypto prices', error: error.message });
    }
};

export const getAssetDetails = async (req, res) => {
    try {
        const { coinId } = req.params;
        const assetDetails = await fetchAssetDetails(coinId);
        
        const {
            id,
            symbol,
            name,
            image,
            market_data: {
                current_price,
                market_cap,
                total_volume,
                high_24h,
                low_24h,
                price_change_percentage_24h,
                price_change_percentage_7d,
                price_change_percentage_30d,
                circulating_supply,
                total_supply,
                max_supply,
                ath,
                ath_date,
                atl,
                atl_date
            },
            description,
            links
        } = assetDetails;

        const formattedDetails = {
            id,
            symbol,
            name,
            image: image.large,
            currentPrice: current_price.usd,
            marketCap: market_cap.usd,
            totalVolume: total_volume.usd,
            high24h: high_24h.usd,
            low24h: low_24h.usd,
            priceChange24h: price_change_percentage_24h,
            priceChange7d: price_change_percentage_7d,
            priceChange30d: price_change_percentage_30d,
            circulatingSupply: circulating_supply,
            totalSupply: total_supply,
            maxSupply: max_supply,
            allTimeHigh: {
                price: ath.usd,
                date: ath_date.usd
            },
            allTimeLow: {
                price: atl.usd,
                date: atl_date.usd
            },
            description: description.en,
            website: links.homepage[0],
            explorer: links.blockchain_site[0],
            reddit: links.subreddit_url,
            github: links.repos_url.github[0]
        };

        res.json({ success: true, data: formattedDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching asset details', error: error.message });
    }
};

export const getHistoricalData = async (req, res) => {
    try {
        const { coinId } = req.params;
        const { timeframe } = req.query;
        
        let days;
        switch (timeframe) {
            case '1d': days = 1; break;
            case '7d': days = 7; break;
            case '30d': days = 30; break;
            case '90d': days = 90; break;
            case '1y': days = 365; break;
            case 'max': days = 'max'; break;
            default: days = 30; // Default to 30 days if no timeframe is specified
        }

        const historicalData = await fetchHistoricalDataWithRetry(coinId, days);

        sendSuccessResponse(res, 200, 'Historical data fetched successfully', {
            prices: historicalData.prices,
            marketCaps: historicalData.market_caps,
            totalVolumes: historicalData.total_volumes
        });
    } catch (error) {
        sendErrorResponse(res, 500, 'Error fetching historical data', error);
    }
};

export const getMultiTimeframeData = async (req, res) => {
    try {
        const { coinId } = req.params;
        const timeframes = ['1d', '7d', '30d', '90d', '1y', 'max'];
        const result = {};

        for (const timeframe of timeframes) {
            let days;
            switch (timeframe) {
                case '1d': days = 1; break;
                case '7d': days = 7; break;
                case '30d': days = 30; break;
                case '90d': days = 90; break;
                case '1y': days = 365; break;
                case 'max': days = 'max'; break;
            }

            const historicalData = await fetchHistoricalDataWithRetry(coinId, days);
            result[timeframe] = {
                prices: historicalData.prices,
                marketCaps: historicalData.market_caps,
                totalVolumes: historicalData.total_volumes
            };
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching multi-timeframe data', error: error.message });
    }
};

export const getCoinId = async (req, res) => {
    try {
        const { symbol } = req.params;
        const coinId = await getCoinIdFromService(redisClient, symbol);
        sendSuccessResponse(res, 200, 'Coin ID retrieved successfully', { symbol, coinId });
    } catch (error) {
        console.error('Error in getCoinId:', error);
        sendErrorResponse(res, 404, `Coin ID not found for symbol: ${req.params.symbol}`, error);
    }
};

export const getTopCryptos = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        console.log('Fetching top cryptocurrencies from API');
        const topCryptos = await fetchTopCryptosWithRetry(limit);
        res.json(topCryptos); // Ensure this is an array
    } catch (error) {
        console.error('Error in getTopCryptos:', error);
        res.status(500).json({ error: 'Error fetching top cryptocurrencies' });
    }
};

export const getCoinGeckoSymbols = async (req, res) => {
  try {
    const response = await CoinGeckoClient.coins.list();
    const symbols = response.data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name
    }));
    res.json({ success: true, symbols });
  } catch (error) {
    console.error('Error fetching CoinGecko symbols:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch CoinGecko symbols' });
  }
};
