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

export const getMonthlyData = (
  transactions: Transaction[], 
  year: number, 
  month: number
): { income: number; expenses: number } => {
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

// Fungsi baru untuk mendapatkan data berdasarkan rentang tanggal
export const getDateRangeData = (
  transactions: Transaction[], 
  startDate: Date, 
  endDate: Date
): { income: number; expenses: number } => {
  // Pastikan waktu diatur dengan benar untuk perbandingan tanggal
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const filtered = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  const income = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expenses };
};

// Fungsi untuk mendapatkan data chart berdasarkan rentang bulan
export const getChartData = (
  transactions: Transaction[], 
  monthsCount: number = 6
): { months: string[]; incomeData: number[]; expenseData: number[] } => {
  const months: string[] = [];
  const incomeData: number[] = [];
  const expenseData: number[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const monthData = getMonthlyData(
      transactions,
      date.getFullYear(),
      date.getMonth()
    );

    months.push(date.toLocaleDateString('id-ID', { month: 'short' }));
    incomeData.push(monthData.income / 1000000); // Convert to millions for better chart display
    expenseData.push(monthData.expenses / 1000000);
  }

  return { months, incomeData, expenseData };
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