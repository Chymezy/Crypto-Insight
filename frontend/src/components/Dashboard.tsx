import React, { useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import PortfolioOverview from './PortfolioOverview';
import NewsSummary from './NewsSummary';
import SwapWidget from './SwapWidget';
import WalletWidget from './WalletWidget';
import { FaChartPie, FaChartLine, FaNewspaper, FaUsers, FaBell, FaRobot, FaExchangeAlt, FaHistory, FaWallet, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder components
const MarketOverview = () => <div>Market Overview</div>;
const TopTraders = () => <div>Top Traders</div>;
const PriceAlerts = () => <div>Price Alerts</div>;
const AIInsights = () => <div>AI Insights</div>;
const Transactions = () => <div>Transactions</div>;

const Dashboard: React.FC = () => {
  const { activeSection, setActiveSection } = useNavigation();
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
    { name: 'Portfolio', icon: FaChartPie, section: 'portfolio' },
    { name: 'Market', icon: FaChartLine, section: 'market' },
    { name: 'News', icon: FaNewspaper, section: 'news' },
    { name: 'Social', icon: FaUsers, section: 'social' },
    { name: 'Alerts', icon: FaBell, section: 'alerts' },
    { name: 'AI', icon: FaRobot, section: 'ai' },
    { name: 'Swap', icon: FaExchangeAlt, section: 'swap' },
    { name: 'Wallet', icon: FaWallet, section: 'wallet' },
    { name: 'History', icon: FaHistory, section: 'transactions' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <header className="md:hidden flex justify-between items-center p-4 bg-gray-800 text-white fixed top-0 left-0 right-0 z-10">
        <button onClick={() => setIsSidebarOpen(true)} className="text-white">
          <FaBars size={24} />
        </button>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="w-6"></div> {/* Placeholder for balance */}
      </header>

      {/* Sidebar for desktop */}
      <aside className="hidden md:block w-64 bg-gray-800 p-4">
        <nav>
          <ul>
            {navItems.map(({ name, icon: Icon, section }) => (
              <li key={section} className="mb-2">
                <button
                  onClick={() => setActiveSection(section as any)}
                  className={`w-full text-left p-2 rounded flex items-center transition-colors ${
                    activeSection === section ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="mr-2" /> {name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-16 md:pb-4 mt-16 md:mt-0">
        {renderActiveSection()}
      </main>

      {/* Mobile Side Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-y-0 left-0 w-64 bg-gray-800 p-4 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-white">
                <FaTimes size={24} />
              </button>
            </div>
            <nav>
              <ul>
                {navItems.map(({ name, icon: Icon, section }) => (
                  <li key={section} className="mb-2">
                    <button
                      onClick={() => {
                        setActiveSection(section as any);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded flex items-center transition-colors ${
                        activeSection === section ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="mr-2" /> {name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'tween' }}
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
