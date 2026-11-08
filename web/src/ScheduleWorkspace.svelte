<script lang="ts">
  import { addCalendarDays, getFirstWeekStartOfYear, getWeekStart } from './lib/calendar';
  import { getActivityDefinition } from './lib/progression';
  import { buildWeeklySchedule, getWeeklySchedule } from './lib/weekly-schedule';
  import { formatCharacterMoney, getPlannedActivityCost, getPlannedActivityStaminaCost, removePlannedActivity } from './lib/simulation';
  import type { ActivityId, Character } from './lib/types';

  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekStart = $derived(getWeekStart(character.calendar?.currentDate ?? getFirstWeekStartOfYear(character.year)));
  const schedule = $derived(getWeeklySchedule(character.weeklySchedule));
  const result = $derived(buildWeeklySchedule(weekStart, schedule));
  const plannedCost = $derived(schedule.activities.reduce((total, item) => total + getPlannedActivityCost(character, item), 0));
  let feedback = $state('');

  const days = $derived(weekdays.map((label, index) => {
    const date = addCalendarDays(weekStart, index);
    return { label, date, blocks: result.blocks.filter((block) => block.date === date) };
  }));

  function removeActivity(id: string) {
    onChange(removePlannedActivity(character, id));
    feedback = 'Planned activity removed.';
  }

  function activityLabel(item: (typeof schedule.activities)[number]) {
    if (item.action?.kind === 'education') return item.action.taskType === 'assignment' ? 'Education assignment' : item.action.taskType === 'exam' ? 'Academic assessment' : 'Focused study';
    if (item.action?.kind === 'care') return item.action.careType.replaceAll('-', ' ');
    if (item.action?.kind === 'family') return 'Family interaction';
    if (item.action?.kind === 'business') return 'Business management';
    if (item.action?.kind === 'event') return 'Life event decision';
    if (item.action?.kind === 'work') return item.action.workAction === 'apply' ? 'Job application' : 'Job interview';
    return getActivityDefinition(item.activityId as ActivityId)?.title ?? item.activityId;
  }
</script>

