<script lang="ts">
  import { getLifeStage } from './lib/progression';
  import { formatCharacterMoney } from './lib/simulation';
  import type { Character } from './lib/types';
  import LifestyleWorkspace from './LifestyleWorkspace.svelte';
  import FamilyWorkspace from './FamilyWorkspace.svelte';
  import LifeTreeWorkspace from './LifeTreeWorkspace.svelte';
  import HealthWorkspace from './HealthWorkspace.svelte';
  type LifeView = 'overview' | 'lifestyle' | 'family' | 'tree' | 'history';
  let { character, onChange, onNotify, initialView = 'overview' }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void; initialView?: LifeView } = $props();
  let activeView = $state<LifeView>(initialView);
  const views: { id: LifeView; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'lifestyle', label: 'Market' },
    { id: 'family', label: 'Family' },
    { id: 'tree', label: 'Life tree' },
    { id: 'history', label: 'Life history' }
  ];
  const stage = $derived(getLifeStage(character.age));
  function financialFlow(type: string): 'income' | 'expense' | null {
    if (['income', 'interest', 'business-income', 'investment-sell', 'property-sale'].includes(type)) return 'income';
    if (['expense', 'family-support', 'loan-payment', 'loan-interest', 'card-purchase', 'card-interest', 'recurring-payment', 'investment-buy', 'property-purchase', 'property-rent', 'business-expense', 'tax', 'fee'].includes(type)) return 'expense';
    return null;
  }
  function groupLifeMilestones() {
    const groups = new Map<string, { key: string; age: number; year: number; events: Character['history']; transactions: NonNullable<Character['financialTransactions']> }>();
    for (const event of character.history.filter((item) => item.kind !== 'activity')) {
      const key = event.age + '-' + event.year;
      const group = groups.get(key) ?? { key, age: event.age, year: event.year, events: [], transactions: [] };
      group.events.push(event);
      groups.set(key, group);
    }
    for (const transaction of character.financialTransactions ?? []) {
      const key = transaction.age + '-' + transaction.year;
      const group = groups.get(key) ?? { key, age: transaction.age, year: transaction.year, events: [], transactions: [] };
      group.transactions.push(transaction);
      groups.set(key, group);
    }
    return [...groups.values()].filter((group) => group.events.length || group.transactions.length)
      .sort((a, b) => b.year - a.year || b.age - a.age);
  }
</script>

