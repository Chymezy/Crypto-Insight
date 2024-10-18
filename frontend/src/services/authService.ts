import { post } from './api';

// ... existing auth functions ...

// Add these new functions at the end of the file

export const forgotPassword = async (email: string) => {
  const response = await post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email: string, token: string, newPassword: string) => {
  const response = await post('/auth/reset-password', { email, token, newPassword });
  return response.data;
};
