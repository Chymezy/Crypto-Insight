import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Crypto } from '../../types';
import { fetchTopCryptos as fetchTopCryptosAPI } from '../../services/api';

export const fetchTopCryptos = createAsyncThunk(
  'crypto/fetchTopCryptos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchTopCryptosAPI();
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch top cryptocurrencies');
    }
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState: {
    topCryptos: [] as Crypto[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setTopCryptos: (state, action: PayloadAction<Crypto[]>) => {
      state.topCryptos = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopCryptos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopCryptos.fulfilled, (state, action) => {
        state.loading = false;
        state.topCryptos = action.payload;
      })
      .addCase(fetchTopCryptos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export const { setTopCryptos, setLoading, setError } = cryptoSlice.actions;
export default cryptoSlice.reducer;
