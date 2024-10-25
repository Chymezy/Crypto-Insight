import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer from './slices/cryptoSlice';
import portfolioReducer from './slices/portfolioSlice';
import userSettingsReducer from './slices/userSettingsSlice';

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
    portfolio: portfolioReducer,
    userSettings: userSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
