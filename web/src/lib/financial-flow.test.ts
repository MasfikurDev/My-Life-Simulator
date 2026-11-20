import { describe, expect, it } from 'vitest';
import { getFinancialFlow } from './financial-flow';

describe('financial transaction flow classification', () => {
  it('classifies rental receipts as income rather than rent paid', () => {
    expect(getFinancialFlow('property-rent')).toBe('income');
    expect(getFinancialFlow('income')).toBe('income');
    expect(getFinancialFlow('recurring-payment')).toBe('expense');
    expect(getFinancialFlow('expense')).toBe('expense');
    expect(getFinancialFlow('transfer')).toBeNull();
  });
});
