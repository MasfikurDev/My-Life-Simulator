import type { ActivityId, BankAccount, BankAccountType, Character, FinancialTransaction, LifeEvent, Gender, Employment, HouseholdArrangement, SavingsGoalMonths } from './types';
import { getEducationStage, isActivityAvailable } from './progression';

export const ACTIONS_PER_YEAR = 3;
const clamp = (value: number) => Math.max(0, Math.min(100, value));

type CountryProfile = {
  nationality: string;
  country: string;
  cities: string[];
  currency: string;
  scale: number;
  names: Record<'male' | 'female' | 'neutral', string[]>;
  surnames: string[];
};

const COUNTRIES: CountryProfile[] = [
  { nationality: 'Bangladeshi', country: 'Bangladesh', cities: ['Dhaka','Chattogram','Rajshahi','Sylhet','Khulna'], currency: 'BDT', scale: 100, names: { male: ['Adnan','Afnan','Ahsan','Arif','Fahim','Farhan','Hasan','Imran','Mahin','Nabil','Rafi','Tanvir'], female: ['Aisha','Anika','Arisha','Farah','Ishrat','Jannat','Maliha','Nusrat','Raisa','Sadia','Samira','Zara'], neutral: ['Ari','Noor','Rumi','Sami','Tarin'] }, surnames: ['Ahmed','Akter','Chowdhury','Hasan','Hossain','Islam','Khan','Rahman','Sarker'] },
  { nationality: 'Indian', country: 'India', cities: ['Delhi','Mumbai','Kolkata','Bengaluru','Chennai','Hyderabad'], currency: 'INR', scale: 100, names: { male: ['Aarav','Arjun','Dev','Ishaan','Kabir','Karan','Rohan','Rahul','Vihaan','Yash'], female: ['Aanya','Diya','Isha','Kavya','Meera','Priya','Riya','Saanvi','Tara','Zoya'], neutral: ['Aadi','Kiran','Neel','Ravi','Samar'] }, surnames: ['Das','Gupta','Iyer','Khan','Mehta','Patel','Rao','Sharma','Singh'] },
  { nationality: 'American', country: 'United States', cities: ['New York','Chicago','Austin','Seattle','Atlanta','Los Angeles'], currency: 'USD', scale: 1, names: { male: ['Alexander','Benjamin','Caleb','Ethan','James','Liam','Noah','Oliver','Theodore','William'], female: ['Amelia','Ava','Charlotte','Emma','Harper','Isabella','Mia','Olivia','Sophia','Violet'], neutral: ['Avery','Casey','Jordan','Morgan','Riley'] }, surnames: ['Bennett','Brooks','Carter','Collins','Davis','Garcia','Johnson','Miller','Reed'] },
  { nationality: 'British', country: 'United Kingdom', cities: ['London','Manchester','Birmingham','Bristol','Leeds','Glasgow'], currency: 'GBP', scale: 1, names: { male: ['Arthur','Charlie','Freddie','George','Harry','Jack','Leo','Oliver','Oscar','Thomas'], female: ['Amelia','Daisy','Ella','Freya','Isla','Lily','Maya','Olivia','Poppy','Sophie'], neutral: ['Alex','Ellis','Jamie','Robin','Taylor'] }, surnames: ['Bennett','Clarke','Davies','Evans','Morgan','Patel','Robinson','Taylor','Wilson'] },
  { nationality: 'Canadian', country: 'Canada', cities: ['Toronto','Vancouver','Montreal','Calgary','Ottawa','Halifax'], currency: 'CAD', scale: 1, names: { male: ['Adam','Benjamin','Elliot','Ethan','Jack','Liam','Lucas','Noah','Owen','Theo'], female: ['Ava','Chloe','Emily','Grace','Isla','Mila','Olivia','Rose','Sophie','Zoe'], neutral: ['Avery','Cameron','Jordan','Quinn','Rowan'] }, surnames: ['Brown','Campbell','Chen','Martin','Nguyen','Roy','Singh','Smith','Wilson'] },
  { nationality: 'Australian', country: 'Australia', cities: ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Canberra'], currency: 'AUD', scale: 1, names: { male: ['Archie','Charlie','Ethan','Henry','Hugo','Jack','Leo','Oliver','Thomas','William'], female: ['Amelia','Charlotte','Ella','Harper','Isla','Matilda','Mia','Olivia','Ruby','Sophie'], neutral: ['Alex','Billie','Frankie','Harper','Riley'] }, surnames: ['Brown','Campbell','Jones','Kelly','Nguyen','Smith','Taylor','Thomas','Wilson'] },
  { nationality: 'Japanese', country: 'Japan', cities: ['Tokyo','Osaka','Kyoto','Yokohama','Sapporo','Fukuoka'], currency: 'JPY', scale: 100, names: { male: ['Akira','Daiki','Haruto','Haruki','Kaito','Ren','Riku','Sota','Yuma','Yuto'], female: ['Aoi','Hana','Hina','Mei','Rin','Sakura','Yui','Yuna','Yuri','Aiko'], neutral: ['Aoi','Haru','Kaoru','Makoto','Ren'] }, surnames: ['Aoki','Fujita','Ito','Kobayashi','Nakamura','Sato','Suzuki','Takahashi','Yamamoto'] },
  { nationality: 'Nigerian', country: 'Nigeria', cities: ['Lagos','Abuja','Kano','Ibadan','Enugu','Port Harcourt'], currency: 'NGN', scale: 1000, names: { male: ['Chidi','David','Emeka','Ibrahim','Kelechi','Musa','Obinna','Olu','Tunde','Yusuf'], female: ['Ada','Amara','Amina','Chioma','Fatima','Ife','Ngozi','Zainab','Zara','Temi'], neutral: ['Ayo','Ejiro','Ife','Kosi','Tomi'] }, surnames: ['Abiola','Adeyemi','Adebayo','Bello','Eze','Ibrahim','Okafor','Okoye','Yusuf'] },
  { nationality: 'Brazilian', country: 'Brazil', cities: ['São Paulo','Rio de Janeiro','Brasília','Salvador','Curitiba','Recife'], currency: 'BRL', scale: 10, names: { male: ['Arthur','Caio','Davi','Gabriel','João','Lucas','Mateus','Miguel','Pedro','Rafael'], female: ['Alice','Ana','Beatriz','Camila','Helena','Isabella','Julia','Laura','Manuela','Sofia'], neutral: ['Ariel','Dani','Gui','Luca','Rene'] }, surnames: ['Almeida','Costa','Ferreira','Lima','Oliveira','Pereira','Rodrigues','Santos','Silva'] },
  { nationality: 'German', country: 'Germany', cities: ['Berlin','Hamburg','Munich','Cologne','Frankfurt','Leipzig'], currency: 'EUR', scale: 1, names: { male: ['Ben','Elias','Emil','Felix','Finn','Jonas','Leon','Lukas','Noah','Paul'], female: ['Amelie','Anna','Clara','Emilia','Emma','Hannah','Lena','Mia','Mila','Sofia'], neutral: ['Alex','Kim','Lou','Luca','Robin'] }, surnames: ['Bauer','Becker','Fischer','Hoffmann','Klein','Meyer','Schmidt','Schneider','Weber'] }
];

const PERSONALITY_TRAITS = ['Curious','Patient','Ambitious','Creative','Practical','Outgoing','Reserved','Optimistic','Thoughtful','Adventurous','Disciplined','Adaptable'];
const FAMILY_BACKGROUNDS = ['Working-class','Modest','Comfortable','Affluent'] as const;
const COUNTRY_LANGUAGES: Record<string, string[]> = {
  Bangladesh: ['Bengali'], India: ['Bengali','Gujarati','Hindi','Kannada','Malayalam','Marathi','Punjabi','Tamil','Telugu'],
  'United States': ['English','Spanish'], 'United Kingdom': ['English','Welsh'], Canada: ['English','French'],
  Australia: ['English'], Japan: ['Japanese'], Nigeria: ['English','Hausa','Igbo','Yoruba'],
  Brazil: ['Portuguese'], Germany: ['German']
};
const FAMILY_NAME_FIRST = new Set(['Japan']);

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}
function stat(random: () => number): number {
  // Triangular distribution: ordinary values are more common than extremes.
  return Math.round((random() + random()) * 25 + 25);
}
function event(character: Character, title: string, description: string, kind: LifeEvent['kind'] = 'activity'): LifeEvent {
  return { id: String(character.year) + '-' + String(character.history.length + 1), year: character.year, age: character.age, title, description, kind };
}

