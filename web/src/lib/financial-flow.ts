import type { FinancialTransactionType } from './types';

export type FinancialFlow = 'income' | 'expense' | null;

const INCOME_TYPES = new Set<FinancialTransactionType>([
  'income', 'interest', 'business-income', 'investment-sell', 'property-sale', 'property-rent'
]);
const EXPENSE_TYPES = new Set<FinancialTransactionType>([
  'expense', 'family-support', 'loan-payment', 'loan-interest', 'card-purchase', 'card-interest',
  'recurring-payment', 'investment-buy', 'property-purchase', 'business-expense', 'tax', 'fee'
]);

export function getFinancialFlow(type: FinancialTransactionType): FinancialFlow {
  if (INCOME_TYPES.has(type)) return 'income';
  if (EXPENSE_TYPES.has(type)) return 'expense';
  return null;
}
