<script lang="ts">
  import FinanceAccounts from './FinanceAccounts.svelte';
  import FinanceAssets from './FinanceAssets.svelte';
  import FinanceTaxes from './FinanceTaxes.svelte';
  import { formatCharacterMoney, getNetWorth } from './lib/simulation';
  import type { Character } from './lib/types';
  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  let activeView = $state('overview');
  const views = $derived([
    { id: 'overview', label: 'Overview', available: true },
    { id: 'banking', label: 'Banking', available: character.age >= 16 },
    { id: 'taxes', label: 'Taxes', available: character.age >= 18 },
    { id: 'property', label: 'Property', available: character.age >= 18 },
    { id: 'investments', label: 'Investments', available: character.age >= 18 },
    { id: 'business', label: 'Business', available: character.age >= 18 }
  ]);
  const title = $derived(views.find((item) => item.id === activeView)?.label ?? 'Overview');
  function openView(id: string) { if (views.find((item) => item.id === id)?.available) activeView = id; }
</script>

<section class="finance-workspace">
  <header class="finance-header">
    <h1>{title}</h1>
    {#if activeView !== 'overview'}<button class="finance-back" onclick={() => activeView='overview'}>← Finance</button>{/if}
  </header>

  <nav class="finance-nav" aria-label="Finance sections">
    {#each views as item}
      <button class:active={activeView===item.id} disabled={!item.available} title={!item.available ? 'Available from age 18' : undefined} aria-current={activeView===item.id ? 'page' : undefined} onclick={() => openView(item.id)}>{item.label}{#if !item.available}<span> · Locked</span>{/if}</button>
    {/each}
  </nav>

  {#if activeView === 'overview'}
    <div class="finance-overview">
      <div class="finance-balance-card"><small>AVAILABLE CASH</small><strong>{formatCharacterMoney(character)}</strong><span>Cash held outside accounts and assets.</span></div>
      <div class="finance-networth-card"><small>ESTIMATED NET WORTH</small><strong>{formatCharacterMoney(character,getNetWorth(character))}</strong><span>Assets minus recorded debt and liabilities.</span></div>
    </div>
    <div class="finance-shortcuts">
      <button onclick={() => openView('banking')} disabled={character.age<16}><span class="shortcut-icon">▤</span><strong>Banking</strong><small>Accounts · Cards · Loans · Savings</small><b>Open →</b></button>
      <button onclick={() => openView('taxes')} disabled={character.age<18}><span class="shortcut-icon">▤</span><strong>Taxes</strong><small>Assessment · Payments</small><b>View →</b></button>
      <button onclick={() => openView('property')} disabled={character.age<18}><span class="shortcut-icon">⌂</span><strong>Property</strong><small>Rent · Buy · Manage</small><b>Open →</b></button>
      <button onclick={() => openView('investments')} disabled={character.age<18}><span class="shortcut-icon">↗</span><strong>Investments</strong><small>Portfolio · Market</small><b>Open →</b></button>
      <button onclick={() => openView('business')} disabled={character.age<18}><span class="shortcut-icon">▦</span><strong>Business</strong><small>Start · Operate</small><b>Open →</b></button>
    </div>
  {:else if activeView === 'banking'}
    <FinanceAccounts {character} {onChange} />
  {:else if activeView === 'taxes'}
    <FinanceTaxes {character} />
  {:else if activeView === 'property'}
    <FinanceAssets {character} {onChange} view="property" />
  {:else if activeView === 'investments'}
    <FinanceAssets {character} {onChange} view="investments" />
  {:else if activeView === 'business'}
    <FinanceAssets {character} {onChange} view="business" />
  {/if}
</section>

<style>
.finance-workspace{display:grid;gap:14px}.finance-header{display:flex;align-items:center;justify-content:space-between;gap:12px}.finance-header h1{font-size:clamp(22px,4vw,28px);margin:0;letter-spacing:-.6px}.finance-back{border:1px solid var(--line);border-radius:9px;padding:9px 11px;background:var(--surface);color:var(--text);font-size:11px;white-space:nowrap}.finance-nav{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:thin}.finance-nav button{flex:0 0 auto;min-height:40px;border:1px solid var(--line);border-radius:10px;padding:0 12px;background:var(--surface);color:var(--muted);font-size:11px;font-weight:650}.finance-nav button.active{border-color:color-mix(in srgb,var(--accent) 50%, transparent);background:var(--accent-soft);color:var(--accent)}.finance-nav button:disabled{opacity:.35}.finance-nav button span{font-size:9px}.finance-overview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.finance-overview>div{display:grid;gap:5px;padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--surface)}.finance-overview small,.finance-overview span{color:var(--muted);font-size:10px}.finance-overview strong{font-size:clamp(18px,4vw,25px);overflow-wrap:anywhere}.finance-shortcuts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.finance-shortcuts button{display:grid;justify-items:start;gap:7px;min-width:0;min-height:116px;padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--surface);color:var(--text);text-align:left}.finance-shortcuts button:disabled{opacity:.35}.finance-shortcuts strong{font-size:13px}.finance-shortcuts small{font-size:10px;line-height:1.4;color:var(--muted)}.finance-shortcuts b{margin-top:auto;font-size:10px;color:var(--accent)}.shortcut-icon{display:grid;place-items:center;width:27px;height:27px;border-radius:8px;background:var(--accent-soft);color:var(--accent);font-size:16px}@media(min-width:760px){.finance-shortcuts{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:380px){.finance-overview{grid-template-columns:1fr}.finance-header{align-items:flex-start}}
</style>