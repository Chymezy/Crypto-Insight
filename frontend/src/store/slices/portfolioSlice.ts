import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPortfolioData, fetchPerformanceData } from '../../services/api';
import { Portfolio, PerformanceData } from '../../types';

interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  performanceData: PerformanceData[];
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  portfolios: [],
  selectedPortfolio: null,
  performanceData: [],
  loading: false,
  error: null,
};

export const fetchPortfoliosThunk = createAsyncThunk(
  'portfolio/fetchPortfolios',
  async () => {
    const response = await fetchPortfolioData();
    return response;
  }
);

export const fetchPerformanceThunk = createAsyncThunk(
  'portfolio/fetchPerformance',
  async ({ portfolioId, timeframe }: { portfolioId: string; timeframe: string }) => {
    const response = await fetchPerformanceData(portfolioId, timeframe);
    return response;
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setSelectedPortfolio: (state, action) => {
      state.selectedPortfolio = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfoliosThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPortfoliosThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolios = Array.isArray(action.payload) ? action.payload : [action.payload];
        state.selectedPortfolio = state.portfolios[0] || null;
      })
      .addCase(fetchPortfoliosThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch portfolios';
      })
      .addCase(fetchPerformanceThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPerformanceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceData = action.payload;
      })
      .addCase(fetchPerformanceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch performance data';
      });
  },
});

export const { setSelectedPortfolio } = portfolioSlice.actions;

export default portfolioSlice.reducer;
