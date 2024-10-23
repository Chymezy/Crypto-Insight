import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaWallet, FaArrowDown } from 'react-icons/fa';
import { getSupportedTokens, getSwapQuote, executeSwap } from '../services/swapApi';
import { getWalletBalance } from '../services/walletApi';
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
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalances, setWalletBalances] = useState<any>(null);

  useEffect(() => {
    fetchSupportedTokens();
    checkWalletConnection();
  }, []);

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

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        toast.success('Wallet connected successfully!');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet. Please try again.');
      }
    } else {
      toast.error('Please install MetaMask to connect your wallet.');
    }
  };

  const handleGetQuote = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
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

  const fetchWalletBalances = async () => {
    try {
      const balances = await getWalletBalance();
      setWalletBalances(balances);
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      toast.error('Failed to fetch wallet balances');
    }
  };

  const handleSwap = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const swapResult = await executeSwap(fromToken, toToken, amount);
      console.log('Swap executed:', swapResult);
      toast.success('Swap executed successfully!');
      // Fetch updated balances
      await fetchWalletBalances();
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
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center justify-center">
        <FaExchangeAlt className="mr-2" /> Swap Tokens
      </h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      
      {!walletConnected ? (
        <button
          onClick={connectWallet}
          className="w-full bg-blue-600 text-white p-3 rounded-lg mb-6 hover:bg-blue-700 transition duration-300 flex items-center justify-center"
        >
          <FaWallet className="mr-2" /> Connect Wallet
        </button>
      ) : (
        <p className="mb-6 text-center text-green-400">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
      )}

      <div className="mb-6">
        <label className="block mb-2 font-semibold">From</label>
        <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="w-2/3 p-3 bg-transparent"
          >
            <option value="">Select Token</option>
            {supportedTokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.name} ({token.symbol})
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-1/3 p-3 bg-transparent text-right"
            placeholder="Amount"
          />
        </div>
      </div>

      <div className="flex justify-center my-4">
        <FaArrowDown className="text-2xl text-blue-500" />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">To</label>
        <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="w-full p-3 bg-transparent"
          >
            <option value="">Select Token</option>
            {supportedTokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.name} ({token.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleGetQuote}
        disabled={!walletConnected || !fromToken || !toToken || !amount}
        className="w-full bg-blue-600 text-white p-3 rounded-lg mb-4 hover:bg-blue-700 disabled:bg-gray-600 transition duration-300"
      >
        {loading ? 'Loading...' : 'Get Quote'}
      </button>

      {quote && (
        <div className="mb-6 bg-gray-700 p-4 rounded-lg">
          <h3 className="font-bold mb-2 text-center">Swap Quote</h3>
          <p className="mb-1">From: {formatNumber(quote.fromAmount)} {quote.fromToken}</p>
          <p className="mb-1">To: {formatNumber(quote.toAmount)} {quote.toToken}</p>
          <p className="mb-1">Rate: 1 {quote.fromToken} = {formatNumber(quote.exchangeRate)} {quote.toToken}</p>
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={!walletConnected || !quote}
        className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition duration-300"
      >
        {loading ? 'Processing...' : 'Execute Swap'}
      </button>

      {walletBalances && (
        <div className="mt-6 bg-gray-700 p-4 rounded-lg">
          <h3 className="font-bold mb-2 text-center">Wallet Balances</h3>
          {Object.entries(walletBalances).map(([currency, balance]: [string, any]) => (
            <p key={currency} className="mb-1">
              {currency}: {balance.amount} (${balance.usdValue})
            </p>
          ))}
        </div>
      )}

      <button
        onClick={fetchWalletBalances}
        className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Refresh Balances
      </button>
    </div>
  );
};

export default SwapWidget;
