import { describe, expect, it } from 'vitest';
import { advanceYear, getAnnualReview, buyProperty, canAffordActivity, closeBusiness, createCharacter, depositToAccount, formatCharacterMoney, generateRandomCharacter, getActivityCost, getAnnualTaxEstimate, getCreditScore, getEconomicConditions, getHouseholdBudget, getMinimumLoanRate, getNetWorth, manageBusiness, moveIntoOwnedProperty, openBankAccount, performActivity, rentHome, sellProperty, setHouseholdArrangement, setPropertyRental, setSavingsGoalMonths, startBusiness, tradeInvestment, transferBetweenAccounts, withdrawFromAccount } from './simulation';
import { getAvailableActivityIds, getLifeStage } from './progression';
import { loadPrepaidCard } from './simulation';
import { addRecurringPayment, depositToVault, issueBankCard, makeAccountPurchase, makeCardPurchase, makeCashPurchase, payCreditCard, repayLoan, setAutoDeposit, takeLoan, withdrawFromVault } from './simulation';
import { createGameDebugSnapshot } from './debug-export';
import { prepareGameEvent, resolveGameEvent } from './events';

describe('life simulation', () => {
  it('calculates age- and currency-scaled activity costs', () => {
    const adult = { ...createCharacter('Adult', 18), currencyScale: 100, money: 3500 };
    const child = { ...createCharacter('Child', 12), currencyScale: 100, money: 0 };
    expect(getActivityCost(adult, 'study')).toBe(3500);
    expect(getActivityCost(adult, 'socialize')).toBe(2000);
    expect(getActivityCost(child, 'study')).toBe(0);
    expect(canAffordActivity(adult, 'study')).toBe(true);
    expect(canAffordActivity({ ...adult, money: 3499 }, 'study')).toBe(false);
  });
  it('rejects paid activities when the balance is insufficient', () => {
    const adult = { ...createCharacter('Adult', 30), money: 10, currencyScale: 1 };
    const study = performActivity(adult, 'study');
    const social = performActivity(adult, 'socialize');
    expect(study).toBe(adult);
    expect(social).toBe(adult);
    expect(adult.actionsRemaining).toBe(3);
  });
  it('charges the exact cost when a paid activity is affordable', () => {
    const adult = { ...createCharacter('Adult', 30), money: 35, currencyScale: 1 };
    const next = performActivity(adult, 'study');
    expect(next.money).toBe(0);
    expect(next.actionsRemaining).toBe(2);
    expect(next.intelligence).toBe(adult.intelligence + 5);
  });
  it('previews predictable annual income and living costs without mutating the save', () => {
    const employed = {
      ...createCharacter('Planner', 30),
      money: 5000,
      employment: { title: 'Worker', type: 'full-time' as const, annualSalary: 20000, experienceYears: 1, performance: 60, promotions: 0, startedAtAge: 25 },
      householdArrangement: 'family-supported' as const
    };
    const before = structuredClone(employed);
    const review = getAnnualReview(employed);
    expect(review.currentYear).toBe(employed.year);
    expect(review.nextAge).toBe(31);
    expect(review.annualIncome).toBe(20000);
    expect(review.estimatedLivingCosts).toBe(getHouseholdBudget(employed).total);
    expect(review.projectedCashBeforeOtherSettlements).toBe(Math.max(0, employed.money + 20000 - review.estimatedLivingCosts));
    expect(review.pendingEventTitle).toBe(employed.pendingGameEvent?.title ?? null);
    expect(employed).toEqual(before);
  });

  it('creates a character with a starting history', () => {
    const c = createCharacter('Sam');
    expect(c.name).toBe('Sam'); expect(c.age).toBe(18); expect(c.actionsRemaining).toBe(3);
    expect(c.history).toHaveLength(1);
  });
  it('supports birth, teen, adult and later-life starts', () => {
    expect(createCharacter('Newborn', 0).age).toBe(0);
    expect(createCharacter('Teen', 16).money).toBeGreaterThan(0);
    expect(createCharacter('Older', 60).age).toBe(60);
    expect(createCharacter('Older', 60).money).toBeGreaterThan(0);
  });
  it('keeps paid work unavailable before age 16', () => {
    const child = createCharacter('Sam', 10);
    expect(performActivity(child, 'work')).toBe(child);
    expect(performActivity(child, 'study').money).toBe(0);
  });
  it('applies activity effects and consumes an action', () => {
    const c = createCharacter('Sam'); const next = performActivity(c, 'exercise');
    expect(next.fitness).toBe(c.fitness + 6); expect(next.actionsRemaining).toBe(2);
  });
  it('blocks activities when the yearly budget is empty', () => {
    const c = { ...createCharacter('Sam'), actionsRemaining: 0 };
    expect(performActivity(c, 'work')).toBe(c);
  });
  it('advances age and refreshes actions only when requested', () => {
    const next = advanceYear(createCharacter('Sam'));
    expect(next.age).toBe(19); expect(next.year).toBe(2027); expect(next.actionsRemaining).toBe(3);
  });
  it('offers an age-appropriate school event and records a meaningful choice', () => {
    const student = createCharacter('Student', 12);
    expect(student.pendingGameEvent?.id).toBe('school-reading-circle');
    const before = student.intelligence;
    const joined = resolveGameEvent(student, 'join');
    expect(joined.pendingGameEvent).toBeNull();
    expect(joined.actionsRemaining).toBe(student.actionsRemaining - 1);
    expect(joined.intelligence).toBe(before + 3);
    expect(joined.scheduledGameConsequences).toHaveLength(1);
    expect(joined.scheduledGameConsequences![0].dueYear).toBe(student.year + 1);
    expect(joined.history[0].title).toContain('reading circle');
  });

  it('resolves a delayed event consequence in the following year', () => {
    const student = createCharacter('Student', 12);
    const joined = resolveGameEvent(student, 'join');
    const intelligenceAfterChoice = joined.intelligence;
    const nextYear = advanceYear(joined);
    expect(nextYear.intelligence).toBe(intelligenceAfterChoice + 2);
    expect(nextYear.scheduledGameConsequences).toHaveLength(0);
    expect(nextYear.history.some((item) => item.title === 'Your reading paid off')).toBe(true);
  });

  it('lets an unanswered situation pass cleanly when the player advances the year', () => {
    const student = createCharacter('Student', 12);
    const nextYear = advanceYear(student);
    expect(nextYear.pendingGameEvent).toBeNull();
    expect(nextYear.resolvedGameEventIds).toContain('school-reading-circle');
    expect(nextYear.history.some((item) => item.title === 'Opportunity passed')).toBe(true);
  });

  it('rejects event choices that exceed available time or money', () => {
    const adult = {
      ...createCharacter('Adult', 30),
      health: 100,
      money: 0,
      pendingGameEvent: null,
      eventPreparedYear: undefined
    };
    const withEvent = prepareGameEvent(adult);
    expect(withEvent.pendingGameEvent?.id).toBe('adult-side-project');
    expect(resolveGameEvent(withEvent, 'take-part')).toBe(withEvent);
  });

  it('records a year recap and prepares the next age-appropriate situation', () => {
    const student = createCharacter('Student', 12);
    const nextYear = advanceYear(resolveGameEvent(student, 'join'));
    expect(nextYear.lastYearRecap?.length).toBeGreaterThan(0);
    expect(nextYear.eventPreparedYear).toBe(nextYear.year);
    expect(nextYear.pendingGameEvent).toBeNull();
  });

  it('maps each age into a gradual life stage', () => {
    expect(getLifeStage(0).id).toBe('infant'); expect(getLifeStage(3).id).toBe('preschool');
    expect(getLifeStage(6).id).toBe('childhood'); expect(getLifeStage(13).id).toBe('early-teen');
    expect(getLifeStage(16).id).toBe('older-teen'); expect(getLifeStage(18).id).toBe('young-adult');
    expect(getLifeStage(25).id).toBe('adult'); expect(getLifeStage(45).id).toBe('midlife'); expect(getLifeStage(65).id).toBe('senior');
  });
  it('enforces activity age gates in the catalogue and simulation', () => {
    expect(getAvailableActivityIds(2)).toEqual(['exercise', 'socialize']);
    expect(getAvailableActivityIds(15)).not.toContain('work'); expect(getAvailableActivityIds(16)).toContain('work');
    const toddler = createCharacter('Sam', 2);
    expect(performActivity(toddler, 'study')).toBe(toddler); expect(performActivity(toddler, 'work')).toBe(toddler);
  });
  it('unlocks school stages, part-time work and adult jobs at the right ages', () => {
    expect(performActivity(createCharacter('Child', 15), 'apply-job', () => 0).employment).toBeNull();
    const teen = { ...createCharacter('Teen', 16), currencyScale: 1 };
    const partTime = performActivity(teen, 'apply-job', () => 0);
    expect(partTime.employment?.type).toBe('part-time');
    expect(partTime.employment?.annualSalary).toBe(5000);
    expect(getAvailableActivityIds(16, partTime.employment)).toContain('career');
    expect(getAvailableActivityIds(16, partTime.employment)).not.toContain('apply-job');
    const adult = { ...createCharacter('Adult', 18), currencyScale: 1 };
    const fullTime = performActivity(adult, 'apply-job', () => 0);
    expect(fullTime.employment?.type).toBe('full-time');
    expect(fullTime.employment?.annualSalary).toBe(18000);
    expect(getAvailableActivityIds(18, fullTime.employment)).toContain('apply-job');
  });
  it('allows higher education to unlock a better-qualified role', () => {
    const learner = { ...createCharacter('Learner', 18), education: 'Secondary education completed', educationProgress: 80, currencyScale: 1, money: 1000 };
    const graduate = performActivity(learner, 'study');
    expect(graduate.education).toBe('Higher education');
    expect(graduate.educationProgress).toBe(0);
    const hired = performActivity(graduate, 'apply-job', () => 0);
    expect(hired.employment?.title).toBe('Professional associate');
    expect(hired.employment?.annualSalary).toBe(28000);
  });
  it('credits annual salary and living costs when the year advances', () => {
    const worker = {
      ...createCharacter('Worker', 30),
      money: 100,
      employment: { title: 'Operations associate', type: 'full-time' as const, annualSalary: 10000, experienceYears: 0, performance: 60, promotions: 0, startedAtAge: 30 }
    };
    const next = advanceYear(worker);
    expect(next.money).toBe(100 + 10000 - next.lastYearExpenses!);
    expect(next.lastYearIncome).toBe(10000);
    expect(next.lastYearExpenses).toBe(Math.round(1500 * getEconomicConditions(next).costOfLivingIndex));
    expect(next.history.some((item) => item.title === 'Household budget settled')).toBe(true);
    expect(next.history.some((item) => item.title === 'Annual pay received')).toBe(true);
  });
  it('promotes experienced employees after sustained high performance', () => {
    const worker = {
      ...createCharacter('Worker', 30),
      employment: { title: 'Operations associate', type: 'full-time' as const, annualSalary: 10000, experienceYears: 1, performance: 90, promotions: 0, startedAtAge: 30 }
    };
    const next = advanceYear(worker);
    expect(next.employment?.title).toBe('Senior Operations associate');
    expect(next.employment?.annualSalary).toBe(12000);
    expect(next.employment?.promotions).toBe(1);
    expect(next.history.some((item) => item.title === 'Promoted at work')).toBe(true);
  });
  it('improves job performance through career development', () => {
    const worker = {
      ...createCharacter('Worker', 30),
      employment: { title: 'Operations associate', type: 'full-time' as const, annualSalary: 10000, experienceYears: 0, performance: 60, promotions: 0, startedAtAge: 30 }
    };
    const next = performActivity(worker, 'career');
    expect(next.employment?.performance).toBe(72);
    expect(next.actionsRemaining).toBe(2);
  });
  it('updates education status when a character crosses school-age boundaries', () => {
    expect(advanceYear(createCharacter('Child', 5)).education).toBe('Primary education');
    expect(advanceYear(createCharacter('Teen', 12)).education).toBe('Secondary education');
    expect(advanceYear(createCharacter('Teen', 17)).education).toBe('Secondary education completed');
  });
  it('creates a portable debug snapshot with full gameplay history', () => {
    const character = createCharacter('Sam', 18);
    const snapshot = createGameDebugSnapshot(character, 'slot-2', new Date('2026-11-06T00:00:00.000Z'));
    expect(snapshot.format).toBe('my-life-simulator-debug'); expect(snapshot.saveSlotId).toBe('slot-2');
    expect(snapshot.character.history).toEqual(character.history); expect(snapshot).not.toHaveProperty('deviceId');
  });
  it('generates a coherent identity and matching currency from the same country profile', () => {
    const c = generateRandomCharacter(18, () => 0);
    expect(c.nationality).toBe('Bangladeshi'); expect(c.country).toBe('Bangladesh');
    expect(c.birthplace).toBe('Dhaka'); expect(c.currency).toBe('BDT');
    expect(c.name).toBe('Adnan Ahmed'); expect(c.gender).toBe('male');
  });
  it('uses local family-name order and language for Japanese characters', () => {
    const values = Array(48).fill(0); values[0] = 0.66;
    const c = generateRandomCharacter(18, () => values.shift() ?? 0);
    expect(c.nationality).toBe('Japanese');
    expect(c.country).toBe('Japan');
    expect(c.birthplace).toBe('Tokyo');
    expect(c.language).toBe('Japanese');
    expect(c.name).toBe('Aoki Akira');
    expect(c.currency).toBe('JPY');
  });
  it('uses non-binary name pools without changing ability distributions', () => {
    const values = [0, 0.99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let i = 0; const c = generateRandomCharacter(18, () => values[i++ % values.length]);
    expect(c.gender).toBe('non-binary'); expect(c.name).toBe('Ari Ahmed'); expect(c.personality).toHaveLength(2);
    for (const key of ['health','happiness','intelligence','fitness'] as const) expect(c[key]).toBeGreaterThanOrEqual(25);
  });
  it('does not derive ability or personality from gender identity', () => {
    const maleValues = Array(48).fill(0);
    const neutralValues = Array(48).fill(0); neutralValues[1] = 0.99;
    const male = generateRandomCharacter(30, () => maleValues.shift() ?? 0);
    const nonBinary = generateRandomCharacter(30, () => neutralValues.shift() ?? 0);
    expect(male.gender).toBe('male'); expect(nonBinary.gender).toBe('non-binary');
    expect([nonBinary.health, nonBinary.happiness, nonBinary.intelligence, nonBinary.fitness, nonBinary.personality])
      .toEqual([male.health, male.happiness, male.intelligence, male.fitness, male.personality]);
  });
  it('does not derive ability or personality from nationality', () => {
    const localValues = Array(48).fill(0);
    const otherCountryValues = Array(48).fill(0); otherCountryValues[0] = 0.99;
    const local = generateRandomCharacter(30, () => localValues.shift() ?? 0);
    const otherCountry = generateRandomCharacter(30, () => otherCountryValues.shift() ?? 0);
    expect(local.nationality).not.toBe(otherCountry.nationality);
    expect([otherCountry.health, otherCountry.happiness, otherCountry.intelligence, otherCountry.fitness, otherCountry.personality])
      .toEqual([local.health, local.happiness, local.intelligence, local.fitness, local.personality]);
  });
  it('keeps children without personal money and scales money with local currency', () => {
    const child = generateRandomCharacter(6, () => 0);
    expect(child.money).toBe(0); expect(child.currency).toBe('BDT');
    const adult = generateRandomCharacter(30, () => 0);
    expect(adult.money).toBeGreaterThan(850);
  });
  it('formats each character using their own currency', () => {
    const c = { ...generateRandomCharacter(18, () => 0), money: 1000 };
    expect(formatCharacterMoney(c)).toContain('৳');
  });
  it('calculates age-gated household costs for each living arrangement', () => {
    const adult = { ...createCharacter('Adult', 30), currencyScale: 1, employment: null };
    expect(getHouseholdBudget({ ...adult, age: 17 }).total).toBe(0);
    expect(getHouseholdBudget({ ...adult, householdArrangement: 'family-supported' }).total).toBe(2700);
    expect(getHouseholdBudget({ ...adult, householdArrangement: 'shared' }).total).toBe(6840);
    expect(getHouseholdBudget({ ...adult, householdArrangement: 'independent' }).total).toBe(10440);
    expect(getHouseholdBudget({ ...adult, currencyScale: 100, householdArrangement: 'shared' }).total).toBe(684000);
  });
  it('records living arrangement and savings goal choices without mutating the old save', () => {
    const adult = createCharacter('Adult', 30);
    const shared = setHouseholdArrangement(adult, 'shared');
    const goal = setSavingsGoalMonths(shared, 3);
    expect(adult.householdArrangement).toBe('family-supported');
    expect(goal.householdArrangement).toBe('shared');
    expect(goal.savingsGoalMonths).toBe(3);
    expect(goal.history[0].title).toBe('Set a savings goal');
    expect(setHouseholdArrangement(createCharacter('Teen', 17), 'shared').age).toBe(17);
  });
  it('charges recurring costs even when an adult is unemployed and records a shortfall', () => {
    const adult = { ...createCharacter('Adult', 30), money: 100, currencyScale: 1, householdArrangement: 'independent' as const, employment: null };
    const next = advanceYear(adult);
    expect(next.lastYearIncome).toBe(0);
    expect(next.lastYearExpenses).toBe(100);
    expect(next.lastYearShortfall).toBe(getHouseholdBudget(next).total - 100);
    expect(next.money).toBe(0);
    expect(next.happiness).toBe(adult.happiness - 4);
    expect(next.history.some((item) => item.title === 'Household budget shortfall')).toBe(true);
  });
  it('settles annual household costs from income and savings', () => {
    const adult = { ...createCharacter('Adult', 30), money: 1000, currencyScale: 1, householdArrangement: 'shared' as const,
      employment: { title: 'Worker', type: 'full-time' as const, annualSalary: 10000, experienceYears: 0, performance: 60, promotions: 0, startedAtAge: 30 } };
    const next = advanceYear(adult);
    expect(next.lastYearIncome).toBe(10000);
    expect(next.lastYearExpenses).toBe(Math.round(3800 * getEconomicConditions(next).costOfLivingIndex));
    expect(next.lastYearShortfall).toBe(0);
    expect(next.money).toBe(1000 + 10000 - next.lastYearExpenses!);
  });

  it('opens age-gated bank accounts and preserves existing cash', () => {
    const teen = createCharacter('Teen', 15);
    expect(openBankAccount(teen, 'checking')).toBe(teen);
    const adult = { ...createCharacter('Adult', 30), money: 5000 };
    const checking = openBankAccount(adult, 'checking', 'Everyday');
    const savings = openBankAccount(checking, 'savings', 'Emergency');
    expect(savings.bankAccounts).toHaveLength(2);
    expect(savings.money).toBe(5000);
    expect(getNetWorth(savings)).toBe(5000);
  });
  it('records deposits, withdrawals and transfers while preserving total money', () => {
    const base = { ...createCharacter('Adult', 30), money: 1000 };
    const one = openBankAccount(base, 'checking', 'Everyday');
    const two = openBankAccount(one, 'savings', 'Reserve');
    const [checking, savings] = two.bankAccounts!;
    const deposited = depositToAccount(two, checking.id, 600);
    expect(deposited.money).toBe(400);
    const transferred = transferBetweenAccounts(deposited, checking.id, savings.id, 250);
    expect(transferred.bankAccounts?.map((account) => account.balance)).toEqual([350, 250]);
    const withdrawn = withdrawFromAccount(transferred, savings.id, 100);
    expect(withdrawn.money).toBe(500);
    expect(getNetWorth(withdrawn)).toBe(1000);
    expect(withdrawn.financialTransactions).toHaveLength(5);
  });
  it('rejects overdrafts, invalid amounts and same-account transfers', () => {
    const base = { ...createCharacter('Adult', 30), money: 10 };
    const one = openBankAccount(base, 'checking');
    const account = one.bankAccounts![0];
    expect(depositToAccount(one, account.id, 11)).toBe(one);
    expect(withdrawFromAccount(one, account.id, 1)).toBe(one);
    expect(transferBetweenAccounts(one, account.id, account.id, 1)).toBe(one);
    expect(depositToAccount(one, account.id, 0)).toBe(one);
  });
  it('credits simple annual savings interest and records it', () => {
    const base = { ...createCharacter('Adult', 30), money: 0 };
    const opened = openBankAccount(base, 'savings', 'Reserve');
    const funded = { ...opened, bankAccounts: opened.bankAccounts!.map((account) => ({ ...account, balance: 10000 })) };
    const next = advanceYear(funded);
    expect(next.bankAccounts?.[0].balance).toBe(10200);
    expect(next.financialTransactions?.some((item) => item.type === 'interest' && item.amount === 200)).toBe(true);
  });

  it('issues loans without changing net worth and tracks interest and repayments', () => {
    const base = { ...createCharacter('Borrower', 30), currencyScale: 1, money: 1000 };
    const loaned = takeLoan(base, 'personal', 'Emergency loan', 5000, 0.1, 5);
    expect(loaned.money).toBe(6000);
    expect(getNetWorth(loaned)).toBe(getNetWorth(base));
    const paid = repayLoan(loaned, loaned.loans![0].id, 500, 'cash');
    expect(paid.money).toBe(5500);
    expect(paid.loans![0].balance).toBe(4500);
    const year = advanceYear(loaned);
    expect(year.loans![0].balance).toBe(4000);
    expect(year.financialTransactions?.some((t)=>t.type==='loan-interest')).toBe(true);
  });
  it('issues debit and credit cards and enforces balances and credit limits', () => {
    const base = { ...createCharacter('Card user', 30), money: 1000 };
    const opened = openBankAccount(base, 'checking', 'Daily');
    const funded = depositToAccount(opened, opened.bankAccounts![0].id, 600);
    const debit = issueBankCard(funded, 'debit', 'Daily card', opened.bankAccounts![0].id);
    const credit = issueBankCard(debit, 'credit', 'Credit card', undefined, 1000);
    const purchased = makeCardPurchase(credit, debit.cards![0].id, 100);
    expect(purchased.bankAccounts![0].balance).toBe(500);
    const creditPurchase = makeCardPurchase(purchased, credit.cards![1].id, 400, 'Groceries');
    expect(creditPurchase.cards![1].balance).toBe(400);
    expect(getNetWorth(creditPurchase)).toBe(getNetWorth(purchased)-400);
    expect(makeCardPurchase(creditPurchase, credit.cards![1].id, 700)).toBe(creditPurchase);
    const paid = payCreditCard(creditPurchase, credit.cards![1].id, 100);
    expect(paid.cards![1].balance).toBe(300);
  });
  it('runs annual subscriptions and automatic savings without creating money', () => {
    const base = { ...createCharacter('Saver', 30), currencyScale: 1, money: 2000, employment: { title: 'Worker', type: 'full-time' as const, annualSalary: 10000, experienceYears: 0, performance: 60, promotions: 0, startedAtAge: 30 } };
    const opened = openBankAccount(base, 'savings', 'Reserve');
    const rule = setAutoDeposit(opened, opened.bankAccounts![0].id, 'percentage', 10);
    const subscription = addRecurringPayment(rule, 'Music', 100, 'subscription', 'cash');
    const next = advanceYear(subscription);
    expect(next.bankAccounts![0].balance).toBe(1000);
    expect(next.money).toBe(9388);
    expect(getNetWorth(next)).toBe(10388);
    expect(next.financialTransactions?.some((t)=>t.type==='auto-deposit')).toBe(true);
    expect(next.financialTransactions?.some((t)=>t.type==='recurring-payment')).toBe(true);
  });
  it('records marketplace purchases from cash, bank accounts, and debit cards', () => {
    const base = { ...createCharacter('Shopper', 30), money: 1000 };
    const cashPurchase = makeCashPurchase(base, 100, 'Supermarket groceries');
    expect(cashPurchase.money).toBe(900);
    expect(cashPurchase.financialTransactions?.at(-1)?.type).toBe('expense');
    expect(cashPurchase.history[0].title).toBe('Purchase');
    expect(makeCashPurchase(base, 1200, 'Too expensive')).toBe(base);

    const accountBase = openBankAccount(base, 'checking', 'Everyday');
    const accountId = accountBase.bankAccounts![0].id;
    const funded = depositToAccount(accountBase, accountId, 400);
    const accountPurchase = makeAccountPurchase(funded, accountId, 150, 'Online order');
    expect(accountPurchase.bankAccounts?.[0].balance).toBe(250);
    expect(accountPurchase.money).toBe(600);
    expect(accountPurchase.financialTransactions?.at(-1)?.from).toBe('Everyday');
    expect(makeAccountPurchase(funded, accountId, 500, 'Overdraft')).toBe(funded);

    const debit = issueBankCard(funded, 'debit', 'Everyday card', accountId);
    const cardId = debit.cards![0].id;
    const cardPurchase = makeCardPurchase(debit, cardId, 75, 'Grocery card payment');
    expect(cardPurchase.bankAccounts?.[0].balance).toBe(325);
    expect(cardPurchase.financialTransactions?.at(-1)?.type).toBe('card-purchase');
  });

  it('moves money to and from a personal vault without changing net worth', () => {
    const base = { ...createCharacter('Saver', 30), money: 900 };
    const stored = depositToVault(base, 400);
    expect(stored.money).toBe(500);
    expect(stored.vaultBalance).toBe(400);
    expect(getNetWorth(stored)).toBe(getNetWorth(base));
    const withdrawn = withdrawFromVault(stored, 150);
    expect(withdrawn.money).toBe(650);
    expect(withdrawn.vaultBalance).toBe(250);
  });
  it('rejects invalid loans and cards', () => {
    const base = { ...createCharacter('Teen', 17), money: 500 };
    expect(takeLoan(base, 'personal', 'Loan', 1000, 0.1, 5)).toBe(base);
    const adult = { ...createCharacter('Adult', 30), money: 100 };
    expect(issueBankCard(adult, 'credit', 'Card', undefined, 0)).toBe(adult);
    expect(issueBankCard(adult, 'debit', 'Debit')).toBe(adult);
    expect(addRecurringPayment(adult, 'Invalid', 0, 'bill', 'cash')).toBe(adult);
  });

  it('buys a mortgaged property without creating net worth from borrowed money', () => {
    const base = { ...createCharacter('Homeowner', 30), currencyScale: 1, money: 20000 };
    const bought = buyProperty(base, 'house', 'First home', 50000, 10000, 0.07, 20, true);
    expect(bought.properties).toHaveLength(1);
    expect(bought.money).toBe(9500);
    expect(bought.loans?.[0].balance).toBe(40000);
    expect(bought.primaryResidenceId).toBe(bought.properties?.[0].id);
    expect(getNetWorth(bought)).toBe(getNetWorth(base) - 500);
    const sold = sellProperty(bought, bought.properties![0].id);
    expect(sold.properties).toHaveLength(0);
    expect(sold.loans?.[0].active).toBe(false);
    expect(getNetWorth(sold)).toBe(getNetWorth(base) - 1000);
  });
  it('supports renting and moving into owned property with housing costs', () => {
    const base = { ...createCharacter('Tenant', 30), currencyScale: 1 };
    const rented = rentHome(base, 'apartment', 6000);
    expect(getHouseholdBudget(rented).housing).toBe(6000);
    const bought = buyProperty({ ...base, money: 20000 }, 'apartment', 'Flat', 10000, 10000, 0.07, 10, false);
    const moved = moveIntoOwnedProperty(bought, bought.properties![0].id);
    expect(moved.rentalHome).toBeNull();
    expect(getHouseholdBudget(moved).housing).toBe(100);
  });
  it('buys and sells whole stock and gold units while accounting for brokerage fees', () => {
    const base = { ...createCharacter('Investor', 30), currencyScale: 1, money: 1000 };
    const stocks = tradeInvestment(base, 'stock-index', 'buy', 2);
    expect(stocks.money).toBe(799);
    expect(getNetWorth(stocks)).toBe(getNetWorth(base) - 1);
    const sold = tradeInvestment(stocks, 'stock-index', 'sell', 1);
    expect(sold.money).toBe(898);
    expect(getNetWorth(sold)).toBe(getNetWorth(base) - 2);
    const gold = tradeInvestment(base, 'gold', 'buy', 1);
    expect(getNetWorth(gold)).toBe(getNetWorth(base) - 1);
  });
  it('starts, manages and sells a small business with auditable cash flows', () => {
    const base = { ...createCharacter('Founder', 30), currencyScale: 1, money: 5000 };
    const started = startBusiness(base, 'Corner shop', 'retail', 2000);
    expect(started.money).toBe(3000);
    expect(getNetWorth(started)).toBe(getNetWorth(base));
    const managed = manageBusiness(started, started.businesses![0].id);
    expect(managed.businesses![0].performance).toBe(68);
    expect(managed.actionsRemaining).toBe(2);
    const closed = closeBusiness(managed, managed.businesses![0].id);
    expect(closed.businesses).toHaveLength(0);
    expect(closed.money).toBe(4780);
  });
  it('updates asset values and credits rental and business income on year advancement', () => {
    const base = { ...createCharacter('Owner', 30), currencyScale: 1, money: 10000 };
    const property = buyProperty(base, 'apartment', 'Rental flat', 5000, 5000, 0.07, 10, false);
    const rented = setPropertyRental(property, property.properties![0].id, true, 1000);
    const business = startBusiness(rented, 'Online shop', 'online', 1000);
    business.businesses![0].performance = 90;
    const next = advanceYear(business);
    expect(next.properties![0].marketValue).toBeGreaterThan(0);
    expect(next.properties![0].marketValue).not.toBe(5000);
    expect(next.marketPrices?.lastUpdatedYear).toBe(next.year);
    expect(next.financialTransactions?.some((t)=>t.type==='property-rent')).toBe(true);
    expect(next.financialTransactions?.some((t)=>t.type==='business-income')).toBe(true);
  });

  it('locks fixed deposits until maturity and credits their higher interest', () => {
    const base = { ...createCharacter('Saver', 30), currencyScale: 1, money: 1000, year: 2026 };
    const opened = openBankAccount(base, 'fixed-deposit', 'Term deposit', 2);
    const funded = depositToAccount(opened, opened.bankAccounts![0].id, 1000);
    expect(withdrawFromAccount(funded, funded.bankAccounts![0].id, 100)).toBe(funded);
    const yearOne = advanceYear(funded);
    expect(yearOne.bankAccounts![0].balance).toBe(1045);
    expect(withdrawFromAccount(yearOne, yearOne.bankAccounts![0].id, 100)).toBe(yearOne);
    const yearTwo = advanceYear(yearOne);
    expect(yearTwo.year).toBe(2028);
    expect(yearTwo.bankAccounts![0].balance).toBe(1092);
    expect(withdrawFromAccount(yearTwo, yearTwo.bankAccounts![0].id, 1092).money).toBe(1092);
  });
  it('loads prepaid cards from cash, limits spending and supports recurring charges', () => {
    const base = { ...createCharacter('Card user', 30), currencyScale: 1, money: 1000 };
    const issued = issueBankCard(base, 'prepaid', 'Travel card');
    const loaded = loadPrepaidCard(issued, issued.cards![0].id, 400);
    expect(loaded.money).toBe(600);
    expect(loaded.cards![0].balance).toBe(400);
    expect(getNetWorth(loaded)).toBe(getNetWorth(base));
    const spent = makeCardPurchase(loaded, loaded.cards![0].id, 150);
    expect(spent.cards![0].balance).toBe(250);
    expect(getNetWorth(spent)).toBe(getNetWorth(base)-150);
    const subscription = addRecurringPayment(spent, 'Transit pass', 100, 'bill', 'card', issued.cards![0].id);
    const next = advanceYear(subscription);
    expect(next.cards![0].balance).toBe(149);
    expect(next.financialTransactions?.some((item)=>item.type==='recurring-payment')).toBe(true);
  });

  it('supports debit-card auto-pay by debiting its linked bank account', () => {
    const base = { ...createCharacter('Card payer', 30), currencyScale: 1, money: 10000 };
    const account = openBankAccount(base, 'checking', 'Bills account');
    const funded = depositToAccount(account, account.bankAccounts![0].id, 5000);
    const debit = issueBankCard(funded, 'debit', 'Bills card', account.bankAccounts![0].id);
    const recurring = addRecurringPayment(debit, 'Internet bill', 100, 'bill', 'card', debit.cards![0].id);
    const next = advanceYear(recurring);
    expect(next.bankAccounts![0].balance).toBe(4899);
    expect(next.financialTransactions?.some((item)=>item.type==='recurring-payment' && item.amount===101)).toBe(true);
  });

  it('creates bounded, reproducible economic cycles and updates market prices', () => {
    const base = { ...createCharacter('Economy', 30), currencyScale: 1, marketPrices: { stocks: 100, gold: 150, lastUpdatedYear: 0 } };
    const first = advanceYear(base);
    const repeated = advanceYear(base);
    expect(first.economy).toEqual(repeated.economy);
    expect(first.marketPrices).toEqual(repeated.marketPrices);
    expect(first.economy!.inflationRate).toBeGreaterThanOrEqual(-0.015);
    expect(first.economy!.inflationRate).toBeLessThanOrEqual(0.095);
    expect(first.economy!.growthRate).toBeGreaterThanOrEqual(-0.055);
    expect(first.economy!.growthRate).toBeLessThanOrEqual(0.065);
    expect(['expansion','stable','recession']).toContain(first.economy!.cycle);
    expect(first.marketPrices!.lastUpdatedYear).toBe(first.year);
  });
  it('lets inflation raise living costs, recurring bills and rental prices over time', () => {
    const base = { ...createCharacter('Tenant', 30), currencyScale: 1, money: 10000, householdArrangement: 'independent' as const, rentalHome: { type: 'apartment' as const, annualRent: 1000 }, recurringPayments: [{ id: 'subscription-1', name: 'Music', amount: 100, category: 'subscription' as const, sourceType: 'cash' as const, active: true, startedAtYear: 0 }] };
    const before = getHouseholdBudget(base).total;
    const next = advanceYear(base);
    expect(next.rentalHome!.annualRent).toBeGreaterThan(0);
    expect(next.recurringPayments![0].amount).toBeGreaterThan(0);
    expect(next.economy!.costOfLivingIndex).toBeGreaterThan(0);
    expect(getHouseholdBudget(next).total).not.toBe(before);
  });

  it('calculates progressive income tax with a tax-free allowance', () => {
    const low = { ...createCharacter('Low earner', 30), currencyScale: 1, lastYearIncome: 10000 };
    const middle = { ...createCharacter('Middle earner', 30), currencyScale: 1, lastYearIncome: 50000 };
    const high = { ...createCharacter('High earner', 30), currencyScale: 1, lastYearIncome: 70000 };
    expect(getAnnualTaxEstimate(low).incomeTax).toBe(0);
    expect(getAnnualTaxEstimate(middle).incomeTax).toBe(4800);
    expect(getAnnualTaxEstimate(high).incomeTax).toBe(8300);
  });
  it('assesses annual taxes, pays liquid funds first, and carries unpaid tax as a liability', () => {
    const base = {
      ...createCharacter('Tax payer', 30), currencyScale: 1, money: 0, lastYearIncome: 50000,
      employment: { title: 'Worker', type: 'full-time' as const, annualSalary: 50000, experienceYears: 0, performance: 60, promotions: 0, startedAtAge: 30 },
      bankAccounts: [
        { id: 'checking-1', name: 'Everyday', type: 'checking' as const, balance: 1000, annualInterestRate: 0, openedAtAge: 20 },
        { id: 'fixed-1', name: 'Fixed deposit', type: 'fixed-deposit' as const, balance: 5000, annualInterestRate: 0.045, openedAtAge: 20, termYears: 3, maturesAtYear: 99 }
      ],
      properties: [{ id: 'home-1', name: 'Home', type: 'house' as const, marketValue: 10000000, purchasePrice: 10000000, annualMaintenance: 1000, rentedOut: false, annualRentalIncome: 0 }]
    };
    const next = advanceYear(base);
    expect(next.lastYearTax).toBeGreaterThan(0);
    expect(next.bankAccounts!.find((account)=>account.id==='checking-1')!.balance).toBe(0);
    expect(next.bankAccounts!.find((account)=>account.id==='fixed-1')!.balance).toBeGreaterThan(5000);
    expect(next.taxBalance).toBeGreaterThan(0);
    expect(getNetWorth({ ...next, taxBalance: 0 }) - getNetWorth(next)).toBe(next.taxBalance);
    expect(next.financialTransactions?.some((item)=>item.type==='tax')).toBe(true);
  });
  it('clears previously outstanding tax when sufficient cash becomes available', () => {
    const base = { ...createCharacter('Tax payer', 30), currencyScale: 1, money: 10000, taxBalance: 500, lastYearIncome: 0 };
    const next = advanceYear(base);
    expect(next.taxBalance).toBe(0);
    expect(next.money).toBeLessThan(10000);
    expect(next.lastYearTax).toBe(0);
  });

  it('calculates credit score from payment history, utilization, debt and tax balance', () => {
    const base = { ...createCharacter('Borrower', 30), currencyScale: 1 };
    expect(getCreditScore(base)).toBe(700);
    const card = issueBankCard(base, 'credit', 'Everyday credit', undefined, 1000);
    const used = makeCardPurchase(card, card.cards![0].id, 800);
    expect(getCreditScore(used)).toBeLessThan(getCreditScore(base));
    const missed = { ...base, financialTransactions: [{ id: 'missed-1', year: 1, age: 30, type: 'expense' as const, amount: 0, description: 'Missed loan installment', from: 'Cash', to: 'Lender' }] };
    expect(getCreditScore(missed)).toBe(665);
    const paid = { ...base, financialTransactions: [{ id: 'paid-1', year: 1, age: 30, type: 'loan-payment' as const, amount: 100, description: 'Installment paid', from: 'Cash', to: 'Lender' }] };
    expect(getCreditScore(paid)).toBe(702);
  });
  it('sets score-based minimum loan rates and rejects unaffordable credit pricing', () => {
    const base = { ...createCharacter('Borrower', 30), currencyScale: 1, money: 1000 };
    expect(getMinimumLoanRate(base, 'personal')).toBe(0.09);
    expect(getMinimumLoanRate(base, 'mortgage')).toBe(0.065);
    expect(getMinimumLoanRate(base, 'business')).toBe(0.11);
    expect(takeLoan(base, 'personal', 'Too cheap', 500, 0.08, 5)).toBe(base);
    const approved = takeLoan(base, 'personal', 'Fair rate', 500, 0.09, 5);
    expect(approved.loans).toHaveLength(1);
    const poor = { ...base, financialTransactions: Array.from({length:7},(_,i)=>({id:'missed-'+i,year:i,age:30,type:'expense' as const,amount:0,description:'Missed loan installment',from:'Cash',to:'Lender'})) };
    expect(getCreditScore(poor)).toBe(455);
    expect(takeLoan(poor, 'personal', 'Rejected', 500, 0.4, 5)).toBe(poor);
  });

  it('charges brokerage fees and capital-gains tax when selling investments', () => {
    const base = { ...createCharacter('Investor', 30), currencyScale: 1, money: 0, marketPrices: { stocks: 100, gold: 150, lastUpdatedYear: 0 }, investments: [{ type: 'stock-index' as const, units: 2, averageCost: 50 }] };
    const sold = tradeInvestment(base, 'stock-index', 'sell', 1);
    expect(sold.money).toBe(94);
    expect(sold.investments![0].units).toBe(1);
    expect(sold.financialTransactions?.some((item)=>item.type==='fee' && item.amount===1)).toBe(true);
    expect(sold.financialTransactions?.some((item)=>item.type==='tax' && item.amount===5)).toBe(true);
  });
  it('deducts property sale fees and capital-gains tax from net proceeds', () => {
    const base = { ...createCharacter('Owner', 30), currencyScale: 1, money: 0, properties: [{ id: 'asset-1', name: 'Rental flat', type: 'apartment' as const, marketValue: 120000, purchasePrice: 100000, annualMaintenance: 1200, rentedOut: false, annualRentalIncome: 0 }] };
    const sold = sellProperty(base, 'asset-1');
    expect(sold.money).toBe(116800);
    expect(sold.properties).toHaveLength(0);
    expect(sold.financialTransactions?.some((item)=>item.type==='fee' && item.amount===1200)).toBe(true);
    expect(sold.financialTransactions?.some((item)=>item.type==='tax' && item.amount===2000)).toBe(true);
  });

});
