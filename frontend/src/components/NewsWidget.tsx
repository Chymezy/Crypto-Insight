import React from 'react';
import { FaNewspaper } from 'react-icons/fa';

const NewsWidget: React.FC = () => {
  // This would typically come from an API call
  const newsItems = [
    { id: 1, title: "Bitcoin Surges Past $50,000", date: "2023-06-01" },
    { id: 2, title: "Ethereum 2.0 Launch Date Announced", date: "2023-06-02" },
    { id: 3, title: "New Cryptocurrency Regulations in EU", date: "2023-06-03" },
  ];

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4 flex items-center">
        <FaNewspaper className="mr-2" /> Latest Crypto News
      </h3>
      <ul>
        {newsItems.map((item) => (
          <li key={item.id} className="mb-4 pb-4 border-b border-gray-600 last:border-b-0">
            <h4 className="font-bold">{item.title}</h4>
            <p className="text-sm text-gray-400">{item.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsWidget;
