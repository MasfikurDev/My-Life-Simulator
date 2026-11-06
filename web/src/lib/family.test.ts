import { describe, expect, it } from 'vitest';
import { advanceYear, createCharacter, generateRandomCharacter } from './simulation';
import { getFamilyConnections, interactWithFamily, validateFamilyState } from './family';
import { prepareGameEvent, resolveGameEvent } from './events';

describe('persistent family simulation', () => {
  it('generates a validated family-of-origin graph for a new child', () => {
    const child = generateRandomCharacter(12, () => 0.5);
    const family = child.family!;
    expect(family).toBeDefined();
    expect(validateFamilyState(family)).toEqual([]);
    expect(family.people.find((person) => person.id === family.playerPersonId)?.name).toBe(child.name);
    expect(family.primaryGuardianId).toBeDefined();
    expect(family.dependentPersonIds).toContain(family.playerPersonId);
    expect(family.householdMemberIds).toContain(family.primaryGuardianId);
    expect(getFamilyConnections(child).some((connection) => connection.role === 'Parent')).toBe(true);
  });

  it('does not invent a partner or children during character creation', () => {
    const adult = generateRandomCharacter(30, () => 0.5);
    const family = adult.family!;
    expect(family.relationships.some((relationship) => relationship.type === 'partner')).toBe(false);
    expect(family.relationships.some((relationship) => relationship.fromPersonId === family.playerPersonId && relationship.type === 'parent')).toBe(false);
  });

  it('keeps legacy characters without a family graph valid and unchanged', () => {
    const legacy = { ...createCharacter('Legacy', 35), family: undefined };
    expect(getFamilyConnections(legacy)).toEqual([]);
    expect(interactWithFamily(legacy, 'missing', 'spend-time')).toBe(legacy);
  });

  it('spending time strengthens only the selected relationship and consumes one action', () => {
    const character = generateRandomCharacter(25, () => 0.5);
    const connection = getFamilyConnections(character).find((item) => item.living)!;
    const before = character.family!.bonds.find((bond) => bond.personId === connection.person.id)!;
    const next = interactWithFamily(character, connection.person.id, 'spend-time');
    const after = next.family!.bonds.find((bond) => bond.personId === connection.person.id)!;
    expect(after.closeness).toBe(Math.min(100, before.closeness + 8));
    expect(after.trust).toBe(Math.min(100, before.trust + 3));
    expect(next.actionsRemaining).toBe(character.actionsRemaining - 1);
    expect(next.history[0].title).toContain(connection.person.name);
    expect(next.family!.history).toHaveLength(character.family!.history.length + 1);
  });

  it('records affordable adult family support as a real financial outflow', () => {
    const character = { ...generateRandomCharacter(35, () => 0.5), money: 1000 };
    const relative = getFamilyConnections(character).find((item) => item.living)!;
    const next = interactWithFamily(character, relative.person.id, 'provide-support', 250);
    expect(next.money).toBe(750);
    expect(next.financialTransactions?.at(-1)).toMatchObject({ type: 'family-support', amount: 250, to: relative.person.name });
    expect(next.family!.bonds.find((bond) => bond.personId === relative.person.id)?.supportProvidedTotal).toBe(250);
    expect(interactWithFamily(character, relative.person.id, 'provide-support', 1001)).toBe(character);
  });

  it('blocks adult financial support from a minor', () => {
    const child = generateRandomCharacter(15, () => 0.5);
    const relative = getFamilyConnections(child).find((item) => item.living)!;
    expect(interactWithFamily(child, relative.person.id, 'provide-support', 1)).toBe(child);
  });

  it('requires a real conflict before reconciliation can be selected', () => {
    const character = generateRandomCharacter(30, () => 0.5);
    const relative = getFamilyConnections(character).find((item) => item.living)!;
    expect(interactWithFamily(character, relative.person.id, 'reconcile')).toBe(character);
    const strained = {
      ...character,
      family: {
        ...character.family!,
        bonds: character.family!.bonds.map((bond) => bond.personId === relative.person.id ? { ...bond, tension: 30 } : bond)
      }
    };
    const next = interactWithFamily(strained, relative.person.id, 'reconcile');
    expect(next.family!.bonds.find((bond) => bond.personId === relative.person.id)?.tension).toBe(18);
  });

  it('advances family simulation year exactly with the life year', () => {
    const character = generateRandomCharacter(40, () => 0.5);
    const next = advanceYear(character);
    expect(next.family!.lastSimulatedYear).toBe(next.year);
    expect(next.family!.people.find((person) => person.id === next.family!.playerPersonId)?.birthYear).toBe(character.year - character.age);
  });

  it('rejects a cyclic parent graph', () => {
    const character = generateRandomCharacter(30, () => 0.5);
    const family = character.family!;
    const parent = family.people.find((person) => person.id !== family.playerPersonId)!;
    const invalid = {
      ...family,
      relationships: [...family.relationships, {
        id: 'invalid-cycle',
        fromPersonId: family.playerPersonId,
        toPersonId: parent.id,
        type: 'parent' as const,
        startedAtYear: character.year
      }]
    };
    expect(validateFamilyState(invalid)).toContain('Parent and guardian relationships cannot contain cycles.');
  });


  it('offers a contextual family reconnection event after higher-priority starter events are resolved', () => {
    const base = generateRandomCharacter(30, () => 0.5);
    const character = {
      ...base,
      resolvedGameEventIds: ['adult-side-project'],
      eventPreparedYear: undefined,
      pendingGameEvent: null
    };
    const prepared = prepareGameEvent(character);
    expect(prepared.pendingGameEvent?.id).toContain('family-check-in-');
    const personId = prepared.pendingGameEvent?.choices[0].familyBondEffect?.personId;
    const before = prepared.family!.bonds.find((bond) => bond.personId === personId)!;
    const resolved = resolveGameEvent(prepared, 'make-time');
    const after = resolved.family!.bonds.find((bond) => bond.personId === personId)!;
    expect(after.closeness).toBe(Math.min(100, before.closeness + 6));
    expect(after.trust).toBe(Math.min(100, before.trust + 3));
    expect(resolved.happiness).toBe(Math.min(100, prepared.happiness + 2));
    expect(resolved.history[0].title).toBe('A chance to reconnect: Make time for them');
  });

  it('renames the player node when the player changes the generated character name', () => {
    const character = createCharacter('Chosen Name', 18);
    expect(character.family!.people.find((person) => person.id === character.family!.playerPersonId)?.name).toBe('Chosen Name');
  });
});
