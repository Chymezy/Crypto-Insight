import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer from './slices/cryptoSlice';
import portfolioReducer from './slices/portfolioSlice';
import { userSettingsReducer } from './slices/userSettingsSlice';
// import alertsReducer from './slices/alertsSlice';
import aiInsightsReducer from './slices/aiInsightsSlice';
import { UserSettings } from '../types/user.types'; // Import UserSettings type

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
    portfolio: portfolioReducer,
    userSettings: userSettingsReducer,
    // alerts: alertsReducer,
    aiInsights: aiInsightsReducer,
  },
});

export interface RootState {
  crypto: ReturnType<typeof cryptoReducer>;
  portfolio: ReturnType<typeof portfolioReducer>;
  userSettings: UserSettings;
  // alerts: ReturnType<typeof alertsReducer>;
  aiInsights: ReturnType<typeof aiInsightsReducer>;
}

export type AppDispatch = typeof store.dispatch;
