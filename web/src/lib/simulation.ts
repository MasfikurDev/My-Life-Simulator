import type { ActivityId, BankAccount, BankAccountType, Character, FinancialTransaction, LifeEvent, Gender, Employment, HouseholdArrangement, SavingsGoalMonths, BankCard, CardType, Loan, LoanType, PaymentSourceType, RecurringPayment, PropertyType, PropertyAsset, InvestmentType, OwnedBusiness, BusinessType } from './types';
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
  const investments = (character.investments ?? []).reduce((sum, holding) => sum + holding.units * getMarketPrice(character, holding.type), 0);
  const properties = (character.properties ?? []).reduce((sum, property) => sum + property.marketValue, 0);
  const businesses = (character.businesses ?? []).reduce((sum, business) => sum + business.valuation, 0);
  return Math.round(character.money + (character.bankAccounts ?? []).reduce((sum, account) => sum + account.balance, 0) + (character.vaultBalance ?? 0) + (character.cards ?? []).filter((card) => card.type === 'prepaid').reduce((sum, card) => sum + card.balance, 0) + investments + properties + businesses - (character.loans ?? []).reduce((sum, loan) => sum + (loan.active ? loan.balance : 0), 0) - (character.cards ?? []).filter((card) => card.type === 'credit').reduce((sum, card) => sum + card.balance, 0));
}



