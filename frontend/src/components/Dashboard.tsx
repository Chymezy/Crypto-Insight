import React, { useState } from 'react';
import PortfolioOverview from './PortfolioOverview';
import NewsSummary from './NewsSummary'; // Make sure this component exists in a separate file
import SwapWidget from './SwapWidget';
import { FaChartPie, FaChartLine, FaNewspaper, FaUsers, FaBell, FaRobot, FaExchangeAlt, FaHistory } from 'react-icons/fa';

// Placeholder components
const MarketOverview = () => <div>Market Overview</div>;
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
        return <NewsSummary />;
      case 'social':
        return <TopTraders />;
      case 'alerts':
        return <PriceAlerts />;
      case 'ai':
        return <AIInsights />;
      case 'swap':
        return <SwapWidget />;
      case 'transactions':
        return <Transactions />;
      default:
        return null;
    }
  };

  const navItems = [
    { name: 'Portfolio', icon: FaChartPie },
    { name: 'Market', icon: FaChartLine },
    { name: 'News', icon: FaNewspaper },
    { name: 'Social', icon: FaUsers },
    { name: 'Alerts', icon: FaBell },
    { name: 'AI Insights', icon: FaRobot },
    { name: 'Swap', icon: FaExchangeAlt },
    { name: 'Transactions', icon: FaHistory },
  ];

  return (
    <div className="flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-gray-800 p-4 mb-4 md:mb-0">
        <ul className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
          {navItems.map((item) => (
            <li key={item.name} className="mb-2 mr-2 md:mr-0">
              <button
                onClick={() => setActiveSection(item.name.toLowerCase().replace(' ', ''))}
                className={`w-full text-left p-2 rounded whitespace-nowrap flex items-center ${
                  activeSection === item.name.toLowerCase().replace(' ', '') ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <item.icon className="mr-2" />
                {item.name}
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
