import { Transaction } from '@/store/transactionSlice';
import { Transfer } from '@/store/balanceSlice';

export const calculateBalance = (
  transactions: Transaction[],
  transfers: Transfer[],
  source: 'Bank' | 'Cash' | 'E-Wallet'
) => {
  // Calculate from transactions
  const transactionBalance = transactions
    .filter(t => t.source === source)
    .reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);

  // Calculate transfer impact
  const transferBalance = transfers.reduce((sum, transfer) => {
    if (transfer.from === source) {
      return sum - transfer.amount;
    } else if (transfer.to === source) {
      return sum + transfer.amount;
    }
    return sum;
  }, 0);

  return transactionBalance + transferBalance;
};

export const getMonthlyData = (transactions: Transaction[], year: number, month: number) => {
  const filtered = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const income = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expenses };
};

export const getCategorySpending = (
  transactions: Transaction[],
  category: string,
  month: string
) => {
  const [year, monthNum] = month.split('-').map(Number);
  
  return transactions
    .filter(t => {
      const date = new Date(t.date);
      return (
        t.type === 'expense' &&
        t.category === category &&
        date.getFullYear() === year &&
        date.getMonth() === monthNum - 1
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
};