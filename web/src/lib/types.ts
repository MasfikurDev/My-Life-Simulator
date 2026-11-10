export type ActivityId = 'study' | 'exercise' | 'socialize' | 'work' | 'apply-job' | 'career';
export type Gender = 'male' | 'female' | 'non-binary';
export type EducationLevel = 'early-learning' | 'primary' | 'lower-secondary' | 'upper-secondary' | 'vocational' | 'associate' | 'bachelor' | 'master' | 'doctorate' | 'professional-specialist';
export interface EducationRecord { id: string; level: EducationLevel; institution: string; field?: string; startedAtAge: number; completedAtAge?: number; status: 'enrolled' | 'completed' | 'paused' | 'withdrawn'; }
export type EducationTaskType = 'study' | 'assignment' | 'exam';
export interface EducationSubject { id: string; name: string; grade: number; }
export interface EducationEnrollment { recordId: string; status: 'enrolled' | 'paused'; programId: string; institution: string; level: EducationLevel; field: string; startedAtAge: number; tuitionPaid: number; weeksCompleted: number; totalWeeks: number; grade: number; attendance: number; weeklyStudyTarget: number; subjects: EducationSubject[]; }
export interface AcademicResult { programId: string; institution: string; level: EducationLevel; field: string; grade: number; completedAtAge: number; outcome: 'completed' | 'failed' | 'withdrawn'; }
export type HealthConditionType = 'burnout' | 'anxiety' | 'common-illness' | 'injury' | 'chronic';
export interface HealthCondition { id: string; type: HealthConditionType; name: string; severity: number; diagnosed: boolean; weeksActive: number; treatment: 'rest' | 'professional-support' | 'medical-care' | 'ongoing-management' | null; }
export interface MedicationCourse { id: string; name: string; weeksRemaining: number; }
export interface MedicalState { conditions: HealthCondition[]; medications: MedicationCourse[]; highStressWeeks: number; lastCheckupWeek?: string; lastTherapyWeek?: string; }
export type CareActionType = 'rest' | 'counselling' | 'medical-checkup' | 'mindfulness';
export interface Qualification { id: string; programId?: string; name: string; category: 'certificate' | 'license' | 'diploma' | 'degree' | 'professional'; issuer: string; field: string; awardedAtAge: number; expiresAtAge?: number; }
export type EmploymentType = 'part-time' | 'full-time' | 'flexible';
export type HouseholdArrangement = 'family-supported' | 'shared' | 'independent';
export type SavingsGoalMonths = 1 | 3 | 6;
export type BankAccountType = 'checking' | 'savings' | 'fixed-deposit';
export type FinancialTransactionType = 'family-support' | 'account-opened' | 'deposit' | 'withdrawal' | 'transfer' | 'income' | 'expense' | 'interest' | 'loan-issued' | 'loan-payment' | 'loan-interest' | 'card-issued' | 'card-purchase' | 'card-payment' | 'card-interest' | 'recurring-payment' | 'auto-deposit' | 'vault-deposit' | 'vault-withdrawal' | 'investment-buy' | 'investment-sell' | 'property-purchase' | 'property-sale' | 'property-rent' | 'business-start' | 'business-income' | 'business-expense' | 'business-sale' | 'card-load' | 'tax' | 'fee';
export type CardType = 'debit' | 'credit' | 'prepaid';
export type LoanType = 'personal' | 'mortgage' | 'business';
export type PropertyType = 'house' | 'apartment';
export type InvestmentType = 'stock-index' | 'technology-stock' | 'energy-stock' | 'government-bond' | 'gold';
export type BusinessType = 'retail' | 'online' | 'cafe';
export interface PropertyAsset { id: string; name: string; type: PropertyType; marketValue: number; purchasePrice: number; annualMaintenance: number; mortgageLoanId?: string; rentedOut: boolean; annualRentalIncome: number; expectedGrowthRate?: number; marketVolatility?: number; }
export interface RentalHome { type: PropertyType; annualRent: number; }
export interface InvestmentHolding { type: InvestmentType; units: number; averageCost: number; }
export interface MarketPrices { stocks: number; technology?: number; energy?: number; bonds?: number; gold: number; lastUpdatedYear: number; }
export type EconomicCycle = 'expansion' | 'stable' | 'recession';
export interface EconomicConditions { inflationRate: number; growthRate: number; baseInterestRate: number; cycle: EconomicCycle; costOfLivingIndex: number; lastUpdatedYear: number; }
export interface OwnedBusiness { id: string; name: string; type: BusinessType; investedCapital: number; valuation: number; performance: number; }

