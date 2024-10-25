import React, { useState } from 'react';
import PortfolioOverview from './PortfolioOverview';
import NewsSummary from './NewsSummary';
import SwapWidget from './SwapWidget';
import WalletWidget from './WalletWidget';
import { FaChartPie, FaChartLine, FaNewspaper, FaUsers, FaBell, FaRobot, FaExchangeAlt, FaHistory, FaWallet, FaBars } from 'react-icons/fa';

// Placeholder components
const MarketOverview = () => <div>Market Overview</div>;
const TopTraders = () => <div>Top Traders</div>;
const PriceAlerts = () => <div>Price Alerts</div>;
const AIInsights = () => <div>AI Insights</div>;
const Transactions = () => <div>Transactions</div>;

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('portfolio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      case 'wallet':
        return <WalletWidget />;
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
    { name: 'Wallet', icon: FaWallet },
    { name: 'Transactions', icon: FaHistory },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-gray-800">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
          <FaBars size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <nav className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        transition-transform duration-300 ease-in-out
        fixed md:static top-0 left-0 h-full
        w-64 bg-gray-800 p-4 overflow-y-auto z-50 md:z-auto
      `}>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => {
                  setActiveSection(item.name.toLowerCase().replace(' ', ''));
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-2 rounded flex items-center text-white ${
                  activeSection === item.name.toLowerCase().replace(' ', '') 
                    ? 'bg-blue-600' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <item.icon className="mr-2" />
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {renderActiveSection()}
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
