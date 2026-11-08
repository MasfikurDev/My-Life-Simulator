import { describe, expect, it } from 'vitest';
import { createCharacter } from './simulation';
import { resolveDueGameConsequences, resolveGameEvent } from './events';

describe('game event decisions and delayed consequences', () => {
  it('persists the selected choice in decision-tree history and schedules its follow-up once', () => {
    const character = createCharacter('Event Tester', 18);
    const pending = character.pendingGameEvent;
    expect(pending?.id).toBe('adult-side-project');
    const choice = pending!.choices.find((item) => item.id === 'take-part')!;

    const resolved = resolveGameEvent(character, choice.id);

    expect(resolved.pendingGameEvent).toBeNull();
    expect(resolved.resolvedGameEventIds).toContain(pending!.id);
    expect(resolved.decisionTreeHistory).toHaveLength(1);
    expect(resolved.decisionTreeHistory?.[0]).toMatchObject({
      eventId: pending!.id,
      chosenChoiceId: choice.id,
      chosenLabel: choice.label,
      treeId: 'life'
    });
    expect(resolved.scheduledGameConsequences).toHaveLength(1);
    expect(resolved.scheduledGameConsequences?.[0]).toMatchObject({
      id: pending!.id + ':' + choice.id,
      dueYear: character.year + 1,
      title: choice.followUp?.title
    });

    const due = {
      ...resolved,
      year: resolved.scheduledGameConsequences![0].dueYear
    };
    const rewarded = resolveDueGameConsequences(due);
    expect(rewarded.money).toBe(resolved.money + (choice.followUp?.effects.money ?? 0));
    expect(rewarded.scheduledGameConsequences).toEqual([]);
    expect(rewarded.history[0].title).toBe(choice.followUp?.title);
    expect(resolveDueGameConsequences(rewarded)).toBe(rewarded);
  });

  it('does not resolve an event twice or record an invalid choice', () => {
    const character = createCharacter('Event Tester', 18);
    const pending = character.pendingGameEvent!;
    expect(resolveGameEvent(character, 'not-a-choice')).toBe(character);

    const resolved = resolveGameEvent(character, pending.choices[0].id);
    expect(resolveGameEvent(resolved, pending.choices[0].id)).toBe(resolved);
    expect(resolved.decisionTreeHistory).toHaveLength(1);
  });
});
