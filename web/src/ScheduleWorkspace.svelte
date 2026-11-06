<script lang="ts">
  import { addCalendarDays, getFirstWeekStartOfYear, getWeekStart } from './lib/calendar';
  import { getAvailableActivityIds } from './lib/progression';
  import { buildWeeklySchedule, getWeeklySchedule } from './lib/weekly-schedule';
  import type { ActivityId, Character, DayPeriod, PlannedActivity } from './lib/types';

  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();

  const periods: DayPeriod[] = ['morning', 'afternoon', 'evening'];
  const activityInfo: Record<ActivityId, { title: string; duration: number; detail: string }> = {
    study: { title: 'Study & learning', duration: 2, detail: 'A longer focused session' },
    exercise: { title: 'Exercise', duration: 1, detail: 'One period' },
    socialize: { title: 'Social time', duration: 1, detail: 'One period' },
    work: { title: 'Extra work', duration: 2, detail: 'A longer work session' },
    'apply-job': { title: 'Apply for a job', duration: 1, detail: 'One period' },
    career: { title: 'Career development', duration: 1, detail: 'One period' }
  };
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekStart = $derived(getWeekStart(character.calendar?.currentDate ?? getFirstWeekStartOfYear(character.year)));
  const schedule = $derived(getWeeklySchedule(character.weeklySchedule));
  const result = $derived(buildWeeklySchedule(weekStart, schedule));
  const availableActivities = $derived(getAvailableActivityIds(character.age));
  let selectedActivity = $state<ActivityId>('exercise');
  let selectedDate = $state(weekStart);
  let selectedPeriod = $state<DayPeriod>('morning');
  let feedback = $state('');

  const days = $derived(weekdays.map((label, index) => {
    const date = addCalendarDays(weekStart, index);
    return { label, date, blocks: result.blocks.filter((block) => block.date === date) };
  }));

  function addActivity() {
    const activityId = selectedActivity;
    if (!availableActivities.includes(activityId)) {
      feedback = 'This activity is not available at your current life stage.';
      return;
    }
    const info = activityInfo[activityId];
    const id = 'planned-' + selectedDate + '-' + selectedPeriod + '-' + activityId;
    const activity: PlannedActivity = {
      id,
      activityId,
      date: selectedDate,
      startPeriod: selectedPeriod,
      durationBlocks: info.duration
    };
    const nextSchedule = { ...schedule, activities: [...schedule.activities, activity] };
    const nextResult = buildWeeklySchedule(weekStart, nextSchedule);
    if (!nextResult.valid) {
      const issue = nextResult.issues.find((item) => item.entryId === id);
      feedback = issue?.message ?? 'That time cannot be reserved.';
      return;
    }
    onChange({ ...character, weeklySchedule: nextSchedule });
    feedback = info.title + ' added to the week.';
  }

  function removeActivity(id: string) {
    const nextSchedule = { ...schedule, activities: schedule.activities.filter((item) => item.id !== id) };
    onChange({ ...character, weeklySchedule: nextSchedule });
    feedback = 'Planned activity removed.';
  }

  function activityLabel(id: string) {
    return activityInfo[id as ActivityId]?.title ?? id;
  }
</script>

