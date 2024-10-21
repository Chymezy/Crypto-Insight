import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/mylogo.svg'; // Make sure this path is correct
import { FaBars, FaTimes } from 'react-icons/fa';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Market', path: '/market' },
    { name: 'News', path: '/news' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logoImage} alt="Logo" className="h-8 w-auto" />
          </Link>
          
          {/* Mobile menu button */}
          <button onClick={toggleMenu} className="md:hidden">
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} className="hover:text-blue-400">
                {item.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <button onClick={logout} className="hover:text-blue-400">Logout</button>
            ) : (
              <Link to="/login" className="hover:text-blue-400">Login</Link>
            )}
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block py-2 hover:text-blue-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left py-2 hover:text-blue-400">
                Logout
              </button>
            ) : (
              <Link to="/login" className="block py-2 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>

      <footer className="bg-gray-800 text-white p-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-2">About CryptoInsight</h3>
            <p className="text-sm">Your trusted platform for cryptocurrency tracking and analysis.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Quick Links</h3>
            <ul className="text-sm">
              <li><Link to="/about" className="hover:text-blue-400">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Follow Us</h3>
            <ul className="text-sm">
              <li><a href="#" className="hover:text-blue-400">Twitter</a></li>
              <li><a href="#" className="hover:text-blue-400">Facebook</a></li>
              <li><a href="#" className="hover:text-blue-400">LinkedIn</a></li>
              <li><a href="#" className="hover:text-blue-400">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Newsletter</h3>
            <p className="text-sm mb-2">Stay updated with our latest news and offers.</p>
            <input type="email" placeholder="Enter your email" className="w-full p-2 rounded bg-gray-700 text-white" />
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          © 2023 CryptoInsight. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