export function generateRandomCharacter(startAge = 18, random: () => number = Math.random): Character {
  const age = Math.max(0, Math.min(90, Math.round(startAge)));
  const profile = pick(COUNTRIES, random);
  const genderRoll = random();
  // Gameplay weighting only; this is not a demographic estimate.
  const gender: Gender = genderRoll < 0.495 ? 'male' : genderRoll < 0.99 ? 'female' : 'non-binary';
  const namePool = gender === 'non-binary' ? profile.names.neutral : profile.names[gender];
  const givenName = pick(namePool, random);
  const familyName = pick(profile.surnames, random);
  const name = FAMILY_NAME_FIRST.has(profile.country) ? familyName + ' ' + givenName : givenName + ' ' + familyName;
  const language = pick(COUNTRY_LANGUAGES[profile.country] ?? ['Local language'], random);
  const background = pick(FAMILY_BACKGROUNDS, random);
  const backgroundIndex = FAMILY_BACKGROUNDS.indexOf(background);
  const moneyBase = age < 16 ? 0 : age < 18 ? 120 : 850;
  const moneyMultiplier = [0.65, 0.9, 1.15, 1.55][backgroundIndex];
  const traitPool = [...PERSONALITY_TRAITS];
  for (let i = traitPool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [traitPool[i], traitPool[j]] = [traitPool[j], traitPool[i]];
  }
  const traits = traitPool.slice(0, 2);
  const appearance = {
    height: age < 2 ? 'Infant' : age < 6 ? 'Young child' : age < 13 ? 'Child' : age < 18 ? pick(['Short for age','Average for age','Tall for age'], random) : pick(['Short','Average height','Tall'], random),
    build: age < 2 ? 'Infant build' : pick(['Slim','Average build','Broad build','Athletic build'], random),
    hair: pick(['Black','Brown','Blond','Red','Auburn','Gray'], random),
    eyes: pick(['Brown','Blue','Green','Hazel','Gray'], random)
  };
  const character: Character = {
    name, age, year: 2026, gender, nationality: profile.nationality, country: profile.country,
    birthplace: pick(profile.cities, random), language, currency: profile.currency, currencyScale: profile.scale,
    familyBackground: background, personality: traits, appearance,
    education: getEducationStage(age), educationProgress: 0, employment: null, lastYearIncome: 0, lastYearExpenses: 0, lastYearShortfall: 0,
    householdArrangement: age >= 18 ? 'family-supported' : undefined, savingsGoalMonths: null,
    health: stat(random), happiness: stat(random), intelligence: stat(random), fitness: stat(random),
    money: Math.round(moneyBase * profile.scale * moneyMultiplier), actionsRemaining: ACTIONS_PER_YEAR, history: []
  };
  character.history.push(event(character, 'A new chapter begins', name + ' begins life at age ' + age + ' in ' + character.birthplace + ', ' + profile.country + '. Their ' + background.toLowerCase() + ' family background shapes their starting circumstances, but not their future.', 'milestone'));
  return character;
}

