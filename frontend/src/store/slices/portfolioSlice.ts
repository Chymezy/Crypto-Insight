import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as portfolioApi from '../../services/portfolioApi';
import { Portfolio, PortfolioPerformance } from '../../types/portfolio.types';

interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  performanceData: PortfolioPerformance | null;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  portfolios: [], // This should be an empty array, not null or undefined
  selectedPortfolio: null,
  performanceData: null,
  loading: false,
  error: null,
};

export const fetchPortfolios = createAsyncThunk(
  'portfolio/fetchPortfolios',
  async (_, { rejectWithValue }) => {
    try {
      return await portfolioApi.fetchPortfolios();
    } catch (error) {
      return rejectWithValue('Failed to fetch portfolios');
    }
  }
);

export const createPortfolio = createAsyncThunk(
  'portfolio/createPortfolio',
  async ({ name, description }: { name: string; description: string }, { rejectWithValue }) => {
    try {
      return await portfolioApi.createPortfolio(name, description);
    } catch (error) {
      return rejectWithValue('Failed to create portfolio');
    }
  }
);

export const updatePortfolio = createAsyncThunk(
  'portfolio/updatePortfolio',
  async ({ portfolioId, name, description }: { portfolioId: string; name: string; description: string }, { rejectWithValue }) => {
    try {
      return await portfolioApi.updatePortfolio(portfolioId, name, description);
    } catch (error) {
      return rejectWithValue('Failed to update portfolio');
    }
  }
);

export const deletePortfolio = createAsyncThunk(
  'portfolio/deletePortfolio',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      await portfolioApi.deletePortfolio(portfolioId);
      return portfolioId;
    } catch (error) {
      return rejectWithValue('Failed to delete portfolio');
    }
  }
);

export const fetchPerformance = createAsyncThunk(
  'portfolio/fetchPerformance',
  async ({ portfolioId, timeframe }: { portfolioId: string; timeframe: string }, { rejectWithValue }) => {
    try {
      return await portfolioApi.fetchPortfolioPerformance(portfolioId, timeframe);
    } catch (error) {
      return rejectWithValue('Failed to fetch performance data');
    }
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setSelectedPortfolio: (state, action: PayloadAction<Portfolio | null>) => {
      state.selectedPortfolio = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolios = action.payload;
        state.selectedPortfolio = state.portfolios[0] || null;
      })
      .addCase(fetchPortfolios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.portfolios.push(action.payload);
      })
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        const index = state.portfolios.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.portfolios[index] = action.payload;
        }
        if (state.selectedPortfolio?.id === action.payload.id) {
          state.selectedPortfolio = action.payload;
        }
      })
      .addCase(deletePortfolio.fulfilled, (state, action) => {
        state.portfolios = state.portfolios.filter(p => p.id !== action.payload);
        if (state.selectedPortfolio?.id === action.payload) {
          state.selectedPortfolio = state.portfolios[0] || null;
        }
      })
      .addCase(fetchPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceData = action.payload;
      })
      .addCase(fetchPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedPortfolio, clearError } = portfolioSlice.actions;

export default portfolioSlice.reducer;
