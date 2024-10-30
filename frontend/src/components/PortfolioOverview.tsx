import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchPortfoliosThunk,
  fetchPerformanceThunk,
  setSelectedPortfolio,
  clearError
} from '../store/slices/portfolioSlice';
import { LineChart, Line, PieChart, Pie, ResponsiveContainer, Tooltip, Cell, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaChartPie, FaList, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { PortfolioPerformance } from '../types/portfolio.types';

const PortfolioOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { portfolios, selectedPortfolio, performanceData, loading, error } = useSelector((state: RootState) => state.portfolio);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchPortfoliosThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPortfolio) {
      dispatch(fetchPerformanceThunk({ portfolioId: selectedPortfolio.id, timeframe: selectedTimeframe }));
    }
  }, [dispatch, selectedPortfolio, selectedTimeframe]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const totalValue = Array.isArray(portfolios) ? portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0) : 0;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const timeframes = ['24h', '7d', '30d', '90d', '1y'];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Portfolio Overview</h2>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
          {['overview', 'performance', 'allocation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <QuickActions />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab totalValue={totalValue} performanceData={performanceData} />
          )}
          {activeTab === 'performance' && (
            <PerformanceTab 
              performanceData={performanceData} 
              selectedTimeframe={selectedTimeframe}
              setSelectedTimeframe={setSelectedTimeframe}
              timeframes={timeframes}
            />
          )}
          {activeTab === 'allocation' && (
            <AllocationTab portfolios={portfolios} colors={COLORS} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-white">Portfolios</h3>
        <div className="space-y-2">
          {Array.isArray(portfolios) && portfolios.map((portfolio) => (
            <motion.div 
              key={portfolio.id}
              className="bg-gray-700 p-2 rounded flex justify-between items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-white">{portfolio.name}</span>
              <span className="text-green-400 font-semibold">${portfolio.totalValue.toFixed(2)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ totalValue: number, performanceData: PortfolioPerformance | null }> = ({ totalValue, performanceData }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
    <motion.div 
      className="bg-gray-700 p-4 rounded-lg"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h3 className="text-lg font-semibold mb-2 text-white">Total Value</h3>
      <p className="text-3xl font-bold text-green-400">${totalValue.toFixed(2)}</p>
    </motion.div>
    
    <motion.div 
      className="bg-gray-700 p-4 rounded-lg"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h3 className="text-lg font-semibold mb-2 text-white">Performance</h3>
      <div className="h-40 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData ? [performanceData] : []}>
            <XAxis dataKey="timeframe" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="endValue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  </div>
);

const PerformanceTab: React.FC<{ 
  performanceData: PortfolioPerformance | null, 
  selectedTimeframe: string, 
  setSelectedTimeframe: (timeframe: string) => void,
  timeframes: string[]
}> = ({ performanceData, selectedTimeframe, setSelectedTimeframe, timeframes }) => (
  <div>
    <div className="flex flex-wrap justify-end mb-4">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => setSelectedTimeframe(timeframe)}
          className={`px-2 py-1 m-1 rounded ${selectedTimeframe === timeframe ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          {timeframe}
        </button>
      ))}
    </div>
    <div className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performanceData ? [performanceData] : []}>
          <XAxis dataKey="timeframe" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="endValue" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const AllocationTab: React.FC<{ portfolios: any[], colors: string[] }> = ({ portfolios, colors }) => (
  <div>
    <div className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={portfolios}
            dataKey="totalValue"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            label
          >
            {portfolios.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
      {portfolios.map((portfolio, index) => (
        <div key={portfolio.id} className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></div>
          <span className="text-white">{portfolio.name}: {((portfolio.totalValue / portfolios.reduce((sum, p) => sum + p.totalValue, 0)) * 100).toFixed(2)}%</span>
        </div>
      ))}
    </div>
  </div>
);

const QuickActions: React.FC = () => (
  <div className="flex flex-wrap gap-2">
    <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Add Asset</button>
    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Rebalance</button>
  </div>
);

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse bg-gray-800 p-4 rounded-lg shadow-lg">
    <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div className="h-40 bg-gray-700 rounded"></div>
      <div className="h-40 bg-gray-700 rounded"></div>
    </div>
    <div className="h-60 bg-gray-700 rounded mb-4"></div>
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-gray-700 rounded"></div>
      ))}
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-500 text-white p-4 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Error</h3>
    <p>{message}</p>
  </div>
);

export default PortfolioOverview;
