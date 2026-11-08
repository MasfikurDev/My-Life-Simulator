<script lang="ts">
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
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'family', label: 'Family' },
    { id: 'tree', label: 'Family tree' },
    { id: 'history', label: 'Life story' }
  ];
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
    <h1>{views.find((item) => item.id === activeView)?.label}</h1>
    {#if activeView !== 'overview'}<button class="finance-back" onclick={() => activeView='overview'}>← Life</button>{/if}
  </header>
  <nav class="finance-nav" aria-label="Life sections">
    {#each views as item}
      <button class:active={activeView===item.id} aria-current={activeView===item.id ? 'page' : undefined} onclick={() => activeView=item.id}>{item.label}</button>
    {/each}
  </nav>
  {#if activeView === 'overview'}
    <HealthWorkspace {character} {onChange} {onNotify} />
  {:else if activeView === 'family'}
    <FamilyWorkspace {character} {onChange} />
  {:else if activeView === 'tree'}
    <LifeTreeWorkspace {character} />
  {:else if activeView === 'lifestyle'}
    <LifestyleWorkspace {character} {onChange} />
  {:else if activeView === 'history'}
    {@const milestoneGroups = groupLifeMilestones()}
    <div class="page-heading"><span class="year-pill">{milestoneGroups.length} PERIODS</span></div>
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
      <p class="life-milestones-empty">No recorded milestones.</p>
    {/if}
  {/if}
</section>

<style>
  .life-workspace {
    display:grid;
    gap:14px;
    min-width:0;
  }
  .life-workspace .finance-header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    min-width:0;
  }
  .life-workspace .finance-header > div { min-width:0; }
  .life-workspace .finance-header h1 {
    margin:0;
    color:var(--text);
    font-size:clamp(22px, 4vw, 28px);
    line-height:1.15;
    letter-spacing:-.6px;
  }
  .life-workspace .finance-back {
    flex:none;
    min-height:40px;
    border:1px solid var(--line);
    border-radius:9px;
    padding:9px 11px;
    background:var(--surface);
    color:var(--text);
    font-size:11px;
    white-space:nowrap;
  }
  .life-workspace .finance-back:hover {
    border-color:var(--line-strong);
    background:var(--surface-hover);
  }
  .life-workspace .finance-nav {
    display:flex;
    gap:6px;
    min-width:0;
    overflow-x:auto;
    overscroll-behavior-inline:contain;
    -webkit-overflow-scrolling:touch;
    padding:2px 0 8px;
    scrollbar-width:thin;
    scrollbar-color:var(--line-strong) transparent;
  }
  .life-workspace .finance-nav button {
    flex:0 0 auto;
    min-height:42px;
    border:1px solid var(--line);
    border-radius:10px;
    padding:0 12px;
    background:var(--surface);
    color:var(--muted);
    font-size:11px;
    font-weight:650;
    white-space:nowrap;
    transition:color .18s, background .18s, border-color .18s;
  }
  .life-workspace .finance-nav button:hover {
    border-color:var(--line-strong);
    color:var(--text);
  }
  .life-workspace .finance-nav button.active {
    border-color:color-mix(in srgb,var(--accent) 50%, transparent);
    background:var(--accent-soft);
    color:var(--accent);
  }
  .life-workspace .page-heading h2 {
    margin:0;
    color:var(--text);
    font-size:clamp(20px, 3vw, 25px);
    line-height:1.2;
    letter-spacing:-.5px;
  }
  .life-workspace .full-history > p {
    margin:0;
    color:var(--muted);
    font-size:11px;
    line-height:1.5;
  }
  @media (max-width: 620px) {
    .life-workspace { gap:12px; }
    .life-workspace .finance-nav {
      margin-right:-2px;
      padding-bottom:7px;
    }
    .life-workspace .finance-nav button {
      min-height:40px;
      padding:0 11px;
      font-size:10px;
    }
  }
  @media (max-width: 360px) {
    .life-workspace .finance-header { flex-wrap:wrap; }
  }
</style>