import React from 'react';
import { NewsItem } from '../types/news';

interface NewsCardProps {
  newsItem: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img src={newsItem.imageurl} alt={newsItem.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{newsItem.title}</h2>
        <p className="text-gray-400 mb-4">{newsItem.body}</p>
        <div className="flex justify-between items-center">
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
