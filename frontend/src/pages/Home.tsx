import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { FaChartLine, FaRobot, FaChartBar, FaMobileAlt, FaDesktop, FaLock } from 'react-icons/fa';
import { fetchTopCryptos } from '../services/api';
import heroImage from '../assets/hero-bg.jpg';
import { RootState } from '../store';
import { setTopCryptos, setLoading, setError } from '../store/slices/cryptoSlice';
import { Crypto } from '../types';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { topCryptos, loading, error } = useSelector((state: RootState) => state.crypto);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCryptos = topCryptos.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleAssetClick = (assetId: string) => {
    navigate(`/asset/${assetId}`);
  };

  return (
    <div className="text-white bg-gray-900">
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
              <Button className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700">Get Started for Free</Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Top Cryptocurrencies Section */}
      <section className="py-8 md:py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12">Top Cryptocurrencies</h2>
          {loading && <p className="text-center">Loading top cryptocurrencies...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && Array.isArray(currentCryptos) && currentCryptos.length > 0 ? (
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
                  {currentCryptos.map((crypto: Crypto, index: number) => (
                    <tr 
                      key={crypto.id} 
                      className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleAssetClick(crypto.id)}
                    >
                      <td className="py-2 md:py-4 px-2 md:px-4">{indexOfFirstItem + index + 1}</td>
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
          {/* Pagination */}
          <div className="flex justify-center mt-8 overflow-x-auto">
            <div className="inline-flex">
              {Array.from({ length: Math.ceil(topCryptos.length / itemsPerPage) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`mx-1 px-3 py-1 rounded text-sm md:text-base ${
                    currentPage === i + 1 ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CryptoInsight?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: FaChartLine, title: 'Advanced Portfolio Tracking', description: 'Monitor your investments across multiple exchanges and wallets in real-time.' },
              { icon: FaRobot, title: 'AI-Powered Insights', description: 'Get personalized investment suggestions and market analysis powered by artificial intelligence.' },
              { icon: FaChartBar, title: 'Comprehensive Market Data', description: 'Access in-depth charts, historical data, and advanced analytics for informed decision-making.' },
              { icon: FaMobileAlt, title: 'Mobile App', description: 'Track your portfolio on-the-go with our user-friendly mobile application.' },
              { icon: FaDesktop, title: 'Cross-Platform Sync', description: 'Seamlessly sync your data across all your devices for a consistent experience.' },
              { icon: FaLock, title: 'Bank-Grade Security', description: 'Rest easy knowing your data is protected with state-of-the-art encryption and security measures.' }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 * (index + 1) }}
                className="bg-gray-700 p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300"
              >
                <feature.icon className="text-4xl mb-4 text-blue-500 mx-auto" />
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 md:py-16 bg-gray-800">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12">How It Works</h2>
        <div className="max-w-4xl mx-auto px-4">
          {[
            { step: 1, title: 'Create an Account', description: 'Sign up for free and set up your profile in minutes.' },
            { step: 2, title: 'Connect Your Wallets', description: 'Easily connect your cryptocurrency wallets and exchange accounts.' },
            { step: 3, title: 'Track and Analyze', description: 'Monitor your portfolio and receive AI-powered insights for smarter investing.' }
          ].map((item) => (
            <motion.div 
              key={item.step}
              className="flex items-start md:items-center mb-6 md:mb-8"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 * item.step }}
            >
              <div className="bg-blue-600 rounded-full w-8 h-8 md:w-12 md:h-12 flex items-center justify-center text-lg md:text-2xl font-bold mr-4 flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-300">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-center">
        <h2 className="text-3xl font-bold mb-8">Ready to Take Control of Your Crypto Investments?</h2>
        <Link to="/register">
          <Button className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100">Sign Up Now - It's Free!</Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
