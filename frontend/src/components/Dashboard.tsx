import React, { useState, useEffect } from 'react';
import { Portfolio, PortfolioPerformance, PortfolioAsset } from '../types/portfolio.types';
import {
  fetchPortfolios,
  createPortfolio,
  fetchSinglePortfolio,
  fetchPortfolioPerformance,
  updatePortfolio,
  deletePortfolio,
  addAssetToPortfolio,
  updateAssetInPortfolio,
  removeAssetFromPortfolio
} from '../services/portfolioApi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [performanceData, setPerformanceData] = useState<PortfolioPerformance | null>(null);
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [error, setError] = useState<string | null>(null);
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState<string>('');
  const [newPortfolioDescription, setNewPortfolioDescription] = useState<string>('');
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [editedPortfolioName, setEditedPortfolioName] = useState('');
  const [editedPortfolioDescription, setEditedPortfolioDescription] = useState('');
  const [newAssetCoinId, setNewAssetCoinId] = useState('');
  const [newAssetAmount, setNewAssetAmount] = useState('');
  const [showPortfolioList, setShowPortfolioList] = useState(false);

  useEffect(() => {
    fetchAllPortfolios();
  }, []);

  const fetchAllPortfolios = async () => {
    try {
      console.log('Fetching all portfolios...');
      const data = await fetchPortfolios();
      console.log('Fetched portfolios:', data);
      setPortfolios(data);
      if (data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0]);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setError('Failed to fetch portfolios. Please try again later.');
    }
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPortfolio = await createPortfolio(newPortfolioName, newPortfolioDescription);
      setPortfolios([...portfolios, newPortfolio]);
      setSelectedPortfolio(newPortfolio);
      setNewPortfolioName('');
      setNewPortfolioDescription('');
      setIsCreatingPortfolio(false);
    } catch (error) {
      console.error('Error creating portfolio:', error);
      setError('Failed to create portfolio. Please try again.');
    }
  };

  const handleSelectPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setShowPortfolioList(false);
  };

  useEffect(() => {
    const fetchPerformance = async () => {
      if (selectedPortfolio && selectedPortfolio.id) {
        try {
          const data = await fetchPortfolioPerformance(selectedPortfolio.id, timeframe);
          setPerformanceData(data);
        } catch (error) {
          console.error('Error fetching performance data:', error);
          setError('Failed to fetch performance data. Please try again later.');
        }
      }
    };
    fetchPerformance();
  }, [selectedPortfolio, timeframe]);

  const handleUpdatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolio) return;
    try {
      const updatedPortfolio = await updatePortfolio(selectedPortfolio.id, editedPortfolioName, editedPortfolioDescription);
      setSelectedPortfolio(updatedPortfolio);
      setPortfolios(portfolios.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p));
      setIsEditingPortfolio(false);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      setError('Failed to update portfolio. Please try again.');
    }
  };

  const handleDeletePortfolio = async () => {
    if (!selectedPortfolio) return;
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await deletePortfolio(selectedPortfolio.id);
        setPortfolios(portfolios.filter(p => p.id !== selectedPortfolio.id));
        setSelectedPortfolio(null);
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        setError('Failed to delete portfolio. Please try again.');
      }
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolio) return;
    try {
      const updatedPortfolio = await addAssetToPortfolio(selectedPortfolio.id, newAssetCoinId, parseFloat(newAssetAmount));
      setSelectedPortfolio(updatedPortfolio);
      setNewAssetCoinId('');
      setNewAssetAmount('');
    } catch (error) {
      console.error('Error adding asset:', error);
      setError('Failed to add asset. Please try again.');
    }
  };

  const handleUpdateAsset = async (assetId: string, newAmount: number) => {
    if (!selectedPortfolio) return;
    try {
      const updatedPortfolio = await updateAssetInPortfolio(selectedPortfolio.id, assetId, newAmount);
      setSelectedPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Error updating asset:', error);
      setError('Failed to update asset. Please try again.');
    }
  };

  const handleRemoveAsset = async (assetId: string) => {
    if (!selectedPortfolio) return;
    if (window.confirm('Are you sure you want to remove this asset?')) {
      try {
        await removeAssetFromPortfolio(selectedPortfolio.id, assetId);
        const updatedPortfolio = await fetchSinglePortfolio(selectedPortfolio.id);
        setSelectedPortfolio(updatedPortfolio);
      } catch (error) {
        console.error('Error removing asset:', error);
        setError('Failed to remove asset. Please try again.');
      }
    }
  };

  const handleViewPortfolios = async () => {
    console.log('View My Portfolios button clicked');
    await fetchAllPortfolios();
    setShowPortfolioList(true);
    console.log('showPortfolioList set to true');
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Portfolio Dashboard</h1>
        
        <button 
          onClick={handleViewPortfolios}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View My Portfolios
        </button>

        {error && (
          <div className="mb-4 p-4 bg-red-900 text-red-100 rounded">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Portfolios</h2>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {portfolios.map((portfolio) => (
                <li key={portfolio.id}>
                  <button
                    onClick={() => handleSelectPortfolio(portfolio)}
                    className={`w-full text-left p-3 rounded transition-colors duration-200 ${
                      selectedPortfolio?.id === portfolio.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-semibold">{portfolio.name}</div>
                    <div className="text-sm text-gray-400">
                      {formatCurrency(portfolio.totalValue)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsCreatingPortfolio(true)}
              className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
            >
              + Add Portfolio
            </button>
          </div>

          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow">
            {isCreatingPortfolio ? (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Create New Portfolio</h2>
                <form onSubmit={handleCreatePortfolio} className="space-y-4">
                  <input
                    type="text"
                    value={newPortfolioName}
                    onChange={(e) => setNewPortfolioName(e.target.value)}
                    placeholder="Portfolio Name"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  />
                  <textarea
                    value={newPortfolioDescription}
                    onChange={(e) => setNewPortfolioDescription(e.target.value)}
                    placeholder="Portfolio Description"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    rows={3}
                  />
                  <div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2 transition-colors duration-200">
                      Create Portfolio
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingPortfolio(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedPortfolio ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">{selectedPortfolio.name}</h2>
                  <div className="space-x-2">
                    <button onClick={() => setIsEditingPortfolio(true)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200">Edit</button>
                    <button onClick={handleDeletePortfolio} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200">Delete</button>
                  </div>
                </div>
                <p className="mb-4 text-gray-400">{selectedPortfolio.description}</p>
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold mb-2">Total Value</h3>
                  <p className="text-3xl font-bold">{formatCurrency(selectedPortfolio.totalValue)}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Performance</h3>
                  <div className="flex space-x-2 mb-4">
                    {['1d', '7d', '30d', '90d', '1y'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1 rounded ${
                          timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        } transition-colors duration-200`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                  {performanceData && (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData.assetPerformances}>
                        <XAxis dataKey="coinId" stroke="#718096" />
                        <YAxis stroke="#718096" />
                        <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
                        <Line type="monotone" dataKey="endValue" stroke="#4299E1" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Assets</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPortfolio.assets.map((asset: PortfolioAsset) => (
                      <div key={asset.id} className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold">{asset.name}</h4>
                        <p className="text-gray-400">{asset.symbol}</p>
                        <p className="text-lg font-bold mt-2">{formatCurrency(asset.value)}</p>
                        <div className="flex items-center mt-2">
                          <input
                            type="number"
                            value={asset.amount}
                            onChange={(e) => handleUpdateAsset(asset.id, parseFloat(e.target.value))}
                            className="bg-gray-600 text-white p-1 rounded w-24 mr-2"
                          />
                          <button onClick={() => handleRemoveAsset(asset.id)} className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors duration-200">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddAsset} className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Add New Asset</h3>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newAssetCoinId}
                        onChange={(e) => setNewAssetCoinId(e.target.value)}
                        placeholder="Coin ID"
                        className="bg-gray-700 text-white p-2 rounded flex-grow"
                      />
                      <input
                        type="number"
                        value={newAssetAmount}
                        onChange={(e) => setNewAssetAmount(e.target.value)}
                        placeholder="Amount"
                        className="bg-gray-700 text-white p-2 rounded w-32"
                      />
                      <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors duration-200">Add Asset</button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Select a portfolio or create a new one to get started.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
