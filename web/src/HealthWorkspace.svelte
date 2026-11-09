<script lang="ts">
  import type { CareActionType, Character } from './lib/types';
  import EmptyState from './components/EmptyState.svelte';
  import ActivityStatusSeal from './components/ActivityStatusSeal.svelte';
  import { formatCharacterMoney, getPlannedActivityStaminaCost, planActivityInNextFreeTime, planCareActionInNextFreeTime, removePlannedActivity } from './lib/simulation';
  import { getWellbeingLoadLabel } from './lib/wellbeing';
  import { getActivityStaminaCost, getValueColor } from './lib/progression';
  let { character, onChange, onNotify }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void } = $props();
  const medical = $derived(character.medicalState ?? { conditions: [], medications: [], highStressWeeks: 0 });
  const schedule = $derived(character.weeklyPlan);
  const activityEffort = $derived(Math.ceil(schedule.activities.reduce((total, item) => total + getPlannedActivityStaminaCost(item), 0) / 6));
  const backgroundObligations = $derived((character.educationEnrollment?.status === 'enrolled' ? 4 : 0) + (character.employment ? (character.employment.type === 'full-time' ? 6 : 3) : 0));
  const workload = $derived(Math.min(21, backgroundObligations + activityEffort));
  const load = $derived(getWellbeingLoadLabel(workload));
  const plannedCare = $derived(schedule.activities.filter((item) => item.action?.kind === 'care'));
  function plan(type: CareActionType) {
    const existing = plannedCare.find((item) => item.action?.kind === 'care' && item.action.careType === type);
    if (existing) { onChange(removePlannedActivity(character, existing.id)); onNotify('Removed from this week.'); return; }
    const result = planCareActionInNextFreeTime(character, type);
    if (result.issue) { onNotify(result.message ?? 'Could not add this care activity.'); return; }
    onChange(result.character);
    onNotify('Added to this week. Toggle it again to remove it.');
  }
  function isPlanned(type: CareActionType) { return plannedCare.some((item) => item.action?.kind === 'care' && item.action.careType === type); }
  function isPersonalActivityPlanned(type: 'exercise' | 'socialize') { return schedule.activities.some((item) => item.activityId === type && item.action?.kind === 'activity'); }
  function togglePersonalActivity(type: 'exercise' | 'socialize') {
    const existing = schedule.activities.find((item) => item.activityId === type && item.action?.kind === 'activity');
    if (existing) { onChange(removePlannedActivity(character, existing.id)); onNotify('Removed from this week.'); return; }
    const result = planActivityInNextFreeTime(character, type);
    if (result.issue) { onNotify(result.message ?? 'Could not add this activity.'); return; }
    onChange(result.character); onNotify('Added to this week.');
  }
  const stats = $derived([
    { label: 'Physical health', value: character.health, tone: 'health', inverse: false },
    { label: 'Fitness', value: character.fitness, tone: 'fitness', inverse: false },
    { label: 'Stamina', value: character.stamina ?? 50, tone: 'stamina', inverse: false },
    { label: 'Happiness', value: character.happiness, tone: 'happiness', inverse: false },
    { label: 'Stress', value: character.stress ?? 30, tone: 'stress', inverse: true }
  ]);
</script>

