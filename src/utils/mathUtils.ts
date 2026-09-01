import { Expense, Product, ProductPriceRecord } from '../types';

export const formatCurrency = (amount: number, currencySymbol = '$'): string => {
  return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Some units are conventionally priced by a larger "base" unit even when the
// purchased quantity is entered in a smaller one — e.g. milk/oil is priced
// per Liter but a carton is bought as "500 ml", and spices are priced per kg
// but a packet is bought as "250 g". Without this conversion, entering
// quantity=500, unit='ml', unitPrice=15 (meant as ₹15/L) would wrongly
// compute 500 × 15 = 7500 instead of the correct 0.5 × 15 = 7.50.
const UNIT_TO_BASE_FACTOR: Record<string, number> = {
  g: 0.001, gm: 0.001, gms: 0.001, gram: 0.001, grams: 0.001,
  ml: 0.001, millilitre: 0.001, milliliter: 0.001, millilitres: 0.001, milliliters: 0.001
};

// The larger unit a given small unit is priced against (only meaningful for
// g/ml — everything else is priced 1:1 against itself).
const UNIT_TO_BASE_NAME: Record<string, string> = {
  g: 'kg', gm: 'kg', gms: 'kg', gram: 'kg', grams: 'kg',
  ml: 'L', millilitre: 'L', milliliter: 'L', millilitres: 'L', milliliters: 'L'
};

export const getUnitConversionFactor = (unit: string): number => {
  const key = (unit || '').trim().toLowerCase();
  return UNIT_TO_BASE_FACTOR[key] ?? 1;
};

// For UI hints — e.g. showing "≈ ₹/L" next to the unit price field when the
// selected unit is 'ml', so it's clear what the price is actually per.
export const getUnitPriceBasisLabel = (unit: string): string | null => {
  const key = (unit || '').trim().toLowerCase();
  return UNIT_TO_BASE_NAME[key] || null;
};

export const computeLineTotal = (quantity: number, unit: string, unitPrice: number, discount: number = 0): number => {
  const scaledQuantity = quantity * getUnitConversionFactor(unit);
  return Math.max(0, scaledQuantity * unitPrice - discount);
};

// Parses a 'YYYY-MM-DD' (optionally with a time part) string into a LOCAL Date,
// avoiding the classic bug where `new Date('YYYY-MM-DD')` is parsed as UTC
// midnight and then shifts to the previous/next day once converted to the
// browser's local timezone (most noticeable right at month boundaries).
export const parseLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date(NaN);
  const [datePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return new Date(dateString);
  return new Date(year, month - 1, day);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatMonth = (dateString: string): string => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const computePriceHistory = (expenses: Expense[]): ProductPriceRecord[] => {
  const records: ProductPriceRecord[] = [];
  expenses.forEach((expense) => {
    expense.items.forEach((item) => {
      records.push({
        id: `${expense.id}-${item.id}`,
        productId: item.productId,
        productName: item.productName,
        expenseId: expense.id,
        date: expense.date,
        storeId: expense.storeId,
        storeName: expense.storeName,
        platform: expense.platform,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        unit: item.unit
      });
    });
  });
  return records.sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());
};

export const computeProductStats = (productId: string, priceRecords: ProductPriceRecord[]) => {
  const filtered = priceRecords.filter((r) => r.productId === productId);
  if (filtered.length === 0) {
    return {
      totalPurchases: 0,
      totalQuantity: 0,
      avgPrice: 0,
      lowestPrice: 0,
      highestPrice: 0,
      lastPurchasedDate: null,
      records: []
    };
  }

  const prices = filtered.map((r) => r.unitPrice);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const totalQuantity = filtered.reduce((sum, r) => sum + r.quantity, 0);
  const sortedDates = [...filtered].sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
  const lastPurchasedDate = sortedDates[0].date;

  return {
    totalPurchases: filtered.length,
    totalQuantity,
    avgPrice,
    lowestPrice,
    highestPrice,
    lastPurchasedDate,
    records: sortedDates
  };
};
