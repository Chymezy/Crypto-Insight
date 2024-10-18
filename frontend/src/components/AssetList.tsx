import React from 'react';
import { Asset } from '../types';

interface AssetListProps {
  assets: Asset[];
}

const AssetList: React.FC<AssetListProps> = ({ assets }) => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Your Assets</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left">Asset</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-right">Value</th>
              <th className="p-2 text-right">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-b border-gray-700">
                <td className="p-2">
                  <div className="flex items-center">
                    <img src={asset.image} alt={asset.name} className="w-6 h-6 mr-2" />
                    <span>{asset.name}</span>
                  </div>
                </td>
                <td className="p-2 text-right">{asset.amount}</td>
                <td className="p-2 text-right">${asset.value.toFixed(2)}</td>
                <td className={`p-2 text-right ${asset.priceChange24h != null && asset.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {asset.priceChange24h != null ? (asset.priceChange24h >= 0 ? '+' : '') + asset.priceChange24h.toFixed(2) : '0.00'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetList;
