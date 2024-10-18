import React, { useState } from 'react';
import PortfolioOverview from './PortfolioOverview';

// Placeholder components
const MarketOverview = () => <div>Market Overview</div>;
const NewsSection = () => <div>News Section</div>;
const TopTraders = () => <div>Top Traders</div>;
const PriceAlerts = () => <div>Price Alerts</div>;
const AIInsights = () => <div>AI Insights</div>;
const Transactions = () => <div>Transactions</div>;

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('portfolio');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'portfolio':
        return <PortfolioOverview />;
      case 'market':
        return <MarketOverview />;
      case 'news':
        return <NewsSection />;
      case 'social':
        return <TopTraders />;
      case 'alerts':
        return <PriceAlerts />;
      case 'ai':
        return <AIInsights />;
      case 'transactions':
        return <Transactions />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-gray-800 p-4">
        <ul>
          {['Portfolio', 'Market', 'News', 'Social', 'Alerts', 'AI Insights', 'Transactions'].map((item) => (
            <li key={item} className="mb-2">
              <button
                onClick={() => setActiveSection(item.toLowerCase().replace(' ', ''))}
                className={`w-full text-left p-2 rounded ${
                  activeSection === item.toLowerCase().replace(' ', '') ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default Dashboard;