export function createCharacter(name: string, startAge = 18): Character {
  const character = generateRandomCharacter(startAge);
  character.name = name.trim().slice(0, 28) || character.name;
  return character;
}

export function formatCharacterMoney(character: Character, amount = character.money): string {
  const symbols: Record<string, string> = {
    BDT: '৳', INR: '₹', USD: String.fromCharCode(36), GBP: '£', CAD: 'CA$',
    AUD: 'A$', JPY: '¥', NGN: '₦', BRL: 'R$', EUR: '€'
  };
  const currency = character.currency ?? 'USD';
  return (symbols[currency] ?? currency + ' ') + Math.round(amount).toLocaleString('en-US');
}

function createEmployment(character: Character): Employment {
  const scale = character.currencyScale ?? 1;
  if (character.age < 18) {
    return { title: 'Part-time assistant', type: 'part-time', annualSalary: 5000 * scale, experienceYears: 0, performance: 60, promotions: 0, startedAtAge: character.age };
  }
  const qualified = character.education === 'Higher education';
  const flexible = character.age >= 65;
  const baseSalary = qualified ? 28000 : 18000;
  return {
    title: flexible ? 'Flexible associate' : qualified ? 'Professional associate' : 'Operations associate',
    type: flexible ? 'flexible' : 'full-time',
    annualSalary: Math.round(baseSalary * scale * (flexible ? 0.65 : 1)),
    experienceYears: 0, performance: 60, promotions: 0, startedAtAge: character.age
  };
}


