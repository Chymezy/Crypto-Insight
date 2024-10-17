import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

export const handleApiError = (error: unknown): void => {
  if (error instanceof AxiosError) {
    const errorMessage = error.response?.data?.message || error.message;
    toast.error(`Error: ${errorMessage}`);
  } else {
    toast.error('An unexpected error occurred. Please try again later.');
  }
  console.error('API Error:', error);
};