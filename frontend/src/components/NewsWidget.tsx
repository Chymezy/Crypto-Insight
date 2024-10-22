import React, { useEffect, useState } from 'react';
import { FaNewspaper } from 'react-icons/fa';
import { fetchLatestNews } from '../services/newsService'; // Assume this function exists to fetch news data

interface NewsItem {
  id: string;
  title: string;
  date: string;
  url: string;
}

const NewsWidget: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const response = await fetchLatestNews(9); // Fetch 9 news items initially
        console.log('Fetched news data:', response);

        if (response.success && Array.isArray(response.data.news)) {
          const formattedNews = response.data.news.map((item: any) => ({
            id: item.id || String(Math.random()),
            title: item.title || 'No title available',
            date: item.published_on ? new Date(item.published_on * 1000).toLocaleDateString() : 'No date available',
            url: item.url || '#'
          }));
          setNewsItems(formattedNews);
          setDisplayedItems(formattedNews.slice(0, 3)); // Display first 3 items
        } else {
          throw new Error('Invalid news data format');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const handleSeeMore = () => {
    const currentLength = displayedItems.length;
    const newItems = newsItems.slice(currentLength, currentLength + 3);
    setDisplayedItems([...displayedItems, ...newItems]);
  };

  if (loading) {
    return <div className="bg-gray-700 p-6 rounded-lg shadow-lg">Loading news...</div>;
  }

  if (error) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4 flex items-center text-red-500">
          <FaNewspaper className="mr-2" /> Error Loading News
        </h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4 flex items-center">
        <FaNewspaper className="mr-2" /> Latest Crypto News
      </h3>
      {displayedItems.length > 0 ? (
        <>
          <ul>
            {displayedItems.map((item) => (
              <li key={item.id} className="mb-4 pb-4 border-b border-gray-600 last:border-b-0">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.date}</p>
                </a>
              </li>
            ))}
          </ul>
          {displayedItems.length < newsItems.length && (
            <button 
              onClick={handleSeeMore} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              See More
            </button>
          )}
        </>
      ) : (
        <p>No news items available at the moment.</p>
      )}
    </div>
  );
};

export default NewsWidget;