function financeRecord(character: Character, type: FinancialTransaction['type'], amount: number, description: string, from: string, to: string): FinancialTransaction[] {
  const existing = character.financialTransactions ?? [];
  const record: FinancialTransaction = {
    id: String(character.year) + '-' + String(character.age) + '-' + String(existing.length + 1),
    year: character.year, age: character.age, type, amount: Math.round(amount), description, from, to
  };
  return [...existing, record].slice(-300);
}

export function getNetWorth(character: Character): number {
  return Math.round(character.money + (character.bankAccounts ?? []).reduce((sum, account) => sum + account.balance, 0));
}

export function openBankAccount(character: Character, type: BankAccountType, name?: string): Character {
  if (character.age < 16) return character;
  const accounts = character.bankAccounts ?? [];
  if (accounts.length >= 8) return character;
  const label = name?.trim().slice(0, 28) || (type === 'savings' ? 'Savings account' : 'Everyday account');
  const account: BankAccount = {
    id: 'account-' + String(character.year) + '-' + String(character.age) + '-' + String(accounts.length + 1),
    name: label, type, balance: 0, annualInterestRate: type === 'savings' ? 0.02 : 0, openedAtAge: character.age
  };
  const next = { ...character, bankAccounts: [...accounts, account], history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'account-opened', 0, 'Opened ' + label + '.', '—', label);
  next.history.unshift(event(next, 'Opened a bank account', 'You opened a ' + type + ' account named ' + label + '.', 'milestone'));
  return next;
}

export function depositToAccount(character: Character, accountId: string, amount: number): Character {
  const value = Math.floor(amount);
  const account = (character.bankAccounts ?? []).find((item) => item.id === accountId);
  if (character.age < 16 || !account || !Number.isSafeInteger(value) || value <= 0 || character.money < value) return character;
  const next = { ...character, money: character.money - value, bankAccounts: (character.bankAccounts ?? []).map((item) => item.id === accountId ? { ...item, balance: item.balance + value } : item), history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'deposit', value, 'Deposited ' + formatCharacterMoney(next, value) + ' into ' + account.name + '.', 'Cash', account.name);
  next.history.unshift(event(next, 'Deposited money', formatCharacterMoney(next, value) + ' moved from cash into ' + account.name + '.'));
  return next;
}

export function withdrawFromAccount(character: Character, accountId: string, amount: number): Character {
  const value = Math.floor(amount);
  const account = (character.bankAccounts ?? []).find((item) => item.id === accountId);
  if (character.age < 16 || !account || !Number.isSafeInteger(value) || value <= 0 || account.balance < value) return character;
  const next = { ...character, money: character.money + value, bankAccounts: (character.bankAccounts ?? []).map((item) => item.id === accountId ? { ...item, balance: item.balance - value } : item), history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'withdrawal', value, 'Withdrew ' + formatCharacterMoney(next, value) + ' from ' + account.name + '.', account.name, 'Cash');
  next.history.unshift(event(next, 'Withdrew money', formatCharacterMoney(next, value) + ' moved from ' + account.name + ' into cash.'));
  return next;
}

