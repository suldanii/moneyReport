export const formatNumber = (value: string | number): string => {
  const numStr = value.toString().replace(/[^\d]/g, '');
  if (!numStr) return '';
  
  return new Intl.NumberFormat('id-ID').format(parseInt(numStr, 10));
};

export const parseFormattedNumber = (formattedValue: string): number => {
  return parseInt(formattedValue.replace(/[^\d]/g, ''), 10) || 0;
};

export const formatCurrency = (amount: number): string => {
  return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
};