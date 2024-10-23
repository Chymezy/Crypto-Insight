import React, { useState, useEffect } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { getSupportedTokens, getSwapQuote, executeSwap } from '../services/swapApi';
import { useAuth } from '../contexts/AuthContext';

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

  const fetchSupportedTokens = async () => {
    try {
      setLoading(true);
      const tokens = await getSupportedTokens();
      setSupportedTokens(tokens);
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      setError('Failed to fetch supported tokens. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuote = async () => {
    if (!user) {
      setError('You must be logged in to get a quote');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const quoteData = await getSwapQuote(fromToken, toToken, amount);
      console.log('Received quote data:', quoteData);
      setQuote(quoteData); // Remove .data here
    } catch (error) {
      console.error('Error fetching swap quote:', error);
      setError('Failed to get swap quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!user) {
      setError('You must be logged in to execute a swap');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const swapResult = await executeSwap(fromToken, toToken, amount);
      console.log('Swap executed:', swapResult);
      // Handle successful swap (e.g., show success message, update balances, etc.)
    } catch (error) {
      console.error('Error executing swap:', error);
      setError('Failed to execute swap. Please try again.');
    } finally {
      setLoading(false);
    }
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
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
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
            Get Quote
          </button>
          {quote && (
            <div className="mb-4 bg-gray-700 p-4 rounded">
              <h3 className="font-bold mb-2">Swap Quote</h3>
              <p>From: {quote.fromAmount} {quote.fromToken}</p>
              <p>To: {quote.toAmount?.toFixed(6)} {quote.toToken}</p>
              <p>Exchange Rate: 1 {quote.fromToken} = {quote.exchangeRate?.toFixed(6)} {quote.toToken}</p>
            </div>
          )}
          <button
            onClick={handleSwap}
            disabled={loading || !quote}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-600"
          >
            Execute Swap
          </button>
        </>
      )}
    </div>
  );
};

export default SwapWidget;
