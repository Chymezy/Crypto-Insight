import { NewsResponse } from '../types/news';
import api from './api';
import { getFromCache, setInCache, invalidateCacheStartingWith } from '../utils/cacheUtils';

export const fetchNews = async (category?: string, search?: string, page: number = 1, limit: number = 6): Promise<NewsResponse['data']> => {
  const cacheKey = `news_${category || 'all'}_${search || ''}_${page}_${limit}`;

  const cachedData = getFromCache<NewsResponse['data']>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  let url = `/news?page=${page}&limit=${limit}`;
  if (category) url += `&categories=${category}`;
  if (search) url += `&search=${search}`;
  
  const response = await api.get<NewsResponse>(url);
  const data = response.data.data;

  setInCache(cacheKey, data);
  return data;
};

export const searchNews = async (query: string): Promise<NewsResponse['data']> => {
  return fetchNews(undefined, query);
};

export const invalidateNewsCache = () => {
  invalidateCacheStartingWith('news_');
};
