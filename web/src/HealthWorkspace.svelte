<script lang="ts">
  import type { CareActionType, Character } from './lib/types';
  import { formatCharacterMoney, planCareActionInNextFreeTime, removePlannedActivity } from './lib/simulation';
  import { getWellbeingLoadLabel } from './lib/wellbeing';
  import { buildWeeklySchedule } from './lib/weekly-schedule';
  import { getWeekStart } from './lib/calendar';
  let { character, onChange, onNotify }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void } = $props();
  const medical = $derived(character.medicalState ?? { conditions: [], medications: [], highStressWeeks: 0 });
  const schedule = $derived(character.weeklySchedule ?? { version: 1 as const, commitments: [], activities: [] });
  const weekStart = $derived(getWeekStart(character.calendar?.currentDate ?? character.year + '-01-01'));
  const occupied = $derived(buildWeeklySchedule(weekStart, schedule).blocks.filter((block) => block.entryId !== null).length);
  const load = $derived(getWellbeingLoadLabel(occupied));
  const plannedCare = $derived(schedule.activities.filter((item) => item.action?.kind === 'care'));
  function plan(type: CareActionType) {
    const result = planCareActionInNextFreeTime(character, type);
    if (result.issue) { onNotify(result.message ?? 'Could not arrange this care activity.'); return; }
    onChange(result.character);
    onNotify('Care appointment added to your week.');
  }
  function isPlanned(type: CareActionType) { return plannedCare.some((item) => item.action?.kind === 'care' && item.action.careType === type); }
  function removeCare(id: string) { onChange(removePlannedActivity(character, id)); onNotify('Care appointment removed from this week.'); }
  const stats = $derived([
    { label: 'Physical health', value: character.health, tone: 'health', inverse: false },
    { label: 'Fitness', value: character.fitness, tone: 'fitness', inverse: false },
    { label: 'Stamina', value: character.stamina ?? 50, tone: 'stamina', inverse: false },
    { label: 'Happiness', value: character.happiness, tone: 'happiness', inverse: false },
    { label: 'Stress', value: character.stress ?? 30, tone: 'stress', inverse: true }
  ]);
</script>

