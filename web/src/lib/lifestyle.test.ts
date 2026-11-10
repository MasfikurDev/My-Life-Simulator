import { describe, expect, it } from 'vitest';
import { addOwnedLifestyleItem, advanceWeek, createCharacter, planSocialInteractionInNextFreeTime } from './simulation';
import {
  addSocialConnection,
  applyWeeklyClothingWear,
  interactWithSocialConnection,
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
      family: { ...family, householdMemberIds: [family.playerPersonId, ...householdIds] }
    };
    const meals = getPassiveLifestyleActivities(supported).find((item) => item.id === 'passive-family-meals');
    expect(meals).toMatchObject({ title: 'Meals provided by family', staminaRecovery: 5, discipline: 2 });
    const neglectful = getPassiveLifestyleActivities({ ...supported, familyCulture: 'neglectful' });
    expect(neglectful.some((item) => item.id === 'passive-family-meals')).toBe(false);
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
    expect(result.character.comfort).toBeGreaterThan(character.comfort);
    expect(result.character.weeklyPlan.activities).toHaveLength(0);
    expect(result.recap.some((line) => line.includes('Shared household support'))).toBe(true);
  });

  it('uses owned clothing for presentation and gradually wears it down', () => {
    const character = createCharacter('Fashion buyer', 30);
    const owned = addOwnedLifestyleItem(character, {
      productId: 'business-suit', name: 'Business suit', category: 'Fashion',
      description: 'Formal clothing', quantity: 1, kind: 'permanent',
      styleScore: 82, formality: 95
    });
    expect(getClothingPresentationScore(owned)).toBe(82);
    const worn = applyWeeklyClothingWear(owned);
    expect(worn.ownedLifestyleItems![0].condition).toBe(99);
    expect(getClothingPresentationScore(worn)).toBe(81);
  });

  it('does not assume social relationships or household support', () => {
    const character = createCharacter('Independent', 30);
    expect(character.socialConnections ?? []).toHaveLength(0);
    expect(getPassiveLifestyleActivities(character).some((item) => item.id === 'passive-partner-support')).toBe(false);
  });
});
