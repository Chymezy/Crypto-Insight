import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateUserSettings } from '../../store/slices/userSettingsSlice';
import logoImage from '../../assets/mylogo.svg'; // Import the logo
import { FaCog, FaChevronDown, FaUser, FaMoon, FaSun, FaGlobe, FaDollarSign } from 'react-icons/fa';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const userSettings = useSelector((state: RootState) => state.userSettings);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Markets', path: '/markets' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'News', path: '/news' },
  ];

  const handleThemeChange = (theme: 'light' | 'dark') => {
    dispatch(updateUserSettings({ theme }));
    setIsSettingsDropdownOpen(false);
  };

  const handleLanguageChange = (language: string) => {
    dispatch(updateUserSettings({ language }));
    setIsSettingsDropdownOpen(false);
  };

  const handleCurrencyChange = (preferredCurrency: string) => {
    dispatch(updateUserSettings({ preferredCurrency }));
    setIsSettingsDropdownOpen(false);
  };

  return (
    <header className={`bg-${userSettings.theme === 'dark' ? 'gray-900' : 'white'} text-${userSettings.theme === 'dark' ? 'white' : 'gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logoImage} alt="CryptoInsight Logo" className="h-8 w-auto" />
          </Link>
          
          {/* Desktop menu */}
          <nav className="hidden md:flex space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                  className="text-gray-300 hover:text-white"
                >
                  <FaCog size={20} />
                </button>
                {isSettingsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1">
                    <div className="px-4 py-2 text-sm text-gray-400">Theme</div>
                    <button onClick={() => handleThemeChange('light')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      <FaSun className="inline mr-2" /> Light
                    </button>
                    <button onClick={() => handleThemeChange('dark')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      <FaMoon className="inline mr-2" /> Dark
                    </button>
                    <div className="px-4 py-2 text-sm text-gray-400">Language</div>
                    <button onClick={() => handleLanguageChange('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      <FaGlobe className="inline mr-2" /> English
                    </button>
                    <div className="px-4 py-2 text-sm text-gray-400">Currency</div>
                    <button onClick={() => handleCurrencyChange('USD')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      <FaDollarSign className="inline mr-2" /> USD
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser size={20} className="w-8 h-8 p-1 rounded-full bg-gray-700" />
                  )}
                  <FaChevronDown size={12} />
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!user && (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Login
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden"
            >
              <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                {user ? (
                  <>
                    <li>
                      <Link
                        to="/profile"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      to="/login"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
