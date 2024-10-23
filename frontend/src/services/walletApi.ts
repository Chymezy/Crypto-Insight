import api from './api';

interface User {
  _id: string;
  name: string;
  email: string;
  walletAddresses?: {[key: string]: string};
}

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

export const testWalletEndpoint = async (): Promise<{ message: string }> => {
  try {
    const response = await api.get<{ success: boolean; message: string; data: { message: string } }>('/wallet/test');
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error testing wallet endpoint:', error);
    throw error;
  }
};

// Add more wallet-related API calls here as needed
