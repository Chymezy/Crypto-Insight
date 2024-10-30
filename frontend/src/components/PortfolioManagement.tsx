import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchPortfoliosThunk, createPortfolio, updatePortfolio, deletePortfolio } from '../store/slices/portfolioSlice';
import { Portfolio, Asset } from '../types/portfolio.types';
import { addAssetToPortfolio, removeAssetFromPortfolio, updateAssetInPortfolio, getCoinId, fetchCoinGeckoSymbols } from '../services/portfolioApi';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

// Predefined list of common coin symbols
const commonCoinSymbols = [
  'BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'XRP', 'DOGE', 'DOT', 'UNI', 'BCH',
  'LTC', 'LINK', 'MATIC', 'XLM', 'ETC', 'THETA', 'DAI', 'ICP', 'VET', 'FIL'
];

const PortfolioManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const portfolioState = useSelector((state: RootState) => state.portfolio);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [assetAmount, setAssetAmount] = useState('');
  const [availableCoins, setAvailableCoins] = useState<{ id: string; symbol: string; name: string }[]>([]);
  const [isLoadingCoins, setIsLoadingCoins] = useState(false);

  useEffect(() => {
    dispatch(fetchPortfoliosThunk());
    fetchCoins();
  }, [dispatch]);

  const fetchCoins = async () => {
    setIsLoadingCoins(true);
    try {
      const coins = await fetchCoinGeckoSymbols();
      setAvailableCoins(coins);
    } catch (error) {
      console.error('Error fetching available coins:', error);
      toast.error('Failed to fetch available coins');
    } finally {
      setIsLoadingCoins(false);
    }
  };

  const handleCreatePortfolio = async () => {
    try {
      await dispatch(createPortfolio({ name: portfolioName, description: portfolioDescription })).unwrap();
      setIsAddingPortfolio(false);
      setPortfolioName('');
      setPortfolioDescription('');
      toast.success('Portfolio created successfully');
    } catch (error) {
      toast.error('Failed to create portfolio');
    }
  };

  const handleUpdatePortfolio = async () => {
    if (!selectedPortfolio) return;
    try {
      await dispatch(updatePortfolio({ 
        portfolioId: selectedPortfolio.id, 
        name: portfolioName, 
        description: portfolioDescription 
      })).unwrap();
      setIsEditingPortfolio(false);
      toast.success('Portfolio updated successfully');
    } catch (error) {
      toast.error('Failed to update portfolio');
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await dispatch(deletePortfolio(portfolioId)).unwrap();
        setSelectedPortfolio(null);
        toast.success('Portfolio deleted successfully');
      } catch (error) {
        toast.error('Failed to delete portfolio');
      }
    }
  };

  const handleAddAsset = async () => {
    if (!selectedPortfolio || !selectedCoin) return;
    try {
      const [coinId, amount] = selectedCoin.split('|');
      const updatedPortfolio = await addAssetToPortfolio(selectedPortfolio.id, coinId, parseFloat(assetAmount));
      setSelectedPortfolio(updatedPortfolio);
      setIsAddingAsset(false);
      setSelectedCoin('');
      setAssetAmount('');
      toast.success('Asset added successfully');
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('Failed to add asset. Please try again.');
    }
  };

  const handleUpdateAsset = async (assetId: string, newAmount: number) => {
    if (!selectedPortfolio) return;
    try {
      const updatedPortfolio = await updateAssetInPortfolio(selectedPortfolio.id, assetId, newAmount);
      setSelectedPortfolio(updatedPortfolio);
      toast.success('Asset updated successfully');
    } catch (error) {
      toast.error('Failed to update asset');
    }
  };

  const handleRemoveAsset = async (assetId: string) => {
    if (!selectedPortfolio) return;
    if (window.confirm('Are you sure you want to remove this asset?')) {
      try {
        await removeAssetFromPortfolio(selectedPortfolio.id, assetId);
        const updatedPortfolio = { ...selectedPortfolio, assets: selectedPortfolio.assets.filter(asset => asset.id !== assetId) };
        setSelectedPortfolio(updatedPortfolio);
        toast.success('Asset removed successfully');
      } catch (error) {
        toast.error('Failed to remove asset');
      }
    }
  };

  if (portfolioState.loading) return <div>Loading...</div>;
  if (portfolioState.error) return <div>Error: {portfolioState.error}</div>;

  const portfolios = Array.isArray(portfolioState.portfolios) ? portfolioState.portfolios : [];

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Manage Portfolios</h2>
        {isAddingPortfolio ? (
          <div className="mb-4">
            <input 
              type="text" 
              value={portfolioName} 
              onChange={(e) => setPortfolioName(e.target.value)} 
              placeholder="Portfolio Name" 
              className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <input 
              type="text" 
              value={portfolioDescription} 
              onChange={(e) => setPortfolioDescription(e.target.value)} 
              placeholder="Portfolio Description" 
              className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <button 
              onClick={handleCreatePortfolio}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
            >
              Create Portfolio
            </button>
            <button 
              onClick={() => setIsAddingPortfolio(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingPortfolio(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            <FaPlus className="inline mr-2" /> Add New Portfolio
          </button>
        )}
        
        <select 
          value={selectedPortfolio?.id || ''}
          onChange={(e) => setSelectedPortfolio(portfolios.find(p => p.id === e.target.value) || null)}
          className="w-full p-2 mb-4 bg-gray-700 rounded"
        >
          <option value="">Select a portfolio</option>
          {portfolios.map((portfolio) => (
            <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
          ))}
        </select>

        {selectedPortfolio && (
          <div>
            <h3 className="text-xl font-semibold mb-2">{selectedPortfolio.name}</h3>
            <p className="text-gray-400 mb-4">{selectedPortfolio.description}</p>
            {isEditingPortfolio ? (
              <div className="mb-4">
                <input 
                  type="text" 
                  value={portfolioName} 
                  onChange={(e) => setPortfolioName(e.target.value)} 
                  placeholder="New Portfolio Name" 
                  className="w-full p-2 mb-2 bg-gray-700 rounded"
                />
                <input 
                  type="text" 
                  value={portfolioDescription} 
                  onChange={(e) => setPortfolioDescription(e.target.value)} 
                  placeholder="New Portfolio Description" 
                  className="w-full p-2 mb-2 bg-gray-700 rounded"
                />
                <button 
                  onClick={handleUpdatePortfolio}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 mr-2"
                >
                  Update Portfolio
                </button>
                <button 
                  onClick={() => setIsEditingPortfolio(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex space-x-2 mb-4">
                <button 
                  onClick={() => {
                    setIsEditingPortfolio(true);
                    setPortfolioName(selectedPortfolio.name);
                    setPortfolioDescription(selectedPortfolio.description);
                  }}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                >
                  <FaEdit className="inline mr-2" /> Edit
                </button>
                <button 
                  onClick={() => handleDeletePortfolio(selectedPortfolio.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  <FaTrash className="inline mr-2" /> Delete
                </button>
              </div>
            )}

            <h4 className="text-lg font-semibold mb-2">Assets</h4>
            {selectedPortfolio.assets.map((asset: Asset) => (
              <div key={asset.id} className="flex items-center justify-between mb-2 bg-gray-700 p-2 rounded">
                <span>{asset.name}: {asset.amount}</span>
                <div>
                  <button 
                    onClick={() => handleUpdateAsset(asset.id, asset.amount + 1)}
                    className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 mr-2"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => handleUpdateAsset(asset.id, Math.max(0, asset.amount - 1))}
                    className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 mr-2"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => handleRemoveAsset(asset.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {isAddingAsset && (
              <div className="mt-4">
                <select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="w-full p-2 mb-2 bg-gray-700 rounded"
                  disabled={isLoadingCoins}
                >
                  <option value="">Select a coin</option>
                  {availableCoins.map((coin) => (
                    <option key={coin.id} value={`${coin.id}|${coin.symbol}`}>
                      {coin.name} ({coin.symbol})
                    </option>
                  ))}
                </select>
                <input 
                  type="number" 
                  value={assetAmount} 
                  onChange={(e) => setAssetAmount(e.target.value)} 
                  placeholder="Amount" 
                  className="w-full p-2 mb-2 bg-gray-700 rounded"
                />
                <button 
                  onClick={handleAddAsset}
                  disabled={!selectedCoin || !assetAmount || isLoadingCoins}
                  className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2 ${(!selectedCoin || !assetAmount || isLoadingCoins) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Add Asset
                </button>
                <button 
                  onClick={() => setIsAddingAsset(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {!isAddingAsset && (
              <button 
                onClick={() => setIsAddingAsset(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <FaPlus className="inline mr-2" /> Add New Asset
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManagement;
