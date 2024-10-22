import api from './api';

export const fetchLatestNews = async (limit: number = 3) => {
  try {
    const response = await api.get(`/news?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};
