import { describe, expect, it } from 'vitest';
import { isValidWeeklyPlan } from './weekly-plan';
import { addOwnedLifestyleItem, advanceWeek, createCharacter, getWeeklyActivityReview, planSocialInteractionInNextFreeTime, planBoughtFoodInNextFreeTime, planOwnedFoodInNextFreeTime } from './simulation';
import {
  addSocialConnection,
  applyWeeklyClothingWear,
  equipLifestyleItem,
  getClothingPresentationScore,
  getPassiveLifestyleActivities,
  removeSocialConnection,
  resolvePassiveLifestyleActivities,
  setSocialConnectionHousehold
} from './lifestyle';

describe('passive lifestyle simulation', () => {
  it('creates automatic family meals from a co-resident family household and varies the benefits by household culture', () => {
    const child = createCharacter('Child', 12);
    const family = child.family!;
    const householdIds = family.people.filter((person) => person.id !== family.playerPersonId).map((person) => person.id);
    const supported = {
      ...child,
      familyCulture: 'structured' as const,
      familyBackground: 'Working-class',
      family: { ...family, householdMemberIds: [family.playerPersonId, ...householdIds] }
    };
    const meals = getPassiveLifestyleActivities(supported).find((item) => item.id === 'passive-family-meals');
    expect(meals).toMatchObject({ title: 'Meals at home', staminaRecovery: 5, discipline: 2 });
    const strained = getPassiveLifestyleActivities({ ...supported, familyCulture: 'strained' }).find((item) => item.id === 'passive-family-meals');
    expect(strained).toMatchObject({ staminaRecovery: 3, happiness: 0, stress: -1 });
    const neglectful = getPassiveLifestyleActivities({ ...supported, familyCulture: 'neglectful' });
    expect(neglectful.some((item) => item.id === 'passive-family-meals')).toBe(false);
  });

  it('records automatic family meal stamina recovery in the weekly review and recap', () => {
    const child = createCharacter('Child', 12);
    const family = child.family!;
    const householdIds = family.people.filter((person) => person.id !== family.playerPersonId).map((person) => person.id);
    const supported = {
      ...child,
      stamina: 40,
      familyCulture: 'supportive' as const,
      familyBackground: 'Working-class',
      family: { ...family, householdMemberIds: [family.playerPersonId, ...householdIds] }
    };
    const review = getWeeklyActivityReview(supported);
    const meals = review.passiveActivities.find((item) => item.id === 'passive-family-meals');
    expect(meals?.staminaRecovery).toBe(5);
    expect(meals?.reward).toContain('Stamina +5');

    const resolved = advanceWeek(supported);
    expect(resolved.issue).toBeNull();
    expect(resolved.recap.some((entry) => entry.startsWith('Meals at home:'))).toBe(true);
    expect(resolved.recap.some((entry) => entry.includes('Stamina +5'))).toBe(true);
    expect(resolved.character.stamina).toBeGreaterThan(40);
  });

  it('stops family meals and family housing support when an adult moves out', () => {
    const generated = createCharacter('Moved out', 30);
    const family = generated.family!;
    const supported = {
      ...generated,
      familyCulture: 'supportive' as const,
      householdArrangement: 'family-supported' as const,
      family: { ...family, householdMemberIds: family.people.filter((person) => person.id !== family.playerPersonId).map((person) => person.id) }
    };
    expect(getPassiveLifestyleActivities(supported).some((item) => item.id === 'passive-family-meals')).toBe(true);
    const independent = { ...supported, householdArrangement: 'independent' as const };
    expect(getPassiveLifestyleActivities(independent).some((item) => item.id === 'passive-family-meals')).toBe(false);
    expect(getPassiveLifestyleActivities(independent).some((item) => item.id === 'passive-stable-home')).toBe(false);
  });

  it('models partner, friend, child and extended-family support as separate automatic activities', () => {
    let character = createCharacter('Adult', 30);
    character = addSocialConnection(character, 'Partner', 'partner', true);
    character = addSocialConnection(character, 'Friend', 'friend');
    character = addSocialConnection(character, 'Child', 'child');
    character = addSocialConnection(character, 'Aunt', 'extended-family');
    character = { ...character, socialConnections: character.socialConnections!.map((item) => ({ ...item, closeness: 70, supportLevel: 'regular' as const })) };
    const activities = getPassiveLifestyleActivities(character);
    expect(activities.map((item) => item.id)).toEqual(expect.arrayContaining([
      'passive-partner-support', 'passive-friend-support', 'passive-parenting', 'passive-extended-family'
    ]));
    expect(activities.find((item) => item.id === 'passive-parenting')?.stress).toBe(-1);
    const partner = character.socialConnections!.find((item) => item.type === 'partner')!;
    expect(setSocialConnectionHousehold(character, partner.id, false).socialConnections!.find((item) => item.id === partner.id)?.livesWithPlayer).toBe(false);
    expect(removeSocialConnection(character, partner.id).socialConnections).toHaveLength(3);
  });

  it('lets players schedule social time and improves support after weekly resolution', () => {
    let character = addSocialConnection(createCharacter('Social adult', 30), 'Friend', 'friend');
    const friend = character.socialConnections![0];
    const planned = planSocialInteractionInNextFreeTime(character, friend.id);
    expect(planned.issue).toBeNull();
    expect(planned.character.weeklyPlan.activities[0]).toMatchObject({
      activityId: 'socialize', action: { kind: 'social', connectionId: friend.id }
    });
    const resolved = advanceWeek(planned.character);
    expect(resolved.issue).toBeNull();
    expect(resolved.character.socialConnections![0].closeness).toBe(33);
    expect(resolved.character.socialConnections![0].supportLevel).toBe('occasional');
    expect(resolved.character.history[0].title).toContain('Spent time with Friend');
  });

  it('requires independent adults to arrange food and stable housing, while a paid meal clears the food penalty', () => {
    const generated = createCharacter('Independent adult', 30);
    const independent = {
      ...generated,
      householdArrangement: 'independent' as const,
      family: generated.family ? { ...generated.family, householdMemberIds: [generated.family.playerPersonId] } : undefined
    };
    const passive = getPassiveLifestyleActivities(independent);
    expect(passive.map((item) => item.id)).toEqual(expect.arrayContaining(['passive-no-meals', 'passive-housing-insecurity']));
    const singleMeal = planBoughtFoodInNextFreeTime(independent, {
      productId: 'meal-delivery', name: 'One delivered meal', quantity: 1, purchaseCost: 8,
      staminaRecovery: 5, health: 0, happiness: 1, stress: 0, comfort: 0
    });
    expect(singleMeal.issue).toBeNull();
    expect(getPassiveLifestyleActivities(singleMeal.character).some((item) => item.id === 'passive-no-meals')).toBe(true);
    const planned = planBoughtFoodInNextFreeTime(independent, {
      productId: 'meal-groceries', name: 'Weekly grocery basket', quantity: 1, purchaseCost: 24,
      staminaRecovery: 24, health: 4, happiness: 2, stress: 0, comfort: 1
    });
    expect(planned.issue).toBeNull();
    expect(getPassiveLifestyleActivities(planned.character).some((item) => item.id === 'passive-no-meals')).toBe(false);
    expect(getPassiveLifestyleActivities(planned.character).some((item) => item.id === 'passive-housing-insecurity')).toBe(true);
  });

  it('gives active lifestyle subscriptions modest service-specific weekly benefits', () => {
    const character = createCharacter('Subscribed player', 30);
    const subscribed = {
      ...character,
      recurringPayments: [
        { id: 'stream', name: 'Standard streaming', amount: 120, category: 'subscription' as const, sourceType: 'cash' as const, active: true, startedAtYear: character.year },
        { id: 'music', name: 'Music premium', amount: 72, category: 'subscription' as const, sourceType: 'cash' as const, active: true, startedAtYear: character.year },
        { id: 'gym', name: 'Gym membership', amount: 240, category: 'subscription' as const, sourceType: 'cash' as const, active: true, startedAtYear: character.year }
      ]
    };
    const activities = getPassiveLifestyleActivities(subscribed);
    expect(activities.map((item) => item.id)).toEqual(expect.arrayContaining(['service-streaming', 'service-music', 'service-fitness']));
    const resolved = resolvePassiveLifestyleActivities(subscribed, activities);
    expect(resolved.fitness).toBe(character.fitness + 1);
    expect(resolved.happiness).toBeGreaterThan(character.happiness);
  });

  it('uses owned food from inventory, caps weekly food bonuses by stat, and consumes portions on resolution', () => {
    const generated = createCharacter('Food inventory', 30);
    const stocked = addOwnedLifestyleItem(generated, {
      productId: 'meal-eggs', name: 'Eggs & toast', category: 'Food', description: 'Protein and carbohydrates',
      quantity: 3, kind: 'usable', foodEffects: { staminaRecovery: 12, health: 3, happiness: 0, stress: 0, comfort: 0 }
    });
    const secondStock = addOwnedLifestyleItem(stocked, {
      productId: 'meal-fruit', name: 'Fresh fruit', category: 'Food', description: 'Fruit snack',
      quantity: 2, kind: 'usable', foodEffects: { staminaRecovery: 6, health: 1, happiness: 3, stress: 2, comfort: 1 }
    });
    const eggs = secondStock.ownedLifestyleItems!.find((item) => item.productId === 'meal-eggs')!;
    const fruit = secondStock.ownedLifestyleItems!.find((item) => item.productId === 'meal-fruit')!;
    const first = planOwnedFoodInNextFreeTime(secondStock, eggs.id);
    expect(first.issue).toBeNull();
    expect(first.character.weeklyPlan!.activities[0].action).toMatchObject({ kind: 'food', staminaRecovery: 8, health: 2, happiness: 0 });
    const second = planOwnedFoodInNextFreeTime(first.character, fruit.id);
    expect(second.issue).toBeNull();
    const fruitAction = second.character.weeklyPlan!.activities.find((item) => item.action?.kind === 'food' && item.action.ownedItemId === fruit.id)!.action;
    expect(fruitAction).toMatchObject({ staminaRecovery: 0, health: 0, happiness: 2, stress: 2, comfort: 1 });
    const resolved = advanceWeek(second.character);
    expect(resolved.issue).toBeNull();
    expect(resolved.character.ownedLifestyleItems!.find((item) => item.productId === 'meal-eggs')?.quantity).toBe(2);
    expect(resolved.character.ownedLifestyleItems!.find((item) => item.productId === 'meal-fruit')?.quantity).toBe(1);
  });

  it('allows a non-cohabiting partner to provide emotional support without replacing meals or housing', () => {
    let character = createCharacter('Partner support', 30);
    character = { ...character, householdArrangement: 'independent', family: character.family ? { ...character.family, householdMemberIds: [character.family.playerPersonId] } : undefined };
    character = addSocialConnection(character, 'Partner', 'partner', false);
    character = { ...character, socialConnections: character.socialConnections!.map((item) => ({ ...item, closeness: 60, supportLevel: 'regular' as const })) };
    const passive = getPassiveLifestyleActivities(character);
    expect(passive.find((item) => item.id === 'passive-partner-support')).toMatchObject({ title: 'Partner checks in', staminaRecovery: 0, happiness: 1 });
    expect(passive.some((item) => item.id === 'passive-no-meals')).toBe(true);
  });

  it('applies passive benefits without consuming planned activity slots', () => {
    let character = createCharacter('Adult', 30);
    character = addSocialConnection(character, 'Partner', 'partner', true);
    character = { ...character, socialConnections: character.socialConnections!.map((item) => ({ ...item, closeness: 65, supportLevel: 'regular' as const })) };
    const passive = getPassiveLifestyleActivities(character);
    const next = resolvePassiveLifestyleActivities(character, passive);
    expect(next.comfort).toBeGreaterThan(character.comfort ?? 50);
    expect(next.happiness).toBeGreaterThan(character.happiness);
    expect(next.weeklyPlan.activities).toHaveLength(0);
  });

  it('applies household and partner recovery during weekly resolution without adding removable plans', () => {
    let character = createCharacter('Adult', 30);
    character = addSocialConnection(character, 'Partner', 'partner', true);
    character = { ...character, socialConnections: character.socialConnections!.map((item) => ({ ...item, closeness: 65, supportLevel: 'regular' as const })), stamina: 20, comfort: 35, happiness: 40 };
    const result = advanceWeek(character);
    expect(result.issue).toBeNull();
    expect(result.character.stamina).toBeGreaterThan(character.stamina);
    expect(result.character.comfort ?? 50).toBeGreaterThan(character.comfort ?? 50);
    expect(result.character.weeklyPlan.activities).toHaveLength(0);
    expect(result.recap.some((line) => line.includes('Sharing the load'))).toBe(true);
  });

  it('shows passive entries as a separate derived review list and includes their recovery in the forecast', () => {
    let character = createCharacter('Review adult', 30);
    character = addSocialConnection(character, 'Partner', 'partner', true);
    character = { ...character, socialConnections: character.socialConnections!.map((item) => ({ ...item, closeness: 65, supportLevel: 'regular' as const })) };
    const review = getWeeklyActivityReview(character);
    expect(review.passiveActivities.some((item) => item.id === 'passive-partner-support')).toBe(true);
    expect(review.passiveStaminaRecovery).toBeGreaterThan(0);
    expect(review.staminaRecovery).toBeGreaterThanOrEqual(review.passiveStaminaRecovery);
    expect(review.activities).toHaveLength(0);
  });

  it('applies bought restaurant/delivery comfort only during weekly resolution and validates it', () => {
    const generated = createCharacter('Food order', 30);
    const character = { ...generated, money: 500, currencyScale: 1, comfort: 40, householdArrangement: 'shared' as const,
      family: generated.family ? { ...generated.family, householdMemberIds: [generated.family.playerPersonId] } : undefined };
    const planned = planBoughtFoodInNextFreeTime(character, {
      productId: 'meal-delivery', name: 'Food delivery', quantity: 1, purchaseCost: 10,
      staminaRecovery: 5, health: 0, happiness: 4, stress: 1, comfort: 3
    });
    expect(planned.issue).toBeNull();
    expect(planned.character.comfort).toBe(40);
    expect(isValidWeeklyPlan(planned.character.weeklyPlan)).toBe(true);
    const invalid = {
      version: 1 as const,
      activities: [{ id: 'food-bad', activityId: 'food' as const, action: {
        kind: 'food' as const, productId: 'meal', name: 'Meal', quantity: 1, purchaseCost: 0,
        staminaRecovery: 0, health: 0, happiness: 0, stress: 0, comfort: 13
      }}]
    };
    expect(isValidWeeklyPlan(invalid)).toBe(false);
    const resolved = advanceWeek(planned.character);
    expect(resolved.issue).toBeNull();
    expect(resolved.character.comfort).toBe(43);
  });

  it('uses owned clothing for presentation and gradually wears it down', () => {
    const character = createCharacter('Fashion buyer', 30);
    const owned = addOwnedLifestyleItem(character, {
      productId: 'business-suit', name: 'Business suit', category: 'Fashion',
      description: 'Formal clothing', quantity: 1, kind: 'permanent',
      styleScore: 82, formality: 95
    });
    expect(getClothingPresentationScore(owned, 95)).toBe(35);
    const equipped = equipLifestyleItem(owned, owned.ownedLifestyleItems![0].id);
    expect(getClothingPresentationScore(equipped, 95)).toBe(82);
    const worn = applyWeeklyClothingWear(equipped);
    expect(worn.ownedLifestyleItems![0].condition).toBe(99);
    expect(getClothingPresentationScore(worn, 95)).toBe(81);
    expect(applyWeeklyClothingWear(owned)).toBe(owned);
  });

  it('equips only one outfit and wears only the outfit currently in use', () => {
    const character = createCharacter('Wardrobe', 30);
    const first = addOwnedLifestyleItem(character, { productId: 'casual', name: 'Casual outfit', category: 'Fashion', description: 'Casual', quantity: 1, kind: 'permanent', styleScore: 55, formality: 25 });
    const second = addOwnedLifestyleItem(first, { productId: 'formal', name: 'Formal suit', category: 'Fashion', description: 'Formal', quantity: 1, kind: 'permanent', styleScore: 82, formality: 95 });
    const wearingFirst = equipLifestyleItem(second, second.ownedLifestyleItems![0].id);
    const wearingSecond = equipLifestyleItem(wearingFirst, second.ownedLifestyleItems![1].id);
    expect(wearingSecond.ownedLifestyleItems!.filter((item) => item.equipped)).toHaveLength(1);
    expect(wearingSecond.ownedLifestyleItems!.find((item) => item.productId === 'formal')?.equipped).toBe(true);
    expect(wearingSecond.ownedLifestyleItems!.find((item) => item.productId === 'casual')?.condition).toBe(100);
    expect(applyWeeklyClothingWear(wearingSecond).ownedLifestyleItems!.find((item) => item.productId === 'casual')?.condition).toBe(100);
  });

  it('does not assume social relationships or household support', () => {
    const character = createCharacter('Independent', 30);
    expect(character.socialConnections ?? []).toHaveLength(0);
    expect(getPassiveLifestyleActivities(character).some((item) => item.id === 'passive-partner-support')).toBe(false);
  });

  it('does not grant passive relationship benefits immediately when a new connection is created', () => {
    let character = createCharacter('New relationship', 30);
    character = addSocialConnection(character, 'New friend', 'friend');
    expect(character.socialConnections![0]).toMatchObject({ closeness: 25, supportLevel: 'occasional' });
    expect(getPassiveLifestyleActivities(character).some((item) => item.id === 'passive-friend-support')).toBe(false);
  });

  it('does not treat an unsupported family-supported adult as automatically fed or housed', () => {
    const generated = createCharacter('Unsupported adult', 30);
    const character = { ...generated, householdArrangement: 'family-supported' as const,
      family: generated.family ? { ...generated.family, householdMemberIds: [generated.family.playerPersonId] } : undefined };
    const ids = getPassiveLifestyleActivities(character).map((item) => item.id);
    expect(ids).toContain('passive-no-meals');
    expect(ids).toContain('passive-housing-insecurity');
  });

  it('caps stacked passive lifestyle effects to prevent support bonuses from overwhelming the simulation', () => {
    const character = createCharacter('Supported adult', 30);
    const resolved = resolvePassiveLifestyleActivities(character, [
      { id: 'a', title: 'A', source: 'A', detail: '', staminaRecovery: 0, health: 10, happiness: 10, comfort: 10, discipline: 10, stress: 10 },
      { id: 'b', title: 'B', source: 'B', detail: '', staminaRecovery: 0, health: 10, happiness: 10, comfort: 10, discipline: 10, stress: 10 }
    ]);
    expect(resolved.health).toBe(Math.min(100, character.health + 3));
    expect(resolved.happiness).toBe(Math.min(100, character.happiness + 4));
    expect(resolved.comfort).toBe(Math.min(100, (character.comfort ?? 50) + 4));
    expect(resolved.discipline).toBe(Math.min(100, character.discipline + 3));
    expect(resolved.stress).toBe(Math.max(0, (character.stress ?? 30) - 4));
  });
});
