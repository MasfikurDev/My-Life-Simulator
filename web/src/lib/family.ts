import type { Character, FamilyBond, FamilyHistoryEntry, FamilyPerson, FamilyRelationship, FamilyState, FamilyRelationshipType, Gender, LifeEvent } from './types';

export type FamilyInteraction = 'spend-time' | 'reach-out' | 'reconcile' | 'provide-support';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const living = (person: FamilyPerson, year: number) => person.deathYear === undefined || person.deathYear > year;
const PLAYER_ID = 'family-player';

const GIVEN_NAMES: Record<string, Record<'male' | 'female' | 'neutral', string[]>> = {
  Bangladesh: { male: ['Arif','Farhan','Hasan','Imran','Nabil','Rafi'], female: ['Aisha','Anika','Farah','Maliha','Nusrat','Sadia'], neutral: ['Ari','Noor','Rumi'] },
  India: { male: ['Aarav','Arjun','Dev','Kabir','Rahul','Rohan'], female: ['Aanya','Diya','Isha','Meera','Priya','Tara'], neutral: ['Aadi','Kiran','Neel'] },
  'United States': { male: ['Alex','Benjamin','Caleb','Ethan','James','Noah'], female: ['Amelia','Ava','Emma','Harper','Mia','Olivia'], neutral: ['Avery','Casey','Jordan'] },
  'United Kingdom': { male: ['Arthur','Charlie','George','Harry','Jack','Oliver'], female: ['Amelia','Daisy','Ella','Freya','Isla','Sophie'], neutral: ['Alex','Ellis','Jamie'] },
  Canada: { male: ['Adam','Elliot','Ethan','Jack','Liam','Owen'], female: ['Ava','Chloe','Emily','Grace','Mila','Sophie'], neutral: ['Avery','Cameron','Quinn'] },
  Australia: { male: ['Archie','Charlie','Ethan','Henry','Jack','Leo'], female: ['Amelia','Ella','Harper','Isla','Mia','Ruby'], neutral: ['Alex','Billie','Riley'] },
  Japan: { male: ['Akira','Daiki','Haruto','Kaito','Ren','Yuto'], female: ['Aoi','Hana','Hina','Mei','Sakura','Yui'], neutral: ['Aoi','Haru','Kaoru'] },
  Nigeria: { male: ['Chidi','David','Emeka','Ibrahim','Kelechi','Tunde'], female: ['Ada','Amara','Amina','Chioma','Ife','Zainab'], neutral: ['Ayo','Ife','Tomi'] },
  Brazil: { male: ['Arthur','Caio','Davi','Gabriel','Lucas','Rafael'], female: ['Alice','Ana','Camila','Helena','Julia','Sofia'], neutral: ['Ariel','Dani','Rene'] },
  Germany: { male: ['Ben','Elias','Emil','Felix','Finn','Jonas'], female: ['Amelie','Anna','Clara','Emilia','Hannah','Lena'], neutral: ['Alex','Kim','Lou'] }
};

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.max(0, Math.floor(random() * items.length)))];
}
function makeName(character: Pick<Character, 'name' | 'country'>, gender: Gender, random: () => number): string {
  const country = character.country ?? 'United States';
  const pools = GIVEN_NAMES[country] ?? GIVEN_NAMES['United States'];
  const first = pick(pools[gender === 'non-binary' ? 'neutral' : gender], random);
  const parts = character.name.trim().split(/\s+/);
  const surname = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  return country === 'Japan' ? surname + ' ' + first : first + ' ' + surname;
}
function personAge(person: FamilyPerson, year: number): number {
  return Math.max(0, year - person.birthYear);
}
function makeBond(personId: string, random: () => number, close = false): FamilyBond {
  return {
    personId,
    closeness: close ? 55 + Math.floor(random() * 26) : 40 + Math.floor(random() * 31),
    trust: 50 + Math.floor(random() * 31),
    tension: Math.floor(random() * 16),
    lastInteractionYear: null,
    supportProvidedTotal: 0
  };
}
function addHistory(family: FamilyState, year: number, type: FamilyHistoryEntry['type'], title: string, description: string, personIds: string[]): FamilyState {
  const entry: FamilyHistoryEntry = {
    id: 'family-' + year + '-' + (family.history.length + 1),
    year, type, title, description, personIds
  };
  return { ...family, history: [...family.history, entry] };
}