export function transferBetweenAccounts(character: Character, fromId: string, toId: string, amount: number): Character {
  const value = Math.floor(amount);
  const accounts = character.bankAccounts ?? [];
  const source = accounts.find((item) => item.id === fromId);
  const destination = accounts.find((item) => item.id === toId);
  if (character.age < 16 || !source || !destination || source.id === destination.id || !Number.isSafeInteger(value) || value <= 0 || source.balance < value) return character;
  const next = { ...character, bankAccounts: accounts.map((item) => item.id === fromId ? { ...item, balance: item.balance - value } : item.id === toId ? { ...item, balance: item.balance + value } : item), history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'transfer', value, 'Transferred ' + formatCharacterMoney(next, value) + ' from ' + source.name + ' to ' + destination.name + '.', source.name, destination.name);
  next.history.unshift(event(next, 'Transferred between accounts', formatCharacterMoney(next, value) + ' moved from ' + source.name + ' to ' + destination.name + '.'));
  return next;
}

export function getHouseholdBudget(character: Character) {
  const zero = { housing: 0, food: 0, transport: 0, utilities: 0, personal: 0, total: 0 };
  if (character.age < 18) return zero;
  const scale = character.currencyScale ?? 1;
  const referenceIncome = character.employment?.annualSalary ?? 18000 * scale;
  const shares: Record<HouseholdArrangement, typeof zero> = {
    'family-supported': { housing: 0, food: 0.08, transport: 0.03, utilities: 0, personal: 0.04, total: 0.15 },
    shared: { housing: 0.14, food: 0.12, transport: 0.04, utilities: 0.03, personal: 0.05, total: 0.38 },
    independent: { housing: 0.25, food: 0.15, transport: 0.06, utilities: 0.06, personal: 0.06, total: 0.58 }
  };
  const share = shares[character.householdArrangement ?? 'family-supported'];
  const housing = Math.round(referenceIncome * share.housing);
  const food = Math.round(referenceIncome * share.food);
  const transport = Math.round(referenceIncome * share.transport);
  const utilities = Math.round(referenceIncome * share.utilities);
  const personal = Math.round(referenceIncome * share.personal);
  return { housing, food, transport, utilities, personal, total: housing + food + transport + utilities + personal };
}

export function setHouseholdArrangement(character: Character, arrangement: HouseholdArrangement): Character {
  if (character.age < 18 || character.householdArrangement === arrangement) return character;
  const next = { ...character, householdArrangement: arrangement, history: [...character.history] };
  const label = arrangement === 'family-supported' ? 'Family-supported' : arrangement === 'shared' ? 'Shared household' : 'Independent living';
  next.history.unshift(event(next, 'Changed living arrangement', 'You moved to a ' + label.toLowerCase() + ' arrangement. Your annual household budget will change next year.', 'milestone'));
  return next;
}

export function setSavingsGoalMonths(character: Character, months: SavingsGoalMonths | null): Character {
  if (character.age < 18 || character.savingsGoalMonths === months) return character;
  const next = { ...character, savingsGoalMonths: months, history: [...character.history] };
  next.history.unshift(event(next, months ? 'Set a savings goal' : 'Cleared savings goal', months ? 'You set an emergency savings target of ' + months + ' months of estimated living costs.' : 'You removed your emergency savings target.'));
  return next;
}

export function getActivityCost(character: Character, activity: ActivityId): number {
  const scale = character.currencyScale ?? 1;
  if (character.age >= 16 && activity === 'study') return 35 * scale;
  if (character.age >= 16 && activity === 'socialize') return 20 * scale;
  return 0;
}

export function canAffordActivity(character: Character, activity: ActivityId): boolean {
  return character.money >= getActivityCost(character, activity);
}

