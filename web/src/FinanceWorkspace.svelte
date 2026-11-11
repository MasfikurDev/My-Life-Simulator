<script lang="ts">
  import FinanceAccounts from './FinanceAccounts.svelte';
  import FinanceAssets from './FinanceAssets.svelte';
  import FinanceTaxes from './FinanceTaxes.svelte';
  import { formatCharacterMoney, getNetWorth, getMarketPrice } from './lib/simulation';
  import type { Character } from './lib/types';
  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  let activeView = $state('overview');
  const views = $derived([
    { id: 'overview', label: 'Overview', available: true },
    { id: 'banking', label: 'Banking', available: character.age >= 16 },
    { id: 'business', label: 'Business', available: character.age >= 18 },
    { id: 'property', label: 'Property', available: character.age >= 18 },
    { id: 'investments', label: 'Investments', available: character.age >= 18 },
    { id: 'taxes', label: 'Taxes', available: character.age >= 18 }
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
      <div class="finance-balance-card"><small>AVAILABLE CASH</small><strong>{formatCharacterMoney(character)}</strong><span>Unbanked funds</span></div>
      <div class="finance-networth-card"><small>ESTIMATED NET WORTH</small><strong>{formatCharacterMoney(character,getNetWorth(character))}</strong><span>Assets − liabilities</span></div>
    </div>
    <section class="finance-insights" aria-label="Financial portfolio overview">
      <article class="finance-insight"><div><small>INVESTMENTS</small><strong>{formatCharacterMoney(character,(character.investments ?? []).reduce((sum,h)=>sum+h.units*getMarketPrice(character,h.type),0))}</strong></div><p>{(character.investments ?? []).reduce((sum,h)=>sum+h.units,0)} units across five market instruments</p><div class="insight-breakdown">{#each (['stock-index','technology-stock','energy-stock','government-bond','gold'] as const) as type}<span>{type === 'stock-index' ? 'Market index' : type === 'technology-stock' ? 'Technology' : type === 'energy-stock' ? 'Energy' : type === 'government-bond' ? 'Government bonds' : 'Gold'} · {(character.investments ?? []).find(h=>h.type===type)?.units ?? 0} units</span>{/each}</div></article>
      <article class="finance-insight"><div><small>BUSINESSES</small><strong>{(character.businesses ?? []).length} / 3</strong></div><p>{formatCharacterMoney(character,(character.businesses ?? []).reduce((sum,b)=>sum+b.valuation,0))} estimated business value</p>{#if (character.businesses ?? []).length}<div class="insight-breakdown">{#each character.businesses ?? [] as business}<span>{business.name} · {business.performance}/100 performance</span>{/each}</div>{:else}<span class="insight-empty">No businesses owned yet</span>{/if}</article>
      <article class="finance-insight finance-debt"><div><small>OUTSTANDING DEBT</small><strong>{formatCharacterMoney(character,(character.loans ?? []).filter(l=>l.active).reduce((sum,l)=>sum+l.balance,0)+(character.cards ?? []).filter(c=>c.active&&c.type==='credit').reduce((sum,c)=>sum+c.balance,0))}</strong></div><p>Active loans and credit-card balances</p></article>
    </section>
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
.finance-workspace{display:grid;gap:10px}.finance-header{display:flex;align-items:center;justify-content:space-between;gap:12px}.finance-header h1{font-size:24px;line-height:1.2;margin:0;letter-spacing:-.7px}.finance-back{border:1px solid var(--line);border-radius:9px;padding:9px 11px;background:var(--surface);color:var(--text);font-size:11px;white-space:nowrap}.finance-nav{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:thin}.finance-nav button{flex:0 0 auto;min-height:40px;border:1px solid var(--line);border-radius:10px;padding:0 12px;background:var(--surface);color:var(--muted);font-size:11px;font-weight:650}.finance-nav button.active{border-color:color-mix(in srgb,var(--accent) 50%, transparent);background:var(--accent-soft);color:var(--accent)}.finance-nav button:disabled{opacity:.35}.finance-nav button span{font-size:9px}.finance-overview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.finance-overview>div{display:grid;gap:5px;padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--surface)}.finance-overview small,.finance-overview span{color:var(--muted);font-size:10px}.finance-overview strong{font-size:clamp(18px,4vw,25px);overflow-wrap:anywhere}.finance-insights{display:grid;gap:10px}.finance-insight{display:grid;gap:6px;padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}.finance-insight>div:first-child{display:flex;justify-content:space-between;align-items:center;gap:10px}.finance-insight small{font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.5px}.finance-insight strong{font-size:19px}.finance-insight p,.insight-empty{margin:0;color:var(--muted);font-size:11px}.insight-breakdown{display:flex;flex-wrap:wrap;gap:6px}.insight-breakdown span{padding:5px 8px;border-radius:7px;background:var(--surface-raised);font-size:10px;color:var(--text)}.finance-debt strong{color:var(--warning)}@media(max-width:380px){.finance-overview{grid-template-columns:1fr}.finance-header{align-items:flex-start}}
@media(max-width:620px){.finance-header h1{font-size:22px;line-height:1.2}}
</style>