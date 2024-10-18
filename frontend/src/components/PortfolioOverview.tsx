import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AssetList from './AssetList';
import { fetchPortfolioData, fetchPerformanceData } from '../services/api';
import { Portfolio, PortfolioData, PerformanceData } from '../types';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const PortfolioOverview: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('7d');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const portfolioData = await fetchPortfolioData();
      console.log('Fetched portfolio data:', portfolioData);
      
      if (Array.isArray(portfolioData) && portfolioData.length > 0) {
        setPortfolios(portfolioData);
        setSelectedPortfolio(portfolioData[0]);
      } else if (typeof portfolioData === 'object' && portfolioData !== null && 'data' in portfolioData) {
        const portfoliosData = portfolioData.data as Portfolio[];
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
  }, []);

  const fetchPerformance = useCallback(async (portfolioId: string) => {
    try {
      console.log(`Fetching performance for portfolio ${portfolioId}`);
      const performance = await fetchPerformanceData(portfolioId, timeframe);
      console.log('Fetched performance data:', performance);
      setPerformanceData(performance);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setPerformanceData([]);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedPortfolio) {
      console.log('Selected portfolio changed:', selectedPortfolio);
      fetchPerformance(selectedPortfolio.id);
    }
  }, [selectedPortfolio, fetchPerformance]);

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

  const calculateChange = (changeType: '1d' | '7d' | '24h') => {
    const totalChange = selectedPortfolio.assets.reduce((sum, asset) => {
      const change = asset[`priceChange${changeType}`] || 0;
      return sum + (change * asset.value);
    }, 0);
    return (totalChange / selectedPortfolio.totalValue) * 100;
  };

  const change1d = calculateChange('1d');
  const change7d = calculateChange('7d');
  const change24h = calculateChange('24h');

  const PriceChangeIndicator: React.FC<{ change: number; label: string }> = ({ change, label }) => (
    <div className="flex flex-col items-center">
      <span className="text-sm text-gray-400 mb-1">{label}</span>
      <div className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {change >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
        <span className="text-lg font-bold">{Math.abs(change).toFixed(2)}%</span>
      </div>
    </div>
  );

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Total Value</h3>
          <p className="text-2xl font-bold">${selectedPortfolio.totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Number of Assets</h3>
          <p className="text-2xl font-bold">{totalAssets}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg col-span-2">
          <h3 className="text-lg font-medium mb-2">Price Movement</h3>
          <div className="flex justify-between">
            <PriceChangeIndicator change={change1d} label="1D" />
            <PriceChangeIndicator change={change7d} label="7D" />
            <PriceChangeIndicator change={change24h} label="24H" />
          </div>
        </div>
      </div>

      {performanceData.length > 0 ? (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Portfolio Performance</h2>
          <div className="mb-6 flex justify-between items-center">
            <div>
              {['24h', '7d', '30d', '1y'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf as '24h' | '7d' | '30d' | '1y')}
                  className={`mr-4 px-6 py-2 rounded-full text-lg font-semibold ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                stroke="#9CA3AF"
                tick={{fontSize: 14}}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{fontSize: 14}}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']} 
                labelFormatter={(label) => new Date(label).toLocaleString()} 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', fontSize: '14px' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Portfolio Performance</h2>
          <p>Performance data is not available at the moment. Debug info: {JSON.stringify({ selectedPortfolio, timeframe })}</p>
        </div>
      )}

      <AssetList assets={selectedPortfolio.assets} />
    </div>
  );
};

export default PortfolioOverview;
