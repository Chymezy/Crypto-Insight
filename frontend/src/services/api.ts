import axios, { AxiosError, AxiosInstance } from 'axios';
import { PortfolioData, PerformanceData, Transaction, User, Asset, Crypto, DetailedAsset } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This ensures cookies are sent with requests
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
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers['X-Retry']) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;
      originalRequest.headers['X-Retry'] = 'true';

      try {
        const { data } = await api.post('/auth/refresh-token');
        isRefreshing = false;
        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        // Logout user or redirect to login page
        // For example: window.location.href = '/login';
        return Promise.reject(refreshError);
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

// Portfolio APIs
export const fetchPortfolioData = async (): Promise<PortfolioData> => {
  const response = await api.get<PortfolioData>('/portfolio');
  return response.data;
};

export const fetchPerformanceData = async (period: string = '1m'): Promise<PerformanceData[]> => {
  const response = await api.get<PerformanceData[]>(`/portfolio/performance?period=${period}`);
  return response.data;
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
  try {
    // Remove the duplicate '/api/v1'
    const response = await api.get<{ success: boolean; data: DetailedAsset }>(`/crypto/assets/${assetId}`);
    console.log('Raw API response:', response.data);

    if (!response.data.success) {
      throw new Error('Failed to fetch asset details');
    }

    const formattedData = response.data.data;
    console.log('Formatted data:', formattedData);
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
    // Remove the duplicate '/api/v1' from the URL
    const response = await api.get<Crypto[]>('/crypto/top');
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Unexpected data format:', response.data);
      throw new Error('Fetched data is not a non-empty array');
    }
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    throw error; // Re-throw the error to be handled by the component
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
