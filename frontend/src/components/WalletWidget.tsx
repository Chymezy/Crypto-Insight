import React, { useState, useEffect } from 'react';
import { FaWallet, FaEthereum, FaBitcoin, FaPlus, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { updateWalletAddress, getWalletBalance } from '../services/walletApi';
import { User } from '../types';

declare global {
  interface Window {
    ethereum?: any;
    bitcoin?: any;
  }
}

interface WalletBalance {
  currency: string;
  balance: {
    amount: string;
    usdValue: string;
  };
}

interface CustomToken {
  name: string;
  address: string;
}

const WalletWidget: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [walletAddresses, setWalletAddresses] = useState<{[key: string]: string}>({});
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [showAddToken, setShowAddToken] = useState<boolean>(false);
  const [customTokenName, setCustomTokenName] = useState<string>('');
  const [customTokenAddress, setCustomTokenAddress] = useState<string>('');
  const [customTokens, setCustomTokens] = useState<CustomToken[]>([]);

  useEffect(() => {
    if (user && user.walletAddresses) {
      setWalletAddresses(user.walletAddresses);
      fetchBalances();
    }
  }, [user]);

  const fetchBalances = async () => {
    try {
      const balancesData = await getWalletBalance();
      setBalances(balancesData);
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast.error('Failed to fetch wallet balances');
    }
  };

  const connectWallet = async (type: string) => {
    setIsConnecting(true);
    try {
      let address;
      switch (type) {
        case 'ethereum':
          if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            address = accounts[0];
          } else {
            throw new Error('Ethereum wallet not found');
          }
          break;
        case 'bitcoin':
          if (typeof window.bitcoin !== 'undefined') {
            // This is a placeholder. Bitcoin wallet connection would work differently
            address = await window.bitcoin.getAddress();
          } else {
            throw new Error('Bitcoin wallet not found');
          }
          break;
        default:
          throw new Error('Unsupported wallet type');
      }

      const updatedAddresses = { ...walletAddresses, [type]: address };
      setWalletAddresses(updatedAddresses);

      const updatedUser = await updateWalletAddress(updatedAddresses);
      if (updateUser) {
        updateUser(updatedUser);
      }

      await fetchBalances();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} wallet connected successfully!`);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error(`Failed to connect ${type} wallet. ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAddCustomToken = () => {
    if (customTokenName && customTokenAddress) {
      setCustomTokens([...customTokens, { name: customTokenName, address: customTokenAddress }]);
      setCustomTokenName('');
      setCustomTokenAddress('');
      setShowAddToken(false);
      toast.success('Custom token added successfully!');
    } else {
      toast.error('Please enter both token name and address.');
    }
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
        <FaWallet className="mr-2" /> Wallet
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(walletAddresses).map(([type, address]) => (
          <div key={type} className="mb-4">
            <p className="mb-2 flex items-center">
              {type === 'ethereum' ? <FaEthereum className="mr-2" /> : <FaBitcoin className="mr-2" />}
              {type.charAt(0).toUpperCase() + type.slice(1)} Address: 
              <span className="ml-2 text-sm">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {balances.map((balance) => (
          <p key={balance.currency} className="mb-2">
            {balance.currency} Balance: {balance.balance.amount} (${balance.balance.usdValue})
          </p>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => connectWallet('ethereum')}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex-grow"
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Ethereum'}
        </button>
        <button
          onClick={() => connectWallet('bitcoin')}
          className="bg-orange-600 text-white p-2 rounded hover:bg-orange-700 flex-grow"
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Bitcoin'}
        </button>
      </div>
      <button 
        onClick={() => setShowAddToken(!showAddToken)} 
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 w-full mb-4"
      >
        <FaPlus className="inline mr-2" /> {showAddToken ? 'Cancel' : 'Add Custom Token'}
      </button>
      {showAddToken && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Token Name"
            value={customTokenName}
            onChange={(e) => setCustomTokenName(e.target.value)}
            className="w-full p-2 mb-2 bg-gray-700 rounded"
          />
          <input
            type="text"
            placeholder="Token Address"
            value={customTokenAddress}
            onChange={(e) => setCustomTokenAddress(e.target.value)}
            className="w-full p-2 mb-2 bg-gray-700 rounded"
          />
          <button
            onClick={handleAddCustomToken}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full"
          >
            Add Token
          </button>
        </div>
      )}
      {customTokens.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">Custom Tokens:</h3>
          {customTokens.map((token, index) => (
            <div key={index} className="flex justify-between items-center mb-2">
              <span>{token.name}: {token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
              <button
                onClick={() => setCustomTokens(customTokens.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletWidget;
