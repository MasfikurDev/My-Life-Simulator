import type { Character, DecisionTreeId, GameEventChoice, GameEventEffects, LifeEvent, PendingGameEvent, ScheduledGameConsequence } from './types';
import { applyFamilyBondEffect, getFamilyConnections } from './family';

const clampStat = (value: number) => Math.max(0, Math.min(100, value));

function historyEntry(character: Character, title: string, description: string): LifeEvent {
  return {
    id: String(character.year) + '-' + String(character.history.length + 1),
    year: character.year,
    age: character.age,
    title,
    description,
    kind: 'event'
  };
}

function recordEventMoney(character: Character, id: string, signedAmount: number, description: string): Character {
  const amount = Math.round(signedAmount);
  if (!amount) return character;
  const existing = character.financialTransactions ?? [];
  if (existing.some((transaction) => transaction.id === id)) return character;
  const transaction = {
    id,
    year: character.year,
    age: character.age,
    date: character.calendar?.currentDate,
    type: amount > 0 ? 'income' as const : 'expense' as const,
    amount: Math.abs(amount),
    description,
    from: amount > 0 ? 'Event' : 'Cash',
    to: amount > 0 ? 'Cash' : 'Event'
  };
  return { ...character, financialTransactions: [...existing, transaction].slice(-300) };
}

