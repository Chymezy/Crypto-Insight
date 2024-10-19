import React from 'react';
import { NewsItem } from '../types/news';

interface NewsCardProps {
  newsItem: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <img src={newsItem.imageurl} alt={newsItem.title} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-xl font-semibold mb-2">{truncateText(newsItem.title, 60)}</h2>
        <p className="text-gray-400 mb-4 flex-grow overflow-hidden">{truncateText(newsItem.body, 100)}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-sm text-gray-500">{newsItem.source}</span>
          <a 
            href={newsItem.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
          >
            Read More
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