export function performActivity(character: Character, activity: ActivityId, random: () => number = Math.random): Character {
  if (character.actionsRemaining <= 0 || !isActivityAvailable(character.age, activity, character.employment) || !canAffordActivity(character, activity)) return character;
  const next = { ...character, history: [...character.history], actionsRemaining: character.actionsRemaining - 1 };
  const scale = character.currencyScale ?? 1;
  switch (activity) {
    case 'study':
      next.intelligence = clamp(next.intelligence + 5);
      next.happiness = clamp(next.happiness - 1);
      if (next.age >= 16) next.money -= getActivityCost(next, 'study');
      next.educationProgress = Math.min(100, (next.educationProgress ?? 0) + (next.age < 6 ? 25 : next.age < 13 ? 15 : next.age < 18 ? 12 : 20));
      if (next.age >= 18 && next.educationProgress >= 100 && next.education !== 'Higher education') {
        next.education = 'Higher education';
        next.educationProgress = 0;
        next.history.unshift(event(next, 'Completed higher education', 'Your qualification has improved and more skilled roles are now available.', 'milestone'));
      } else if (next.educationProgress >= 100) {
        next.educationProgress = 0;
        next.history.unshift(event(next, 'Learning milestone', 'Consistent study strengthened your education and knowledge.', 'milestone'));
      } else {
        next.history.unshift(event(next, 'Made time to study', 'You invested time in education and improved your knowledge.'));
      }
      break;
    case 'exercise':
      next.fitness = clamp(next.fitness + 6);
      next.health = clamp(next.health + 2);
      next.happiness = clamp(next.happiness + 2);
      next.history.unshift(event(next, 'Focused on fitness', 'A good session improved your fitness and lifted your mood.'));
      break;
    case 'socialize':
      next.happiness = clamp(next.happiness + 7);
      if (next.age >= 16) next.money -= getActivityCost(next, 'socialize');
      next.history.unshift(event(next, 'Spent time with friends', 'You made space for people who matter.'));
      break;
    case 'work':
      if (next.age < 16) return character;
      next.money += 180 * scale;
      next.happiness = clamp(next.happiness - 2);
      next.history.unshift(event(next, 'Picked up extra work', 'You earned some money, although it took time and energy.'));
      break;
    case 'apply-job': {
      const offeredJob = createEmployment(next);
      const personalityBonus = (next.personality ?? []).some((trait) => trait === 'Ambitious' || trait === 'Disciplined') ? 0.06 : 0;
      const qualificationBonus = next.education === 'Higher education' ? 0.16 : 0;
      const skillBonus = (next.intelligence - 50) / 300;
      const successChance = next.age < 18 ? 0.86 : Math.max(0.35, Math.min(0.92, 0.62 + qualificationBonus + skillBonus + personalityBonus));
      if (random() < successChance) {
        const previous = next.employment?.title;
        next.employment = offeredJob;
        next.history.unshift(event(next, previous ? 'Moved into a new role' : 'Started a new job', (previous ? 'You left ' + previous + ' for ' : 'You secured ') + offeredJob.title + '. Annual pay is ' + formatCharacterMoney(next, offeredJob.annualSalary) + ' per year.', 'milestone'));
      } else {
        next.history.unshift(event(next, 'Job application unsuccessful', 'The application did not lead to an offer. You can build experience or qualifications and try again.'));
      }
      break;
    }
    case 'career':
      if (!next.employment) return character;
      next.employment = { ...next.employment, performance: clamp(next.employment.performance + 12) };
      next.happiness = clamp(next.happiness + 1);
      next.history.unshift(event(next, 'Invested in career development', 'Your performance improved. Sustained results can lead to a promotion.'));
      break;
  }
  return next;
}

