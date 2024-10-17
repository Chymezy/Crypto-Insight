import * as realApi from '../services/api';
import * as mockApi from '../services/mockApi';
import { Asset } from '../types';

const isDevelopment = import.meta.env.MODE === 'development';
const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

// Helper function to handle API calls based on environment and configuration
const apiSelector = <T extends (...args: any[]) => Promise<any>>(
  realApiFunc: T,
  mockApiFunc: T
): T => {
  return (async (...args: Parameters<T>) => {
    if (!isDevelopment) {
      // In production, always use real API
      return realApiFunc(...args);
    }

    if (useMockApi) {
      // In development, use mock API if explicitly set
      return mockApiFunc(...args);
    }

    // In development, try real API first, fall back to mock if it fails
    try {
      return await realApiFunc(...args);
    } catch (error) {
      console.warn(`Real API call failed, falling back to mock data for ${realApiFunc.name}`, error);
      return mockApiFunc(...args);
    }
  }) as T;
};

export const fetchPortfolioData = apiSelector(realApi.fetchPortfolioData, mockApi.mockFetchPortfolioData);
export const fetchPerformanceData = apiSelector(realApi.fetchPerformanceData, mockApi.mockFetchPerformanceData);
export const fetchTransactions = apiSelector(realApi.fetchTransactions, mockApi.mockFetchTransactions);
export const login = apiSelector(realApi.login, mockApi.mockLogin);
export const register = apiSelector(realApi.register, mockApi.mockRegister);
export const logout = apiSelector(realApi.logout, mockApi.mockLogout);
export const refreshToken = apiSelector(realApi.refreshToken, mockApi.mockRefreshToken);
export const searchAssets = apiSelector(realApi.searchAssets, mockApi.mockSearchAssets);

export interface DetailedAsset extends Asset {
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  allTimeHigh: number;
  priceHistory: { date: number; price: number }[];
}

export const fetchAssetDetails = apiSelector(realApi.fetchAssetDetails, mockApi.mockFetchAssetDetails);

export const fetchAIInsights = apiSelector(realApi.fetchAIInsights, mockApi.mockFetchAIInsights);

// New import for price history API
import { fetchPriceHistory as realFetchPriceHistory } from '../services/api';
import { mockFetchPriceHistory } from '../services/mockApi';

// New export for price history API
export const fetchPriceHistory = apiSelector(realFetchPriceHistory, mockFetchPriceHistory);