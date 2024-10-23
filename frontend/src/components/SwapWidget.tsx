import React, { useState, useEffect } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { getSupportedTokens, getSwapQuote, executeSwap } from '../services/swapApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

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

const SwapWidget: React.FC = () => {
  const { user } = useAuth();
  const [supportedTokens, setSupportedTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<string>('');
  const [toToken, setToToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupportedTokens();
  }, []);

  useEffect(() => {
    // Clear quote when inputs change
    setQuote(null);
  }, [fromToken, toToken, amount]);

  const fetchSupportedTokens = async () => {
    try {
      setLoading(true);
      const tokens = await getSupportedTokens();
      setSupportedTokens(tokens);
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      setError('Failed to fetch supported tokens. Please try again later.');
      toast.error('Failed to fetch supported tokens. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuote = async () => {
    if (!user) {
      setError('You must be logged in to get a quote');
      toast.error('You must be logged in to get a quote');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const quoteData = await getSwapQuote(fromToken, toToken, amount);
      setQuote(quoteData);
    } catch (error) {
      console.error('Error fetching swap quote:', error);
      setError('Failed to get swap quote. Please try again.');
      toast.error('Failed to get swap quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!user) {
      setError('You must be logged in to execute a swap');
      toast.error('You must be logged in to execute a swap');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const swapResult = await executeSwap(fromToken, toToken, amount);
      console.log('Swap executed:', swapResult);
      toast.success('Swap executed successfully!');
      // Reset form after successful swap
      setFromToken('');
      setToToken('');
      setAmount('');
      setQuote(null);
    } catch (error) {
      console.error('Error executing swap:', error);
      setError('Failed to execute swap. Please try again.');
      toast.error('Failed to execute swap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(num);
  };

  if (loading && supportedTokens.length === 0) {
    return <div className="bg-gray-800 p-6 rounded-lg shadow-lg">Loading supported tokens...</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FaExchangeAlt className="mr-2" /> Swap Tokens
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block mb-2">From Token</label>
        <select
          value={fromToken}
          onChange={(e) => setFromToken(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        >
          <option value="">Select Token</option>
          {supportedTokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token.name} ({token.symbol})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">To Token</label>
        <select
          value={toToken}
          onChange={(e) => setToToken(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        >
          <option value="">Select Token</option>
          {supportedTokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token.name} ({token.symbol})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          placeholder="Enter amount"
        />
      </div>
      <button
        onClick={handleGetQuote}
        disabled={loading || !fromToken || !toToken || !amount}
        className="w-full bg-blue-600 text-white p-2 rounded mb-4 hover:bg-blue-700 disabled:bg-gray-600"
      >
        {loading ? 'Loading...' : 'Get Quote'}
      </button>
      {quote && (
        <div className="mb-4 bg-gray-700 p-4 rounded">
          <h3 className="font-bold mb-2">Swap Quote</h3>
          <p>From: {formatNumber(quote.fromAmount)} {quote.fromToken}</p>
          <p>To: {formatNumber(quote.toAmount)} {quote.toToken}</p>
          <p>Exchange Rate: 1 {quote.fromToken} = {formatNumber(quote.exchangeRate)} {quote.toToken}</p>
        </div>
      )}
      <button
        onClick={handleSwap}
        disabled={loading || !quote}
        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-600"
      >
        {loading ? 'Processing...' : 'Execute Swap'}
      </button>
    </div>
  );
};

export default SwapWidget;
