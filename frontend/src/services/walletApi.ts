import api from './api';
import { User, CustomToken } from '../types';

interface WalletBalance {
  currency: string;
  balance: {
    amount: string;
    usdValue: string;
  };
}

export const updateWalletAddress = async (addresses: {[key: string]: string}): Promise<User> => {
  try {
    const response = await api.post<{ success: boolean; message: string; data: User }>('/wallet/update-address', { walletAddresses: addresses });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error updating wallet addresses:', error);
    throw error;
  }
};

export const getWalletBalance = async (): Promise<WalletBalance[]> => {
  try {
    const response = await api.get<{ success: boolean; message: string; data: { balances: WalletBalance[] } }>('/wallet/balance');
    if (response.data.success) {
      return response.data.data.balances;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    throw error;
  }
};

export const validateTokenAddress = async (address: string): Promise<boolean> => {
  try {
    const response = await api.post<{ success: boolean; data: { isValid: boolean } }>('/wallet/validate-address', { address });
    return response.data.data.isValid;
  } catch (error) {
    console.error('Error validating token address:', error);
    return false;
  }
};

export const addCustomToken = async (token: CustomToken): Promise<CustomToken> => {
  try {
    const response = await api.post<{ success: boolean; data: CustomToken }>('/wallet/custom-token', token);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to add custom token');
    }
  } catch (error) {
    console.error('Error adding custom token:', error);
    throw error;
  }
};

// Add more wallet-related API calls here as needed
