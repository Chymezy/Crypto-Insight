import { NewsResponse } from '../types/news';
import api from './api';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache: { [key: string]: { data: NewsResponse['data']; timestamp: number } } = {};

const isCacheValid = (key: string) => {
  const cached = cache[key];
  return cached && Date.now() - cached.timestamp < CACHE_DURATION;
};

export const fetchNews = async (category?: string, search?: string, page: number = 1, limit: number = 10): Promise<NewsResponse['data']> => {
  const cacheKey = `news_${category || 'all'}_${search || ''}_${page}_${limit}`;

  if (isCacheValid(cacheKey)) {
    return cache[cacheKey].data;
  }

  let url = `/news?page=${page}&limit=${limit}`;
  if (category) url += `&categories=${category}`;
  if (search) url += `&search=${search}`;
  
  const response = await api.get<NewsResponse>(url);
  const data = response.data.data;

  cache[cacheKey] = { data, timestamp: Date.now() };
  return data;
};

export const searchNews = async (query: string): Promise<NewsResponse['data']> => {
  return fetchNews(undefined, query);
};
