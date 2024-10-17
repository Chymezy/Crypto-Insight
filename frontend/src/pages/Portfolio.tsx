import React from 'react';
import { motion } from 'framer-motion';
import ErrorBoundary from '../components/ErrorBoundary';
import PortfolioChart from '../components/PortfolioChart';
import AssetList from '../components/AssetList';

const Portfolio: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-white"
    >
      <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>
      <ErrorBoundary fallback={<div className="text-red-500">Error loading portfolio chart</div>}>
        <PortfolioChart />
      </ErrorBoundary>
      <ErrorBoundary fallback={<div className="text-red-500">Error loading asset list</div>}>
        <AssetList />
      </ErrorBoundary>
    </motion.div>
  );
};

export default Portfolio;