export function getMarketPrice(character: Character, type: InvestmentType): number {
  const scale = character.currencyScale ?? 1;
  return Math.max(1, Math.round(type === 'gold' ? (character.marketPrices?.gold ?? 150 * scale) : (character.marketPrices?.stocks ?? 100 * scale)));
}
export function tradeInvestment(character: Character, type: InvestmentType, action: 'buy' | 'sell', units: number): Character {
  const quantity = Math.floor(units);
  if (character.age < 18 || !Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 1000000) return character;
  const price = getMarketPrice(character, type);
  const total = price * quantity;
  if (!Number.isSafeInteger(total)) return character;
  const holdings = [...(character.investments ?? [])];
  const index = holdings.findIndex((holding) => holding.type === type);
  const holding = index >= 0 ? holdings[index] : { type, units: 0, averageCost: 0 };
  if (action === 'buy') {
    if (character.money < total) return character;
    const nextHolding = { type, units: holding.units + quantity, averageCost: Math.round(((holding.units * holding.averageCost) + total) / (holding.units + quantity)) };
    if (index >= 0) holdings[index] = nextHolding; else holdings.push(nextHolding);
    const next = { ...character, money: character.money - total, investments: holdings, history: [...character.history] };
    next.financialTransactions = financeRecord(next, 'investment-buy', total, 'Bought ' + quantity + ' units of ' + type + '.', 'Cash', type);
    return next;
  }
  if (holding.units < quantity) return character;
  const remaining = holding.units - quantity;
  if (remaining === 0) holdings.splice(index, 1); else holdings[index] = { ...holding, units: remaining };
  const next = { ...character, money: character.money + total, investments: holdings, history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'investment-sell', total, 'Sold ' + quantity + ' units of ' + type + '.', type, 'Cash');
  return next;
}
export function buyProperty(character: Character, type: PropertyType, name: string, price: number, downPayment: number, annualRate = 0.07, termYears = 20, primaryResidence = false): Character {
  const value = Math.floor(price), down = Math.floor(downPayment);
  if (character.age < 18 || (character.properties ?? []).length >= 5 || !validAmount(value) || !Number.isSafeInteger(down) || down < Math.ceil(value * 0.2) || down > value || character.money < down || !Number.isFinite(annualRate) || annualRate < 0 || annualRate > 0.5 || !Number.isInteger(termYears) || termYears < 1 || termYears > 30) return character;
  const financed = value - down;
  let next = character;
  if (financed > 0) {
    next = takeLoan(character, 'mortgage', 'Mortgage · ' + (name.trim() || type), financed, annualRate, termYears);
    if (next === character) return character;
  }
  const mortgage = financed > 0 ? (next.loans ?? [])[Math.max(0, (next.loans ?? []).length - 1)] : undefined;
  const label = name.trim().slice(0, 36) || (type === 'house' ? 'House' : 'Apartment');
  const property: PropertyAsset = { id: 'property-' + character.year + '-' + character.age + '-' + ((character.properties ?? []).length + 1), name: label, type, marketValue: value, purchasePrice: value, annualMaintenance: Math.max(1, Math.round(value * 0.01)), mortgageLoanId: mortgage?.id, rentedOut: false, annualRentalIncome: 0 };
  next = { ...next, money: next.money - value, properties: [...(next.properties ?? []), property], primaryResidenceId: primaryResidence ? property.id : next.primaryResidenceId, rentalHome: primaryResidence ? null : next.rentalHome, history: [...next.history] };
  next.financialTransactions = financeRecord(next, 'property-purchase', value, 'Purchased ' + label + '.', 'Cash and mortgage', label);
  next.history.unshift(event(next, 'Property purchased', label + ' was added to your assets' + (mortgage ? ' with mortgage financing.' : '.'), 'milestone'));
  return next;
}
export function rentHome(character: Character, type: PropertyType, annualRent: number): Character {
  const rent = Math.floor(annualRent);
  if (character.age < 18 || !validAmount(rent)) return character;
  const next = { ...character, rentalHome: { type, annualRent: rent }, primaryResidenceId: undefined, history: [...character.history] };
  next.history.unshift(event(next, 'Moved into a rental home', 'You chose to rent an ' + type + ' for ' + formatCharacterMoney(next, rent) + ' per year.', 'milestone'));
  return next;
}
export function moveIntoOwnedProperty(character: Character, propertyId: string): Character {
  const property = (character.properties ?? []).find((item) => item.id === propertyId);
  if (character.age < 18 || !property || property.rentedOut) return character;
  const next = { ...character, primaryResidenceId: propertyId, rentalHome: null, history: [...character.history] };
  next.history.unshift(event(next, 'Moved into owned property', 'You made ' + property.name + ' your primary residence.', 'milestone'));
  return next;
}
export function setPropertyRental(character: Character, propertyId: string, rentedOut: boolean, annualRentalIncome = 0): Character {
  const property = (character.properties ?? []).find((item) => item.id === propertyId);
  const income = Math.floor(annualRentalIncome);
  if (!property || propertyId === character.primaryResidenceId || (rentedOut && !validAmount(income))) return character;
  const next = { ...character, properties: (character.properties ?? []).map((item) => item.id === propertyId ? { ...item, rentedOut, annualRentalIncome: rentedOut ? income : 0 } : item), history: [...character.history] };
  next.history.unshift(event(next, rentedOut ? 'Property listed for rent' : 'Property rental ended', rentedOut ? property.name + ' is expected to earn ' + formatCharacterMoney(next, income) + ' each year.' : property.name + ' is no longer rented out.', 'milestone'));
  return next;
}
export function sellProperty(character: Character, propertyId: string): Character {
  const property = (character.properties ?? []).find((item) => item.id === propertyId);
  if (!property) return character;
  const mortgage = property.mortgageLoanId ? (character.loans ?? []).find((loan) => loan.id === property.mortgageLoanId && loan.active) : undefined;
  const debt = mortgage?.balance ?? 0;
  if (property.marketValue < debt) return character;
  const proceeds = property.marketValue - debt;
  const next = { ...character, money: character.money + proceeds, properties: (character.properties ?? []).filter((item) => item.id !== propertyId), loans: mortgage ? (character.loans ?? []).map((loan) => loan.id === mortgage.id ? { ...loan, balance: 0, active: false } : loan) : character.loans, primaryResidenceId: character.primaryResidenceId === propertyId ? undefined : character.primaryResidenceId, history: [...character.history] };
  if (debt > 0) next.financialTransactions = financeRecord(next, 'loan-payment', debt, 'Mortgage settled when selling ' + property.name + '.', property.name, mortgage!.name);
  next.financialTransactions = financeRecord(next, 'property-sale', property.marketValue, 'Sold ' + property.name + ' and settled linked mortgage.', property.name, 'Cash');
  next.history.unshift(event(next, 'Property sold', property.name + ' sold for ' + formatCharacterMoney(next, property.marketValue) + (debt ? ', with ' + formatCharacterMoney(next, debt) + ' mortgage settled.' : '.'), 'milestone'));
  return next;
}
export function startBusiness(character: Character, name: string, type: BusinessType, capital: number): Character {
  const amount = Math.floor(capital);
  if (character.age < 18 || (character.businesses ?? []).length >= 3 || !validAmount(amount) || amount < 1000 * (character.currencyScale ?? 1) || character.money < amount) return character;
  const label = name.trim().slice(0, 36);
  if (!label) return character;
  const business: OwnedBusiness = { id: 'business-' + character.year + '-' + character.age + '-' + ((character.businesses ?? []).length + 1), name: label, type, investedCapital: amount, valuation: amount, performance: 60 };
  const next = { ...character, money: character.money - amount, businesses: [...(character.businesses ?? []), business], history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'business-start', amount, 'Started ' + label + '.', 'Cash', label);
  next.history.unshift(event(next, 'Started a business', label + ' opened with ' + formatCharacterMoney(next, amount) + ' in startup capital.', 'milestone'));
  return next;
}
export function manageBusiness(character: Character, businessId: string): Character {
  const business = (character.businesses ?? []).find((item) => item.id === businessId);
  const cost = business ? Math.max(1, Math.round(business.investedCapital * 0.01)) : 0;
  if (!business || character.age < 18 || character.actionsRemaining <= 0 || character.money < cost) return character;
  const next = { ...character, money: character.money - cost, actionsRemaining: character.actionsRemaining - 1, businesses: (character.businesses ?? []).map((item) => item.id === businessId ? { ...item, performance: clamp(item.performance + 8) } : item), history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'business-expense', cost, 'Business development expense for ' + business.name + '.', 'Cash', business.name);
  next.history.unshift(event(next, 'Managed your business', 'You invested time and ' + formatCharacterMoney(next, cost) + ' into improving ' + business.name + '.'));
  return next;
}
export function closeBusiness(character: Character, businessId: string): Character {
  const business = (character.businesses ?? []).find((item) => item.id === businessId);
  if (!business) return character;
  const proceeds = Math.floor(business.valuation * 0.9);
  const next = { ...character, money: character.money + proceeds, businesses: (character.businesses ?? []).filter((item) => item.id !== businessId), history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'business-sale', proceeds, 'Closed and sold ' + business.name + '.', business.name, 'Cash');
  next.history.unshift(event(next, 'Business sold', business.name + ' was sold for ' + formatCharacterMoney(next, proceeds) + '.', 'milestone'));
  return next;
}
export function getEconomicConditions(character: Character) {
  return character.economy ?? { inflationRate: 0.025, growthRate: 0.02, baseInterestRate: 0.045, cycle: 'stable' as const, costOfLivingIndex: 1, lastUpdatedYear: character.year };
}
function advanceEconomicConditions(character: Character): Character {
  const previous = getEconomicConditions(character);
  const wave = Math.sin(character.year * 1.71 + (character.age % 11) * 0.37);
  const secondary = Math.sin(character.year * 0.63 + 2.4);
  const growthRate = Math.max(-0.055, Math.min(0.065, wave * 0.038 + secondary * 0.012));
  const inflationRate = Math.max(-0.015, Math.min(0.095, 0.025 + secondary * 0.025 + (growthRate < -0.02 ? 0.012 : 0)));
  const baseInterestRate = Math.max(0.01, Math.min(0.14, 0.035 + inflationRate * 0.55 - growthRate * 0.2));
  const cycle: 'expansion' | 'stable' | 'recession' = growthRate < -0.018 ? 'recession' : growthRate > 0.025 ? 'expansion' : 'stable';
  const costOfLivingIndex = Math.max(0.5, Math.min(5, previous.costOfLivingIndex * (1 + inflationRate)));
  const economy = { inflationRate, growthRate, baseInterestRate, cycle, costOfLivingIndex, lastUpdatedYear: character.year };
  const inflationFactor = 1 + Math.max(-0.01, inflationRate);
  return { ...character, economy,
    recurringPayments: (character.recurringPayments ?? []).map((payment) => ({ ...payment, amount: Math.max(1, Math.round(payment.amount * inflationFactor)) })),
    rentalHome: character.rentalHome ? { ...character.rentalHome, annualRent: Math.max(1, Math.round(character.rentalHome.annualRent * inflationFactor)) } : character.rentalHome,
    properties: (character.properties ?? []).map((property) => ({ ...property, annualRentalIncome: property.rentedOut ? Math.max(1, Math.round(property.annualRentalIncome * inflationFactor)) : property.annualRentalIncome }))
  };
}
function settleAnnualAssets(character: Character): Character {
  let next = character;
  const scale = next.currencyScale ?? 1;
  const economy = getEconomicConditions(next);
  const stockNoise = Math.sin(next.year * 12.9898 + next.age * 78.233) * 0.12;
  const goldNoise = Math.sin(next.year * 3.17 + next.age * 1.7) * 0.035;
  const stockMovement = Math.max(-0.35, Math.min(0.3, economy.growthRate * 1.35 + stockNoise));
  const goldMovement = Math.max(-0.12, Math.min(0.2, economy.inflationRate * 0.75 - economy.growthRate * 0.15 + goldNoise));
  const oldPrices = next.marketPrices ?? { stocks: 100 * scale, gold: 150 * scale, lastUpdatedYear: next.year - 1 };
  next = { ...next, marketPrices: { stocks: Math.max(1, Math.round(oldPrices.stocks * (1 + stockMovement))), gold: Math.max(1, Math.round(oldPrices.gold * (1 + goldMovement))), lastUpdatedYear: next.year } };
  if ((next.properties ?? []).length) {
    const propertyGrowth = Math.max(-0.08, Math.min(0.12, economy.inflationRate * 0.35 + economy.growthRate * 0.45 + 0.005));
    next = { ...next, properties: (next.properties ?? []).map((property) => ({ ...property, marketValue: Math.max(1, Math.round(property.marketValue * (1 + propertyGrowth))) })) };
    for (const property of next.properties ?? []) {
      if (property.rentedOut && property.annualRentalIncome > 0) {
        next = { ...next, money: next.money + property.annualRentalIncome };
        next.financialTransactions = financeRecord(next, 'property-rent', property.annualRentalIncome, 'Rental income from ' + property.name + '.', property.name, 'Cash');
      }
    }
  }
  for (const business of next.businesses ?? []) {
    const profitRate = ((business.performance - 50) / 100) * 0.1 + economy.growthRate * 0.35;
    const profit = Math.round(business.investedCapital * profitRate);
    if (profit > 0) {
      next = { ...next, money: next.money + profit };
      next.financialTransactions = financeRecord(next, 'business-income', profit, 'Annual operating profit from ' + business.name + '.', business.name, 'Cash');
    } else if (profit < 0) {
      const loss = Math.abs(profit);
      const paid = Math.min(next.money, loss);
      next = { ...next, money: next.money - paid };
      next.financialTransactions = financeRecord(next, 'business-expense', paid, 'Annual operating loss at ' + business.name + '.', 'Cash', business.name);
      if (paid < loss) next = { ...next, businesses: (next.businesses ?? []).map((item) => item.id === business.id ? { ...item, valuation: Math.max(0, item.valuation - (loss - paid)) } : item) };
    }
  }
  return next;
}


