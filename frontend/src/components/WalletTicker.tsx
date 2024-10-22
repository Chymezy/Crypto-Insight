import React from 'react';
import { motion } from 'framer-motion';
import { FaEthereum, FaBitcoin } from 'react-icons/fa';
import { SiLitecoin, SiDogecoin, SiTether, SiBinance } from 'react-icons/si';

const wallets = [
  { name: 'Ethereum', icon: FaEthereum, color: '#3C3C3D' },
  { name: 'Bitcoin', icon: FaBitcoin, color: '#F7931A' },
  { name: 'Litecoin', icon: SiLitecoin, color: '#345D9D' },
  { name: 'Dogecoin', icon: SiDogecoin, color: '#C2A633' },
  { name: 'Tether', icon: SiTether, color: '#26A17B' },
  { name: 'Binance', icon: SiBinance, color: '#F3BA2F' },
];

const WalletTicker: React.FC = () => {
  return (
    <div className="bg-gray-700 py-3 overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {wallets.concat(wallets).map((wallet, index) => (
          <div key={index} className="inline-flex items-center mx-6">
            <wallet.icon size={24} color={wallet.color} />
            <span className="ml-2 text-sm font-medium">{wallet.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default WalletTicker;
