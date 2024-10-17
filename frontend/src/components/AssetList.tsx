import React from 'react';

const AssetList: React.FC = () => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Your Assets</h2>
      {/* Placeholder for asset list */}
      <ul className="space-y-2">
        <li className="bg-gray-700 p-2 rounded">Asset 1</li>
        <li className="bg-gray-700 p-2 rounded">Asset 2</li>
        <li className="bg-gray-700 p-2 rounded">Asset 3</li>
      </ul>
    </div>
  );
};

export default AssetList;