import { describe, expect, it } from 'vitest';
import { isValidWeeklyPlan } from './weekly-plan';
import { addOwnedLifestyleItem, advanceWeek, createCharacter, getWeeklyActivityReview, planSocialInteractionInNextFreeTime, planBoughtFoodInNextFreeTime } from './simulation';
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
    expect(meals).toMatchObject({ title: 'Meals provided by family', staminaRecovery: 5, discipline: 2 });
    const neglectful = getPassiveLifestyleActivities({ ...supported, familyCulture: 'neglectful' });
    expect(neglectful.some((item) => item.id === 'passive-family-meals')).toBe(false);
  });

  it('stops family meals and family housing support when an adult moves out', () => {
    const generated = createCharacter('Moved out', 30);
    const family = generated.family!;
    const supported = {
      ...generated,
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
    const activities = getPassiveLifestyleActivities(character);
    expect(activities.map((item) => item.id)).toEqual(expect.arrayContaining([
      'passive-partner-support', 'passive-friend-support', 'passive-parenting', 'passive-extended-family'
    ]));
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
    expect(resolved.character.socialConnections![0].closeness).toBe(68);
    expect(resolved.character.socialConnections![0].supportLevel).toBe('regular');
    expect(resolved.character.history[0].title).toContain('Spent time with Friend');
  });

  it('applies passive benefits without consuming planned activity slots', () => {
    let character = createCharacter('Adult', 30);
    character = addSocialConnection(character, 'Partner', 'partner', true);
    const passive = getPassiveLifestyleActivities(character);
    const next = resolvePassiveLifestyleActivities(character, passive);
    expect(next.comfort).toBeGreaterThan(character.comfort ?? 50);
    expect(next.happiness).toBeGreaterThan(character.happiness);
    expect(next.weeklyPlan.activities).toHaveLength(0);
  });

  it('applies household and partner recovery during weekly resolution without adding removable plans', () => {
    let character = createCharacter('Adult', 30);
    character = addSocialConnection(character, 'Partner', 'partner', true);
    character = { ...character, stamina: 20, comfort: 35, happiness: 40 };
    const result = advanceWeek(character);
    expect(result.issue).toBeNull();
    expect(result.character.stamina).toBeGreaterThan(character.stamina);
    expect(result.character.comfort ?? 50).toBeGreaterThan(character.comfort ?? 50);
    expect(result.character.weeklyPlan.activities).toHaveLength(0);
    expect(result.recap.some((line) => line.includes('Shared household support'))).toBe(true);
  });

  it('shows passive entries as a separate derived review list and includes their recovery in the forecast', () => {
    let character = createCharacter('Review adult', 30);
    character = addSocialConnection(character, 'Partner', 'partner', true);
    const review = getWeeklyActivityReview(character);
    expect(review.passiveActivities.some((item) => item.id === 'passive-partner-support')).toBe(true);
    expect(review.passiveStaminaRecovery).toBeGreaterThan(0);
    expect(review.staminaRecovery).toBeGreaterThanOrEqual(review.passiveStaminaRecovery);
    expect(review.activities).toHaveLength(0);
  });

  it('applies bought restaurant/delivery comfort only during weekly resolution and validates it', () => {
    const generated = createCharacter('Food order', 30);
    const character = { ...generated, money: 500, currencyScale: 1, comfort: 40, householdArrangement: 'independent' as const,
      family: generated.family ? { ...generated.family, householdMemberIds: [generated.family.playerPersonId] } : undefined };
    const planned = planBoughtFoodInNextFreeTime(character, {
      productId: 'meal-delivery', name: 'Food delivery', quantity: 1,
      staminaRecovery: 5, health: 0, happiness: 4, stress: 1, comfort: 3
    });
    expect(planned.issue).toBeNull();
    expect(planned.character.comfort).toBe(40);
    expect(isValidWeeklyPlan(planned.character.weeklyPlan)).toBe(true);
    const invalid = {
      version: 1 as const,
      activities: [{ id: 'food-bad', activityId: 'food' as const, action: {
        kind: 'food' as const, productId: 'meal', name: 'Meal', quantity: 1,
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
    expect(wearingSecond.ownedLifestyleItems!.find((item) => item.productId === 'casual')?.condition).toBeUndefined();
    expect(applyWeeklyClothingWear(wearingSecond).ownedLifestyleItems!.find((item) => item.productId === 'casual')?.condition).toBeUndefined();
  });

  it('does not assume social relationships or household support', () => {
    const character = createCharacter('Independent', 30);
    expect(character.socialConnections ?? []).toHaveLength(0);
    expect(getPassiveLifestyleActivities(character).some((item) => item.id === 'passive-partner-support')).toBe(false);
  });
});
