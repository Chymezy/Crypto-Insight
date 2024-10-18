import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchPortfolios, setSelectedPortfolio } from '../store/slices/portfolioSlice';
import { Portfolio, Asset } from '../types';
import { addAssetToPortfolio, removeAssetFromPortfolio, updateAssetInPortfolio, createPortfolio, updatePortfolio, deletePortfolio } from '../services/api';
import { toast } from 'react-toastify';

const PortfolioManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { portfolios, loading, error } = useSelector((state: RootState) => state.portfolio);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [newPortfolioData, setNewPortfolioData] = useState({ name: '', description: '' });
  const [newAssetData, setNewAssetData] = useState({ coinId: '', amount: 0 });
  const [editingAsset, setEditingAsset] = useState<{ id: string; amount: number } | null>(null);

  useEffect(() => {
    dispatch(fetchPortfolios());
  }, [dispatch]);

  const handleCreatePortfolio = async () => {
    try {
      await createPortfolio(newPortfolioData);
      dispatch(fetchPortfolios());
      setNewPortfolioData({ name: '', description: '' });
      toast.success('Portfolio created successfully');
    } catch (error) {
      toast.error('Failed to create portfolio');
    }
  };

  const handleUpdatePortfolio = async (portfolioId: string, updatedData: { name: string; description: string }) => {
    try {
      await updatePortfolio(portfolioId, updatedData);
      dispatch(fetchPortfolios());
      toast.success('Portfolio updated successfully');
    } catch (error) {
      toast.error('Failed to update portfolio');
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await deletePortfolio(portfolioId);
        dispatch(fetchPortfolios());
        setSelectedPortfolio(null);
        toast.success('Portfolio deleted successfully');
      } catch (error) {
        toast.error('Failed to delete portfolio');
      }
    }
  };

  const handleAddAsset = async (portfolioId: string) => {
    try {
      await addAssetToPortfolio(portfolioId, newAssetData.coinId, newAssetData.amount);
      dispatch(fetchPortfolios());
      setNewAssetData({ coinId: '', amount: 0 });
      toast.success('Asset added successfully');
    } catch (error) {
      toast.error('Failed to add asset');
    }
  };

  const handleUpdateAsset = async (portfolioId: string, assetId: string, newAmount: number) => {
    try {
      await updateAssetInPortfolio(portfolioId, assetId, newAmount);
      dispatch(fetchPortfolios());
      setEditingAsset(null);
      toast.success('Asset updated successfully');
    } catch (error) {
      toast.error('Failed to update asset');
    }
  };

  const handleRemoveAsset = async (portfolioId: string, assetId: string) => {
    if (window.confirm('Are you sure you want to remove this asset?')) {
      try {
        await removeAssetFromPortfolio(portfolioId, assetId);
        dispatch(fetchPortfolios());
        toast.success('Asset removed successfully');
      } catch (error) {
        toast.error('Failed to remove asset');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Create New Portfolio</h2>
        <input 
          type="text" 
          value={newPortfolioData.name} 
          onChange={(e) => setNewPortfolioData({ ...newPortfolioData, name: e.target.value })} 
          placeholder="Portfolio Name" 
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <input 
          type="text" 
          value={newPortfolioData.description} 
          onChange={(e) => setNewPortfolioData({ ...newPortfolioData, description: e.target.value })} 
          placeholder="Portfolio Description" 
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <button 
          onClick={handleCreatePortfolio}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Portfolio
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Manage Portfolios</h2>
        <select 
          value={selectedPortfolio?.id || ''}
          onChange={(e) => setSelectedPortfolio(portfolios.find((p: Portfolio) => p.id === e.target.value) || null)}
          className="w-full p-2 mb-4 bg-gray-700 rounded"
        >
          <option value="">Select a portfolio</option>
          {portfolios.map((portfolio: Portfolio) => (
            <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
          ))}
        </select>

        {selectedPortfolio && (
          <div>
            <h3 className="text-xl font-semibold mb-2">{selectedPortfolio.name}</h3>
            <p className="text-gray-400 mb-4">{selectedPortfolio.description}</p>
            <div className="flex space-x-2 mb-4">
              <button 
                onClick={() => {
                  const newName = prompt('Enter new name', selectedPortfolio.name);
                  const newDescription = prompt('Enter new description', selectedPortfolio.description);
                  if (newName && newDescription) {
                    handleUpdatePortfolio(selectedPortfolio.id, { name: newName, description: newDescription });
                  }
                }}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Update
              </button>
              <button 
                onClick={() => handleDeletePortfolio(selectedPortfolio.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>

            <h4 className="text-lg font-semibold mb-2">Assets</h4>
            {selectedPortfolio.assets.map((asset: Asset) => (
              <div key={asset.id} className="flex items-center justify-between mb-2">
                <span>{asset.name}: {asset.amount}</span>
                {editingAsset && editingAsset.id === asset.id ? (
                  <div>
                    <input 
                      type="number" 
                      value={editingAsset.amount} 
                      onChange={(e) => setEditingAsset({ ...editingAsset, amount: parseFloat(e.target.value) })}
                      className="w-20 p-1 mr-2 bg-gray-700 rounded"
                    />
                    <button 
                      onClick={() => handleUpdateAsset(selectedPortfolio.id, asset.id, editingAsset.amount)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 mr-2"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingAsset(null)}
                      className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <button 
                      onClick={() => setEditingAsset({ id: asset.id, amount: asset.amount })}
                      className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleRemoveAsset(selectedPortfolio.id, asset.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Add New Asset</h4>
              <input 
                type="text" 
                value={newAssetData.coinId} 
                onChange={(e) => setNewAssetData({ ...newAssetData, coinId: e.target.value })} 
                placeholder="Coin ID" 
                className="w-full p-2 mb-2 bg-gray-700 rounded"
              />
              <input 
                type="number" 
                value={newAssetData.amount} 
                onChange={(e) => setNewAssetData({ ...newAssetData, amount: parseFloat(e.target.value) })} 
                placeholder="Amount" 
                className="w-full p-2 mb-2 bg-gray-700 rounded"
              />
              <button 
                onClick={() => handleAddAsset(selectedPortfolio.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Asset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManagement;
