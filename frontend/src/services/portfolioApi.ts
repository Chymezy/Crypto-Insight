import api from './api';  // Import the main api instance
import { Portfolio, PortfolioPerformance } from '../types/portfolio.types';

export const fetchPortfolios = async (): Promise<Portfolio[]> => {
  try {
    console.log('Sending request to fetch portfolios...');
    const response = await api.get('/portfolios');
    console.log('Raw portfolios API response:', response);
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      console.log('Parsed portfolios:', response.data.data);
      return response.data.data;
    }
    
    console.error('Unexpected API response structure:', response.data);
    return []; // Return an empty array instead of throwing an error
  } catch (error) {
    console.error('Error in fetchPortfolios:', error);
    return []; // Return an empty array in case of error
  }
};

export const createPortfolio = async (name: string, description: string): Promise<Portfolio> => {
  try {
    console.log('Sending request to create portfolio:', { name, description });
    const response = await api.post('/portfolios', { name, description });
    console.log('Raw create portfolio response:', response);
    if (response.data && response.data.success && response.data.data && response.data.data.portfolio) {
      console.log('Parsed new portfolio:', response.data.data.portfolio);
      return response.data.data.portfolio;
    }
    console.error('Unexpected API response structure:', response.data);
    throw new Error('Failed to create portfolio');
  } catch (error) {
    console.error('Error in createPortfolio:', error);
    throw error;
  }
};

export const fetchSinglePortfolio = async (portfolioId: string): Promise<Portfolio> => {
  try {
    console.log('Sending request to fetch single portfolio:', portfolioId);
    const response = await api.get(`/portfolios/${portfolioId}`);
    console.log('Raw single portfolio response:', response);
    if (response.data && response.data.success && response.data.portfolio) {
      console.log('Parsed single portfolio:', response.data.portfolio);
      return response.data.portfolio;
    }
    console.error('Unexpected API response structure:', response.data);
    throw new Error('Failed to fetch portfolio');
  } catch (error) {
    console.error('Error in fetchSinglePortfolio:', error);
    throw error;
  }
};

export const fetchPortfolioPerformance = async (portfolioId: string, timeframe: string): Promise<PortfolioPerformance> => {
  try {
    console.log('Sending request to fetch portfolio performance:', { portfolioId, timeframe });
    const response = await api.get(`/portfolios/${portfolioId}/performance?timeframe=${timeframe}`);
    console.log('Raw performance API response:', response);
    if (response.data && response.data.success && response.data.data && response.data.data.performance) {
      console.log('Parsed portfolio performance:', response.data.data.performance);
      return response.data.data.performance;
    }
    console.error('Unexpected API response structure:', response.data);
    throw new Error('Invalid performance data structure');
  } catch (error) {
    console.error('Error in fetchPortfolioPerformance:', error);
    throw error;
  }
};

export const updatePortfolio = async (portfolioId: string, name: string, description: string): Promise<Portfolio> => {
  try {
    const response = await api.put(`/portfolios/${portfolioId}`, { name, description });
    if (response.data && response.data.success && response.data.portfolio) {
      return response.data.portfolio;
    }
    throw new Error('Failed to update portfolio');
  } catch (error) {
    console.error('Error in updatePortfolio:', error);
    throw error;
  }
};

export const deletePortfolio = async (portfolioId: string): Promise<void> => {
  try {
    const response = await api.delete(`/portfolios/${portfolioId}`);
    if (!response.data || !response.data.success) {
      throw new Error('Failed to delete portfolio');
    }
  } catch (error) {
    console.error('Error in deletePortfolio:', error);
    throw error;
  }
};

export const addAssetToPortfolio = async (portfolioId: string, coinId: string, amount: number): Promise<Portfolio> => {
  try {
    const response = await api.post(`/portfolios/${portfolioId}/assets`, { coinId, amount });
    if (response.data && response.data.success && response.data.portfolio) {
      return response.data.portfolio;
    }
    throw new Error('Failed to add asset to portfolio');
  } catch (error) {
    console.error('Error in addAssetToPortfolio:', error);
    throw error;
  }
};

export const updateAssetInPortfolio = async (portfolioId: string, assetId: string, amount: number): Promise<Portfolio> => {
  try {
    const response = await api.put(`/portfolios/${portfolioId}/assets/${assetId}`, { amount });
    if (response.data && response.data.success && response.data.portfolio) {
      return response.data.portfolio;
    }
    throw new Error('Failed to update asset in portfolio');
  } catch (error) {
    console.error('Error in updateAssetInPortfolio:', error);
    throw error;
  }
};

export const removeAssetFromPortfolio = async (portfolioId: string, assetId: string): Promise<void> => {
  try {
    const response = await api.delete(`/portfolios/${portfolioId}/assets/${assetId}`);
    if (!response.data || !response.data.success) {
      throw new Error('Failed to remove asset from portfolio');
    }
  } catch (error) {
    console.error('Error in removeAssetFromPortfolio:', error);
    throw error;
  }
};
