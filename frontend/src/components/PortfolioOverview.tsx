import React, { useState, useEffect } from 'react';
import AssetList from './AssetList';
import { fetchPortfolioData } from '../services/api';
import { Portfolio, PortfolioData } from '../types';

const PortfolioOverview: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchPortfolioData();
        console.log('Fetched portfolio data:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          setPortfolios(data);
          setSelectedPortfolio(data[0]);
        } else if (typeof data === 'object' && data !== null && 'data' in data) {
          const portfoliosData = data.data as Portfolio[];
          setPortfolios(portfoliosData);
          setSelectedPortfolio(portfoliosData[0]);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        setError('Failed to fetch portfolio data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!selectedPortfolio) {
    return <div className="text-center">No portfolio data available</div>;
  }

  const totalAssets = portfolios.reduce((total, portfolio) => total + portfolio.assets.length, 0);

  // Calculate the total change percentage
  const totalChange = selectedPortfolio.assets.reduce((sum, asset) => sum + (asset.priceChange24h || 0), 0);
  const averageChange = selectedPortfolio.assets.length > 0 ? totalChange / selectedPortfolio.assets.length : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Portfolio Overview</h2>
      {portfolios.length > 1 && (
        <select
          className="mb-4 p-2 rounded bg-gray-700"
          value={selectedPortfolio.id}
          onChange={(e) => setSelectedPortfolio(portfolios.find(p => p.id === e.target.value) || null)}
        >
          {portfolios.map(portfolio => (
            <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
          ))}
        </select>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Total Value</h3>
          <p className="text-2xl font-bold">${selectedPortfolio.totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">24h Change</h3>
          <p className={`text-2xl font-bold ${averageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Number of Assets</h3>
          <p className="text-2xl font-bold">{totalAssets}</p>
        </div>
      </div>
      <AssetList assets={selectedPortfolio.assets} />
    </div>
  );
};

export default PortfolioOverview;
