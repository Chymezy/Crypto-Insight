import React, { useState, useEffect } from 'react';
import { NewsItem } from '../types/news';
import NewsCard from './NewsCard';
import { fetchNews, bookmarkNews, shareNews, markNewsAsRead, isNewsBookmarked, isNewsRead } from '../services/newsApi';
import { FaSearch, FaSort } from 'react-icons/fa';
import LoadingSkeleton from "./LoadingSkeleton";

const News: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'relevance'>('date');
  const [bookmarkedNews, setBookmarkedNews] = useState<Set<string>>(new Set());
  const [readNews, setReadNews] = useState<Set<string>>(new Set());

  const categories = ['', 'Bitcoin', 'Ethereum', 'Blockchain', 'DeFi', 'NFTs', 'Regulation'];
  const itemsPerPage = 6;

  useEffect(() => {
    loadNews();
    // Load bookmarked and read news from local storage
    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
    const storedReadNews = JSON.parse(localStorage.getItem('readNews') || '[]');
    setBookmarkedNews(new Set(storedBookmarks));
    setReadNews(new Set(storedReadNews));
  }, [selectedCategory, page, sortBy]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await fetchNews(selectedCategory === '' ? undefined : selectedCategory, searchTerm, page, itemsPerPage, sortBy);
      setNewsItems(data.news);
      setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
      setError(null);
    } catch (err) {
      setError('Failed to load news');
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadNews();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleBookmark = (id: string) => {
    bookmarkNews(id);
    setBookmarkedNews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShare = (newsItem: NewsItem) => {
    shareNews(newsItem);
  };

  const handleRead = (id: string) => {
    markNewsAsRead(id);
    setReadNews(prev => new Set(prev).add(id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Crypto News</h1>
      
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="flex-grow mr-4 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 md:mb-0"
        >
          <FaSearch className="inline mr-2" />
          Search
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'popularity' | 'relevance')}
          className="p-2 rounded bg-gray-700 text-white ml-4"
        >
          <option value="date">Latest</option>
          <option value="popularity">Popular</option>
          <option value="relevance">Relevant</option>
        </select>
      </div>

      <div className="mb-6 overflow-x-auto whitespace-nowrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 mr-2 rounded-full ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : newsItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map(newsItem => (
            <NewsCard 
              key={newsItem.id} 
              newsItem={newsItem} 
              isBookmarked={isNewsBookmarked(newsItem.id)}
              isRead={isNewsRead(newsItem.id)}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onRead={handleRead}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">No news items available.</div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 mr-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Previous
          </button>
          <span className="mx-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 ml-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default News;
