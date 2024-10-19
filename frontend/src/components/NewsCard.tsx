import React from 'react';
import { NewsItem } from '../types/news';
import { FaBookmark, FaShare, FaCheck } from 'react-icons/fa';

interface NewsCardProps {
  newsItem: NewsItem;
  isBookmarked: boolean;
  isRead: boolean;
  onBookmark: (id: string) => void;
  onShare: (newsItem: NewsItem) => void;
  onRead: (id: string) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, isBookmarked, isRead, onBookmark, onShare, onRead }) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    onBookmark(newsItem.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    onShare(newsItem);
  };

  const handleRead = (e: React.MouseEvent) => {
    e.preventDefault();
    onRead(newsItem.id);
  };

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full ${isRead ? 'opacity-50' : ''}`}>
      <img src={newsItem.imageurl} alt={newsItem.title} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-xl font-semibold mb-2">{truncateText(newsItem.title, 60)}</h2>
        <p className="text-gray-400 mb-4 flex-grow overflow-hidden">{truncateText(newsItem.body, 100)}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-sm text-gray-500">{newsItem.source}</span>
          <div className="flex space-x-2">
            <button 
              onClick={handleBookmark}
              className={`p-2 rounded-full ${isBookmarked ? 'bg-yellow-500' : 'bg-gray-600'}`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this news"}
            >
              <FaBookmark />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-gray-600"
              title="Share this news"
            >
              <FaShare />
            </button>
            <button 
              onClick={handleRead}
              className={`p-2 rounded-full ${isRead ? 'bg-green-500' : 'bg-gray-600'}`}
              title={isRead ? "Mark as unread" : "Mark as read"}
            >
              <FaCheck />
            </button>
            <a 
              href={newsItem.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
              onClick={handleRead}
            >
              Read More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
