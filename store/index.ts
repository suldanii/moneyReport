import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './transactionSlice';
import budgetReducer from './budgetSlice';
import balanceReducer from './balanceSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionReducer,
    budget: budgetReducer,
    balance: balanceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;