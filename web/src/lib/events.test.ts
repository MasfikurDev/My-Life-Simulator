import { describe, expect, it } from 'vitest';
import { createCharacter } from './simulation';
import { prepareGameEvent, resolveDueGameConsequences, resolveGameEvent } from './events';

describe('game event decisions and delayed consequences', () => {
  it('records an employed adult extra shift as an immediate career and financial outcome', () => {
    const base = createCharacter('Event Tester', 18);
    const character = prepareGameEvent({
      ...base, eventPreparedYear: undefined, pendingGameEvent: null,
      employment: { title: 'Worker', type: 'full-time', annualSalary: 52000, experienceYears: 1, performance: 60, promotions: 0, startedAtAge: 18 }
    });
    const pending = character.pendingGameEvent!;
    const choice = pending.choices.find((item) => item.id === 'take-part')!;
    const resolved = resolveGameEvent(character, choice.id);

    expect(resolved.pendingGameEvent).toBeNull();
    expect(resolved.resolvedGameEventIds).toContain(pending.id);
    expect(resolved.decisionTreeHistory?.[0]).toMatchObject({
      eventId: pending.id, chosenChoiceId: choice.id, chosenLabel: choice.label, treeId: 'career'
    });
    expect(resolved.money).toBe(character.money + choice.effects.money!);
    expect(resolved.financialTransactions?.some((transaction) =>
      transaction.type === 'income' && transaction.amount === choice.effects.money
    )).toBe(true);
    expect(resolved.scheduledGameConsequences).toHaveLength(0);
  });

  it('persists a study choice follow-up and resolves it once in the following year', () => {
    const base = createCharacter('Student Tester', 12);
    const character = prepareGameEvent({
      ...base, eventPreparedYear: undefined, pendingGameEvent: null,
      educationEnrollment: {
        recordId: 'school-1', status: 'enrolled', programId: 'primary', institution: 'Local School',
        level: 'primary', field: 'Science', startedAtAge: 6, tuitionPaid: 0,
        weeksCompleted: 4, totalWeeks: 100, grade: 70, attendance: 95, subjects: []
      }
    });
    const pending = character.pendingGameEvent!;
    const choice = pending.choices.find((item) => item.id === 'join')!;
    const resolved = resolveGameEvent(character, choice.id);
    expect(resolved.scheduledGameConsequences).toHaveLength(1);
    expect(resolved.scheduledGameConsequences?.[0]).toMatchObject({
      id: pending.id + ':' + choice.id, dueYear: character.year + 1, title: choice.followUp?.title
    });

    const due = { ...resolved, year: resolved.scheduledGameConsequences![0].dueYear };
    const rewarded = resolveDueGameConsequences(due);
    expect(rewarded.intelligence).toBe(resolved.intelligence + (choice.followUp?.effects.intelligence ?? 0));
    expect(rewarded.scheduledGameConsequences).toEqual([]);
    expect(rewarded.history[0].title).toBe(choice.followUp?.title);
    expect(resolveDueGameConsequences(rewarded)).toBe(rewarded);
  });

  it('does not resolve an event twice or record an invalid choice', () => {
    const base = createCharacter('Event Tester', 18);
    const character = prepareGameEvent({
      ...base, eventPreparedYear: undefined, pendingGameEvent: null,
      employment: { title: 'Worker', type: 'full-time', annualSalary: 52000, experienceYears: 1, performance: 60, promotions: 0, startedAtAge: 18 }
    });
    const pending = character.pendingGameEvent!;
    expect(resolveGameEvent(character, 'not-a-choice')).toBe(character);
    const resolved = resolveGameEvent(character, pending.choices[0].id);
    expect(resolveGameEvent(resolved, pending.choices[0].id)).toBe(resolved);
    expect(resolved.decisionTreeHistory).toHaveLength(1);
  });
});

describe('contextual event eligibility and content', () => {
  it('does not invent a school group for a child who is not enrolled', () => {
    const character = createCharacter('Child Tester', 8);
    const prepared = prepareGameEvent({ ...character, eventPreparedYear: undefined, pendingGameEvent: null });
    expect(prepared.pendingGameEvent).toBeNull();
  });

  it('offers the study group only to an enrolled student and names their actual programme context', () => {
    const character = createCharacter('Student Tester', 8);
    const enrolled = {
      ...character,
      eventPreparedYear: undefined,
      pendingGameEvent: null,
      educationEnrollment: {
        recordId: 'primary-1', status: 'enrolled' as const, programId: 'primary', institution: 'Local School',
        level: 'primary' as const, field: 'Science', startedAtAge: 6, tuitionPaid: 0,
        weeksCompleted: 4, totalWeeks: 100, grade: 70, attendance: 95, subjects: []
      }
    };
    const prepared = prepareGameEvent(enrolled);
    expect(prepared.pendingGameEvent?.id).toBe('school-reading-circle');
    expect(prepared.pendingGameEvent?.description).toContain('Local School');
    expect(prepared.pendingGameEvent?.description).toContain('Science');
  });

  it('offers paid extra work only to an employed adult and records it as a career decision', () => {
    const character = createCharacter('Worker Tester', 30);
    const employed = {
      ...character,
      eventPreparedYear: undefined,
      pendingGameEvent: null,
      employment: {
        title: 'Support Specialist', type: 'full-time' as const, annualSalary: 52000,
        experienceYears: 2, performance: 70, promotions: 0, startedAtAge: 28,
        employer: 'Northstar Services'
      }
    };
    const prepared = prepareGameEvent(employed);
    expect(prepared.pendingGameEvent?.id).toBe('adult-side-project');
    expect(prepared.pendingGameEvent?.title).toBe('Your employer offers an extra shift');
    expect(prepared.pendingGameEvent?.description).toContain('Northstar Services');
    const choice = prepared.pendingGameEvent!.choices.find((item) => item.id === 'take-part')!;
    expect(choice.effects.money).toBeGreaterThan(0);
    expect(choice.moneyCost).toBe(0);
    expect(choice.staminaCost).toBeGreaterThan(0);
    const resolved = resolveGameEvent(prepared, choice.id);
    expect(resolved.money).toBe(prepared.money + choice.effects.money!);
    expect(resolved.decisionTreeHistory?.[0].treeId).toBe('career');
    expect(resolved.financialTransactions?.some((transaction) =>
      transaction.type === 'income' && transaction.amount === choice.effects.money
    )).toBe(true);
  });
});
