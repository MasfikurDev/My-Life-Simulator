import type { ActivityId, Character, LifeEvent, Gender } from './types';

export const ACTIONS_PER_YEAR = 3;
const clamp = (value: number) => Math.max(0, Math.min(100, value));
type CountryProfile = {
  nationality: string; country: string; cities: string[]; currency: string; scale: number;
  names: Record<'male' | 'female' | 'neutral', string[]>; surnames: string[];
};
const COUNTRIES: CountryProfile[] = [{"nationality":"Bangladeshi","country":"Bangladesh","cities":["Dhaka","Chattogram","Rajshahi","Sylhet","Khulna"],"currency":"BDT","scale":100,"names":{"male":["Aarav","Adnan","Arif","Farhan","Hasan","Imran","Mahin","Nabil","Rafi","Tanvir"],"female":["Aisha","Anika","Farah","Ishita","Jannat","Maliha","Nusrat","Raisa","Sadia","Zara"],"neutral":["Ari","Noor","Rumi","Sami","Tarin"]},"surnames":["Ahmed","Akter","Chowdhury","Hasan","Hossain","Islam","Khan","Rahman","Sarker"]},{"nationality":"Indian","country":"India","cities":["Delhi","Mumbai","Kolkata","Bengaluru","Chennai","Hyderabad"],"currency":"INR","scale":100,"names":{"male":["Aarav","Arjun","Dev","Ishaan","Kabir","Karan","Rohan","Rahul","Vihaan","Yash"],"female":["Aanya","Diya","Isha","Kavya","Meera","Priya","Riya","Saanvi","Tara","Zoya"],"neutral":["Aadi","Kiran","Neel","Ravi","Samar"]},"surnames":["Das","Gupta","Iyer","Khan","Mehta","Patel","Rao","Sharma","Singh"]},{"nationality":"American","country":"United States","cities":["New York","Chicago","Austin","Seattle","Atlanta","Los Angeles"],"currency":"USD","scale":1,"names":{"male":["Alexander","Benjamin","Caleb","Ethan","James","Liam","Noah","Oliver","Theodore","William"],"female":["Amelia","Ava","Charlotte","Emma","Harper","Isabella","Mia","Olivia","Sophia","Violet"],"neutral":["Avery","Casey","Jordan","Morgan","Riley"]},"surnames":["Bennett","Brooks","Carter","Collins","Davis","Garcia","Johnson","Miller","Reed"]},{"nationality":"British","country":"United Kingdom","cities":["London","Manchester","Birmingham","Bristol","Leeds","Glasgow"],"currency":"GBP","scale":1,"names":{"male":["Arthur","Charlie","Freddie","George","Harry","Jack","Leo","Oliver","Oscar","Thomas"],"female":["Amelia","Daisy","Ella","Freya","Isla","Lily","Maya","Olivia","Poppy","Sophie"],"neutral":["Alex","Ellis","Jamie","Robin","Taylor"]},"surnames":["Bennett","Clarke","Davies","Evans","Morgan","Patel","Robinson","Taylor","Wilson"]},{"nationality":"Canadian","country":"Canada","cities":["Toronto","Vancouver","Montreal","Calgary","Ottawa","Halifax"],"currency":"CAD","scale":1,"names":{"male":["Adam","Benjamin","Elliot","Ethan","Jack","Liam","Lucas","Noah","Owen","Theo"],"female":["Ava","Chloe","Emily","Grace","Isla","Mila","Olivia","Rose","Sophie","Zoe"],"neutral":["Avery","Cameron","Jordan","Quinn","Rowan"]},"surnames":["Brown","Campbell","Chen","Martin","Nguyen","Roy","Singh","Smith","Wilson"]},{"nationality":"Australian","country":"Australia","cities":["Sydney","Melbourne","Brisbane","Perth","Adelaide","Canberra"],"currency":"AUD","scale":1,"names":{"male":["Archie","Charlie","Ethan","Henry","Hugo","Jack","Leo","Oliver","Thomas","William"],"female":["Amelia","Charlotte","Ella","Harper","Isla","Matilda","Mia","Olivia","Ruby","Sophie"],"neutral":["Alex","Billie","Frankie","Harper","Riley"]},"surnames":["Brown","Campbell","Jones","Kelly","Nguyen","Smith","Taylor","Thomas","Wilson"]},{"nationality":"Japanese","country":"Japan","cities":["Tokyo","Osaka","Kyoto","Yokohama","Sapporo","Fukuoka"],"currency":"JPY","scale":100,"names":{"male":["Akira","Daiki","Haruto","Haruki","Kaito","Ren","Riku","Sota","Yuma","Yuto"],"female":["Aoi","Hana","Hina","Mei","Rin","Sakura","Yui","Yuna","Yuri","Aiko"],"neutral":["Aoi","Haru","Kaoru","Makoto","Ren"]},"surnames":["Aoki","Fujita","Ito","Kobayashi","Nakamura","Sato","Suzuki","Takahashi","Yamamoto"]},{"nationality":"Nigerian","country":"Nigeria","cities":["Lagos","Abuja","Kano","Ibadan","Enugu","Port Harcourt"],"currency":"NGN","scale":1000,"names":{"male":["Chidi","David","Emeka","Ibrahim","Kelechi","Musa","Obinna","Olu","Tunde","Yusuf"],"female":["Ada","Amara","Amina","Chioma","Fatima","Ife","Ngozi","Zainab","Zara","Temi"],"neutral":["Ayo","Ejiro","Ife","Kosi","Tomi"]},"surnames":["Abiola","Adeyemi","Adebayo","Bello","Eze","Ibrahim","Okafor","Okoye","Yusuf"]},{"nationality":"Brazilian","country":"Brazil","cities":["São Paulo","Rio de Janeiro","Brasília","Salvador","Curitiba","Recife"],"currency":"BRL","scale":10,"names":{"male":["Arthur","Caio","Davi","Gabriel","João","Lucas","Mateus","Miguel","Pedro","Rafael"],"female":["Alice","Ana","Beatriz","Camila","Helena","Isabella","Julia","Laura","Manuela","Sofia"],"neutral":["Ariel","Dani","Gui","Luca","Rene"]},"surnames":["Almeida","Costa","Ferreira","Lima","Oliveira","Pereira","Rodrigues","Santos","Silva"]},{"nationality":"German","country":"Germany","cities":["Berlin","Hamburg","Munich","Cologne","Frankfurt","Leipzig"],"currency":"EUR","scale":1,"names":{"male":["Ben","Elias","Emil","Felix","Finn","Jonas","Leon","Lukas","Noah","Paul"],"female":["Amelie","Anna","Clara","Emilia","Emma","Hannah","Lena","Mia","Mila","Sofia"],"neutral":["Alex","Kim","Lou","Luca","Robin"]},"surnames":["Bauer","Becker","Fischer","Hoffmann","Klein","Meyer","Schmidt","Schneider","Weber"]}];
const PERSONALITY_TRAITS = ['Curious','Patient','Ambitious','Creative','Practical','Outgoing','Reserved','Optimistic','Thoughtful','Adventurous','Disciplined','Adaptable'];
const FAMILY_BACKGROUNDS = ['Working-class','Modest','Comfortable','Affluent'] as const;
function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}
function stat(random: () => number): number {
  // Triangular distribution: ordinary values are more common than extremes.
  return Math.round((random() + random()) * 25 + 25);
}
function event(character: Character, title: string, description: string, kind: LifeEvent['kind'] = 'activity'): LifeEvent {
  return { id: `${character.year}-${character.history.length + 1}`, year: character.year, age: character.age, title, description, kind };
}
export function generateRandomCharacter(startAge = 18, random: () => number = Math.random): Character {
  const age = Math.max(0, Math.min(90, Math.round(startAge)));
  const profile = pick(COUNTRIES, random);
  const gender: Gender = pick(['male','female','non-binary'] as const, random);
  const name = `${pick(profile.names[gender], random)} ${pick(profile.surnames, random)}`;
  const background = pick(FAMILY_BACKGROUNDS, random);
  const backgroundIndex = FAMILY_BACKGROUNDS.indexOf(background);
  const moneyBase = age < 16 ? 0 : age < 18 ? 120 : 850;
  const moneyMultiplier = [0.65, 0.9, 1.15, 1.55][backgroundIndex];
  const traits = [...PERSONALITY_TRAITS].sort(() => random() - 0.5).slice(0, 2);
  const character: Character = {
    name, age, year: 2026, gender, nationality: profile.nationality, country: profile.country,
    birthplace: pick(profile.cities, random), currency: profile.currency, currencyScale: profile.scale,
    familyBackground: background, personality: traits,
    education: age < 6 ? 'Not started' : age < 16 ? 'Primary education' : age < 22 ? 'Secondary education' : 'General education',
    health: stat(random), happiness: stat(random), intelligence: stat(random), fitness: stat(random),
    money: Math.round(moneyBase * profile.scale * moneyMultiplier), actionsRemaining: ACTIONS_PER_YEAR, history: []
  };
  character.history.push(event(character, 'A new chapter begins', `${name} begins life at age ${age} in ${character.birthplace}, ${profile.country}. Their ${background.toLowerCase()} family background shapes their starting circumstances, but not their future.`, 'milestone'));
  return character;
}
export function createCharacter(name: string, startAge = 18): Character {
  const character = generateRandomCharacter(startAge);
  character.name = name.trim().slice(0, 28) || character.name;
  return character;
}
export function formatCharacterMoney(character: Character): string {
  const currency = character.currency ?? 'USD';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(character.money);
}
export function performActivity(character: Character, activity: ActivityId): Character {
  if (character.actionsRemaining <= 0) return character;
  const next = { ...character, history: [...character.history], actionsRemaining: character.actionsRemaining - 1 };
  const scale = character.currencyScale ?? 1;
  switch (activity) {
    case 'study': next.intelligence = clamp(next.intelligence + 5); next.happiness = clamp(next.happiness - 1); if (next.age >= 16) next.money = Math.max(0, next.money - 35 * scale); next.history.unshift(event(next, 'Made time to study', 'You invested in learning. It may open doors later.')); break;
    case 'exercise': next.fitness = clamp(next.fitness + 6); next.health = clamp(next.health + 2); next.happiness = clamp(next.happiness + 2); next.history.unshift(event(next, 'Focused on fitness', 'A good session improved your fitness and lifted your mood.')); break;
    case 'socialize': next.happiness = clamp(next.happiness + 7); if (next.age >= 16) next.money = Math.max(0, next.money - 20 * scale); next.history.unshift(event(next, 'Spent time with friends', 'You made space for people who matter.')); break;
    case 'work': if (next.age < 16) return character; next.money += 180 * scale; next.happiness = clamp(next.happiness - 2); next.history.unshift(event(next, 'Picked up extra work', 'You earned some money, although it took time and energy.')); break;
  }
  return next;
}
export function advanceYear(character: Character): Character {
  const next = { ...character, age: character.age + 1, year: character.year + 1, actionsRemaining: ACTIONS_PER_YEAR, health: clamp(character.health - (character.age >= 45 ? 2 : 1)), history: [...character.history] };
  next.history.unshift(event(next, 'Another year, another chapter', `You turned ${next.age}. Your choices continue to shape what comes next.`, 'milestone'));
  if (next.age === 21) next.history.unshift(event(next, 'A new stage of adulthood', 'New responsibilities and opportunities may begin to appear.', 'event'));
  return next;
}
