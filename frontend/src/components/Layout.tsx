import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/mylogo.svg'; // Make sure this path is correct
import { FaBars, FaTimes, FaChartLine, FaWallet, FaChartBar, FaNewspaper, FaSignOutAlt, FaSignInAlt, FaApple, FaGooglePlay } from 'react-icons/fa';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FaChartLine, description: 'Overview of your crypto assets' },
    { name: 'Portfolio', path: '/portfolio', icon: FaWallet, description: 'Manage your crypto portfolio' },
    { name: 'Market', path: '/market', icon: FaChartBar, description: 'Live crypto market data' },
    { name: 'News', path: '/news', icon: FaNewspaper, description: 'Latest crypto news and updates' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Desktop Header */}
      <header className="bg-gray-800 text-white p-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logoImage} alt="Logo" className="h-8 w-auto" />
          </Link>
          <nav className="flex space-x-4 items-center">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} className="hover:text-blue-400">
                {item.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <button onClick={logout} className="hover:text-blue-400">Logout</button>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="bg-gray-800 text-white p-4 md:hidden fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logoImage} alt="Logo" className="h-8 w-auto" />
          </Link>
          <button onClick={toggleMenu} className="z-50">
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-40 md:hidden pt-20">
          <nav className="flex flex-col h-full overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-6 py-4 hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="mr-4" size={24} />
                <div>
                  <div className="text-xl font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.description}</div>
                </div>
              </Link>
            ))}
            {isAuthenticated ? (
              <button 
                onClick={() => { logout(); setIsMenuOpen(false); }} 
                className="flex items-center px-6 py-4 hover:bg-gray-800"
              >
                <FaSignOutAlt className="mr-4" size={24} />
                <div>
                  <div className="text-xl font-semibold">Logout</div>
                  <div className="text-sm text-gray-400">Sign out of your account</div>
                </div>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center px-6 py-4 bg-blue-600 hover:bg-blue-700" 
                onClick={() => setIsMenuOpen(false)}
              >
                <FaSignInAlt className="mr-4" size={24} />
                <div>
                  <div className="text-xl font-semibold">Login</div>
                  <div className="text-sm text-gray-200">Sign in to your account</div>
                </div>
              </Link>
            )}
          </nav>
        </div>
      )}

      <main className="flex-grow container mx-auto p-4 mt-16 md:mt-0">
        {children}
      </main>

      {/* Desktop Footer */}
      <footer className="bg-gray-800 text-white p-8 hidden md:block">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">About CryptoInsight</h3>
              <p className="text-sm">Your trusted platform for cryptocurrency tracking and analysis.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="text-sm space-y-2">
                <li><Link to="/about" className="hover:text-blue-400">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-blue-400">FAQ</Link></li>
                <li><Link to="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Follow Us</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-blue-400">Twitter</a></li>
                <li><a href="#" className="hover:text-blue-400">Facebook</a></li>
                <li><a href="#" className="hover:text-blue-400">LinkedIn</a></li>
                <li><a href="#" className="hover:text-blue-400">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Newsletter</h3>
              <p className="text-sm mb-2">Stay updated with our latest news and offers.</p>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full p-2 rounded bg-gray-700 text-white mb-2" 
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                Subscribe
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
            <p>&copy; 2023 CryptoInsight. All rights reserved.</p>
            <div className="mt-2">
              <a href="#" className="text-blue-400 hover:text-blue-300 mr-4">Privacy Policy</a>
              <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Footer */}
      <footer className="bg-gray-800 text-white p-4 md:hidden">
        <div className="container mx-auto">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold mb-2">Download Our App</h3>
            <p className="text-sm mb-2">Track your crypto portfolio on the go</p>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="bg-black text-white px-4 py-2 rounded-lg flex items-center">
                <FaApple className="mr-2" />
                App Store
              </a>
              <a href="#" className="bg-black text-white px-4 py-2 rounded-lg flex items-center">
                <FaGooglePlay className="mr-2" />
                Google Play
              </a>
            </div>
            <p className="text-sm text-center">&copy; 2023 CryptoInsight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