export type PaymentSourceType = 'cash' | 'account' | 'card';
export interface BankCard { id: string; name: string; type: CardType; linkedAccountId?: string; creditLimit: number; balance: number; annualInterestRate: number; active: boolean; productId?: string; rewardsRate?: number; rewardBalance?: number; }
export interface Loan { id: string; name: string; type: LoanType; principal: number; balance: number; annualInterestRate: number; termYears: number; paymentAccountId?: string; active: boolean; }
export interface RecurringPayment { id: string; name: string; amount: number; category: 'subscription' | 'bill'; sourceType: PaymentSourceType; sourceId?: string; active: boolean; startedAtYear: number; }
export interface OwnedLifestyleItem { id: string; productId: string; name: string; category: string; description: string; quantity: number; purchasedAtYear: number; kind: 'usable' | 'permanent'; styleScore?: number; formality?: number; condition?: number; equipped?: boolean; }
export type SocialConnectionType = 'friend' | 'partner' | 'child' | 'extended-family';
export interface SocialConnection { id: string; name: string; type: SocialConnectionType; closeness: number; active: boolean; livesWithPlayer: boolean; supportLevel: 'occasional' | 'regular' | 'strong'; }
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
  date?: string;
  type: FinancialTransactionType;
  amount: number;
  description: string;
  from: string;
  to: string;
}
export type CareerPathId = 'customer-service' | 'operations' | 'technology' | 'sales';
export type JobApplicationStatus = 'interview' | 'rejected' | 'offered' | 'accepted' | 'declined' | 'expired';
export interface Employment {
  title: string;
  type: EmploymentType;
  annualSalary: number;
  experienceYears: number;
  performance: number;
  promotions: number;
  startedAtAge: number;
  roleId?: string;
  careerPathId?: CareerPathId;
  employer?: string;
  level?: number;
  startedAtDate?: string;
}
export interface JobApplication {
  id: string;
  listingId: string;
  roleId: string;
  title: string;
  employer: string;
  type: EmploymentType;
  annualSalary: number;
  appliedAt: string;
  status: JobApplicationStatus;
  outcome?: string;
}
export interface JobOffer {
  id: string;
  applicationId: string;
  roleId: string;
  title: string;
  employer: string;
  type: EmploymentType;
  annualSalary: number;
  issuedAt: string;
  expiresAt: string;
}
export interface PromotionOffer {
  roleId: string;
  title: string;
  annualSalary: number;
  issuedAt: string;
  expiresAt: string;
}

export interface GameEventEffects {
  money?: number;
  health?: number;
  happiness?: number;
  intelligence?: number;
  fitness?: number;
}
export interface ScheduledGameConsequence {
  id: string;
  dueYear: number;
  title: string;
  description: string;
  effects: GameEventEffects;
}
export type DecisionTreeId = 'life' | 'education' | 'career' | 'relationships' | 'health' | 'finance';
export interface DecisionTreeBranch {
  choiceId: string;
  label: string;
  detail: string;
  rewards: GameEventEffects;
  followUp?: { title: string; description: string };
}
export interface DecisionTreeRecord {
  id: string;
  treeId: DecisionTreeId;
  eventId: string;
  title: string;
  description: string;
  age: number;
  year: number;
  chosenChoiceId: string;
  chosenLabel: string;
  branches: DecisionTreeBranch[];
}
export interface GameEventFollowUp {
  delayYears: number;
  title: string;
  description: string;
  effects: GameEventEffects;
}
export interface FamilyBondEffect { personId: string; closeness: number; trust: number; tension: number; }
export interface GameEventChoice {
  id: string;
  label: string;
  detail: string;
  staminaCost: number;
  moneyCost: number;
  effects: GameEventEffects;
  familyBondEffect?: FamilyBondEffect;
  followUp?: GameEventFollowUp;
}
export interface PendingGameEvent {
  id: string;
  title: string;
  description: string;
  category: 'opportunity' | 'challenge' | 'personal';
  choices: GameEventChoice[];
}

