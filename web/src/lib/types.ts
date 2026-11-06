export type ActivityId = 'study' | 'exercise' | 'socialize' | 'work' | 'apply-job' | 'career';
export type Gender = 'male' | 'female' | 'non-binary';
export type EmploymentType = 'part-time' | 'full-time' | 'flexible';
export type HouseholdArrangement = 'family-supported' | 'shared' | 'independent';
export type SavingsGoalMonths = 1 | 3 | 6;
export type BankAccountType = 'checking' | 'savings' | 'fixed-deposit';
export type FinancialTransactionType = 'account-opened' | 'deposit' | 'withdrawal' | 'transfer' | 'income' | 'expense' | 'interest' | 'loan-issued' | 'loan-payment' | 'loan-interest' | 'card-issued' | 'card-purchase' | 'card-payment' | 'card-interest' | 'recurring-payment' | 'auto-deposit' | 'vault-deposit' | 'vault-withdrawal' | 'investment-buy' | 'investment-sell' | 'property-purchase' | 'property-sale' | 'property-rent' | 'business-start' | 'business-income' | 'business-expense' | 'business-sale' | 'card-load' | 'tax' | 'fee';
export type CardType = 'debit' | 'credit' | 'prepaid';
export type LoanType = 'personal' | 'mortgage' | 'business';
export type PropertyType = 'house' | 'apartment';
export type InvestmentType = 'stock-index' | 'gold';
export type BusinessType = 'retail' | 'online' | 'cafe';
export interface PropertyAsset { id: string; name: string; type: PropertyType; marketValue: number; purchasePrice: number; annualMaintenance: number; mortgageLoanId?: string; rentedOut: boolean; annualRentalIncome: number; }
export interface RentalHome { type: PropertyType; annualRent: number; }
export interface InvestmentHolding { type: InvestmentType; units: number; averageCost: number; }
export interface MarketPrices { stocks: number; gold: number; lastUpdatedYear: number; }
export type EconomicCycle = 'expansion' | 'stable' | 'recession';
export interface EconomicConditions { inflationRate: number; growthRate: number; baseInterestRate: number; cycle: EconomicCycle; costOfLivingIndex: number; lastUpdatedYear: number; }
export interface OwnedBusiness { id: string; name: string; type: BusinessType; investedCapital: number; valuation: number; performance: number; }

export type PaymentSourceType = 'cash' | 'account' | 'card';
export interface BankCard { id: string; name: string; type: CardType; linkedAccountId?: string; creditLimit: number; balance: number; annualInterestRate: number; active: boolean; }
export interface Loan { id: string; name: string; type: LoanType; principal: number; balance: number; annualInterestRate: number; termYears: number; paymentAccountId?: string; active: boolean; }
export interface RecurringPayment { id: string; name: string; amount: number; category: 'subscription' | 'bill'; sourceType: PaymentSourceType; sourceId?: string; active: boolean; startedAtYear: number; }
export interface AutoDepositRule { id: string; targetAccountId: string; method: 'fixed' | 'percentage'; value: number; active: boolean; }

export interface BankAccount {
  id: string;
  name: string;
  type: BankAccountType;
  balance: number;
  annualInterestRate: number;
  openedAtAge: number;
  maturesAtYear?: number;
}
export interface FinancialTransaction {
  id: string;
  year: number;
  age: number;
  type: FinancialTransactionType;
  amount: number;
  description: string;
  from: string;
  to: string;
}
export interface Employment {
  title: string;
  type: EmploymentType;
  annualSalary: number;
  experienceYears: number;
  performance: number;
  promotions: number;
  startedAtAge: number;
}
export interface LifeEvent { id: string; year: number; age: number; title: string; description: string; kind: 'milestone' | 'activity' | 'event'; }
export interface Character {
  name: string; age: number; year: number; health: number; happiness: number;
  intelligence: number; fitness: number; money: number; actionsRemaining: number;
  gender?: Gender; nationality?: string; country?: string; birthplace?: string; language?: string; currency?: string;
  currencyScale?: number; familyBackground?: string; personality?: string[]; education?: string;
  educationProgress?: number; employment?: Employment | null;
  lastYearIncome?: number; lastYearExpenses?: number; lastYearShortfall?: number; lastYearTax?: number; taxBalance?: number;
  householdArrangement?: HouseholdArrangement; savingsGoalMonths?: SavingsGoalMonths | null;
  bankAccounts?: BankAccount[];
  financialTransactions?: FinancialTransaction[];
  cards?: BankCard[];
  loans?: Loan[];
  recurringPayments?: RecurringPayment[];
  autoDepositRules?: AutoDepositRule[];
  vaultBalance?: number;
  properties?: PropertyAsset[];
  primaryResidenceId?: string;
  rentalHome?: RentalHome | null;
  investments?: InvestmentHolding[];
  marketPrices?: MarketPrices;
  economy?: EconomicConditions;
  businesses?: OwnedBusiness[];
  appearance?: { height: string; build: string; hair: string; eyes: string };
  history: LifeEvent[];
}
export type SaveSlotId = 'slot-1' | 'slot-2' | 'slot-3';
export interface SaveSlot { id: SaveSlotId; character: Character | null; updatedAt: number | null; }
export interface SaveData { schemaVersion: number; activeSlotId: SaveSlotId; slots: SaveSlot[]; }
