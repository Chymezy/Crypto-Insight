import React, { useState, useEffect } from 'react';
import PortfolioOverview from './PortfolioOverview';
import { fetchLatestNews } from '../services/newsApi';
import { NewsItem } from '../types/news';
import { FaNewspaper, FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Placeholder components
const MarketOverview = () => <div>Market Overview</div>;
const NewsSection = () => <div>News Section</div>;
const TopTraders = () => <div>Top Traders</div>;
const PriceAlerts = () => <div>Price Alerts</div>;
const AIInsights = () => <div>AI Insights</div>;
const Transactions = () => <div>Transactions</div>;

const NewsSummary: React.FC = () => {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const loadNewsSummary = async () => {
      try {
        setLoading(true);
        const news = await fetchLatestNews(15);
        setLatestNews(news);
        setError(null);
      } catch (err) {
        console.error('Error fetching latest news:', err);
        setError('Failed to load latest news');
      } finally {
        setLoading(false);
      }
    };
    loadNewsSummary();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = latestNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(latestNews.length / itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if (loading) return <div className="text-center py-4">Loading news...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="news-summary bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
        <FaNewspaper className="mr-2" />
        Latest Crypto News
      </h2>
      <div className="latest-headlines space-y-4">
        {currentItems.map(news => (
          <div key={news.id} className="bg-gray-700 rounded-lg p-3 md:p-4 hover:bg-gray-600 transition-colors duration-200">
            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block"
            >
              <h3 className="text-base md:text-lg font-semibold mb-2 text-blue-400 hover:text-blue-300">
                {news.title}
              </h3>
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                {news.body}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{new Date(news.published_on * 1000).toLocaleString()}</span>
                <span className="flex items-center">
                  {news.source} 
                  <FaExternalLinkAlt className="ml-1" />
                </span>
              </div>
            </a>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <button 
          onClick={prevPage} 
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-gray-600 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <FaChevronLeft />
        </button>
        <span className="text-gray-400 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={nextPage} 
          disabled={currentPage === totalPages}
          className={`px-2 py-1 rounded ${currentPage === totalPages ? 'bg-gray-600 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

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
      case 'transactions':
        return <Transactions />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-gray-800 p-4 mb-4 md:mb-0">
        <ul className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
          {['Portfolio', 'Market', 'News', 'Social', 'Alerts', 'AI Insights', 'Transactions'].map((item) => (
            <li key={item} className="mb-2 mr-2 md:mr-0">
              <button
                onClick={() => setActiveSection(item.toLowerCase().replace(' ', ''))}
                className={`w-full text-left p-2 rounded whitespace-nowrap ${
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
