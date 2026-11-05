import type { ActivityId, Character, LifeEvent } from './types';

export const ACTIONS_PER_YEAR = 3;
const clamp = (value: number) => Math.max(0, Math.min(100, value));
function event(character: Character, title: string, description: string, kind: LifeEvent['kind'] = 'activity'): LifeEvent {
  return { id: `${character.year}-${character.history.length + 1}`, year: character.year, age: character.age, title, description, kind };
}
export function createCharacter(name: string, startAge = 18): Character {
  const cleanName = name.trim().slice(0, 28) || 'Alex';
  const age = Math.max(0, Math.min(90, Math.round(startAge)));
  const startingMoney = age < 16 ? 0 : age < 18 ? 120 : age < 30 ? 850 : 1200;
  const character: Character = { name: cleanName, age, year: 2026, health: 86, happiness: 72, intelligence: 58, fitness: 55, money: startingMoney, actionsRemaining: ACTIONS_PER_YEAR, history: [] };
  character.history.push(event(character, 'A new chapter begins', `${cleanName} begins this life at age ${age}. Their story is shaped by the choices ahead.`, 'milestone'));
  return character;
}
export function performActivity(character: Character, activity: ActivityId): Character {
  if (character.actionsRemaining <= 0) return character;
  const next = { ...character, history: [...character.history], actionsRemaining: character.actionsRemaining - 1 };
  switch (activity) {
    case 'study': next.intelligence = clamp(next.intelligence + 5); next.happiness = clamp(next.happiness - 1); if (next.age >= 16) next.money = Math.max(0, next.money - 35); next.history.unshift(event(next, 'Made time to study', 'You invested in learning. It may open doors later.')); break;
    case 'exercise': next.fitness = clamp(next.fitness + 6); next.health = clamp(next.health + 2); next.happiness = clamp(next.happiness + 2); next.history.unshift(event(next, 'Focused on fitness', 'A good session improved your fitness and lifted your mood.')); break;
    case 'socialize': next.happiness = clamp(next.happiness + 7); if (next.age >= 16) next.money = Math.max(0, next.money - 20); next.history.unshift(event(next, 'Spent time with friends', 'You made space for people who matter.')); break;
    case 'work': if (next.age < 16) return character; next.money += 180; next.happiness = clamp(next.happiness - 2); next.history.unshift(event(next, 'Picked up extra work', 'You earned some money, although it took time and energy.')); break;
  }
  return next;
}
export function advanceYear(character: Character): Character {
  const next = { ...character, age: character.age + 1, year: character.year + 1, actionsRemaining: ACTIONS_PER_YEAR, health: clamp(character.health - (character.age >= 45 ? 2 : 1)), history: [...character.history] };
  next.history.unshift(event(next, 'Another year, another chapter', `You turned ${next.age}. Your choices continue to shape what comes next.`, 'milestone'));
  if (next.age === 21) next.history.unshift(event(next, 'A new stage of adulthood', 'New responsibilities and opportunities may begin to appear.', 'event'));
  return next;
}
