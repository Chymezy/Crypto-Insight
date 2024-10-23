import React, { useState, useEffect } from 'react';
import { FaWallet, FaEthereum, FaBitcoin, FaPlus, FaTimes, FaQrcode } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { updateWalletAddress, getWalletBalance, validateTokenAddress } from '../services/walletApi';
import { User, CustomToken } from '../types';
import QrScanner from 'react-qr-scanner';

// Add this type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

interface WalletBalance {
  currency: string;
  balance: {
    amount: string;
    usdValue: string;
  };
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
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);

  useEffect(() => {
    if (user && user.walletAddresses && Object.keys(user.walletAddresses).length > 0) {
      setWalletAddresses(user.walletAddresses);
      fetchBalances();
    } else if (user && (!user.walletAddresses || Object.keys(user.walletAddresses).length === 0)) {
      // Only show the toast once when there are no wallet addresses
      toast.info('No wallet addresses found. Please connect a wallet.', { toastId: 'no-wallet-addresses' });
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

  const connectEthereumWallet = async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        await updateWalletAddressAndFetchBalance('ethereum', address);
      } else {
        throw new Error('Ethereum wallet not found. Please install MetaMask.');
      }
    } catch (error) {
      console.error('Error connecting Ethereum wallet:', error);
      toast.error(`Failed to connect Ethereum wallet. ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectBitcoinWallet = () => {
    setShowQRScanner(true);
  };

  const updateWalletAddressAndFetchBalance = async (type: string, address: string) => {
    const updatedAddresses = { ...walletAddresses, [type]: address };
    setWalletAddresses(updatedAddresses);

    const updatedUser = await updateWalletAddress(updatedAddresses);
    if (updateUser) {
      updateUser(updatedUser);
    }

    await fetchBalances();
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} wallet connected successfully!`);
  };

  const handleQRScan = (data: { text: string } | null) => {
    if (data) {
      setShowQRScanner(false);
      updateWalletAddressAndFetchBalance('bitcoin', data.text);
    }
  };

  const handleQRError = (error: any) => {
    console.error(error);
    toast.error('Failed to scan QR code. Please try again.');
    setShowQRScanner(false);
  };

  const handleAddCustomToken = async () => {
    if (customTokenName && customTokenAddress) {
      try {
        const isValid = await validateTokenAddress(customTokenAddress);
        if (!isValid) {
          toast.error('Invalid token address');
          return;
        }

        setCustomTokens([...customTokens, { name: customTokenName, address: customTokenAddress }]);
        setCustomTokenName('');
        setCustomTokenAddress('');
        setShowAddToken(false);
        toast.success('Custom token added successfully!');
        fetchBalances();
      } catch (error) {
        console.error('Error adding custom token:', error);
        toast.error('Failed to add custom token');
      }
    } else {
      toast.error('Please enter both token name and address.');
    }
  };

  const renderBalance = (balance: WalletBalance) => {
    if (typeof balance.balance === 'object' && balance.balance.amount && balance.balance.usdValue) {
      return `${balance.balance.amount} (${balance.balance.usdValue})`;
    } else if (typeof balance.balance === 'string') {
      return balance.balance;
    } else {
      return 'N/A';
    }
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
        <FaWallet className="mr-2" /> Wallet
      </h2>
      {Object.keys(walletAddresses).length === 0 ? (
        <p className="text-center mb-4">No wallets connected. Please connect a wallet to view balances.</p>
      ) : (
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
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {balances.length > 0 ? (
          balances.map((balance) => (
            <p key={balance.currency} className="mb-2">
              {balance.currency} Balance: {renderBalance(balance)}
            </p>
          ))
        ) : (
          <p className="text-center col-span-2">No balances available.</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={connectEthereumWallet}
          className={`text-white p-2 rounded flex-grow ${
            walletAddresses['ethereum'] ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : walletAddresses['ethereum'] ? 'Ethereum Connected' : 'Connect Ethereum'}
        </button>
        <button
          onClick={connectBitcoinWallet}
          className="bg-orange-600 text-white p-2 rounded hover:bg-orange-700 flex-grow"
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Bitcoin'}
        </button>
      </div>
      {showQRScanner && (
        <div className="mb-4">
          <QrScanner
            delay={300}
            onError={handleQRError}
            onScan={handleQRScan}
            style={{ width: '100%' }}
          />
          <button
            onClick={() => setShowQRScanner(false)}
            className="mt-2 bg-red-600 text-white p-2 rounded hover:bg-red-700"
          >
            Cancel QR Scan
          </button>
        </div>
      )}
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