function validAmount(amount: number): boolean { return Number.isSafeInteger(amount) && amount > 0; }
function accountExists(character: Character, id?: string): boolean { return !!id && (character.bankAccounts ?? []).some((account) => account.id === id); }
function updateAccountBalance(character: Character, id: string, delta: number): BankAccount[] {
  return (character.bankAccounts ?? []).map((account) => account.id === id ? { ...account, balance: account.balance + delta } : account);
}
export function issueBankCard(character: Character, type: CardType, name: string, linkedAccountId?: string, creditLimit = 0): Character {
  if (character.age < (type === 'credit' ? 18 : 16) || (character.cards ?? []).length >= 6) return character;
  if (type === 'debit' && !accountExists(character, linkedAccountId)) return character;
  if (type === 'credit' && (!validAmount(creditLimit) || creditLimit > 100000000 || (linkedAccountId && !accountExists(character, linkedAccountId)))) return character;
  const label = name.trim().slice(0, 28) || (type === 'credit' ? 'Credit card' : type === 'prepaid' ? 'Prepaid card' : 'Debit card');
  const card: BankCard = { id: 'card-' + character.year + '-' + character.age + '-' + ((character.cards ?? []).length + 1), name: label, type, linkedAccountId, creditLimit: type === 'credit' ? creditLimit : 0, balance: 0, annualInterestRate: type === 'credit' ? 0.18 : 0, active: true };
  const next = { ...character, cards: [...(character.cards ?? []), card], history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'card-issued', 0, 'Issued ' + label + '.', 'Bank', label);
  next.history.unshift(event(next, 'Payment card issued', 'You added a ' + type + ' card named ' + label + '.', 'milestone'));
  return next;
}
export function loadPrepaidCard(character: Character, cardId: string, amount: number, source: 'cash' | 'account' = 'cash', sourceId?: string): Character {
  const value = Math.floor(amount);
  const card = (character.cards ?? []).find((item) => item.id === cardId && item.type === 'prepaid' && item.active);
  const account = source === 'account' ? (character.bankAccounts ?? []).find((item) => item.id === sourceId) : undefined;
  if (!card || !validAmount(value) || (source === 'cash' && character.money < value) || (source === 'account' && (!account || account.balance < value))) return character;
  const next = { ...character, money: source === 'cash' ? character.money - value : character.money, bankAccounts: source === 'account' && account ? updateAccountBalance(character, account.id, -value) : character.bankAccounts, cards: (character.cards ?? []).map((item) => item.id === cardId ? { ...item, balance: item.balance + value } : item), history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'card-load', value, 'Loaded ' + formatCharacterMoney(next, value) + ' onto ' + card.name + '.', source === 'cash' ? 'Cash' : account!.name, card.name);
  return next;
}
export function makeCardPurchase(character: Character, cardId: string, amount: number, description = 'Card purchase'): Character {
  const value = Math.floor(amount);
  const card = (character.cards ?? []).find((item) => item.id === cardId && item.active);
  if (!card || !validAmount(value)) return character;
  if (card.type === 'prepaid') {
    if (card.balance < value) return character;
    const next = { ...character, cards: (character.cards ?? []).map((item) => item.id === cardId ? { ...item, balance: item.balance - value } : item), history: [...character.history] };
    next.financialTransactions = financeRecord(next, 'card-purchase', value, description + ' using ' + card.name + '.', card.name, 'Merchant');
    return next;
  }
  if (card.type === 'debit') {
    const account = (character.bankAccounts ?? []).find((item) => item.id === card.linkedAccountId);
    if (!account || account.balance < value) return character;
    const next = { ...character, bankAccounts: updateAccountBalance(character, account.id, -value), history: [...character.history] };
    next.financialTransactions = financeRecord(next, 'card-purchase', value, description + ' using ' + card.name + '.', account.name, 'Merchant');
    return next;
  }
  if (card.balance + value > card.creditLimit) return character;
  const next = { ...character, cards: (character.cards ?? []).map((item) => item.id === cardId ? { ...item, balance: item.balance + value } : item), history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'card-purchase', value, description + ' using ' + card.name + '.', card.name, 'Merchant');
  return next;
}
export function payCreditCard(character: Character, cardId: string, amount: number, source: 'cash' | 'account' = 'cash', sourceId?: string): Character {
  const value = Math.floor(amount);
  const card = (character.cards ?? []).find((item) => item.id === cardId && item.type === 'credit' && item.active);
  const account = source === 'account' ? (character.bankAccounts ?? []).find((item) => item.id === sourceId) : undefined;
  if (!card || !validAmount(value) || value > card.balance || (source === 'cash' && character.money < value) || (source === 'account' && (!account || account.balance < value))) return character;
  const next = { ...character, money: source === 'cash' ? character.money - value : character.money, bankAccounts: source === 'account' && account ? updateAccountBalance(character, account.id, -value) : character.bankAccounts, cards: (character.cards ?? []).map((item) => item.id === cardId ? { ...item, balance: item.balance - value } : item), history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'card-payment', value, 'Paid ' + formatCharacterMoney(next, value) + ' toward ' + card.name + '.', source === 'cash' ? 'Cash' : account!.name, card.name);
  return next;
}
export function takeLoan(character: Character, type: LoanType, name: string, principal: number, annualInterestRate: number, termYears: number, paymentAccountId?: string): Character {
  const value = Math.floor(principal);
  if (character.age < 18 || (character.loans ?? []).filter((loan) => loan.active).length >= 5 || !validAmount(value) || !Number.isFinite(annualInterestRate) || annualInterestRate < 0 || annualInterestRate > 0.5 || !Number.isInteger(termYears) || termYears < 1 || termYears > 30 || (paymentAccountId && !accountExists(character, paymentAccountId))) return character;
  const label = name.trim().slice(0, 28) || (type === 'mortgage' ? 'Home loan' : type === 'business' ? 'Business loan' : 'Personal loan');
  const loan: Loan = { id: 'loan-' + character.year + '-' + character.age + '-' + ((character.loans ?? []).length + 1), name: label, type, principal: value, balance: value, annualInterestRate, termYears, paymentAccountId, active: true };
  const next = { ...character, money: character.money + value, loans: [...(character.loans ?? []), loan], history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'loan-issued', value, 'Received ' + formatCharacterMoney(next, value) + ' from ' + label + '.', label, 'Cash');
  next.history.unshift(event(next, 'Loan approved', label + ' added ' + formatCharacterMoney(next, value) + ' to cash. Repayments and interest will be applied annually.', 'milestone'));
  return next;
}
export function repayLoan(character: Character, loanId: string, amount: number, source: 'cash' | 'account' = 'cash', sourceId?: string): Character {
  const value = Math.floor(amount);
  const loan = (character.loans ?? []).find((item) => item.id === loanId && item.active);
  const account = source === 'account' ? (character.bankAccounts ?? []).find((item) => item.id === sourceId) : undefined;
  if (!loan || !validAmount(value) || value > loan.balance || (source === 'cash' && character.money < value) || (source === 'account' && (!account || account.balance < value))) return character;
  const balance = loan.balance - value;
  const next = { ...character, money: source === 'cash' ? character.money - value : character.money, bankAccounts: source === 'account' && account ? updateAccountBalance(character, account.id, -value) : character.bankAccounts, loans: (character.loans ?? []).map((item) => item.id === loanId ? { ...item, balance, active: balance > 0 } : item), history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'loan-payment', value, 'Repaid ' + formatCharacterMoney(next, value) + ' toward ' + loan.name + '.', source === 'cash' ? 'Cash' : account!.name, loan.name);
  if (balance === 0) next.history.unshift(event(next, 'Loan paid off', 'You fully repaid ' + loan.name + '.', 'milestone'));
  return next;
}
export function addRecurringPayment(character: Character, name: string, amount: number, category: 'subscription' | 'bill', sourceType: PaymentSourceType, sourceId?: string): Character {
  const value = Math.floor(amount);
  if (character.age < 16 || (character.recurringPayments ?? []).filter((item) => item.active).length >= 12 || !validAmount(value)) return character;
  if (sourceType === 'account' && !accountExists(character, sourceId)) return character;
  if (sourceType === 'card' && !(character.cards ?? []).some((card) => card.id === sourceId && card.active)) return character;
  const label = name.trim().slice(0, 36);
  if (!label) return character;
  const payment: RecurringPayment = { id: 'recurring-' + character.year + '-' + character.age + '-' + ((character.recurringPayments ?? []).length + 1), name: label, amount: value, category, sourceType, sourceId, active: true, startedAtYear: character.year };
  const next = { ...character, recurringPayments: [...(character.recurringPayments ?? []), payment], history: [...character.history] };
  next.history.unshift(event(next, 'Recurring payment added', label + ' will cost ' + formatCharacterMoney(next, value) + ' each year.', 'milestone'));
  return next;
}
export function cancelRecurringPayment(character: Character, id: string): Character {
  if (!(character.recurringPayments ?? []).some((item) => item.id === id && item.active)) return character;
  return { ...character, recurringPayments: (character.recurringPayments ?? []).map((item) => item.id === id ? { ...item, active: false } : item), history: [...character.history, event(character, 'Recurring payment cancelled', 'A recurring bill or subscription was cancelled.')] };
}
export function setAutoDeposit(character: Character, targetAccountId: string, method: 'fixed' | 'percentage', value: number): Character {
  if (character.age < 16 || !accountExists(character, targetAccountId) || !Number.isFinite(value) || value <= 0 || (method === 'percentage' && value > 90) || (method === 'fixed' && (!Number.isSafeInteger(value) || value > 100000000))) return character;
  const rules = (character.autoDepositRules ?? []).filter((rule) => rule.active);
  if (rules.length >= 5) return character;
  const rule = { id: 'auto-deposit-' + character.year + '-' + character.age + '-' + ((character.autoDepositRules ?? []).length + 1), targetAccountId, method, value, active: true };
  const next = { ...character, autoDepositRules: [...(character.autoDepositRules ?? []).filter((item) => item.targetAccountId !== targetAccountId), rule], history: [...character.history] };
  next.history.unshift(event(next, 'Automatic savings configured', (method === 'percentage' ? value + '% of annual income' : formatCharacterMoney(next, value) + ' per year') + ' will be moved to your selected account after income arrives.', 'milestone'));
  return next;
}
export function depositToVault(character: Character, amount: number): Character {
  const value = Math.floor(amount);
  if (character.age < 16 || !validAmount(value) || character.money < value) return character;
  const next = { ...character, money: character.money - value, vaultBalance: (character.vaultBalance ?? 0) + value, history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'vault-deposit', value, 'Stored ' + formatCharacterMoney(next, value) + ' in your personal safe.', 'Cash', 'Personal safe');
  return next;
}
export function withdrawFromVault(character: Character, amount: number): Character {
  const value = Math.floor(amount);
  if (character.age < 16 || !validAmount(value) || (character.vaultBalance ?? 0) < value) return character;
  const next = { ...character, money: character.money + value, vaultBalance: (character.vaultBalance ?? 0) - value, history: [...character.history] };
  next.financialTransactions = financeRecord(next, 'vault-withdrawal', value, 'Removed ' + formatCharacterMoney(next, value) + ' from your personal safe.', 'Personal safe', 'Cash');
  return next;
}
function settleFinancialProducts(character: Character): Character {
  let next = character;
  // Automatic deposits are processed after income and before optional recurring payments.
  for (const rule of next.autoDepositRules ?? []) {
    if (!rule.active) continue;
    const account = (next.bankAccounts ?? []).find((item) => item.id === rule.targetAccountId);
    if (!account) continue;
    const amount = rule.method === 'percentage' ? Math.floor((next.lastYearIncome ?? 0) * rule.value / 100) : rule.value;
    if (amount > 0 && next.money >= amount) {
      next = { ...next, money: next.money - amount, bankAccounts: updateAccountBalance(next, account.id, amount) };
      next.financialTransactions = financeRecord(next, 'auto-deposit', amount, 'Automatic deposit to ' + account.name + '.', 'Cash', account.name);
    }
  }
  // Recurring charges use the selected source; failed charges are recorded but never create hidden debt.
  for (const payment of next.recurringPayments ?? []) {
    if (!payment.active || payment.startedAtYear > next.year) continue;
    if (payment.sourceType === 'cash' && next.money >= payment.amount) {
      next = { ...next, money: next.money - payment.amount };
      next.financialTransactions = financeRecord(next, 'recurring-payment', payment.amount, 'Paid ' + payment.name + '.', 'Cash', payment.name);
    } else if (payment.sourceType === 'account') {
      const account = (next.bankAccounts ?? []).find((item) => item.id === payment.sourceId);
      if (account && account.balance >= payment.amount) {
        next = { ...next, bankAccounts: updateAccountBalance(next, account.id, -payment.amount) };
        next.financialTransactions = financeRecord(next, 'recurring-payment', payment.amount, 'Paid ' + payment.name + '.', account.name, payment.name);
      } else { next.financialTransactions = financeRecord(next, 'expense', 0, 'Missed payment: ' + payment.name + '.', account?.name ?? 'Missing account', payment.name); }
    } else if (payment.sourceType === 'card') {
      const card = (next.cards ?? []).find((item) => item.id === payment.sourceId && item.active);
      const linkedAccount = card?.type === 'debit' ? (next.bankAccounts ?? []).find((account) => account.id === card.linkedAccountId) : undefined;
      const canCharge = card && (card.type === 'credit' ? card.balance + payment.amount <= card.creditLimit : card.type === 'prepaid' ? card.balance >= payment.amount : !!linkedAccount && linkedAccount.balance >= payment.amount);
      if (card && canCharge) {
        if (card.type === 'debit' && linkedAccount) next = { ...next, bankAccounts: updateAccountBalance(next, linkedAccount.id, -payment.amount) };
        else next = { ...next, cards: (next.cards ?? []).map((item) => item.id === card.id ? { ...item, balance: item.type === 'credit' ? item.balance + payment.amount : item.balance - payment.amount } : item) };
        next.financialTransactions = financeRecord(next, 'recurring-payment', payment.amount, 'Charged ' + payment.name + ' to ' + card.name + '.', card.name, payment.name);
      } else { next.financialTransactions = financeRecord(next, 'expense', 0, 'Missed payment: ' + payment.name + '.', card?.name ?? 'Unavailable card', payment.name); }
    } else if (payment.sourceType === 'cash') {
      next.financialTransactions = financeRecord(next, 'expense', 0, 'Missed payment: ' + payment.name + '.', 'Cash', payment.name);
    }
  }
  // Loan interest accrues yearly; a fixed principal-plus-interest installment is attempted.
  for (const loan of next.loans ?? []) {
    if (!loan.active) continue;
    const interest = Math.floor(loan.balance * loan.annualInterestRate);
    const withInterest = loan.balance + interest;
    const principalPart = Math.ceil(loan.principal / loan.termYears);
    const due = Math.min(withInterest, principalPart + interest);
    if (interest > 0) {
      next = { ...next, loans: (next.loans ?? []).map((item) => item.id === loan.id ? { ...item, balance: withInterest } : item) };
      next.financialTransactions = financeRecord(next, 'loan-interest', interest, 'Interest accrued on ' + loan.name + '.', 'Lender', loan.name);
    }
    const account = loan.paymentAccountId ? (next.bankAccounts ?? []).find((item) => item.id === loan.paymentAccountId) : undefined;
    if (loan.paymentAccountId && account && account.balance >= due) {
      const remaining = withInterest - due;
      next = { ...next, bankAccounts: updateAccountBalance(next, account.id, -due), loans: (next.loans ?? []).map((item) => item.id === loan.id ? { ...item, balance: remaining, active: remaining > 0 } : item) };
      next.financialTransactions = financeRecord(next, 'loan-payment', due, 'Annual installment paid for ' + loan.name + '.', account.name, loan.name);
    } else if (!loan.paymentAccountId && next.money >= due) {
      const remaining = withInterest - due;
      next = { ...next, money: next.money - due, loans: (next.loans ?? []).map((item) => item.id === loan.id ? { ...item, balance: remaining, active: remaining > 0 } : item) };
      next.financialTransactions = financeRecord(next, 'loan-payment', due, 'Annual installment paid for ' + loan.name + '.', 'Cash', loan.name);
    } else {
      next.financialTransactions = financeRecord(next, 'expense', 0, 'Missed loan installment for ' + loan.name + '.', loan.paymentAccountId ? 'Bank account' : 'Cash', loan.name);
    }
  }
  // Credit balances accrue interest and attempt a 5% minimum payment from the linked account or cash.
  for (const card of next.cards ?? []) {
    if (!card.active || card.type !== 'credit' || card.balance <= 0) continue;
    const interest = Math.floor(card.balance * card.annualInterestRate);
    const dueBalance = card.balance + interest;
    if (interest > 0) {
      next = { ...next, cards: (next.cards ?? []).map((item) => item.id === card.id ? { ...item, balance: dueBalance } : item) };
      next.financialTransactions = financeRecord(next, 'card-interest', interest, 'Interest accrued on ' + card.name + '.', 'Bank', card.name);
    }
    const minimum = Math.min(dueBalance, Math.max(1, Math.ceil(dueBalance * 0.05)));
    const account = card.linkedAccountId ? (next.bankAccounts ?? []).find((item) => item.id === card.linkedAccountId) : undefined;
    if (account && account.balance >= minimum) {
      next = { ...next, bankAccounts: updateAccountBalance(next, account.id, -minimum), cards: (next.cards ?? []).map((item) => item.id === card.id ? { ...item, balance: dueBalance - minimum } : item) };
      next.financialTransactions = financeRecord(next, 'card-payment', minimum, 'Minimum payment for ' + card.name + '.', account.name, card.name);
    } else if (!card.linkedAccountId && next.money >= minimum) {
      next = { ...next, money: next.money - minimum, cards: (next.cards ?? []).map((item) => item.id === card.id ? { ...item, balance: dueBalance - minimum } : item) };
      next.financialTransactions = financeRecord(next, 'card-payment', minimum, 'Minimum payment for ' + card.name + '.', 'Cash', card.name);
    } else {
      next.financialTransactions = financeRecord(next, 'expense', 0, 'Missed minimum payment for ' + card.name + '.', account?.name ?? 'Cash', card.name);
    }
  }
  return next;
}