export function createFamilyState(character: Pick<Character, 'name' | 'age' | 'year' | 'country' | 'gender'>, random: () => number = Math.random): FamilyState {
  const player: FamilyPerson = {
    id: PLAYER_ID, name: character.name, gender: character.gender,
    birthYear: character.year - character.age
  };
  const people: FamilyPerson[] = [player];
  const relationships: FamilyRelationship[] = [];
  const bonds: FamilyBond[] = [];
  const history: FamilyHistoryEntry[] = [];
  const parentCount = random() < 0.18 ? 1 : 2;
  const parents: FamilyPerson[] = [];
  for (let index = 0; index < parentCount; index++) {
    const gender: Gender = random() < 0.5 ? 'female' : 'male';
    const ageAtBirth = 20 + Math.floor(random() * 19);
    const birthYear = player.birthYear - ageAtBirth;
    const ageNow = character.year - birthYear;
    const deathAge = 72 + Math.floor(random() * 23);
    const parent: FamilyPerson = {
      id: 'family-parent-' + (index + 1),
      name: makeName(character, gender, random),
      gender,
      birthYear,
      ...(ageNow > deathAge ? { deathYear: birthYear + deathAge } : {})
    };
    parents.push(parent);
    people.push(parent);
    relationships.push({
      id: 'family-parent-link-' + (index + 1),
      fromPersonId: parent.id,
      toPersonId: PLAYER_ID,
      type: 'parent',
      startedAtYear: player.birthYear
    });
    bonds.push(makeBond(parent.id, random, true));
    if (parent.deathYear !== undefined) {
      history.push({
        id: 'family-background-death-' + parent.id,
        year: parent.deathYear,
        type: 'background',
        title: 'Family loss',
        description: parent.name + ' died before the current chapter of this life.',
        personIds: [parent.id, PLAYER_ID]
      });
    }
  }

  const siblingCount = Math.floor(random() * 4);
  for (let index = 0; index < siblingCount; index++) {
    const ageOffset = Math.floor(random() * 17) - 8;
    const siblingAge = Math.max(0, character.age + ageOffset);
    const gender: Gender = random() < 0.5 ? 'female' : 'male';
    const sibling: FamilyPerson = {
      id: 'family-sibling-' + (index + 1),
      name: makeName(character, gender, random),
      gender,
      birthYear: character.year - siblingAge
    };
    people.push(sibling);
    relationships.push({
      id: 'family-sibling-link-' + (index + 1),
      fromPersonId: PLAYER_ID,
      toPersonId: sibling.id,
      type: 'sibling',
      startedAtYear: Math.max(player.birthYear, sibling.birthYear)
    });
    for (const parent of parents) {
      relationships.push({
        id: 'family-sibling-parent-' + (index + 1) + '-' + parent.id,
        fromPersonId: parent.id,
        toPersonId: sibling.id,
        type: 'parent',
        startedAtYear: sibling.birthYear
      });
    }
    bonds.push(makeBond(sibling.id, random));
  }

  const family: FamilyState = {
    version: 1,
    playerPersonId: PLAYER_ID,
    people,
    relationships,
    bonds,
    householdMemberIds: [PLAYER_ID],
    dependentPersonIds: [],
    history,
    lastSimulatedYear: character.year
  };
  if (character.age < 18) {
    const guardian = parents.find((parent) => living(parent, character.year)) ?? parents[0];
    if (guardian) {
      family.primaryGuardianId = guardian.id;
      family.relationships.push({
        id: 'family-primary-guardian',
        fromPersonId: guardian.id,
        toPersonId: PLAYER_ID,
        type: 'guardian',
        startedAtYear: character.year - character.age
      });
      family.householdMemberIds.push(guardian.id);
      family.dependentPersonIds.push(PLAYER_ID);
    }
    for (const sibling of people.filter((person) => person.id.startsWith('family-sibling-'))) {
      if (living(sibling, character.year) && random() < 0.7) family.householdMemberIds.push(sibling.id);
    }
  }
  for (const bond of family.bonds) {
    if (family.householdMemberIds.includes(bond.personId)) bond.lastInteractionYear = character.year;
  }
  return family;
}

