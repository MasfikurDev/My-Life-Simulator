<script lang="ts">
  import { canAffordActivity, formatCharacterMoney, performActivity } from './lib/simulation';
  import { getAvailableActivityIds, getLifeStage } from './lib/progression';
  import type { ActivityId, Character } from './lib/types';
  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  let activeView = $state('overview');
  const views = [
    { id: 'overview', label: 'Overview' },
    { id: 'wellbeing', label: 'Wellbeing' },
    { id: 'growth', label: 'Personal growth' },
    { id: 'personal', label: 'Personal' },
    { id: 'history', label: 'Life history' }
  ];
  const personalActivities: {id: ActivityId; title: string; detail: string; icon: string; cost: string}[] = [
    { id: 'exercise', title: 'Exercise', detail: 'Improve fitness, health, and mood.', icon: '⌁', cost: 'Time' },
    { id: 'socialize', title: 'Socialize', detail: 'Make time for the people around you.', icon: '◎', cost: '20' }
  ];
  const stage = $derived(getLifeStage(character.age));
  const availablePersonalActivities = $derived(personalActivities.filter((item) => getAvailableActivityIds(character.age, character.employment).includes(item.id)));
  function act(id: ActivityId) {
    if (!character.actionsRemaining || !canAffordActivity(character, id)) return;
    onChange(performActivity(character, id));
  }
  function cost(id: ActivityId) {
    if (!canAffordActivity(character, id)) return 'Insufficient funds';
    if (character.age < 16) return 'Time';
    return id === 'exercise' ? 'Time' : formatCharacterMoney(character, 20 * (character.currencyScale ?? 1));
  }
</script>

<section class="life-workspace">
  <header class="finance-header">
    <div><div class="eyebrow">LIFE</div><h1>{views.find((item) => item.id === activeView)?.label}</h1><p>Your personal wellbeing, everyday life and recorded milestones.</p></div>
    {#if activeView !== 'overview'}<button class="finance-back" onclick={() => activeView='overview'}>← Life overview</button>{/if}
  </header>
  <nav class="finance-nav" aria-label="Life sections">
    {#each views as item}
      <button class:active={activeView===item.id} aria-current={activeView===item.id ? 'page' : undefined} onclick={() => activeView=item.id}>{item.label}</button>
    {/each}
  </nav>

  {#if activeView === 'overview'}
    <section class="domain-panel">
      <div class="domain-panel-head"><div><div class="eyebrow">CURRENT LIFE STAGE</div><h2>{stage.label}</h2><p>Age {character.age} · {stage.ageRange}. {stage.description}</p></div><span class="domain-status">YEAR {character.year}</span></div>
      {#if stage.nextAge !== null}<div class="domain-note">Next life stage begins at age {stage.nextAge}.</div>{/if}
      <div class="domain-metrics"><div><span>Actions remaining</span><strong>{character.actionsRemaining}/3</strong></div><div><span>Health</span><strong>{character.health}/100</strong></div><div><span>Happiness</span><strong>{character.happiness}/100</strong></div><div><span>Fitness</span><strong>{character.fitness}/100</strong></div></div>
    </section>
    <div class="finance-shortcuts life-shortcuts">
      <button onclick={() => activeView='wellbeing'><span class="shortcut-icon">＋</span><strong>Wellbeing</strong><small>Health, happiness and fitness</small><b>View wellbeing →</b></button>
      <button onclick={() => activeView='personal'><span class="shortcut-icon">✳</span><strong>Personal</strong><small>Everyday activities and free time</small><b>Open personal life →</b></button>
      <button onclick={() => activeView='history'}><span class="shortcut-icon">↗</span><strong>Life history</strong><small>{character.history.length} recorded events and milestones</small><b>Review history →</b></button>
    </div>
  {:else if activeView === 'wellbeing'}
    <section class="domain-panel">
      <div class="domain-panel-head"><div><div class="eyebrow">PERSONAL CONDITION</div><h2>Wellbeing</h2><p>These indicators change through life events and personal activities.</p></div></div>
      <div class="stats-grid">
        {#each [{label:'Health',value:character.health,color:'mint',icon:'＋'},{label:'Happiness',value:character.happiness,color:'coral',icon:'♡'},{label:'Fitness',value:character.fitness,color:'amber',icon:'⌁'}] as stat}
          <article class="stat-card"><div class="stat-top"><span class="stat-icon {stat.color}">{stat.icon}</span><span class="stat-label">{stat.label}</span></div><div class="stat-value">{stat.value}<small>/100</small></div><div class="meter"><span class={stat.color} style="width:{stat.value}%"></span></div></article>
        {/each}
      </div>
    </section>
  {:else if activeView === 'growth'}
    <section class="domain-panel">
      <div class="domain-panel-head"><div><div class="eyebrow">PERSONAL DEVELOPMENT</div><h2>Intelligence</h2><p>A general measure of accumulated learning and knowledge.</p></div></div>
      <div class="stats-grid"><article class="stat-card"><div class="stat-top"><span class="stat-icon blue">✳</span><span class="stat-label">Intelligence</span></div><div class="stat-value">{character.intelligence}<small>/100</small></div><div class="meter"><span class="blue" style="width:{character.intelligence}%"></span></div></article></div>
    </section>
  {:else if activeView === 'personal'}
    <div class="page-heading"><div><div class="eyebrow">PERSONAL TIME</div><h2>Everyday activities</h2><p>Exercise and social time. Actions use the same yearly time allowance as other systems.</p></div><div class="year-pill">{character.actionsRemaining} ACTIONS LEFT</div></div>
    <div class="activity-grid activity-grid-large">
      {#each availablePersonalActivities as activity}
        <button class="activity-card" disabled={character.actionsRemaining===0 || !canAffordActivity(character, activity.id)} onclick={() => act(activity.id)}>
          <span class="activity-icon">{activity.icon}</span><span class="activity-title">{activity.title}</span><span class="activity-detail">{activity.detail}</span><span class="activity-cost">{cost(activity.id)} <span>→</span></span>
        </button>
      {/each}
    </div>
  {:else if activeView === 'history'}
    <div class="page-heading"><div><div class="eyebrow">RECORDED EVENTS</div><h2>Life history</h2><p>Decisions, events and milestones recorded during this life.</p></div><span class="year-pill">{character.history.length} RECORDS</span></div>
    <section class="history-card full-history">
      {#if character.history.length === 0}<p>No life events have been recorded yet.</p>{:else}
        {#each character.history as item}
          <div class="timeline-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>
        {/each}
      {/if}
    </section>
  {/if}
</section>
