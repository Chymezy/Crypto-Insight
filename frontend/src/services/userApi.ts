import api from './api';
import { User } from '../types/user.types';

export const updateProfilePicture = async (formData: FormData): Promise<{ success: boolean; profilePicture: string }> => {
  try {
    const response = await api.put('/users/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put('/users/change-password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateWalletAddress = async (type: string, address: string): Promise<void> => {
  await api.post('/wallet/update-address', { type, address });
};

export const upgradePlan = async (planName: string, isAnnual: boolean): Promise<void> => {
  await api.post('/users/upgrade-plan', { planName, isAnnual });
};