export function validateFamilyState(family: FamilyState): string[] {
  const errors: string[] = [];
  const ids = family.people.map((person) => person.id);
  const idSet = new Set(ids);
  if (new Set(ids).size !== ids.length) errors.push('Family person IDs must be unique.');
  if (!idSet.has(family.playerPersonId)) errors.push('The player person must exist in the family graph.');
  for (const person of family.people) {
    if (!person.id || !person.name.trim() || !Number.isInteger(person.birthYear)) errors.push('Family people need an ID, name, and integer birth year.');
    if (person.deathYear !== undefined && (!Number.isInteger(person.deathYear) || person.deathYear < person.birthYear)) errors.push('A family member death year cannot precede their birth year.');
  }
  const activeKeys = new Set<string>();
  const parentEdges = new Map<string, string[]>();
  for (const relation of family.relationships) {
    if (!idSet.has(relation.fromPersonId) || !idSet.has(relation.toPersonId)) errors.push('Family relationships must reference existing people.');
    if (relation.fromPersonId === relation.toPersonId) errors.push('A person cannot have a relationship with themselves.');
    if (!Number.isInteger(relation.startedAtYear)) errors.push('Family relationship start years must be integers.');
    if (relation.endedAtYear !== undefined && relation.endedAtYear < relation.startedAtYear) errors.push('A relationship cannot end before it starts.');
    const pair = relation.type === 'sibling' || relation.type === 'partner'
      ? [relation.fromPersonId, relation.toPersonId].sort().join(':')
      : relation.fromPersonId + ':' + relation.toPersonId;
    const key = relation.type + ':' + pair;
    if (relation.endedAtYear === undefined && activeKeys.has(key)) errors.push('Duplicate active family relationship.');
    if (relation.endedAtYear === undefined) activeKeys.add(key);
    if (['parent', 'guardian', 'adoptive-parent', 'step-parent'].includes(relation.type)) {
      const children = parentEdges.get(relation.fromPersonId) ?? [];
      children.push(relation.toPersonId);
      parentEdges.set(relation.fromPersonId, children);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    for (const child of parentEdges.get(id) ?? []) if (!visit(child)) return false;
    visiting.delete(id);
    visited.add(id);
    return true;
  };
  for (const id of ids) if (!visit(id)) { errors.push('Parent and guardian relationships cannot contain cycles.'); break; }
  for (const bond of family.bonds) {
    if (!idSet.has(bond.personId) || bond.personId === family.playerPersonId) errors.push('Family bonds must reference a non-player family member.');
    for (const value of [bond.closeness, bond.trust, bond.tension]) {
      if (!Number.isInteger(value) || value < 0 || value > 100) errors.push('Family bond values must be integers from 0 to 100.');
    }
    if (!Number.isSafeInteger(bond.supportProvidedTotal) || bond.supportProvidedTotal < 0) errors.push('Family support totals must be non-negative safe integers.');
  }
  for (const id of [...family.householdMemberIds, ...family.dependentPersonIds]) if (!idSet.has(id)) errors.push('Household and dependency records must reference existing people.');
  if (!family.householdMemberIds.includes(family.playerPersonId)) errors.push('The player must be included in their household membership record.');
  if (family.primaryGuardianId && !idSet.has(family.primaryGuardianId)) errors.push('The primary guardian must exist in the family graph.');
  return [...new Set(errors)];
}

export function getFamilyConnections(character: Character): Array<{ person: FamilyPerson; age: number; role: string; bond: FamilyBond | undefined; living: boolean; livesTogether: boolean }> {
  const family = character.family;
  if (!family) return [];
  return family.people.filter((person) => person.id !== family.playerPersonId).map((person) => {
    const direct = family.relationships.find((relation) =>
      relation.endedAtYear === undefined &&
      ((relation.fromPersonId === person.id && relation.toPersonId === family.playerPersonId) ||
       (relation.toPersonId === person.id && relation.fromPersonId === family.playerPersonId))
    );
    let role = 'Family member';
    if (direct?.type === 'sibling') role = 'Sibling';
    else if (direct?.type === 'partner') role = 'Partner';
    else if (direct?.type === 'parent' || direct?.type === 'adoptive-parent' || direct?.type === 'step-parent') role = direct.fromPersonId === person.id ? (direct.type === 'adoptive-parent' ? 'Adoptive parent' : direct.type === 'step-parent' ? 'Step-parent' : 'Parent') : 'Child';
    else if (direct?.type === 'guardian') role = direct.fromPersonId === person.id ? 'Guardian' : 'Dependent';
    return {
      person,
      age: personAge(person, character.year),
      role,
      bond: family.bonds.find((item) => item.personId === person.id),
      living: living(person, character.year),
      livesTogether: family.householdMemberIds.includes(person.id)
    };
  }).sort((a, b) => Number(b.living) - Number(a.living) || a.role.localeCompare(b.role) || a.person.name.localeCompare(b.person.name));
}

function lifeEvent(character: Character, title: string, description: string): LifeEvent {
  return {
    id: 'family-' + character.year + '-' + character.age + '-' + (character.history.length + 1),
    year: character.year, age: character.age, title, description, kind: 'event'
  };
}

export function interactWithFamily(character: Character, personId: string, interaction: FamilyInteraction, supportAmount = 0): Character {
  const family = character.family;
  if (!family || character.actionsRemaining <= 0 || validateFamilyState(family).length > 0) return character;
  const person = family.people.find((item) => item.id === personId);
  const bondIndex = family.bonds.findIndex((item) => item.personId === personId);
  if (!person || person.id === family.playerPersonId || !living(person, character.year) || bondIndex < 0) return character;
  if (interaction === 'reach-out' && character.age < 10) return character;
  if (interaction === 'reconcile' && (character.age < 13 || family.bonds[bondIndex].tension < 15)) return character;
  if (interaction === 'provide-support' && (character.age < 18 || !Number.isSafeInteger(supportAmount) || supportAmount <= 0 || supportAmount > character.money)) return character;

  const bonds = family.bonds.map((bond, index) => {
    if (index !== bondIndex) return bond;
    if (interaction === 'spend-time') return { ...bond, closeness: clamp(bond.closeness + 8), trust: clamp(bond.trust + 3), tension: clamp(bond.tension - 2), lastInteractionYear: character.year };
    if (interaction === 'reach-out') return { ...bond, closeness: clamp(bond.closeness + 4), trust: clamp(bond.trust + 2), lastInteractionYear: character.year };
    if (interaction === 'reconcile') return { ...bond, closeness: clamp(bond.closeness + 2), trust: clamp(bond.trust + 2), tension: clamp(bond.tension - 12), lastInteractionYear: character.year };
    return { ...bond, closeness: clamp(bond.closeness + 2), trust: clamp(bond.trust + 5), supportProvidedTotal: bond.supportProvidedTotal + supportAmount, lastInteractionYear: character.year };
  });
  const nextFamily: FamilyState = {
    ...family,
    bonds,
    history: [...family.history, {
      id: 'family-' + character.year + '-' + (family.history.length + 1),
      year: character.year,
      type: interaction === 'provide-support' ? 'support' : 'interaction',
      title: interaction === 'spend-time' ? 'Spent time with ' + person.name :
        interaction === 'reach-out' ? 'Reached out to ' + person.name :
        interaction === 'reconcile' ? 'Worked through a conflict with ' + person.name :
        'Supported ' + person.name,
      description: interaction === 'provide-support' ? 'Provided ' + supportAmount + ' in financial support.' :
        interaction === 'reconcile' ? 'Made an effort to reduce tension and rebuild trust.' :
        interaction === 'reach-out' ? 'Maintained contact and strengthened the relationship.' :
        'Shared meaningful time and strengthened the relationship.',
      personIds: [family.playerPersonId, person.id]
    }]
  };
  const money = interaction === 'provide-support' ? character.money - supportAmount : character.money;
  const next: Character = {
    ...character,
    family: nextFamily,
    money,
    actionsRemaining: character.actionsRemaining - 1,
    history: [...character.history, lifeEvent(character, nextFamily.history[nextFamily.history.length - 1].title, nextFamily.history[nextFamily.history.length - 1].description)]
  };
  if (interaction === 'provide-support') {
    const transactions = character.financialTransactions ?? [];
    next.financialTransactions = [...transactions, {
      id: 'family-support-' + character.year + '-' + (transactions.length + 1),
      year: character.year,
      age: character.age,
      type: 'family-support',
      amount: supportAmount,
      description: 'Financial support provided to ' + person.name + '.',
      from: 'Cash',
      to: person.name
    }].slice(-300);
  }
  return next;
}

export function advanceFamilyYear(character: Character): Character {
  if (!character.family || character.family.lastSimulatedYear >= character.year) return character;
  return { ...character, family: { ...character.family, lastSimulatedYear: character.year } };
}

export function familyRelationshipTypeLabel(type: FamilyRelationshipType): string {
  const labels: Record<FamilyRelationshipType, string> = {
    parent: 'Parent', guardian: 'Guardian', sibling: 'Sibling',
    partner: 'Partner', 'adoptive-parent': 'Adoptive parent', 'step-parent': 'Step-parent'
  };
  return labels[type];
}

export function establishFamilyBackground(character: Character): Character {
  if (character.family) return character;
  const family = createFamilyState(character);
  const entry = lifeEvent(character, 'Family background established', 'A family-of-origin record was added. This records known background, not a prediction of future relationships.');
  return { ...character, family, history: [...character.history, entry] };
}
