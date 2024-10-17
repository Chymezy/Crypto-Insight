import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTopCryptos } from '../services/api';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: { price: number[] };
}

const CryptoList: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const loadCryptos = async () => {
      try {
        const data = await fetchTopCryptos();
        setCryptos(data.slice(0, 20));
      } catch (error) {
        console.error('Error fetching cryptos:', error);
      }
    };
    loadCryptos();
  }, []);

  const filteredCryptos = activeTab === 'all' ? cryptos : cryptos.filter(crypto => crypto.price_change_percentage_24h > 0);

  return (
    <div>
      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 mr-2 rounded ${activeTab === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          All Coins
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'trending' ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('trending')}
        >
          Trending
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-4">#</th>
              <th className="pb-4">Name</th>
              <th className="pb-4">Price</th>
              <th className="pb-4">24h %</th>
              <th className="pb-4">7d Chart</th>
            </tr>
          </thead>
          <tbody>
            {filteredCryptos.map((crypto, index) => (
              <tr key={crypto.id} className="border-t border-gray-700">
                <td className="py-4">{index + 1}</td>
                <td className="py-4">
                  <Link to={`/crypto/${crypto.id}`} className="flex items-center">
                    <img src={`https://assets.coingecko.com/coins/images/1/thumb/${crypto.id}.png`} alt={crypto.name} className="w-6 h-6 mr-2" />
                    <span>{crypto.name}</span>
                    <span className="text-gray-400 ml-2">{crypto.symbol.toUpperCase()}</span>
                  </Link>
                </td>
                <td className="py-4">${crypto.current_price.toLocaleString()}</td>
                <td className={`py-4 ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="py-4">
                  <ResponsiveContainer width={100} height={40}>
                    <LineChart data={crypto.sparkline_in_7d.price.map((price, i) => ({ price, index: i }))}>
                      <Line type="monotone" dataKey="price" stroke={crypto.price_change_percentage_24h >= 0 ? '#10B981' : '#EF4444'} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoList;
