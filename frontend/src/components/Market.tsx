import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTopCryptos } from '../store/slices/cryptoSlice';
import { Crypto } from '../types';
import { FaSearch, FaSort } from 'react-icons/fa';
import LoadingSkeleton from './LoadingSkeleton';

const Market: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { topCryptos, loading, error } = useSelector((state: RootState) => state.crypto);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Crypto; direction: 'ascending' | 'descending' }>({ key: 'market_cap', direction: 'descending' });

  useEffect(() => {
    dispatch(fetchTopCryptos());
  }, [dispatch]);

  const handleSort = (key: keyof Crypto) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const sortedCryptos = useMemo(() => {
    const sortableItems = [...topCryptos];
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
  }, [topCryptos, sortConfig]);

  const filteredCryptos = sortedCryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSkeleton />;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (topCryptos.length === 0) return <div className="text-center py-8">No cryptocurrency data available.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Cryptocurrency Market</h1>

      <div className="mb-6 flex flex-col sm:flex-row items-center">
        <input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto flex-grow p-2 rounded bg-gray-700 text-white mb-2 sm:mb-0 sm:mr-2"
        />
        <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <FaSearch className="inline mr-2" />
          Search
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
              <th className="p-2 text-right cursor-pointer hidden sm:table-cell" onClick={() => handleSort('market_cap')}>
                Market Cap <FaSort />
              </th>
              <th className="p-2 text-right cursor-pointer hidden md:table-cell" onClick={() => handleSort('total_volume')}>
                Volume (24h) <FaSort />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCryptos.map((crypto, index) => (
              <tr key={crypto.id} className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  <div className="flex items-center">
                    <img src={crypto.image} alt={crypto.name} className="w-6 h-6 mr-2" />
                    <span className="hidden sm:inline">{crypto.name}</span>
                    <span className="text-gray-400 ml-2">{crypto.symbol.toUpperCase()}</span>
                  </div>
                </td>
                <td className="p-2 text-right">${crypto.current_price.toLocaleString()}</td>
                <td className={`p-2 text-right ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="p-2 text-right hidden sm:table-cell">${crypto.market_cap.toLocaleString()}</td>
                <td className="p-2 text-right hidden md:table-cell">${crypto.total_volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Market;