export function advanceYear(character: Character): Character {
  const next: Character = { ...character, age: character.age + 1, year: character.year + 1, actionsRemaining: ACTIONS_PER_YEAR, health: clamp(character.health - (character.age >= 45 ? 2 : 1)), history: [...character.history] };
  const educationStage = getEducationStage(next.age);
  if ([3, 6, 13, 18].includes(next.age) && next.education !== 'Higher education' && next.education !== educationStage) {
    next.education = educationStage;
    next.educationProgress = 0;
    next.history.unshift(event(next, 'Education stage changed', 'You entered ' + educationStage.toLowerCase() + '.', 'milestone'));
  }
  if (next.age === 18 && !next.householdArrangement) {
    next.householdArrangement = 'family-supported';
    next.history.unshift(event(next, 'Household finances unlocked', 'You can now choose how you live and manage recurring household costs.', 'milestone'));
  }

  // Existing saves without banking fields remain valid; new accounts earn simple annual interest.
  const accounts = next.bankAccounts ?? [];
  if (accounts.length) {
    next.bankAccounts = accounts.map((account) => {
      const interest = Math.floor(account.balance * account.annualInterestRate);
      if (interest > 0) {
        next.financialTransactions = financeRecord(next, 'interest', interest, 'Annual interest earned on ' + account.name + '.', 'Bank', account.name);
        next.history.unshift(event(next, 'Bank interest received', account.name + ' earned ' + formatCharacterMoney(next, interest) + ' in interest.', 'event'));
      }
      return { ...account, balance: account.balance + interest };
    });
  }
  const job = next.employment ? { ...next.employment } : null;
  if (next.age >= 18) {
    const income = job ? Math.round(job.annualSalary) : 0;
    const plannedExpenses = getHouseholdBudget(next).total;
    const available = next.money + income;
    const expenses = Math.min(available, plannedExpenses);
    const shortfall = Math.max(0, plannedExpenses - expenses);
    next.money = available - expenses;
    if (income > 0) next.financialTransactions = financeRecord(next, 'income', income, 'Annual employment income received.', 'Employment', 'Cash');
    if (expenses > 0) next.financialTransactions = financeRecord(next, 'expense', expenses, 'Annual household expenses paid.', 'Cash', 'Household');
    next.lastYearIncome = income;
    next.lastYearExpenses = expenses;
    next.lastYearShortfall = shortfall;
    if (income > 0) next.history.unshift(event(next, 'Annual pay received', 'You received ' + formatCharacterMoney(next, income) + ' in earnings.', 'event'));
    if (shortfall > 0) {
      next.happiness = clamp(next.happiness - 4);
      next.history.unshift(event(next, 'Household budget shortfall', 'You could not cover ' + formatCharacterMoney(next, shortfall) + ' of estimated household costs. Your balance cannot go below zero; no debt is created.', 'event'));
    }
    next.history.unshift(event(next, 'Household budget settled', 'Income: ' + formatCharacterMoney(next, income) + '. Costs paid: ' + formatCharacterMoney(next, expenses) + ' of ' + formatCharacterMoney(next, plannedExpenses) + ' estimated.', 'event'));
  } else if (job) {
    const income = Math.round(job.annualSalary);
    const expenseRate = job.type === 'part-time' ? 0.2 : job.type === 'flexible' ? 0.45 : 0.55;
    const expenses = Math.round(income * expenseRate);
    next.money = Math.max(0, next.money + income - expenses);
    if (income > 0) next.financialTransactions = financeRecord(next, 'income', income, 'Annual employment income received.', 'Employment', 'Cash');
    if (expenses > 0) next.financialTransactions = financeRecord(next, 'expense', expenses, 'Estimated living costs paid.', 'Cash', 'Living costs');
    next.lastYearIncome = income;
    next.lastYearExpenses = expenses;
    next.lastYearShortfall = 0;
    next.history.unshift(event(next, 'Annual pay received', 'You received ' + formatCharacterMoney(next, income) + ' in earnings. Estimated living costs were ' + formatCharacterMoney(next, expenses) + '.', 'event'));
  } else {
    next.lastYearIncome = 0;
    next.lastYearExpenses = 0;
    next.lastYearShortfall = 0;
  }

  if (job) {
    job.experienceYears += 1;
    if (job.experienceYears >= 2 && job.performance >= 85 && job.promotions < 3) {
      const oldTitle = job.title;
      job.title = 'Senior ' + oldTitle.replace(/^Senior /, '');
      job.annualSalary = Math.round(job.annualSalary * 1.2);
      job.performance = 60;
      job.promotions += 1;
      next.history.unshift(event(next, 'Promoted at work', 'Your results earned a promotion from ' + oldTitle + ' to ' + job.title + '. Pay increased by 20%.', 'milestone'));
    }
    next.employment = job;
  }

  next.history.unshift(event(next, 'Another year, another chapter', 'You turned ' + next.age + '. Your choices continue to shape what comes next.', 'milestone'));
  if (next.age === 18) next.history.unshift(event(next, 'Adult opportunities unlocked', 'Full-time employment, higher education and household finance choices are now available.', 'milestone'));
  if (next.age === 21) next.history.unshift(event(next, 'A new stage of adulthood', 'New responsibilities and opportunities may begin to appear.', 'event'));
  return next;
}
