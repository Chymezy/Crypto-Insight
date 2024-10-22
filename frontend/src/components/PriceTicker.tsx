import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchTopCryptos } from '../services/api';

const PriceTicker: React.FC = () => {
  const [prices, setPrices] = useState<Array<{ symbol: string; price: number; change: number }>>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      const data = await fetchTopCryptos();
      const formattedPrices = data.slice(0, 10).map((crypto: any) => ({
        symbol: crypto.symbol.toUpperCase(),
        price: crypto.current_price,
        change: crypto.price_change_percentage_24h
      }));
      setPrices(formattedPrices);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 py-2 overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {prices.concat(prices).map((price, index) => (
          <div key={index} className="inline-block mx-4">
            <span className="font-bold">{price.symbol}</span>
            <span className="ml-2">${price.price.toFixed(2)}</span>
            <span className={`ml-2 ${price.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {price.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default PriceTicker;