<div class="page-heading"><div><div class="eyebrow">BODY · MIND · RECOVERY</div><h1>Health & <em>wellbeing</em></h1><p>Manage your health, energy and pressure. Recovery is part of the weekly plan, not wasted time.</p></div></div>
<section class="health-overview domain-panel">
  <div class="health-overview-head"><div><div class="eyebrow">CURRENT CONDITION</div><h2>{load} weekly load</h2><p>Estimated workload: {workload}/21 units, including automatic education/work responsibilities and selected personal activities.</p></div><span class="domain-status">{(character.stress ?? 30) >= 82 ? 'HIGH PRESSURE' : (character.stress ?? 30) >= 60 ? 'ELEVATED' : 'MANAGEABLE'}</span></div>
  <div class="health-stat-grid">
    {#each stats as stat}
      <div class="health-stat"><div><span>{stat.label}</span><strong>{Math.round(stat.value)}%</strong></div><div class="meter"><span class:blue={stat.tone !== 'stress'} class:stress-meter={stat.tone === 'stress'} style="width:{stat.value}%;background:{getValueColor(stat.value, stat.inverse)}"></span></div><small>{stat.inverse ? stat.value >= 80 ? 'Critical pressure' : stat.value >= 60 ? 'Elevated pressure' : 'Manageable' : stat.value < 25 ? 'Critical' : stat.value < 45 ? 'Low' : stat.value < 70 ? 'Fair' : 'Strong'}</small></div>
    {/each}
  </div>
  {#if (character.stress ?? 30) >= 70 || workload >= 14}
    <div class="health-warning"><strong>Your current load is affecting recovery.</strong><span>Reduce commitments, take a break, exercise gently or seek professional support. Pushing harder can make every task less effective.</span></div>
  {/if}
</section>

<section class="health-care-section">
  <div class="section-heading"><div><span class="section-index">01</span><h3>Health, recovery & social wellbeing</h3></div><span class="section-hint">Toggle activities for this week</span></div>
  <div class="health-care-grid">
    <button class="health-care-card" class:planned={isPlanned('rest')} onclick={() => plan('rest')}><span class="health-care-icon">⌂</span><strong>Rest & recovery</strong><ActivityStatusSeal status={isPlanned('rest') ? 'planned' : 'available'} /><p>Restore stamina, improve health and reduce pressure.</p><small>No fee · restores stamina</small><b>{isPlanned('rest') ? 'REMOVE FROM WEEK' : 'ADD TO WEEK'}</b></button>
    <button class="health-care-card" class:planned={isPlanned('mindfulness')} onclick={() => plan('mindfulness')}><span class="health-care-icon">◌</span><strong>Mindfulness</strong><ActivityStatusSeal status={isPlanned('mindfulness') ? 'planned' : 'available'} /><p>Build a calmer routine, improve focus and reduce everyday stress.</p><small>Stamina 4 · no fee</small><b>{isPlanned('mindfulness') ? 'REMOVE FROM WEEK' : 'ADD TO WEEK'}</b></button>
    <button class="health-care-card" class:planned={isPlanned('counselling')} onclick={() => plan('counselling')}><span class="health-care-icon">♡</span><strong>Professional counselling</strong><ActivityStatusSeal status={isPlanned('counselling') ? 'planned' : 'available'} /><p>Get structured support for persistent pressure and burnout.</p><small>{character.age < 18 ? 'Family-supported' : formatCharacterMoney(character, 90 * (character.currencyScale ?? 1))} · Stamina 2</small><b>{isPlanned('counselling') ? 'REMOVE FROM WEEK' : 'Seek support'}</b></button>
    <button class="health-care-card" class:planned={isPlanned('medical-checkup')} onclick={() => plan('medical-checkup')}><span class="health-care-icon">✚</span><strong>Medical check-up</strong><ActivityStatusSeal status={isPlanned('medical-checkup') ? 'planned' : 'available'} /><p>Review physical health and update a treatment plan.</p><small>{character.age < 18 ? 'Family-supported' : formatCharacterMoney(character, 120 * (character.currencyScale ?? 1))} · no stamina cost</small><b>{isPlanned('medical-checkup') ? 'REMOVE FROM WEEK' : 'Book check-up'}</b></button>
    <button class="health-care-card" class:planned={isPersonalActivityPlanned('exercise')} onclick={() => togglePersonalActivity('exercise')}><span class="health-care-icon">↗</span><strong>Exercise</strong><ActivityStatusSeal status={isPlanned('exercise') ? 'planned' : 'available'} /><p>Build fitness, support physical health and reduce accumulated stress.</p><small>{getActivityStaminaCost('exercise')} stamina · no direct fee</small><b>{isPersonalActivityPlanned('exercise') ? 'REMOVE FROM WEEK' : 'ADD TO WEEK'}</b></button>
    <button class="health-care-card" class:planned={isPersonalActivityPlanned('socialize')} onclick={() => togglePersonalActivity('socialize')}><span class="health-care-icon">◎</span><strong>Social time</strong><p>Spend time with friends to improve happiness and social skills.</p><small>{getActivityStaminaCost('socialize')} stamina · {character.age >= 16 ? formatCharacterMoney(character, 20 * (character.currencyScale ?? 1)) : 'No direct fee'}</small><b>{isPersonalActivityPlanned('socialize') ? 'REMOVE FROM WEEK' : 'ADD TO WEEK'}</b></button>
  </div>
</section>

<section class="health-conditions-section">
  <div class="section-heading"><div><span class="section-index">02</span><h3>Medical record</h3></div><span class="section-hint">{medical.conditions.length} active conditions</span></div>
  {#if medical.conditions.length}
    {#each medical.conditions as condition}
      <div class="health-condition-row"><div><strong>{condition.name}</strong><small>{condition.diagnosed ? 'Diagnosed' : 'Not yet assessed'} · {condition.weeksActive} weeks active · {condition.treatment ? 'Treatment: ' + condition.treatment.replaceAll('-', ' ') : 'No treatment plan'}</small></div><div class="health-condition-severity"><strong>{Math.round(condition.severity)}%</strong><div class="meter"><span class="stress-meter" style="width:{condition.severity}%;background:{getValueColor(condition.severity, true)}"></span></div></div></div>
    {/each}
  {:else}
    <EmptyState title="No active medical conditions" />
  {/if}
  {#if medical.medications.length}
    <div class="health-medication-list"><strong>Current treatment</strong>{#each medical.medications as medication}<span>{medication.name} · {medication.weeksRemaining} weeks remaining</span>{/each}</div>
  {/if}
  <p class="health-disclaimer">Medical care in this game is an abstract simulation of seeking professional support. Conditions and treatments are gameplay systems, not real-world diagnoses or medical advice.</p>
</section>
