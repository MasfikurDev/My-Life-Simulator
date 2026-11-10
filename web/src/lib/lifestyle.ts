import type { Character, SocialConnection } from './types';

export interface PassiveLifestyleActivity {
  id: string;
  title: string;
  source: string;
  detail: string;
  staminaRecovery: number;
  health: number;
  happiness: number;
  comfort: number;
  discipline: number;
  stress: number;
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function livingSocialConnections(character: Character): SocialConnection[] {
  return (character.socialConnections ?? []).filter((item) => item.active);
}

export function getPassiveLifestyleActivities(character: Character): PassiveLifestyleActivity[] {
  const activities: PassiveLifestyleActivity[] = [];
  const family = character.family;
  const householdIds = new Set(family?.householdMemberIds ?? []);
  const familyMembersAtHome = family?.people.filter((person) =>
    person.id !== family.playerPersonId &&
    householdIds.has(person.id) &&
    (person.deathYear === undefined || person.deathYear > character.year)
  ) ?? [];
  const familyPresent = familyMembersAtHome.length > 0 &&
    (character.age < 18 || character.householdArrangement === 'family-supported');
  const familyCulture = character.familyCulture ?? 'supportive';
  if (familyPresent && familyCulture !== 'neglectful') {
    const background = character.familyBackground ?? 'Modest';
    const quality = background === 'Affluent' ? 2 : background === 'Comfortable' ? 1 : 0;
    const structured = familyCulture === 'structured';
    const strained = familyCulture === 'strained';
    activities.push({
      id: 'passive-family-meals',
      title: 'Meals provided by family',
      source: 'Family household',
      detail: structured ? 'Regular household meals and routines' : strained ? 'Basic meals are available, with limited support' : 'Shared home meals and everyday family support',
      staminaRecovery: strained ? 3 : 5 + quality,
      health: strained ? 0 : 1 + quality,
      happiness: strained ? 0 : structured ? 1 : 2,
      comfort: strained ? 1 : 2 + quality,
      discipline: structured ? 2 : character.personality?.includes('Disciplined') ? 1 : 0,
      stress: strained ? -1 : 0
    });
  }

  const social = livingSocialConnections(character);
  const partner = social.find((item) => item.type === 'partner' && item.closeness >= 30);
  if (partner) {
    activities.push(partner.livesWithPlayer ? {
      id: 'passive-partner-support',
      title: 'Shared household support',
      source: partner.name,
      detail: 'A cohabiting partner shares meals and everyday responsibilities',
      staminaRecovery: partner.supportLevel === 'strong' ? 4 : 2,
      health: 1,
      happiness: partner.supportLevel === 'strong' ? 2 : 1,
      comfort: 2,
      discipline: 0,
      stress: partner.closeness >= 65 ? 1 : 0
    } : {
      id: 'passive-partner-support',
      title: 'Partner checks in',
      source: partner.name,
      detail: 'Regular contact with your partner provides emotional support',
      staminaRecovery: 0,
      health: 0,
      happiness: 1,
      comfort: 1,
      discipline: 0,
      stress: partner.closeness >= 65 ? 1 : 0
    });
  }

  const friends = social.filter((item) => item.type === 'friend' && item.closeness >= 45);
  if (friends.length) {
    activities.push({
      id: 'passive-friend-support',
      title: 'Friends check in',
      source: friends.slice(0, 2).map((item) => item.name).join(', '),
      detail: 'Regular contact provides social support',
      staminaRecovery: 0,
      health: 0,
      happiness: Math.min(2, friends.filter((item) => item.supportLevel === 'strong').length || 1),
      comfort: 0,
      discipline: 0,
      stress: friends.some((item) => item.supportLevel === 'strong') ? 2 : 1
    });
  }

  const extendedFamily = social.filter((item) => item.type === 'extended-family' && item.closeness >= 60);
  if (extendedFamily.length) {
    activities.push({
      id: 'passive-extended-family',
      title: 'Extended family support',
      source: extendedFamily.slice(0, 2).map((item) => item.name).join(', '),
      detail: 'Relatives maintain contact and provide occasional practical support',
      staminaRecovery: extendedFamily.some((item) => item.supportLevel === 'strong') ? 2 : 1,
      health: 0,
      happiness: 1,
      comfort: 1,
      discipline: 0,
      stress: 0
    });
  }

  const children = social.filter((item) => item.type === 'child');
  if (children.length) {
    activities.push({
      id: 'passive-parenting',
      title: 'Time with children',
      source: children.slice(0, 2).map((item) => item.name).join(', '),
      detail: 'Family connection brings enjoyment alongside ongoing responsibilities',
      staminaRecovery: 0,
      health: 0,
      happiness: Math.min(2, children.length),
      comfort: 1,
      discipline: 0,
      stress: -Math.min(3, children.length)
    });
  }

  const hasFamilyMeals = activities.some((item) => item.id === 'passive-family-meals');
  const hasSharedPartnerMeals = activities.some((item) => item.id === 'passive-partner-support' && item.staminaRecovery > 0);
  const boughtMeals = (character.weeklyPlan?.activities ?? []).filter((item) => item.action?.kind === 'food');
  const hasBoughtFood = boughtMeals.some((item) => item.action?.kind === 'food' && item.action.productId === 'meal-groceries') ||
    boughtMeals.reduce((total, item) => total + (item.action?.kind === 'food' ? item.action.quantity : 0), 0) >= 7;
  if (character.age >= 18 && !hasFamilyMeals && !hasSharedPartnerMeals && !hasBoughtFood) {
    activities.push({
      id: 'passive-no-meals',
      title: 'No regular meals arranged',
      source: 'Independent routine',
      detail: 'Buy groceries, prepared meals, delivery or restaurant food to maintain regular nutrition',
      staminaRecovery: 0,
      health: -1,
      happiness: -1,
      comfort: -1,
      discipline: 0,
      stress: -1
    });
  }

  const scale = character.currencyScale ?? 1;
  const residence = (character.properties ?? []).find((item) => item.id === character.primaryResidenceId);
  const homeValue = residence?.marketValue ?? 0;
  const rent = character.rentalHome?.annualRent ?? 0;
  const housingQuality = residence
    ? homeValue >= 50000 * scale ? 4 : homeValue >= 20000 * scale ? 3 : homeValue >= 8000 * scale ? 2 : 1
    : rent > 0 ? rent >= 8000 * scale ? 3 : rent >= 3000 * scale ? 2 : 1
    : character.householdArrangement === 'family-supported' && familyPresent ? 2
    : character.householdArrangement === 'shared' || hasSharedPartnerMeals ? 1 : 0;
  if (housingQuality > 0) {
    activities.push({
      id: 'passive-stable-home',
      title: 'Stable home environment',
      source: residence?.name ?? (character.rentalHome ? 'Rental home' : hasSharedPartnerMeals ? partner?.name ?? 'Shared household' : 'Family household'),
      detail: 'Your living space provides everyday comfort and stability',
      staminaRecovery: 0,
      health: housingQuality >= 3 ? 1 : 0,
      happiness: 0,
      comfort: housingQuality,
      discipline: 0,
      stress: housingQuality >= 3 ? 1 : 0
    });
  } else if (character.age >= 18 && character.householdArrangement === 'independent') {
    activities.push({
      id: 'passive-housing-insecurity',
      title: 'No stable home arranged',
      source: 'Independent living',
      detail: 'Rent a home or move into owned property to improve comfort and security',
      staminaRecovery: 0,
      health: 0,
      happiness: -1,
      comfort: -2,
      discipline: 0,
      stress: -2
    });
  }

  return activities;
}

export function resolvePassiveLifestyleActivities(character: Character, activities = getPassiveLifestyleActivities(character)): Character {
  const total = activities.reduce((sum, item) => ({
    health: sum.health + item.health,
    happiness: sum.happiness + item.happiness,
    comfort: sum.comfort + item.comfort,
    discipline: sum.discipline + item.discipline,
    stress: sum.stress + item.stress
  }), { health: 0, happiness: 0, comfort: 0, discipline: 0, stress: 0 });
  return {
    ...character,
    health: clamp(character.health + total.health),
    happiness: clamp(character.happiness + total.happiness),
    comfort: clamp((character.comfort ?? 50) + total.comfort),
    discipline: clamp(character.discipline + total.discipline),
    stress: clamp((character.stress ?? 30) - total.stress)
  };
}

export function equipLifestyleItem(character: Character, id: string): Character {
  const items = character.ownedLifestyleItems ?? [];
  const selected = items.find((item) => item.id === id && item.category === 'Fashion' && typeof item.styleScore === 'number');
  if (!selected || selected.equipped) return character;
  return {
    ...character,
    ownedLifestyleItems: items.map((item) => item.category === 'Fashion'
      ? { ...item, equipped: item.id === id }
      : item)
  };
}

export function getClothingPresentationScore(character: Character, requiredFormality = 50): number {
  const clothing = (character.ownedLifestyleItems ?? []).filter((item) =>
    item.category === 'Fashion' && item.equipped === true && typeof item.styleScore === 'number'
  );
  if (!clothing.length) return 35;
  return Math.max(...clothing.map((item) => {
    const formalityFit = 1 - Math.min(0.8, Math.abs((item.formality ?? 50) - requiredFormality) / 125);
    return Math.round((item.styleScore ?? 0) * formalityFit * ((item.condition ?? 100) / 100));
  }));
}

export function applyWeeklyClothingWear(character: Character): Character {
  let changed = false;
  const items = (character.ownedLifestyleItems ?? []).map((item) => {
    if (item.category !== 'Fashion' || item.equipped !== true || typeof item.styleScore !== 'number') return item;
    const condition = Math.max(0, (item.condition ?? 100) - 1);
    if (condition === item.condition) return item;
    changed = true;
    return { ...item, condition };
  });
  return changed ? { ...character, ownedLifestyleItems: items } : character;
}

export function addSocialConnection(
  character: Character,
  name: string,
  type: SocialConnection['type'],
  livesWithPlayer = false
): Character {
  const label = name.trim().slice(0, 40);
  if (!label || character.age < (type === 'friend' ? 8 : 18) ||
      (type === 'partner' && (character.socialConnections ?? []).some((item) => item.active && item.type === 'partner')) ||
      (character.socialConnections ?? []).length >= 30) return character;
  const item: SocialConnection = {
    id: 'social-' + character.year + '-' + character.age + '-' + (character.history.length + 1),
    name: label,
    type,
    closeness: 60,
    active: true,
    livesWithPlayer,
    supportLevel: 'regular'
  };
  const entry = { id: 'social-added-' + item.id, year: character.year, age: character.age, date: character.calendar?.currentDate, title: 'Added ' + label + ' to your social circle', description: 'Recorded a ' + type.replace('-', ' ') + ' connection for everyday life.', kind: 'activity' as const };
  return { ...character, socialConnections: [...(character.socialConnections ?? []), item], history: [entry, ...character.history] };
}

export function interactWithSocialConnection(character: Character, id: string): Character {
  const connection = (character.socialConnections ?? []).find((item) => item.id === id && item.active);
  if (!connection || connection.closeness >= 100) return character;
  const closeness = clamp(connection.closeness + 8);
  const supportLevel = closeness >= 75 ? 'strong' : closeness >= 45 ? 'regular' : 'occasional';
  const entry = {
    id: 'social-interaction-' + character.year + '-' + character.age + '-' + character.history.length,
    year: character.year,
    age: character.age,
    date: character.calendar?.currentDate,
    title: 'Spent time with ' + connection.name,
    description: 'Made time for the relationship and strengthened the connection.',
    kind: 'activity' as const
  };
  return {
    ...character,
    socialConnections: (character.socialConnections ?? []).map((item) => item.id === id ? { ...item, closeness, supportLevel } : item),
    history: [entry, ...character.history]
  };
}

export function removeSocialConnection(character: Character, id: string): Character {
  const existing = character.socialConnections ?? [];
  const removed = existing.find((item) => item.id === id);
  if (!removed) return character;
  const entry = { id: 'social-removed-' + removed.id, year: character.year, age: character.age, date: character.calendar?.currentDate, title: 'Removed ' + removed.name + ' from your social circle', description: 'The connection is no longer part of your current social support network.', kind: 'activity' as const };
  return { ...character, socialConnections: existing.filter((item) => item.id !== id), history: [entry, ...character.history] };
}

export function setSocialConnectionHousehold(character: Character, id: string, livesWithPlayer: boolean): Character {
  const existing = character.socialConnections ?? [];
  if (!existing.some((item) => item.id === id)) return character;
  return {
    ...character,
    socialConnections: existing.map((item) => item.id === id ? { ...item, livesWithPlayer } : item)
  };
}
