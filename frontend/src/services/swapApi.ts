import api from './api';

interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  timestamp: string;
}

export const getSupportedTokens = async (): Promise<Token[]> => {
  try {
    const response = await api.get('/swap/supported-tokens');
    console.log('Supported tokens response:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error('Unexpected response format:', response.data);
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Error fetching supported tokens:', error);
    throw error;
  }
};

export const getSwapQuote = async (fromToken: string, toToken: string, amount: string): Promise<SwapQuote> => {
  const response = await api.get('/swap/quote', { params: { fromTokenId: fromToken, toTokenId: toToken, amount } });
  console.log('Swap quote response:', response.data);
  return response.data.data; // If the data is wrapped in a 'data' property
  // OR
  // return response.data; // If the data is not wrapped
};

export const executeSwap = async (fromToken: string, toToken: string, amount: string): Promise<any> => {
  const response = await api.post('/swap/execute', { fromTokenId: fromToken, toTokenId: toToken, amount });
  console.log('Execute swap response:', response.data);
  return response.data;
};