<div class="page-heading"><div><div class="eyebrow">BODY · MIND · RECOVERY</div><h1>Health & <em>wellbeing.</em></h1><p>Manage your health, energy and pressure. Recovery is part of the weekly plan, not wasted time.</p></div></div>
<section class="health-overview domain-panel">
  <div class="health-overview-head"><div><div class="eyebrow">CURRENT CONDITION</div><h2>{load} weekly load</h2><p>{occupied} of 21 weekly time blocks are committed. Too many demands can reduce study and work efficiency.</p></div><span class="domain-status">{(character.stress ?? 30) >= 82 ? 'HIGH PRESSURE' : (character.stress ?? 30) >= 60 ? 'ELEVATED' : 'MANAGEABLE'}</span></div>
  <div class="health-stat-grid">
    {#each stats as stat}
      <div class="health-stat"><div><span>{stat.label}</span><strong>{Math.round(stat.value)}%</strong></div><div class="meter"><span class:blue={stat.tone !== 'stress'} class:stress-meter={stat.tone === 'stress'} style="width:{stat.value}%"></span></div><small>{stat.inverse ? stat.value >= 80 ? 'Critical pressure' : stat.value >= 60 ? 'Elevated pressure' : 'Manageable' : stat.value >= 75 ? 'Strong' : stat.value >= 45 ? 'Fair' : 'Needs attention'}</small></div>
    {/each}
  </div>
  {#if (character.stress ?? 30) >= 70 || occupied >= 14}
    <div class="health-warning"><strong>Your current load is affecting recovery.</strong><span>Reduce commitments, take a break, exercise gently or seek professional support. Pushing harder can make every task less effective.</span></div>
  {/if}
</section>

<section class="health-care-section">
  <div class="section-heading"><div><span class="section-index">01</span><h3>Care & recovery</h3></div><span class="section-hint">Automatically scheduled in free time</span></div>
  <div class="health-care-grid">
    <button class="health-care-card" class:planned={isPlanned('rest')} disabled={isPlanned('rest')} aria-label={isPlanned('rest') ? 'Rest and recovery planned' : 'Plan rest and recovery'} onclick={() => plan('rest')}><span class="health-care-icon">⌂</span><strong>Rest & recovery</strong><p>Restore stamina and reduce pressure.</p><small>No direct cost · 1 block</small></button>
    <button class="health-care-card" class:planned={isPlanned('mindfulness')} disabled={isPlanned('mindfulness')} aria-label={isPlanned('mindfulness') ? 'Mindfulness planned' : 'Plan mindfulness'} onclick={() => plan('mindfulness')}><span class="health-care-icon">◌</span><strong>Mindfulness</strong><p>Improve focus and reduce everyday stress.</p><small>No direct cost · 1 block</small></button>
    <button class="health-care-card" class:planned={isPlanned('counselling')} disabled={isPlanned('counselling')} aria-label={isPlanned('counselling') ? 'Professional counselling planned' : 'Plan professional counselling'} onclick={() => plan('counselling')}><span class="health-care-icon">♡</span><strong>Professional counselling</strong><p>Get structured support for persistent pressure.</p><small>{character.age < 18 ? 'Family-supported' : formatCharacterMoney(character, 90 * (character.currencyScale ?? 1))} · 1 block</small></button>
    <button class="health-care-card" class:planned={isPlanned('medical-checkup')} disabled={isPlanned('medical-checkup')} aria-label={isPlanned('medical-checkup') ? 'Medical check-up planned' : 'Book medical check-up'} onclick={() => plan('medical-checkup')}><span class="health-care-icon">✚</span><strong>Medical check-up</strong><p>Review physical health and treatment needs.</p><small>{character.age < 18 ? 'Family-supported' : formatCharacterMoney(character, 120 * (character.currencyScale ?? 1))} · 1 block</small></button>
  </div>
  {#if plannedCare.length}<div class="education-planned-list"><strong>Appointments scheduled this week</strong>{#each plannedCare as item}<div class="education-planned-row"><span>{item.date} · {item.startPeriod} · {item.action?.kind === 'care' ? item.action.careType.replaceAll('-', ' ') : 'Care'}</span><button class="text-button" onclick={() => removeCare(item.id)}>Remove</button></div>{/each}</div>{/if}
</section>

<section class="health-conditions-section">
  <div class="section-heading"><div><span class="section-index">02</span><h3>Medical record</h3></div><span class="section-hint">{medical.conditions.length} active conditions</span></div>
  {#if medical.conditions.length}
    {#each medical.conditions as condition}
      <div class="health-condition-row"><div><strong>{condition.name}</strong><small>{condition.diagnosed ? 'Diagnosed' : 'Not yet assessed'} · {condition.weeksActive} weeks active · {condition.treatment ? 'Treatment: ' + condition.treatment.replaceAll('-', ' ') : 'No treatment plan'}</small></div><div class="health-condition-severity"><strong>{Math.round(condition.severity)}%</strong><div class="meter"><span class="stress-meter" style="width:{condition.severity}%"></span></div></div></div>
    {/each}
  {:else}
    <div class="health-empty"><strong>No active medical conditions recorded.</strong><p>Keep a sustainable routine. Health problems may still emerge from prolonged stress, poor recovery or low physical health.</p></div>
  {/if}
  {#if medical.medications.length}
    <div class="health-medication-list"><strong>Current treatment</strong>{#each medical.medications as medication}<span>{medication.name} · {medication.weeksRemaining} weeks remaining</span>{/each}</div>
  {/if}
  <p class="health-disclaimer">Medical care in this game is an abstract simulation of seeking professional support. Conditions and treatments are gameplay systems, not real-world diagnoses or medical advice.</p>
</section>
