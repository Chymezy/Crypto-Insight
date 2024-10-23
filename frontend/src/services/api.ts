import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { PortfolioData, PerformanceData, Transaction, User, Asset, Crypto, DetailedAsset, Portfolio } from '../types';
import { getFromCache, setInCache } from '../utils/cacheUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshToken();
        processQueue(null, 'dummy_token');
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = async (email: string, password: string): Promise<User> => {
  const response = await api.post<{ user: User }>('/auth/login', { email, password });
  return response.data.user;
};


export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');

};

export const refreshToken = async (): Promise<void> => {
  await api.post('/auth/refresh-token');
};

export const signup = async (name: string, email: string, password: string): Promise<User> => {
  const response = await api.post<User>('/auth/signup', { name, email, password });
  return response.data;
};

export const verifyEmail = async (email: string, token: string): Promise<void> => {
  const response = await api.post('/auth/verify-email', { email, token });
  return response.data;
};

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-token`, { token });
    return response.data.isValid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email: string, token: string, newPassword: string) => {
  const response = await api.post('/auth/reset-password', { email, token, newPassword });
  return response.data;
};

// Portfolio APIs
export const fetchPortfolioData = async (): Promise<PortfolioData> => {
  try {
    const response = await api.get<{ success: boolean; message: string; data: Portfolio[] }>('/portfolios');
    console.log('API response:', response.data);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch portfolio data');
    }
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    throw error;
  }
};

export const fetchPerformanceData = async (portfolioId: string, timeframe: string = '7d'): Promise<PerformanceData[]> => {
  try {
    console.log(`Fetching performance data for portfolio ${portfolioId} with timeframe ${timeframe}`);
    const response = await api.get<{ success: boolean; data: any }>(`/portfolios/${portfolioId}/performance?timeframe=${timeframe}`);
    console.log('Performance data response:', response.data);
    
    if (response.data.success && response.data.data) {
      // Transform the data to match the PerformanceData type
      const transformedData: PerformanceData[] = [
        {
          date: new Date().toISOString(), // You might want to use a more appropriate date
          value: response.data.data.endValue
        }
      ];
      return transformedData;
    } else {
      console.error('Unexpected performance data format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return [];
  }
};

export const fetchTransactions = async (page: number = 1, limit: number = 10): Promise<Transaction[]> => {
  const response = await api.get<Transaction[]>(`/transactions?page=${page}&limit=${limit}`);
  return response.data;
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const response = await api.post<Transaction>('/transactions', transaction);
  return response.data;
};

// Asset APIs
export const fetchAssetDetails = async (assetId: string): Promise<DetailedAsset> => {
  const cacheKey = `asset_details_${assetId}`;

  const cachedData = getFromCache<DetailedAsset>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await api.get<{ success: boolean; data: DetailedAsset }>(`/crypto/assets/${assetId}`);
    console.log('Raw API response:', response.data);

    if (!response.data.success) {
      throw new Error('Failed to fetch asset details');
    }

    const formattedData = response.data.data;
    console.log('Formatted data:', formattedData);

    setInCache(cacheKey, formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching asset details:', error);
    throw error;
  }
};

export const searchAssets = async (query: string): Promise<Asset[]> => {
  const response = await api.get<Asset[]>(`/assets/search?q=${query}`);
  return response.data;
};

// Error handling helper
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return 'An unexpected error occurred';
};

export const fetchAIInsights = async (assetSymbol: string): Promise<string> => {
  const response = await api.get<{ insight: string }>(`/ai/insights/${assetSymbol}`);
  return response.data.insight;
};

export const fetchPriceHistory = async (assetId: string, timeframe: '24h' | '7d' | '30d' | '1y'): Promise<{ date: number; price: number }[]> => {
  try {
    // Remove the duplicate '/api/v1' and update the endpoint
    const response = await api.get<{ success: boolean; data: { prices: [number, number][] } }>(`/crypto/historical/${assetId}?timeframe=${timeframe}`);
    
    if (!response.data.success) {
      throw new Error('Failed to fetch price history');
    }

    return response.data.data.prices.map(([timestamp, price]) => ({
      date: timestamp,
      price: price,
    }));
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
};

export const fetchTopCryptos = async (): Promise<Crypto[]> => {
  try {
    const response = await api.get<Crypto[]>('/crypto/top?limit=100'); // Fetch 100 or more cryptocurrencies
    console.log('Fetched crypto data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    throw error;
  }
};

export const fetchOHLCData = async (assetId: string, timeframe: string): Promise<{ date: Date; open: number; high: number; low: number; close: number }[]> => {
  try {
    // Remove the duplicate '/api/v1'
    const response = await api.get<{ success: boolean; data: { ohlc: [number, number, number, number, number][] } }>(`/crypto/ohlc/${assetId}?timeframe=${timeframe}`);
    
    if (!response.data.success) {
      throw new Error('Failed to fetch OHLC data');
    }

    return response.data.data.ohlc.map(([timestamp, open, high, low, close]) => ({
      date: new Date(timestamp),
      open,
      high,
      low,
      close,
    }));
  } catch (error) {
    console.error('Error fetching OHLC data:', error);
    throw error;
  }
};

// ... other exports

export const post = api.post.bind(api); // Bind the post method to the api instance

export default api;
// Add these functions to your api.ts file

export const addAssetToPortfolio = async (portfolioId: string, coinId: string, amount: number): Promise<Portfolio> => {
  const response = await api.post<Portfolio>(`/portfolios/${portfolioId}/assets`, { coinId, amount });
  return response.data;
};

export const updateAssetInPortfolio = async (portfolioId: string, assetId: string, amount: number): Promise<Portfolio> => {
  const response = await api.put<Portfolio>(`/portfolios/${portfolioId}/assets/${assetId}`, { amount });
  return response.data;
};

export const removeAssetFromPortfolio = async (portfolioId: string, assetId: string): Promise<void> => {
  await api.delete(`/portfolios/${portfolioId}/assets/${assetId}`);
};

// Add or update these functions in your api.ts file

export const createPortfolio = async (portfolioData: { name: string; description: string }): Promise<Portfolio> => {
  const response = await api.post<Portfolio>('/portfolios', portfolioData);
  return response.data;
};

export const updatePortfolio = async (portfolioId: string, portfolioData: { name: string; description: string }): Promise<Portfolio> => {
  const response = await api.put<Portfolio>(`/portfolios/${portfolioId}`, portfolioData);
  return response.data;
};

export const deletePortfolio = async (portfolioId: string): Promise<void> => {
  await api.delete(`/portfolios/${portfolioId}`);
};

