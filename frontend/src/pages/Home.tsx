import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { FaChartLine, FaRobot, FaChartBar, FaMobileAlt, FaDesktop, FaLock, FaChevronDown, FaSearch, FaExchangeAlt, FaLink, FaGraduationCap, FaUsers, FaTrophy } from 'react-icons/fa';
import { fetchTopCryptos } from '../services/api';
import heroImage from '../assets/hero-bg.jpg';
import { RootState } from '../store';
import { setTopCryptos, setLoading, setError } from '../store/slices/cryptoSlice';
import { Crypto } from '../types';
import applicationBackground from '../assets/application-bg.jpg';
import happyCustomerImage from '../assets/happy-customer.webp';
import PriceTicker from '../components/PriceTicker';
import WalletTicker from '../components/WalletTicker';
import AIDemo from '../components/AIDemo'; // You'll need to create this component
import NewsWidget from '../components/NewsWidget'; // You'll need to create this component
import tradersBackground from '../assets/entrepreneur-696976_1920.png'; // Import the new background image
import educationImage from '../assets/crypto-education.jpg'; // Add this import at the top of the file
import simulatorVideo from '../assets/simulator-background.mp4';
import CryptoAnimation from '../components/CryptoAnimation';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { topCryptos, loading, error } = useSelector((state: RootState) => state.crypto);
  const [displayCount, setDisplayCount] = useState(10);
  const [featuredCrypto, setFeaturedCrypto] = useState<Crypto | null>(null);

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

  useEffect(() => {
    if (topCryptos.length > 0) {
      const randomIndex = Math.floor(Math.random() * topCryptos.length);
      setFeaturedCrypto(topCryptos[randomIndex]);
    }
  }, [topCryptos]);

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

      {/* Why Choose CryptoInsight? Section - Further Enhanced */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CryptoInsight?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FaChartLine, title: 'Advanced Portfolio Tracking', description: 'Monitor investments across 100+ exchanges and 1000+ tokens in real-time.', stat: '99.9% accuracy' },
              { icon: FaRobot, title: 'AI-Powered Insights', description: 'Get personalized suggestions with our AI that analyzes 1M+ data points daily.', stat: '85% prediction accuracy' },
              { icon: FaChartBar, title: 'Comprehensive Market Data', description: 'Access 10+ years of historical data and 50+ technical indicators.', stat: 'Updated every 5 seconds' },
              { icon: FaMobileAlt, title: 'Mobile App', description: 'Track your portfolio on-the-go with our app, available on iOS and Android.', stat: '4.8★ on App Store' },
              { icon: FaDesktop, title: 'Cross-Platform Sync', description: 'Seamlessly sync your data across unlimited devices in real-time.', stat: '100% data consistency' },
              { icon: FaLock, title: 'Bank-Grade Security', description: 'Your data is protected with AES 256-bit encryption and 2FA.', stat: 'SOC 2 Type II Certified' }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-400"
                tabIndex={0}
              >
                <div className="flex items-center mb-4">
                  <feature.icon className="text-4xl text-blue-500 mr-4" aria-hidden="true" />
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">{feature.description}</p>
                <div className="mt-auto">
                  <span className="text-blue-400 font-semibold">{feature.stat}</span>
                </div>
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

      {/* AI-Powered Features Showcase */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Experience AI-Powered Crypto Insights</h2>
          <AIDemo /> {/* This component should showcase AI features interactively */}
        </div>
      </section>

      {/* Social Trading Preview */}
      <section className="py-16 bg-gray-800 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row">
          <div className="md:w-1/2 flex flex-col justify-center pr-8">
            <h2 className="text-3xl font-bold mb-6">Connect with Top Traders</h2>
            <p className="text-lg mb-6">Learn from experienced traders, share strategies, and grow your network. Join our thriving community of crypto enthusiasts and professionals.</p>
            <Link to="/social-trading">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">Explore Social Trading</Button>
            </Link>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <img 
              src={tradersBackground}
              alt="Social Trading"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Educational Content Preview */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Learn Crypto with CryptoInsight</h2>
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <img 
                src={educationImage} 
                alt="Crypto Education" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="md:w-1/2">
              <p className="text-lg mb-6">
                Dive into the world of cryptocurrency with our comprehensive educational resources. From beginner guides to advanced trading strategies, we've got you covered.
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-300">
                <li>In-depth articles on blockchain technology</li>
                <li>Video tutorials on crypto trading</li>
                <li>Regular webinars with industry experts</li>
                <li>Interactive quizzes to test your knowledge</li>
              </ul>
              <Link to="/learn">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Start Learning</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features Highlight */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Your Security is Our Priority</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <FaLock className="text-4xl text-blue-500 mr-4" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Bank-Grade Encryption</h3>
                <p>Your data is protected with AES 256-bit encryption.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaUsers className="text-4xl text-blue-500 mr-4" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Multi-Factor Authentication</h3>
                <p>Add an extra layer of security to your account.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Portfolio Simulator */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-800">
          <CryptoAnimation />
        </div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-6 text-white">Test Your Strategies Risk-Free</h2>
          <p className="text-center text-xl mb-8 text-white">Practice trading with our Virtual Portfolio Simulator.</p>
          <div className="text-center">
            <Link to="/simulator">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
                Try Simulator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gamification Preview */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Level Up Your Crypto Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <FaTrophy className="text-5xl text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Earn Achievements</h3>
              <p className="text-gray-300">Complete challenges and showcase your crypto expertise.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <FaChartLine className="text-5xl text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Climb the Leaderboard</h3>
              <p className="text-gray-300">Compete with other traders and rise to the top.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <FaGraduationCap className="text-5xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Learn and Grow</h3>
              <p className="text-gray-300">Gain XP and level up as you expand your knowledge.</p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link to="/gamification">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
                Start Your Crypto Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-Time Data Showcase */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Stay Ahead with Real-Time Data</h2>
          <NewsWidget /> {/* This component should display live news updates */}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-center relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold mb-8 text-white">Ready to Revolutionize Your Crypto Journey?</h2>
          <p className="text-xl mb-12 text-white">Join thousands of satisfied users and unlock the full potential of your investments with AI-powered insights, social trading, and more!</p>
          <Link to="/register">
            <Button className="text-lg px-12 py-4 bg-blue-600 text-white hover:bg-blue-700 font-bold transition duration-300 transform hover:scale-105 shadow-lg">
              Start Your Free Trial Now
            </Button>
          </Link>
        </div>
        <div className="absolute inset-0 z-0 opacity-20">
          <img src={applicationBackground} alt="Application Background" className="w-full h-full object-cover" />
        </div>
      </section>

      {featuredCrypto && (
        <section className="py-12 bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Featured Cryptocurrency</h2>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <img src={featuredCrypto.image} alt={featuredCrypto.name} className="w-12 h-12 mr-4" />
                <h3 className="text-xl font-semibold">{featuredCrypto.name} ({featuredCrypto.symbol.toUpperCase()})</h3>
              </div>
              <p className="text-2xl font-bold mb-2">${featuredCrypto.current_price.toLocaleString()}</p>
              <p className={`text-lg ${featuredCrypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {featuredCrypto.price_change_percentage_24h.toFixed(2)}% (24h)
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
