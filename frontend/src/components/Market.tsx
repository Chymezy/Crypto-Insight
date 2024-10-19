import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTopCryptos } from '../services/api';
import { Crypto } from '../types';
import { FaSearch, FaSort } from 'react-icons/fa';
import LoadingSkeleton from './LoadingSkeleton';

const Market: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Crypto; direction: 'ascending' | 'descending' }>({ key: 'market_cap', direction: 'descending' });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cryptosData = await fetchTopCryptos();
        setCryptos(cryptosData);
        setError(null);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to fetch market data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (key: keyof Crypto) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const sortedCryptos = React.useMemo(() => {
    const sortableItems = [...cryptos];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [cryptos, sortConfig]);

  const filteredCryptos = sortedCryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-8">Loading market data...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (cryptos.length === 0) return <div className="text-center py-8">No cryptocurrency data available.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cryptocurrency Market</h1>

      <div className="mb-6 flex items-center">
        <input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 rounded bg-gray-700 text-white"
        />
        <button className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <FaSearch />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('current_price')}>
                Price <FaSort />
              </th>
              <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('price_change_percentage_24h')}>
                24h % <FaSort />
              </th>
              <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('market_cap')}>
                Market Cap <FaSort />
              </th>
              <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('total_volume')}>
                Volume (24h) <FaSort />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCryptos.map((crypto, index) => (
              <tr key={crypto.id} className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/asset/${crypto.id}`)}>
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  <div className="flex items-center">
                    <img src={crypto.image} alt={crypto.name} className="w-6 h-6 mr-2" />
                    <span>{crypto.name}</span>
                    <span className="text-gray-400 ml-2">{crypto.symbol.toUpperCase()}</span>
                  </div>
                </td>
                <td className="p-2 text-right">${crypto.current_price.toLocaleString()}</td>
                <td className={`p-2 text-right ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="p-2 text-right">${crypto.market_cap.toLocaleString()}</td>
                <td className="p-2 text-right">${crypto.total_volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Market;