<section class="schedule-workspace">
  <header class="schedule-heading">
    <div>
      <div class="eyebrow">YOUR WEEK</div>
      <h2>Your week</h2>
      <p>Recurring school and work commitments shape your week. Personal activities are planned separately and use stamina, not calendar slots.</p>
    </div>
    <span class="week-range">{weekStart} – {addCalendarDays(weekStart, 6)}</span>
  </header>

  <section class="schedule-summary" aria-label="Weekly time summary">
    <div><strong>{result.blocks.filter((block) => block.entryId === null).length}</strong><span>Free periods</span></div>
    <div><strong>{schedule.activities.length}</strong><span>Planned activities</span></div>
    <div><strong>{schedule.commitments.length}</strong><span>Recurring commitments</span></div>
  </section>

  <p class="schedule-budget">Direct planned costs: <strong>{formatCharacterMoney(character, plannedCost)}</strong> · Cash after planned costs: <strong>{formatCharacterMoney(character, Math.max(0, character.money - plannedCost))}</strong></p>

  {#if schedule.activities.length}
    <section class="planned-activity-list" aria-label="Personal activities this week">
      <div class="planned-activity-heading"><strong>Personal activities</strong><span>Toggle them in their own workspaces or remove them here</span></div>
      {#each schedule.activities as item (item.id)}
        <article><div><strong>{activityLabel(item)}</strong><small>{getPlannedActivityStaminaCost(item)} stamina · {getPlannedActivityCost(character, item) > 0 ? formatCharacterMoney(character, getPlannedActivityCost(character, item)) : 'No direct fee'}</small></div><button aria-label={'Remove '+activityLabel(item)} onclick={() => removeActivity(item.id)}>Remove</button></article>
      {/each}
    </section>
  {/if}

  <section class="week-grid" aria-label="Recurring weekly commitments">
    {#each days as day}
      <article class="day-column">
        <header><strong>{day.label}</strong><small>{day.date.slice(5)}</small></header>
        {#each day.blocks as block}
          <div class:occupied={block.entryId !== null} class="period-card">
            <span class="period-label">{block.period}</span>
            {#if block.entryId}
              <div class="period-entry">
                <strong>{block.title}</strong>
                <small>Recurring commitment</small>
              </div>
            {:else}
              <span class="period-free">Available</span>
            {/if}
          </div>
        {/each}
      </article>
    {/each}
  </section>

  {#if feedback}<p class="schedule-feedback" role="status">{feedback}</p>{/if}
  {#if result.issues.length}
    <section class="schedule-issues" role="alert">
      <strong>Schedule needs attention</strong>
      {#each result.issues as issue}<p>{issue.message}</p>{/each}
    </section>
  {/if}
  <p class="schedule-footnote">Only recurring commitments reserve calendar periods. Personal activities are managed in their own workspaces, consume stamina and resolve during the weekly simulation.</p>
</section>

<style>
  .schedule-workspace{display:grid;gap:14px;min-width:0}
  .schedule-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:12px}
  .schedule-heading h2{margin:5px 0;color:var(--text);font-size:clamp(23px,3vw,30px);letter-spacing:-.8px}
  .schedule-heading p{margin:0;color:var(--muted);font-size:11px;line-height:1.55;max-width:560px}
  .week-range{flex:none;padding:8px 10px;border:1px solid var(--line);border-radius:9px;color:var(--muted);font-size:10px}
  .schedule-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
  .schedule-summary div{display:grid;gap:4px;padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--surface)}
  .schedule-summary strong{font-size:21px;color:var(--text)}
  .schedule-summary span{font-size:10px;color:var(--muted)}
  .schedule-budget{margin:-5px 0 0;color:var(--muted);font-size:10px}.schedule-budget strong{color:var(--text)}
.planned-activity-list{display:grid;gap:7px;padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--surface)}
  .planned-activity-heading{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.planned-activity-heading strong{font-size:11px}.planned-activity-heading span{font-size:9px;color:var(--muted);text-align:right}
  .planned-activity-list article{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid var(--line)}.planned-activity-list article>div{display:grid;gap:3px}.planned-activity-list article strong{font-size:10px}.planned-activity-list article small{font-size:9px;color:var(--muted)}.planned-activity-list article button{border:1px solid var(--line);border-radius:7px;background:var(--surface-raised);color:var(--muted);padding:6px 9px;font-size:9px}
  .week-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;min-width:0}
  .day-column{display:grid;align-content:start;gap:6px;min-width:0}
  .day-column>header{display:grid;gap:3px;padding:0 2px 4px}
  .day-column>header strong{font-size:10px;color:var(--text)}
  .day-column>header small{font-size:9px;color:var(--muted)}
  .period-card{display:grid;align-content:start;gap:5px;min-height:82px;padding:8px 6px;border:1px dashed var(--line-strong);border-radius:9px;background:var(--surface)}
  .period-card.occupied{border-style:solid;border-color:color-mix(in srgb,var(--accent) 45%, transparent);background:var(--accent-soft)}
  .period-label{font-size:9px;text-transform:capitalize;color:var(--muted)}
  .period-free{font-size:10px;color:var(--muted)}
  .period-entry{display:flex;align-items:flex-start;justify-content:space-between;gap:3px;min-width:0}
  .period-entry strong{overflow-wrap:anywhere;color:var(--text);font-size:9px;line-height:1.35}
  .period-entry small{font-size:8px;color:var(--muted)}
  .period-entry button{flex:none;width:18px;height:18px;border:0;border-radius:5px;background:color-mix(in srgb,var(--bg) 8%, transparent);color:var(--text);font-size:14px;line-height:1}
  .schedule-feedback{margin:0;color:var(--muted);font-size:10px}
  .schedule-issues{padding:12px;border:1px solid var(--danger);border-radius:10px;background:color-mix(in srgb,var(--danger) 8%, transparent);color:var(--text);font-size:11px}
  .schedule-issues p{margin:5px 0 0;color:var(--muted)}
  .schedule-footnote{margin:0;color:var(--muted);font-size:10px;line-height:1.55}
  @media(max-width:760px){.week-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.day-column:last-child{grid-column:1/-1}}
  @media(max-width:420px){.schedule-heading{align-items:flex-start;flex-direction:column}.week-range{align-self:flex-start}.schedule-summary div{padding:10px}.schedule-summary strong{font-size:18px}.week-grid{gap:6px}.period-card{min-height:70px}}
</style>
