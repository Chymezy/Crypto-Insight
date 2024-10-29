import api from './api';
import { Insight } from '../types/ai.types.ts';

export const getAIInsights = async (): Promise<Insight[]> => {
  const response = await api.get('/ai-insights');
  return response.data;
};
