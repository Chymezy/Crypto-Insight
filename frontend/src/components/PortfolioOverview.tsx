import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AssetList from './AssetList';
import { fetchPortfolios, fetchPerformance, setSelectedPortfolio } from '../store/slices/portfolioSlice';
import { RootState, AppDispatch } from '../store';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Portfolio, Asset } from '../types';

const PortfolioOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { portfolios, selectedPortfolio, performanceData, loading, error } = useSelector((state: RootState) => state.portfolio);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('7d');

  useEffect(() => {
    dispatch(fetchPortfolios());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPortfolio) {
      dispatch(fetchPerformance({ portfolioId: selectedPortfolio.id, timeframe }));
    }
  }, [dispatch, selectedPortfolio, timeframe]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const portfolio = selectedPortfolio || portfolios[0];

  if (!portfolio) {
    return <div>No portfolio available. Please create a portfolio.</div>;
  }

  const totalAssets = portfolio.assets ? portfolio.assets.length : 0;

  const calculateChange = (changeType: '1d' | '7d' | '24h') => {
    if (!portfolio.assets || portfolio.assets.length === 0) {
      return 0;
    }
    const totalChange = portfolio.assets.reduce((sum: number, asset: Asset) => {
      const change = asset[`priceChange${changeType}` as keyof Asset] as number || 0;
      return sum + (change * (asset.value || 0));
    }, 0);
    return portfolio.totalValue ? (totalChange / portfolio.totalValue) * 100 : 0;
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
          value={portfolio.id}
          onChange={(e) => {
            const selectedPortfolio = portfolios.find((p: Portfolio) => p.id === e.target.value);
            if (selectedPortfolio) {
              dispatch(setSelectedPortfolio(selectedPortfolio));
            }
          }}
        >
          {portfolios.map((p: Portfolio) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Total Value</h3>
          <p className="text-2xl font-bold">${portfolio.totalValue?.toFixed(2) || '0.00'}</p>
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
          <p className="text-red-500">Unable to load performance data. Please try again later.</p>
        </div>
      )}

      {portfolio.assets && <AssetList assets={portfolio.assets} />}
    </div>
  );
};

export default PortfolioOverview;
