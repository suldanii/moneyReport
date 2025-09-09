import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transfer {
  id: string;
  from: 'Bank' | 'Cash' | 'E-Wallet';
  to: 'Bank' | 'Cash' | 'E-Wallet';
  amount: number;
  date: string;
}

interface BalanceState {
  transfers: Transfer[];
}

const initialState: BalanceState = {
  transfers: [],
};

export const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    addTransfer: (state, action: PayloadAction<Transfer>) => {
      state.transfers.push(action.payload);
    },
    setTransfers: (state, action: PayloadAction<Transfer[]>) => {
      state.transfers = action.payload;
    },
  },
});

export const { addTransfer, setTransfers } = balanceSlice.actions;
export default balanceSlice.reducer;