<section class="life-workspace">
  <header class="finance-header">
    <div><div class="eyebrow">LIFE</div><h1>{views.find((item) => item.id === activeView)?.label}</h1><p>Your personal wellbeing, everyday life and recorded milestones.</p></div>
    {#if activeView !== 'overview'}<button class="finance-back" onclick={() => activeView='overview'}>← Life overview</button>{/if}
  </header>
  {#if activeView === 'overview'}
    <section class="domain-panel">
      <div class="domain-panel-head"><div><div class="eyebrow">CURRENT LIFE STAGE</div><h2>{stage.label}</h2><p>Age {character.age} · {stage.ageRange}. {stage.description}</p></div><span class="domain-status">YEAR {character.year}</span></div>
      {#if stage.nextAge !== null}<div class="domain-note">Next life stage begins at age {stage.nextAge}.</div>{/if}
    </section>
    <HealthWorkspace {character} {onChange} {onNotify} />
    <div class="finance-shortcuts life-shortcuts">
      <button onclick={() => activeView='lifestyle'}><span class="shortcut-icon">▤</span><strong>Market</strong><small>Everyday shopping, services and household needs</small><b>Open market →</b></button>
      <button onclick={() => activeView='family'}><span class="shortcut-icon">⌂</span><strong>Family</strong><small>People, bonds and family history</small><b>Open family →</b></button>
      <button onclick={() => activeView='tree'}><span class="shortcut-icon">⑂</span><strong>Life tree</strong><small>Your decisions, paths and earned skill boosts</small><b>Explore life tree →</b></button>
      <button onclick={() => activeView='history'}><span class="shortcut-icon">↗</span><strong>Life history</strong><small>{character.history.filter((item) => item.kind === 'milestone').length} major achievements</small><b>Review history →</b></button>
    </div>
  {:else if activeView === 'family'}
    <FamilyWorkspace {character} {onChange} />
  {:else if activeView === 'tree'}
    <LifeTreeWorkspace {character} />
  {:else if activeView === 'lifestyle'}
    <LifestyleWorkspace {character} {onChange} />
  {:else if activeView === 'history'}
    {@const milestoneGroups = groupLifeMilestones()}
    <div class="page-heading"><div><div class="eyebrow">RECORDED EVENTS & FINANCES</div><h2>Life history</h2><p>Important events, achievements and financial changes across your life.</p></div><span class="year-pill">{milestoneGroups.length} PERIODS</span></div>
    {#if milestoneGroups.length}
      <div class="life-milestone-list">
        {#each milestoneGroups as group, index}
          {@const income = group.transactions.filter((item) => financialFlow(item.type) === 'income').reduce((sum, item) => sum + item.amount, 0)}
          {@const expenses = group.transactions.filter((item) => financialFlow(item.type) === 'expense').reduce((sum, item) => sum + item.amount, 0)}
          {@const transfers = group.transactions.filter((item) => item.type === 'transfer').reduce((sum, item) => sum + item.amount, 0)}
          <details class="life-milestone-group" open={index === 0}>
            <summary><span><strong>Age {group.age}</strong><small>YEAR {group.year} · {group.events.length} {group.events.length === 1 ? 'EVENT' : 'EVENTS'}</small></span><i aria-hidden="true"></i></summary>
            <div class="life-milestone-content">
              {#if group.transactions.length}
                <div class="life-milestone-finance">
                  <div><small>INCOME</small><strong class="milestone-income">+{formatCharacterMoney(character, income)}</strong></div>
                  <div><small>EXPENSES</small><strong class="milestone-expense">−{formatCharacterMoney(character, expenses)}</strong></div>
                  <div><small>NET</small><strong>{income - expenses < 0 ? '−' : '+'}{formatCharacterMoney(character, Math.abs(income - expenses))}</strong></div>
                  {#if transfers > 0}<div><small>TRANSFERS</small><strong>{formatCharacterMoney(character, transfers)}</strong></div>{/if}
                </div>
              {/if}
              {#each group.events as event}
                <div class="life-milestone-event"><span class:milestone-event-dot={event.kind === 'event'}></span><div><strong>{event.title}</strong><p>{event.description}</p></div></div>
              {/each}
              {#if group.transactions.length}
                <details class="life-milestone-transactions"><summary>Financial records <span>{group.transactions.length}</span></summary>
                  {#each group.transactions as transaction}
                    <div><span><strong>{transaction.description}</strong><small>{transaction.type.replaceAll('-', ' ')}</small></span><b>{formatCharacterMoney(character, transaction.amount)}</b></div>
                  {/each}
                </details>
              {/if}
            </div>
          </details>
        {/each}
      </div>
    {:else}
      <p class="life-milestones-empty">Major life events and financial records will appear here as your story progresses.</p>
    {/if}
  {/if}
</section>

<style>
  .life-workspace {
    display: grid;
    gap: 14px;
    min-width: 0;
  }

  .life-workspace .finance-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  }

  .life-workspace .finance-header > div {
    min-width: 0;
  }

  .life-workspace .finance-header h1 {
    margin: 4px 0 3px;
    color: var(--text);
    font-size: clamp(24px, 4vw, 32px);
    line-height: 1.15;
    letter-spacing: -.8px;
  }

  .life-workspace .finance-header p {
    margin: 0;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.5;
  }

  .life-workspace .finance-back {
    flex: none;
    min-height: 40px;
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 9px 11px;
    background: var(--surface);
    color: var(--text);
    font-size: 11px;
    white-space: nowrap;
  }

  .life-workspace .finance-back:hover {
    border-color: var(--line-strong);
    background: var(--surface-hover);
  }

  .life-workspace .finance-nav {
    display: flex;
    gap: 6px;
    min-width: 0;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    -webkit-overflow-scrolling: touch;
    padding: 2px 0 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--line-strong) transparent;
  }

  .life-workspace .finance-nav button {
    flex: 0 0 auto;
    min-height: 42px;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 0 12px;
    background: var(--surface);
    color: var(--muted);
    font-size: 11px;
    font-weight: 650;
    white-space: nowrap;
    transition: color .18s, background .18s, border-color .18s;
  }

  .life-workspace .finance-nav button:hover {
    border-color: var(--line-strong);
    color: var(--text);
  }

  .life-workspace .finance-nav button.active {
    border-color: rgba(114, 214, 154, .5);
    background: var(--accent-soft);
    color: var(--accent);
  }

  .life-workspace .life-shortcuts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .life-workspace .life-shortcuts .shortcut-icon {
    display: grid;
    place-items: center;
    width: 27px;
    height: 27px;
    border-radius: 8px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 16px;
    line-height: 1;
  }

  .life-workspace .life-shortcuts button {
    display: grid;
    justify-items: start;
    align-content: start;
    gap: 7px;
    min-width: 0;
    min-height: 126px;
    padding: 13px;
    border: 1px solid var(--line);
    border-radius: 13px;
    background: var(--surface);
    color: var(--text);
    text-align: left;
    transition: border-color .18s, background .18s, transform .18s;
  }

  .life-workspace .life-shortcuts button:hover {
    border-color: var(--line-strong);
    background: var(--surface-raised);
    transform: translateY(-1px);
  }

  .life-workspace .life-shortcuts strong {
    font-size: 13px;
    line-height: 1.3;
  }

  .life-workspace .life-shortcuts small {
    color: var(--muted);
    font-size: 10px;
    line-height: 1.45;
  }

  .life-workspace .life-shortcuts b {
    margin-top: auto;
    color: var(--accent);
    font-size: 10px;
    line-height: 1.4;
  }

  .life-workspace .page-heading h2 {
    margin: 8px 0 5px;
    color: var(--text);
    font-size: clamp(23px, 3vw, 29px);
    line-height: 1.15;
    letter-spacing: -1px;
  }

  .life-workspace .page-heading p {
    line-height: 1.5;
  }

  .life-workspace .full-history > p {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.5;
  }

  @media (max-width: 620px) {
    .life-workspace {
      gap: 12px;
    }

    .life-workspace .finance-header {
      align-items: flex-start;
    }

    .life-workspace .finance-header h1 {
      font-size: 25px;
    }

    .life-workspace .finance-header p {
      font-size: 11px;
    }

    .life-workspace .finance-back {
      min-height: 38px;
      padding: 8px 9px;
      font-size: 10px;
    }

    .life-workspace .finance-nav {
      margin-right: -2px;
      padding-bottom: 7px;
    }

    .life-workspace .finance-nav button {
      min-height: 40px;
      padding: 0 11px;
      font-size: 10px;
    }

    .life-workspace .life-shortcuts {
      gap: 7px;
    }

    .life-workspace .life-shortcuts .shortcut-icon {
      width: 25px;
      height: 25px;
      font-size: 15px;
    }

    .life-workspace .life-shortcuts button {
      min-height: 116px;
      padding: 11px;
      border-radius: 10px;
    }

    .life-workspace .life-shortcuts strong {
      font-size: 11px;
    }

    .life-workspace .life-shortcuts small {
      font-size: 9px;
    }

    .life-workspace .life-shortcuts b {
      font-size: 9px;
    }

    .life-workspace .page-heading h2 {
      font-size: 24px;
    }
  }

  @media (max-width: 360px) {
    .life-workspace .finance-header {
      flex-wrap: wrap;
    }

    .life-workspace .finance-back {
      margin-top: 2px;
    }

    .life-workspace .life-shortcuts button {
      padding: 9px;
    }
  }
</style>
