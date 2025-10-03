import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setExpenses } from '@/store/expenseSlice';
import { loadExpenses, saveExpenses } from '@/utils/storage';

export const useExpenses = () => {
  const dispatch = useDispatch();
  const expenses = useSelector((state: RootState) => state.expense.expenses);

  // Load expenses dari storage saat hook pertama kali digunakan
  useEffect(() => {
    const loadExpensesData = async () => {
      try {
        const storedExpenses = await loadExpenses();
        if (storedExpenses.length > 0) {
          dispatch(setExpenses(storedExpenses));
        } else {
          // Jika tidak ada data di storage, simpan default expenses
          await saveExpenses(expenses);
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
      }
    };

    loadExpensesData();
  }, [dispatch]);

  // Simpan expenses ke storage setiap kali berubah
  useEffect(() => {
    const saveExpensesData = async () => {
      try {
        await saveExpenses(expenses);
      } catch (error) {
        console.error('Error saving expenses:', error);
      }
    };

    saveExpensesData();
  }, [expenses]);

  return expenses;
};