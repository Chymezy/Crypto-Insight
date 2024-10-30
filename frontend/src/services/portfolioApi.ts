import api from './api';  // Import the main api instance
import { Portfolio, PortfolioPerformance, Asset } from '../types/portfolio.types';
import { store } from '../store';
import { 
  updatePortfolioAssets, 
  fetchPortfoliosThunk, 
  fetchPerformanceThunk 
} from '../store/slices/portfolioSlice';

export const getPortfolios = async (): Promise<Portfolio[]> => {
  try {
    const response = await api.get('/portfolios');
    return response.data.data;
  } catch (error) {
    console.error('Error in getPortfolios:', error);
    throw error;
  }
};

export const createPortfolio = async (name: string, description: string): Promise<Portfolio> => {
  try {
    const response = await api.post('/portfolios', { name, description });
    return response.data.data.portfolio;
  } catch (error) {
    console.error('Error in createPortfolio:', error);
    throw error;
  }
};

export const fetchSinglePortfolio = async (portfolioId: string): Promise<Portfolio> => {
  try {
    const response = await api.get(`/portfolios/${portfolioId}`);
    return response.data.data?.portfolio || response.data.portfolio;
  } catch (error) {
    console.error('Error in fetchSinglePortfolio:', error);
    throw error;
  }
};

export const fetchPortfolioPerformance = async (portfolioId: string, timeframe: string): Promise<PortfolioPerformance> => {
  try {
    const response = await api.get(`/portfolios/${portfolioId}/performance?timeframe=${timeframe}`);
    return response.data.data.performance;
  } catch (error) {
    console.error('Error in fetchPortfolioPerformance:', error);
    throw error;
  }
};

export const updatePortfolio = async (portfolioId: string, name: string, description: string): Promise<Portfolio> => {
  try {
    const response = await api.put(`/portfolios/${portfolioId}`, { name, description });
    return response.data.portfolio;
  } catch (error) {
    console.error('Error in updatePortfolio:', error);
    throw error;
  }
};

export const deletePortfolio = async (portfolioId: string): Promise<void> => {
  try {
    await api.delete(`/portfolios/${portfolioId}`);
  } catch (error) {
    console.error('Error in deletePortfolio:', error);
    throw error;
  }
};

export const addAssetToPortfolio = async (portfolioId: string, coinId: string, amount: number): Promise<Portfolio> => {
  try {
    const response = await api.post(`/portfolios/${portfolioId}/assets`, { coinId, amount });
    console.log('Add asset response:', response.data);
    
    const portfolioResponse = await api.get(`/portfolios/${portfolioId}`);
    console.log('Updated portfolio response:', portfolioResponse.data);
    
    const updatedPortfolio = portfolioResponse.data.data?.portfolio || portfolioResponse.data.portfolio;
    
    if (updatedPortfolio) {
      store.dispatch(updatePortfolioAssets(updatedPortfolio));
      
      store.dispatch(fetchPortfoliosThunk());
      
      store.dispatch(fetchPerformanceThunk({ 
        portfolioId: updatedPortfolio.id, 
        timeframe: '7d'
      }));

      return updatedPortfolio;
    } else {
      console.error('Invalid portfolio data structure:', portfolioResponse.data);
      throw new Error('Failed to fetch updated portfolio data');
    }
  } catch (error) {
    console.error('Error in addAssetToPortfolio:', error);
    throw error;
  }
};

export const updateAssetInPortfolio = async (portfolioId: string, assetId: string, amount: number): Promise<Portfolio> => {
  try {
    await api.put(`/portfolios/${portfolioId}/assets/${assetId}`, { amount });
    
    const updatedPortfolio = await fetchSinglePortfolio(portfolioId);
    
    if (updatedPortfolio) {
      store.dispatch(updatePortfolioAssets(updatedPortfolio));
      
      store.dispatch(fetchPortfoliosThunk());
      
      store.dispatch(fetchPerformanceThunk({ 
        portfolioId: updatedPortfolio.id, 
        timeframe: '7d'
      }));

      return updatedPortfolio;
    } else {
      throw new Error('Failed to fetch updated portfolio data');
    }
  } catch (error) {
    console.error('Error in updateAssetInPortfolio:', error);
    throw error;
  }
};

export const removeAssetFromPortfolio = async (portfolioId: string, assetId: string): Promise<void> => {
  try {
    await api.delete(`/portfolios/${portfolioId}/assets/${assetId}`);
    
    const updatedPortfolio = await fetchSinglePortfolio(portfolioId);
    
    if (updatedPortfolio) {
      store.dispatch(updatePortfolioAssets(updatedPortfolio));
      
      store.dispatch(fetchPortfoliosThunk());
      
      store.dispatch(fetchPerformanceThunk({ 
        portfolioId: updatedPortfolio.id, 
        timeframe: '7d'
      }));
    }
  } catch (error) {
    console.error('Error in removeAssetFromPortfolio:', error);
    throw error;
  }
};

export const getCoinId = async (symbol: string): Promise<string> => {
  try {
    const response = await api.get(`/crypto/coin-id/${symbol}`);
    return response.data.coinId;
  } catch (error) {
    console.error('Error in getCoinId:', error);
    throw error;
  }
};

// Add this new function to fetch available coins
export const fetchAvailableCoins = async (): Promise<{ id: string; symbol: string; name: string }[]> => {
  try {
    const response = await api.get('/crypto/coingecko-symbols');
    return response.data.symbols;
  } catch (error) {
    console.error('Error in fetchAvailableCoins:', error);
    throw error;
  }
};

// Add this new function to the existing file
export const fetchCoinGeckoSymbols = async (): Promise<{ id: string; symbol: string; name: string }[]> => {
  try {
    const response = await api.get('/crypto/coingecko-symbols');
    return response.data.symbols;
  } catch (error) {
    console.error('Error fetching CoinGecko symbols:', error);
    throw error;
  }
};
