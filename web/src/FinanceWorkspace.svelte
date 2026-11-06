<script lang="ts">
  import FinanceAccounts from './FinanceAccounts.svelte';
  import FinanceProducts from './FinanceProducts.svelte';
  import FinanceAssets from './FinanceAssets.svelte';
  import FinanceLivingCosts from './FinanceLivingCosts.svelte';
  import { formatCharacterMoney, getNetWorth } from './lib/simulation';
  import type { Character } from './lib/types';
  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  let activeView = $state('overview');
  const views = $derived([
    { id: 'overview', label: 'Overview', available: true },
    { id: 'banking', label: 'Banking', available: character.age >= 16 },
    { id: 'cards', label: 'Cards', available: character.age >= 16 },
    { id: 'loans', label: 'Loans', available: character.age >= 18 },
    { id: 'bills', label: 'Bills & subscriptions', available: character.age >= 16 },
    { id: 'savings', label: 'Savings & vault', available: character.age >= 16 },
    { id: 'assets', label: 'Assets', available: character.age >= 18 },
    { id: 'living', label: 'Living costs', available: character.age >= 18 }
  ]);
  const title = $derived(views.find((item) => item.id === activeView)?.label ?? 'Overview');
  const accountCount = $derived((character.bankAccounts ?? []).length);
  const cardCount = $derived((character.cards ?? []).filter((item) => item.active).length);
  const loanCount = $derived((character.loans ?? []).filter((item) => item.active).length);
  const assetCount = $derived((character.properties ?? []).length + (character.investments ?? []).length + (character.businesses ?? []).length);
  function openView(id: string) { if (views.find((item) => item.id === id)?.available) activeView = id; }
</script>

<section class="finance-workspace">
  <header class="finance-header">
    <div><div class="eyebrow">FINANCE</div><h1>{title}</h1><p>Manage money through separate financial services.</p></div>
    {#if activeView !== 'overview'}<button class="finance-back" onclick={() => activeView='overview'}>← Finance overview</button>{/if}
  </header>

  <nav class="finance-nav" aria-label="Finance sections">
    {#each views as item}
      <button class:active={activeView===item.id} disabled={!item.available} title={!item.available ? 'Available from age ' + (item.id === 'banking' || item.id === 'cards' || item.id === 'bills' || item.id === 'savings' ? '16' : '18') : undefined} aria-current={activeView===item.id ? 'page' : undefined} onclick={() => openView(item.id)}>{item.label}{#if !item.available}<span> · Locked</span>{/if}</button>
    {/each}
  </nav>

  {#if activeView === 'overview'}
    <div class="finance-overview">
      <div class="finance-balance-card"><small>AVAILABLE CASH</small><strong>{formatCharacterMoney(character)}</strong><span>Cash held outside accounts and assets.</span></div>
      <div class="finance-networth-card"><small>ESTIMATED NET WORTH</small><strong>{formatCharacterMoney(character,getNetWorth(character))}</strong><span>Assets minus recorded debt and liabilities.</span></div>
    </div>
    <div class="finance-shortcuts">
      <button onclick={() => openView('banking')} disabled={character.age<16}><span class="shortcut-icon">▤</span><strong>Banking</strong><small>{accountCount} accounts · balances and transfers</small><b>Open banking →</b></button>
      <button onclick={() => openView('cards')} disabled={character.age<16}><span class="shortcut-icon">▭</span><strong>Cards</strong><small>{cardCount} active cards</small><b>Manage cards →</b></button>
      <button onclick={() => openView('loans')} disabled={character.age<18}><span class="shortcut-icon">↗</span><strong>Loans</strong><small>{loanCount} active loans</small><b>Manage credit →</b></button>
      <button onclick={() => openView('bills')} disabled={character.age<16}><span class="shortcut-icon">↻</span><strong>Bills & subscriptions</strong><small>{(character.recurringPayments ?? []).length} recurring payments</small><b>Manage payments →</b></button>
      <button onclick={() => openView('savings')} disabled={character.age<16}><span class="shortcut-icon">▣</span><strong>Savings & vault</strong><small>Automatic deposits and stored cash</small><b>Open savings →</b></button>
      <button onclick={() => openView('assets')} disabled={character.age<18}><span class="shortcut-icon">⌂</span><strong>Assets</strong><small>{assetCount} property, investment or business holdings</small><b>Manage assets →</b></button>
      <button onclick={() => openView('living')} disabled={character.age<18}><span class="shortcut-icon">⌂</span><strong>Living costs</strong><small>Housing arrangement and household budget</small><b>Plan living costs →</b></button>
    </div>
  {:else if activeView === 'banking'}
    <FinanceAccounts {character} onChange={onChange} />
  {:else if activeView === 'cards'}
    <FinanceProducts {character} onChange={onChange} view="cards" />
  {:else if activeView === 'loans'}
    <FinanceProducts {character} onChange={onChange} view="loans" />
  {:else if activeView === 'bills'}
    <FinanceProducts {character} onChange={onChange} view="bills" />
  {:else if activeView === 'savings'}
    <FinanceProducts {character} onChange={onChange} view="savings" />
  {:else if activeView === 'assets'}
    <FinanceAssets {character} onChange={onChange} />
  {:else if activeView === 'living'}
    <FinanceLivingCosts {character} onChange={onChange} />
  {/if}
</section>

<style>
.finance-workspace{display:grid;gap:14px}.finance-header{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}.finance-header h1{font-size:clamp(24px,4vw,32px);margin:4px 0 3px;letter-spacing:-.8px}.finance-header p{margin:0;color:var(--muted);font-size:12px}.finance-back{border:1px solid var(--line);border-radius:9px;padding:9px 11px;background:var(--surface);color:var(--text);font-size:11px;white-space:nowrap}.finance-nav{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:thin}.finance-nav button{flex:0 0 auto;min-height:40px;border:1px solid var(--line);border-radius:10px;padding:0 12px;background:var(--surface);color:var(--muted);font-size:11px;font-weight:650}.finance-nav button.active{border-color:rgba(114,214,154,.5);background:var(--accent-soft);color:var(--accent)}.finance-nav button:disabled{opacity:.35}.finance-nav button span{font-size:9px}.finance-overview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.finance-overview>div{display:grid;gap:5px;padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--surface)}.finance-overview small,.finance-overview span{color:var(--muted);font-size:10px}.finance-overview strong{font-size:clamp(18px,4vw,25px);overflow-wrap:anywhere}.finance-shortcuts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.finance-shortcuts button{display:grid;justify-items:start;gap:7px;min-width:0;min-height:126px;padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--surface);color:var(--text);text-align:left}.finance-shortcuts button:disabled{opacity:.35}.finance-shortcuts strong{font-size:13px}.finance-shortcuts small{font-size:10px;line-height:1.4;color:var(--muted)}.finance-shortcuts b{margin-top:auto;font-size:10px;color:var(--accent)}.shortcut-icon{display:grid;place-items:center;width:27px;height:27px;border-radius:8px;background:var(--accent-soft);color:var(--accent);font-size:16px}@media(min-width:760px){.finance-shortcuts{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:380px){.finance-overview{grid-template-columns:1fr}.finance-header{align-items:flex-start;flex-direction:column}}
</style>