export interface LifeEvent { id: string; year: number; age: number; date?: string; title: string; description: string; kind: 'milestone' | 'activity' | 'event'; }
export type FamilyRelationshipType = 'parent' | 'guardian' | 'sibling' | 'partner' | 'adoptive-parent' | 'step-parent';
export type FamilyHistoryType = 'background' | 'interaction' | 'support' | 'relationship-change' | 'milestone';
export interface FamilyPerson {
  id: string;
  name: string;
  gender?: Gender;
  birthYear: number;
  deathYear?: number;
}
export interface FamilyRelationship {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: FamilyRelationshipType;
  startedAtYear: number;
  endedAtYear?: number;
}
export interface FamilyBond {
  personId: string;
  closeness: number;
  trust: number;
  tension: number;
  lastInteractionYear: number | null;
  supportProvidedTotal: number;
}
export interface FamilyHistoryEntry {
  id: string;
  year: number;
  type: FamilyHistoryType;
  title: string;
  description: string;
  personIds: string[];
}
export interface FamilyState {
  version: 1;
  playerPersonId: string;
  people: FamilyPerson[];
  relationships: FamilyRelationship[];
  bonds: FamilyBond[];
  householdMemberIds: string[];
  dependentPersonIds: string[];
  primaryGuardianId?: string;
  history: FamilyHistoryEntry[];
  lastSimulatedYear: number;
}
export interface GameCalendar {
  /** ISO 8601 date representing the first day of the active game week. */
  currentDate: string;
  /** ISO 8601 date of birth; age is derived from this and currentDate. */
  birthDate: string;
}
export type PlannedAction =
  | { kind: 'activity' }
  | { kind: 'family'; personId: string; interaction: 'spend-time' | 'reach-out' | 'reconcile' | 'provide-support'; supportAmount?: number }
  | { kind: 'business'; businessId: string }
  | { kind: 'event'; eventId: string; choiceId: string; staminaCost: number }
  | { kind: 'work'; workAction: 'apply' | 'interview'; jobId: string; title: string }
  | { kind: 'education'; taskType: EducationTaskType }
  | { kind: 'care'; careType: CareActionType }
  | { kind: 'food'; productId: string; name: string; quantity: number; purchaseCost: number; staminaRecovery: number; health: number; happiness: number; stress: number; comfort?: number }
  | { kind: 'social'; connectionId: string; interaction: 'spend-time' };

export interface PlannedActivity {
  id: string;
  activityId: ActivityId | 'family' | 'business' | 'event' | 'healthcare' | 'food';
  action: PlannedAction;
}
export interface WeeklyPlan {
  version: 1;
  activities: PlannedActivity[];
}
export interface Character {
  /** Optional per-stat development potential (50–100); absent on older saves. */
  statPotential?: Partial<Record<'health' | 'happiness' | 'intelligence' | 'fitness' | 'stamina' | 'focus' | 'confidence' | 'discipline' | 'creativity' | 'socialSkills' | 'comfort', number>>;
  name: string; age: number; year: number; health: number; happiness: number;
  intelligence: number; fitness: number; money: number;
  /** Ability/condition stats use 0–100; stress is inverse (lower is better). */
  stamina: number; focus: number; confidence: number; discipline: number; creativity: number; socialSkills: number; stress: number;
  comfort?: number;
  familyCulture?: 'supportive' | 'structured' | 'strained' | 'neglectful';
  socialConnections?: SocialConnection[];
  calendar: GameCalendar;
  weeklyPlan: WeeklyPlan;
  lastResolvedWeekStart?: string;
  lastWeekRecap?: string[];
  gender?: Gender; nationality?: string; country?: string; birthplace?: string; language?: string; currency?: string;
  currencyScale?: number; familyBackground?: string; personality?: string[]; education?: string;
  educationProgress?: number; educationLevel?: EducationLevel; educationRecords?: EducationRecord[]; qualifications?: Qualification[]; educationEnrollment?: EducationEnrollment | null; academicHistory?: AcademicResult[]; medicalState?: MedicalState; employment?: Employment | null;
  careerExperienceYears?: number; careerPathId?: CareerPathId; skills?: Record<string, number>; jobApplications?: JobApplication[]; jobOffers?: JobOffer[]; promotionOffer?: PromotionOffer | null;
  lastYearIncome?: number; lastYearExpenses?: number; lastYearShortfall?: number; lastYearTax?: number; taxBalance?: number;
  householdArrangement?: HouseholdArrangement; savingsGoalMonths?: SavingsGoalMonths | null;
  bankAccounts?: BankAccount[];
  financialTransactions?: FinancialTransaction[];
  cards?: BankCard[];
  loans?: Loan[];
  recurringPayments?: RecurringPayment[];
  ownedLifestyleItems?: OwnedLifestyleItem[];
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
  pendingGameEvent?: PendingGameEvent | null;
  decisionTreeHistory?: DecisionTreeRecord[];
  eventPreparedYear?: number;
  resolvedGameEventIds?: string[];
  scheduledGameConsequences?: ScheduledGameConsequence[];
  lastYearRecap?: string[];
  family?: FamilyState;
  history: LifeEvent[];
}
export type SaveSlotId = 'slot-1' | 'slot-2' | 'slot-3';
export interface SaveSlot { id: SaveSlotId; character: Character | null; updatedAt: number | null; }
export interface SaveData { schemaVersion: number; activeSlotId: SaveSlotId; slots: SaveSlot[]; }