export function openBankAccount(character: Character, type: BankAccountType, name?: string, termYears = 1): Character {
  if (character.age < 16 || (type === 'fixed-deposit' && (!Number.isInteger(termYears) || termYears < 1 || termYears > 10))) return character;
  const accounts = character.bankAccounts ?? [];
  if (accounts.length >= 8) return character;
  const label = name?.trim().slice(0, 28) || (type === 'fixed-deposit' ? 'Fixed deposit' : type === 'savings' ? 'Savings account' : 'Everyday account');
  const account: BankAccount = {
    id: 'account-' + String(character.year) + '-' + String(character.age) + '-' + String(accounts.length + 1),
    name: label, type, balance: 0, annualInterestRate: type === 'fixed-deposit' ? 0.045 : type === 'savings' ? 0.02 : 0, openedAtAge: character.age, maturesAtYear: type === 'fixed-deposit' ? character.year + termYears : undefined
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
  if (character.age < 16 || !account || !Number.isSafeInteger(value) || value <= 0 || account.balance < value || (account.type === 'fixed-deposit' && character.year < (account.maturesAtYear ?? Number.MAX_SAFE_INTEGER))) return character;
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
  const costIndex = getEconomicConditions(character).costOfLivingIndex;
  const shares: Record<HouseholdArrangement, typeof zero> = {
    'family-supported': { housing: 0, food: 0.08, transport: 0.03, utilities: 0, personal: 0.04, total: 0.15 },
    shared: { housing: 0.14, food: 0.12, transport: 0.04, utilities: 0.03, personal: 0.05, total: 0.38 },
    independent: { housing: 0.25, food: 0.15, transport: 0.06, utilities: 0.06, personal: 0.06, total: 0.58 }
  };
  const share = shares[character.householdArrangement ?? 'family-supported'];
  const ownedResidence = (character.properties ?? []).find((property) => property.id === character.primaryResidenceId);
  const housing = character.rentalHome ? character.rentalHome.annualRent : ownedResidence ? 0 : Math.round(referenceIncome * share.housing * costIndex);
  const food = Math.round(referenceIncome * share.food * costIndex);
  const transport = Math.round(referenceIncome * share.transport * costIndex);
  const utilities = Math.round(referenceIncome * share.utilities * costIndex);
  const personal = Math.round(referenceIncome * share.personal * costIndex);
  const maintenance = (character.properties ?? []).reduce((sum, property) => sum + property.annualMaintenance, 0);
  const totalHousing = housing + maintenance;
  return { housing: totalHousing, food, transport, utilities, personal, total: totalHousing + food + transport + utilities + personal };
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
  let next: Character = { ...character, age: character.age + 1, year: character.year + 1, actionsRemaining: ACTIONS_PER_YEAR, health: clamp(character.health - (character.age >= 45 ? 2 : 1)), history: [...character.history] };
  next = advanceEconomicConditions(next);
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

  Object.assign(next, settleAnnualAssets(next));
  Object.assign(next, settleFinancialProducts(next));

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
