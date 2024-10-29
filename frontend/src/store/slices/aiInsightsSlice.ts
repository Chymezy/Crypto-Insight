import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as aiApi from '../../services/aiApi';

interface Insight {
  id: string;
  type: 'portfolio' | 'market' | 'opportunity' | 'risk';
  content: string;
}

interface AIInsightsState {
  insights: Insight[];
  loading: boolean;
  error: string | null;
}

const initialState: AIInsightsState = {
  insights: [],
  loading: false,
  error: null,
};

export const fetchAIInsights = createAsyncThunk('aiInsights/fetchAIInsights', async () => {
  return await aiApi.getAIInsights();
});

const aiInsightsSlice = createSlice({
  name: 'aiInsights',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIInsights.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAIInsights.fulfilled, (state, action) => {
        // state.insights = action.payload;
        state.loading = false;
      })
      .addCase(fetchAIInsights.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch AI insights';
        state.loading = false;
      });
  },
});

export default aiInsightsSlice.reducer;