<section class="schedule-workspace">
  <header class="schedule-heading">
    <div>
      <div class="eyebrow">WEEKLY PLANNING</div>
      <h2>Your week</h2>
      <p>Reserve time for activities. A plan is not completed until its owning gameplay system resolves it.</p>
    </div>
    <span class="week-range">{weekStart} – {addCalendarDays(weekStart, 6)}</span>
  </header>

  <section class="schedule-summary" aria-label="Weekly time summary">
    <div><strong>{result.blocks.filter((block) => block.entryId === null).length}</strong><span>Free periods</span></div>
    <div><strong>{result.blocks.filter((block) => block.domain === 'activity').length}</strong><span>Planned periods</span></div>
    <div><strong>{schedule.commitments.length}</strong><span>Recurring commitments</span></div>
  </section>

  <section class="schedule-planner">
    <div class="planner-copy">
      <div class="eyebrow">MAKE A PLAN</div>
      <h3>Schedule an activity</h3>
      <p>Each activity reserves a small number of broad periods. You can change the plan until the week is resolved.</p>
    </div>
    <div class="planner-controls">
      <label>Activity
        <select bind:value={selectedActivity}>
          {#each availableActivities as id}
            <option value={id}>{activityInfo[id].title} · {activityInfo[id].duration} {activityInfo[id].duration === 1 ? 'period' : 'periods'}</option>
          {/each}
        </select>
      </label>
      <label>Day
        <select bind:value={selectedDate}>
          {#each days as day}
            <option value={day.date}>{day.label} · {day.date}</option>
          {/each}
        </select>
      </label>
      <label>Start
        <select bind:value={selectedPeriod}>
          {#each periods as period}
            <option value={period}>{period[0].toUpperCase() + period.slice(1)}</option>
          {/each}
        </select>
      </label>
      <button class="schedule-add" onclick={addActivity} disabled={availableActivities.length === 0}>Add to week</button>
    </div>
    {#if feedback}<p class="schedule-feedback" role="status">{feedback}</p>{/if}
    {#if !availableActivities.length}<p class="schedule-feedback">No activities are currently available at this life stage.</p>{/if}
  </section>

  <section class="week-grid" aria-label="Seven day schedule">
    {#each days as day}
      <article class="day-column">
        <header><strong>{day.label}</strong><small>{day.date.slice(5)}</small></header>
        {#each day.blocks as block}
          <div class:occupied={block.entryId !== null} class="period-card">
            <span class="period-label">{block.period}</span>
            {#if block.entryId}
              <div class="period-entry">
                <strong>{block.domain === 'activity' ? activityLabel(block.title ?? '') : block.title}</strong>
                {#if block.domain === 'activity'}
                  <button aria-label="Remove planned activity" title="Remove planned activity" onclick={() => removeActivity(block.entryId!)}>×</button>
                {:else}<small>Recurring commitment</small>{/if}
              </div>
            {:else}
              <span class="period-free">Available</span>
            {/if}
          </div>
        {/each}
      </article>
    {/each}
  </section>

  {#if result.issues.length}
    <section class="schedule-issues" role="alert">
      <strong>Schedule needs attention</strong>
      {#each result.issues as issue}<p>{issue.message}</p>{/each}
    </section>
  {/if}
  <p class="schedule-footnote">Time blocks are planning constraints, not hours. School and work routines will appear here only when those systems provide real schedules. Planned activities currently reserve time; weekly activity resolution is the next gameplay step.</p>
</section>

<style>
  .schedule-workspace{display:grid;gap:14px;min-width:0}
  .schedule-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:12px}
  .schedule-heading h2{margin:5px 0;color:var(--text);font-size:clamp(23px,3vw,30px);letter-spacing:-.8px}
  .schedule-heading p,.planner-copy p{margin:0;color:var(--muted);font-size:11px;line-height:1.55;max-width:560px}
  .week-range{flex:none;padding:8px 10px;border:1px solid var(--line);border-radius:9px;color:var(--muted);font-size:10px}
  .schedule-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
  .schedule-summary div{display:grid;gap:4px;padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--surface)}
  .schedule-summary strong{font-size:21px;color:var(--text)}
  .schedule-summary span{font-size:10px;color:var(--muted)}
  .schedule-planner{display:grid;gap:12px;padding:15px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}
  .planner-copy h3{margin:4px 0;font-size:16px;color:var(--text)}
  .planner-controls{display:grid;grid-template-columns:1.2fr 1.3fr 1fr auto;gap:8px;align-items:end}
  .planner-controls label{display:grid;gap:5px;color:var(--muted);font-size:10px;font-weight:650}
  .planner-controls select{width:100%;min-width:0;min-height:40px;padding:0 9px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font:inherit;font-size:11px}
  .schedule-add{min-height:40px;padding:0 13px;border:1px solid var(--accent);border-radius:8px;background:var(--accent);color:#102016;font-size:11px;font-weight:750;white-space:nowrap}
  .schedule-add:disabled{opacity:.45;cursor:not-allowed}
  .schedule-feedback{margin:0;color:var(--accent);font-size:11px}
  .week-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;min-width:0}
  .day-column{display:grid;align-content:start;gap:6px;min-width:0}
  .day-column>header{display:grid;gap:3px;padding:0 2px 4px}
  .day-column>header strong{font-size:10px;color:var(--text)}
  .day-column>header small{font-size:9px;color:var(--muted)}
  .period-card{display:grid;align-content:start;gap:5px;min-height:82px;padding:8px 6px;border:1px dashed var(--line-strong);border-radius:9px;background:var(--surface)}
  .period-card.occupied{border-style:solid;border-color:rgba(114,214,154,.45);background:var(--accent-soft)}
  .period-label{font-size:9px;text-transform:capitalize;color:var(--muted)}
  .period-free{font-size:10px;color:var(--muted)}
  .period-entry{display:flex;align-items:flex-start;justify-content:space-between;gap:3px;min-width:0}
  .period-entry strong{overflow-wrap:anywhere;color:var(--text);font-size:9px;line-height:1.35}
  .period-entry small{font-size:8px;color:var(--muted)}
  .period-entry button{flex:none;width:18px;height:18px;border:0;border-radius:5px;background:rgba(0,0,0,.08);color:var(--text);font-size:14px;line-height:1}
  .schedule-issues{padding:12px;border:1px solid #d98b70;border-radius:10px;background:rgba(217,139,112,.08);color:var(--text);font-size:11px}
  .schedule-issues p{margin:5px 0 0;color:var(--muted)}
  .schedule-footnote{margin:0;color:var(--muted);font-size:10px;line-height:1.55}
  @media(max-width:760px){.planner-controls{grid-template-columns:1fr 1fr}.schedule-add{width:100%}.week-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.day-column:last-child{grid-column:1/-1}}
  @media(max-width:420px){.schedule-heading{align-items:flex-start;flex-direction:column}.week-range{align-self:flex-start}.schedule-summary div{padding:10px}.schedule-summary strong{font-size:18px}.week-grid{gap:6px}.period-card{min-height:70px}}
</style>
