import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { FaChartLine, FaRobot, FaChartBar, FaMobileAlt, FaDesktop, FaLock, FaChevronDown, FaSearch, FaExchangeAlt, FaLink } from 'react-icons/fa';
import { fetchTopCryptos } from '../services/api';
import heroImage from '../assets/hero-bg.jpg';
import { RootState } from '../store';
import { setTopCryptos, setLoading, setError } from '../store/slices/cryptoSlice';
import { Crypto } from '../types';
import applicationBackground from '../assets/application-bg.jpg';
import happyCustomerImage from '../assets/happy-customer.webp';
import PriceTicker from '../components/PriceTicker';
import WalletTicker from '../components/WalletTicker';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { topCryptos, loading, error } = useSelector((state: RootState) => state.crypto);
  const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    const loadTopCryptos = async () => {
      try {
        dispatch(setLoading(true));
        const data = await fetchTopCryptos();
        if (Array.isArray(data) && data.length > 0) {
          dispatch(setTopCryptos(data));
          dispatch(setError(null));
        } else {
          throw new Error('Fetched data is not a non-empty array');
        }
      } catch (error) {
        console.error('Error fetching top cryptos:', error);
        dispatch(setError('Failed to load top cryptocurrencies'));
      } finally {
        dispatch(setLoading(false));
      }
    };
    loadTopCryptos();
  }, [dispatch]);

  const handleViewMore = () => {
    setDisplayCount(prevCount => prevCount + 10);
  };

  const handleAssetClick = (assetId: string) => {
    navigate(`/asset/${assetId}`);
  };

  const displayedCryptos = topCryptos.slice(0, displayCount);

  return (
    <div className="text-white bg-gray-900">
      <PriceTicker />
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative text-center py-20 overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
          >
            Track Your Crypto Portfolio with AI-Powered Insights
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            CryptoInsight helps you make informed decisions with real-time data and AI analysis.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          >
            <Link to="/register">
              <Button className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold">Sign Up for Free</Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* WalletTicker moved here, just below the hero section */}
      <section className="py-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <WalletTicker />
        </div>
      </section>

      {/* Business Advertisement Section */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={applicationBackground} alt="Application Background" className="w-full h-full object-cover opacity-50" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Maximize Your Crypto Investments</h2>
              <p className="text-lg">Join CryptoInsight today and get personalized AI-driven insights to boost your portfolio performance!</p>
            </div>
            <div className="md:w-1/3 text-center">
              <Link to="/register">
                <Button className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold transition duration-300">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Action Buttons Section */}
      <section className="py-10 bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={applicationBackground} alt="Application Background" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-1/2 relative">
              <input
                type="text"
                placeholder="Search coins..."
                className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <Button className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                <FaExchangeAlt className="mr-2" /> Swap
              </Button>
              <Button className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                <FaLink className="mr-2" /> Connect
              </Button>
              <Button className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                <FaChartLine className="mr-2" /> Track Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Remove extra space between hero and top cryptocurrencies section */}
      {/* <div className="py-10"></div> */}

      {/* Top Cryptocurrencies Section - Adjust padding for consistency */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Changed max-w-7xl to max-w-6xl for consistency */}
          <h2 className="text-3xl font-bold text-center mb-12">Top Cryptocurrencies</h2>
          {loading && <p className="text-center">Loading top cryptocurrencies...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && Array.isArray(displayedCryptos) && displayedCryptos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Coin</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">24h %</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Market Cap</th>
                    <th className="py-3 px-4 hidden md:table-cell">Volume (24h)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCryptos.map((crypto: Crypto, index: number) => (
                    <tr 
                      key={crypto.id} 
                      className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleAssetClick(crypto.id)}
                    >
                      <td className="py-2 md:py-4 px-2 md:px-4">{index + 1}</td>
                      <td className="py-2 md:py-4 px-2 md:px-4">
                        <div className="flex items-center">
                          <img src={crypto.image} alt={crypto.name} className="w-6 h-6 mr-2" />
                          <span className="hidden sm:inline">{crypto.name}</span>
                          <span className="sm:ml-2">{crypto.symbol.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="py-2 md:py-4 px-2 md:px-4">${crypto.current_price.toLocaleString()}</td>
                      <td className={`py-2 md:py-4 px-2 md:px-4 ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {crypto.price_change_percentage_24h.toFixed(2)}%
                      </td>
                      <td className="py-2 md:py-4 px-2 md:px-4 hidden sm:table-cell">${crypto.market_cap.toLocaleString()}</td>
                      <td className="py-2 md:py-4 px-2 md:px-4 hidden md:table-cell">${crypto.total_volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">No cryptocurrency data available.</p>
          )}
          {displayCount < topCryptos.length && (
            <div className="text-center mt-6">
              <button 
                onClick={handleViewMore}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View More <FaChevronDown className="inline ml-2" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose CryptoInsight? Section - Compact and Professional with no gaps */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose CryptoInsight?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FaChartLine, title: 'Advanced Portfolio Tracking', description: 'Monitor investments across multiple exchanges and wallets in real-time.' },
              { icon: FaRobot, title: 'AI-Powered Insights', description: 'Get personalized investment suggestions and market analysis.' },
              { icon: FaChartBar, title: 'Comprehensive Market Data', description: 'Access in-depth charts, historical data, and advanced analytics.' },
              { icon: FaMobileAlt, title: 'Mobile App', description: 'Track your portfolio on-the-go with our user-friendly mobile application.' },
              { icon: FaDesktop, title: 'Cross-Platform Sync', description: 'Seamlessly sync your data across all your devices.' },
              { icon: FaLock, title: 'Bank-Grade Security', description: 'Your data is protected with state-of-the-art encryption and security measures.' }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-gray-800 p-4 flex flex-col items-center border border-gray-700"
              >
                <feature.icon className="text-3xl mb-2 text-blue-500" />
                <h3 className="text-lg font-semibold mb-1 text-center">{feature.title}</h3>
                <p className="text-gray-300 text-sm text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Adjust height to match text content */}
      <section className="py-12 bg-gray-800 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row">
          <div className="md:w-1/2 flex flex-col justify-center pr-8">
            <h2 className="text-3xl font-bold text-center md:text-left mb-8">How It Works</h2>
            {[
              { step: 1, title: 'Create an Account', description: 'Sign up for free and set up your profile in minutes.' },
              { step: 2, title: 'Connect Your Wallets', description: 'Easily connect your cryptocurrency wallets and exchange accounts.' },
              { step: 3, title: 'Track and Analyze', description: 'Monitor your portfolio and receive AI-powered insights for smarter investing.' }
            ].map((item) => (
              <motion.div 
                key={item.step}
                className="flex items-start mb-6"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 * item.step }}
              >
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="md:w-1/2 flex items-center justify-center mt-8 md:mt-0">
            <img 
              src={applicationBackground} 
              alt="Application Background" 
              className="w-full h-full object-cover rounded-lg shadow-lg"
              style={{ maxHeight: '300px' }} // Adjust this value to match the height of your text content
            /> 
          </div>
        </div>
      </section>

      {/* CTA Section with enhanced marketing and responsiveness */}
      <section className="py-20 bg-gray-800 text-center relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-left md:pr-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Crypto Investments?</h2>
            <p className="text-xl mb-6">Join thousands of satisfied users and start your journey to smarter crypto investing today!</p>
            <ul className="list-none mb-8">
              {['Real-time portfolio tracking', 'AI-powered insights', 'Advanced analytics', 'Bank-grade security'].map((benefit, index) => (
                <li key={index} className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold transition duration-300">Sign Up Now - It's Free!</Button>
            </Link>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <img 
              src={happyCustomerImage}
              alt="Happy CryptoInsight User" 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
