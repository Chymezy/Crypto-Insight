import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { updateSettings, updateProfilePicture } from '../../services/userApi';

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  preferredCurrency: string;
  profilePicture: string | null;
}

const initialState: UserSettings = {
  theme: 'light',
  language: 'en',
  preferredCurrency: 'USD',
  profilePicture: null,
};

export const updateUserSettings = createAsyncThunk(
  'userSettings/update',
  async (settings: Partial<UserSettings>, { rejectWithValue }) => {
    try {
      const response = await updateSettings(settings);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update user settings');
    }
  }
);

export const updateUserProfilePicture = createAsyncThunk(
  'userSettings/updateProfilePicture',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await updateProfilePicture(formData);
      return response.profilePicture;
    } catch (error) {
      return rejectWithValue('Failed to update profile picture');
    }
  }
);

const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setPreferredCurrency: (state, action: PayloadAction<string>) => {
      state.preferredCurrency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
      .addCase(updateUserProfilePicture.fulfilled, (state, action) => {
        state.profilePicture = action.payload;
      });
  },
});

export const { setTheme, setLanguage, setPreferredCurrency } = userSettingsSlice.actions;

export const userSettingsReducer = userSettingsSlice.reducer;
