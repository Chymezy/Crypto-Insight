import { NewsResponse, NewsItem } from '../types/news';
import api from './api';  // Import the main api instance
import { getFromCache, setInCache, invalidateCache } from '../utils/cacheUtils';

export const fetchNews = async (
  category?: string, 
  search?: string, 
  page: number = 1, 
  limit: number = 6,
  sortBy: 'date' | 'popularity' | 'relevance' = 'date'
): Promise<NewsResponse['data']> => {
  const cacheKey = `news_${category || 'all'}_${search || ''}_${page}_${limit}_${sortBy}`;

  const cachedData = getFromCache<NewsResponse['data']>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  let url = `/news?page=${page}&limit=${limit}&sortBy=${sortBy}`;
  if (category) url += `&categories=${category}`;
  if (search) url += `&search=${search}`;
  
  const response = await api.get<NewsResponse>(url);
  const data = response.data.data;

  setInCache(cacheKey, data);
  return data;
};

export const bookmarkNews = (newsId: string): void => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
  if (!bookmarks.includes(newsId)) {
    bookmarks.push(newsId);
    localStorage.setItem('bookmarkedNews', JSON.stringify(bookmarks));
  } else {
    const updatedBookmarks = bookmarks.filter((id: string) => id !== newsId);
    localStorage.setItem('bookmarkedNews', JSON.stringify(updatedBookmarks));
  }
};

export const isNewsBookmarked = (newsId: string): boolean => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
  return bookmarks.includes(newsId);
};

export const markNewsAsRead = (newsId: string): void => {
  const readNews = JSON.parse(localStorage.getItem('readNews') || '[]');
  if (!readNews.includes(newsId)) {
    readNews.push(newsId);
    localStorage.setItem('readNews', JSON.stringify(readNews));
  }
};

export const isNewsRead = (newsId: string): boolean => {
  const readNews = JSON.parse(localStorage.getItem('readNews') || '[]');
  return readNews.includes(newsId);
};

export const shareNews = async (newsItem: NewsItem): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: newsItem.title,
        text: newsItem.body,
        url: newsItem.url,
      });
    } catch (error) {
      console.error('Error sharing news:', error);
    }
  } else {
    // Fallback for browsers that don't support the Web Share API
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${newsItem.title}\n\n${newsItem.url}`)}`;
    window.open(shareUrl, '_blank');
  }
};

export const invalidateNewsCache = () => {
  invalidateCache('latestNews');
};

export const fetchLatestNews = async (limit: number = 5): Promise<NewsItem[]> => {
  const cacheKey = `latest_news_${limit}`;

  const cachedData = getFromCache<NewsItem[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await api.get<NewsResponse>(`/news?limit=${limit}&sortBy=date`);
    const latestNews = response.data.data.news;
    setInCache(cacheKey, latestNews);
    return latestNews;
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
};