function applyEffects(character: Character, effects: GameEventEffects, transactionId: string, description: string): Character {
  const moneyChange = Math.max(-character.money, Math.round(effects.money ?? 0));
  const next: Character = {
    ...character,
    money: character.money + moneyChange,
    health: clampStat(character.health + (effects.health ?? 0)),
    happiness: clampStat(character.happiness + (effects.happiness ?? 0)),
    intelligence: clampStat(character.intelligence + (effects.intelligence ?? 0)),
    fitness: clampStat(character.fitness + (effects.fitness ?? 0))
  };
  return recordEventMoney(next, transactionId, moneyChange, description);
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function eligibleEvents(character: Character): PendingGameEvent[] {
  const resolved = character.resolvedGameEventIds ?? [];
  const scale = character.currencyScale ?? 1;
  const events: PendingGameEvent[] = [];

  const enrollment = character.educationEnrollment;
  if (character.age >= 6 && character.age <= 17 && enrollment?.status === 'enrolled' && !resolved.includes('school-reading-circle')) {
    events.push({
      id: 'school-reading-circle',
      title: 'Your instructor recommends a study group',
      description: 'At ' + enrollment.institution + ', your ' + enrollment.field + ' instructor is organizing an optional study group for students who want to strengthen their understanding before the next assessment. It takes time that could go toward rest or another activity.',
      category: 'opportunity',
      choices: [
        {
          id: 'join',
          label: 'Attend the study group',
          detail: 'Use part of this week to work through the subject with other students.',
          staminaCost: 5,
          moneyCost: 0,
          effects: { intelligence: 3, happiness: 1 },
          followUp: {
            delayYears: 1,
            title: 'The study habit stuck',
            description: 'The group helped you build a more consistent study routine. That habit continues to support your learning.',
            effects: { intelligence: 2 }
          }
        },
        {
          id: 'pass',
          label: 'Keep your time free',
          detail: 'Skip the optional session and preserve your time for other priorities.',
          staminaCost: 0,
          moneyCost: 0,
          effects: {}
        }
      ]
    });
  }

  if (character.age >= 18 && character.age < 65 && character.employment && !resolved.includes('adult-side-project')) {
    const extraShiftPay = Math.max(1, Math.round(character.employment.annualSalary / 260 * 1.5));
    events.push({
      id: 'adult-side-project',
      title: 'Your employer offers an extra shift',
      description: character.employment.employer + ' needs cover for an additional shift in your ' + character.employment.title + ' role. The shift would bring extra pay, but it will use time and energy you could otherwise spend recovering or on personal priorities.',
      category: 'opportunity',
      choices: [
        {
          id: 'take-part',
          label: 'Accept the extra shift',
          detail: 'Work the additional shift and receive ' + extraShiftPay.toLocaleString('en-US') + ' in extra pay.',
          staminaCost: 8,
          moneyCost: 0,
          effects: { money: extraShiftPay }
        },
        {
          id: 'pass',
          label: 'Decline the shift',
          detail: 'Keep your existing commitments and recovery time unchanged.',
          staminaCost: 0,
          moneyCost: 0,
          effects: {}
        }
      ]
    });
  }

  if (events.length === 0 && character.family && character.age >= 18) {
    const relative = getFamilyConnections(character).find((connection) =>
      connection.living && connection.bond && (connection.bond.lastInteractionYear === null || character.year - connection.bond.lastInteractionYear >= 2)
    );
    if (relative) {
      const id = 'family-check-in-' + relative.person.id;
      if (!resolved.includes(id)) {
        events.push({
          id,
          title: 'A chance to reconnect',
          description: relative.person.name + ' is someone you have not caught up with in a while. Make time to reconnect.',
          category: 'personal',
          choices: [
            {
              id: 'make-time',
              label: 'Make time for them',
              detail: 'Catch up and strengthen your bond.',
              staminaCost: 5,
              moneyCost: 0,
              effects: { happiness: 2 },
              familyBondEffect: { personId: relative.person.id, closeness: 6, trust: 3, tension: -2 }
            },
            {
              id: 'keep-plans',
              label: 'Keep your current plans',
              detail: 'Leave the invitation for another time.',
              staminaCost: 0,
              moneyCost: 0,
              effects: {}
            }
          ]
        });
      }
    }
  }

  return events;
}

export function prepareGameEvent(character: Character): Character {
  if (character.eventPreparedYear === character.year) return character;
  const candidates = eligibleEvents(character);
  const selected = candidates.length
    ? candidates[stableHash([character.name, character.year, character.age, character.history.length].join('|')) % candidates.length]
    : null;
  return { ...character, eventPreparedYear: character.year, pendingGameEvent: selected };
}

function getDecisionTreeId(eventId: string): DecisionTreeId {
  if (eventId.startsWith('family-check-in-')) return 'relationships';
  if (eventId.includes('wellbeing')) return 'health';
  if (eventId.includes('school') || eventId.includes('reading')) return 'education';
  if (eventId.includes('career') || eventId.includes('job') || eventId.includes('work') || eventId === 'adult-side-project') return 'career';
  if (eventId.includes('finance') || eventId.includes('money') || eventId.includes('business')) return 'finance';
  return 'life';
}

function decisionRecord(character: Character, pending: PendingGameEvent, chosen: GameEventChoice) {
  return {
    id: pending.id + ':' + chosen.id,
    treeId: getDecisionTreeId(pending.id),
    eventId: pending.id,
    title: pending.title,
    description: pending.description,
    age: character.age,
    year: character.year,
    chosenChoiceId: chosen.id,
    chosenLabel: chosen.label,
    branches: pending.choices.map((option) => ({
      choiceId: option.id,
      label: option.label,
      detail: option.detail,
      rewards: { ...option.effects },
      ...(option.followUp ? { followUp: { title: option.followUp.title, description: option.followUp.description } } : {})
    }))
  };
}

export function resolveGameEvent(character: Character, choiceId: string): Character {
  const pending = character.pendingGameEvent;
  if (!pending) return character;
  const choice = pending.choices.find((item) => item.id === choiceId);
  if (!choice || character.money < choice.moneyCost) return character;

  let next: Character = {
    ...character,
    money: character.money - choice.moneyCost,
    pendingGameEvent: null,
    resolvedGameEventIds: [...(character.resolvedGameEventIds ?? []), pending.id],
    decisionTreeHistory: [...(character.decisionTreeHistory ?? []), decisionRecord(character, pending, choice)],
    scheduledGameConsequences: [...(character.scheduledGameConsequences ?? [])]
  };
  if (choice.moneyCost > 0) {
    next = recordEventMoney(next, 'event:' + pending.id + ':' + choice.id + ':cost', -choice.moneyCost, 'Event cost: ' + pending.title + '.');
  }
  next = applyEffects(next, choice.effects, 'event:' + pending.id + ':' + choice.id + ':effect', 'Event outcome: ' + pending.title + '.');
  if (choice.familyBondEffect) next = applyFamilyBondEffect(next, choice.familyBondEffect);

  if (choice.followUp) {
    const followUp: ScheduledGameConsequence = {
      id: pending.id + ':' + choice.id,
      dueYear: character.year + Math.max(1, Math.floor(choice.followUp.delayYears)),
      title: choice.followUp.title,
      description: choice.followUp.description,
      effects: choice.followUp.effects
    };
    next.scheduledGameConsequences = [...(next.scheduledGameConsequences ?? []), followUp];
  }

  const costParts = [];
  if (choice.moneyCost) costParts.push('spent ' + choice.moneyCost.toLocaleString('en-US'));
  const result = costParts.length ? ' ' + costParts.join(' and ') + '.' : '';
  next.history = [
    historyEntry(next, pending.title + ': ' + choice.label, choice.detail + result),
    ...next.history
  ];
  return next;
}

export function expirePendingGameEvent(character: Character): Character {
  const pending = character.pendingGameEvent;
  if (!pending) return character;
  return {
    ...character,
    pendingGameEvent: null,
    resolvedGameEventIds: [...(character.resolvedGameEventIds ?? []), pending.id],
    history: [
      historyEntry(character, 'Opportunity passed', 'You let "' + pending.title + '" pass without making a choice.'),
      ...character.history
    ]
  };
}

export function resolveDueGameConsequences(character: Character): Character {
  const due = (character.scheduledGameConsequences ?? []).filter((item) => item.dueYear <= character.year);
  if (!due.length) return character;
  let next: Character = {
    ...character,
    scheduledGameConsequences: (character.scheduledGameConsequences ?? []).filter((item) => item.dueYear > character.year)
  };
  for (const consequence of due) {
    next = applyEffects(next, consequence.effects, 'consequence:' + consequence.id + ':money', 'Delayed event outcome: ' + consequence.title + '.');
    next.history = [historyEntry(next, consequence.title, consequence.description), ...next.history];
  }
  return next;
}
