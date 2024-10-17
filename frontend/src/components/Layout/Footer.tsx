import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const footerLinks = ['About', 'Blog', 'Careers', 'Contact'];

  return (
    <footer className="bg-gray-800 text-gray-300 font-coinstats border-t border-gray-700">
      <div className="max-w-7xl mx-auto py-8 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {footerLinks.map((link) => (
            <motion.div key={link} className="px-5 py-2" whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link to={`/${link.toLowerCase()}`} className="text-base hover:text-white transition-colors duration-200">
                {link}
              </Link>
            </motion.div>
          ))}
        </nav>
        <motion.p 
          className="mt-8 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          &copy; {new Date().getFullYear()} CryptoInsight, Inc. All rights reserved.
        </motion.p>
      </div>
    </footer>
  );
};

export default Footer;