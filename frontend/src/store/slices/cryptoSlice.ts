import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Crypto } from '../../types';

interface CryptoState {
  topCryptos: Crypto[];
  loading: boolean;
  error: string | null;
}

const initialState: CryptoState = {
  topCryptos: [],
  loading: false,
  error: null,
};

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
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
});

export const { setTopCryptos, setLoading, setError } = cryptoSlice.actions;
export default cryptoSlice.reducer;
