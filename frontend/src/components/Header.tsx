import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './common/Button';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Portfolio', path: '/portfolio', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Markets', path: '/markets', icon: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' },
    { name: 'News', path: '/news', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  ];

  return (
    <>
      <header className="bg-gray-100 dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            CryptoInsight
          </Link>
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    {item.name}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  <li><span className="text-gray-700 dark:text-gray-300">Welcome, {user.name}</span></li>
                  <li><Button onClick={logout}>Logout</Button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Login</Link></li>
                  <li><Link to="/register" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Register</Link></li>
                </>
              )}
            </ul>
          </nav>
          <button
            className="md:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-100 dark:bg-gray-800 py-2">
          <ul className="px-4">
            {navItems.map((item) => (
              <li key={item.name} className="py-2">
                <Link
                  to={item.path}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {user ? (
              <>
                <li className="py-2"><span className="text-gray-700 dark:text-gray-300">Welcome, {user.name}</span></li>
                <li className="py-2"><Button onClick={logout}>Logout</Button></li>
              </>
            ) : (
              <>
                <li className="py-2"><Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>Login</Link></li>
                <li className="py-2"><Link to="/register" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>Register</Link></li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 shadow-lg">
        <ul className="flex justify-around py-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex flex-col items-center ${
                  location.pathname === item.path
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Header;