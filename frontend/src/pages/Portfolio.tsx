import React, { useState } from 'react';
import PortfolioOverview from '../components/PortfolioOverview';
import PortfolioManagement from '../components/PortfolioManagement';
import { 
  fetchPortfoliosThunk,
  setSelectedPortfolio 
} from '../store/slices/portfolioSlice';

const Portfolio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'management'>('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>
      
      <div className="mb-6">
        <div className="sm:hidden">
          <select
            className="block w-full bg-gray-800 border border-gray-700 text-white py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as 'overview' | 'management')}
          >
            <option value="overview">Overview</option>
            <option value="management">Management</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'management'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Management
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        {activeTab === 'overview' ? <PortfolioOverview /> : <PortfolioManagement />}
      </div>
    </div>
  );
};

export default Portfolio;
