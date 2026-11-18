<script lang="ts">
  import { formatCharacterMoney, getMarketPrice, tradeInvestment } from './lib/simulation';
  import { MARKET_ASSETS, type MarketAsset } from './lib/markets';
  import type { Character, InvestmentType } from './lib/types';
  let { character, onChange, onOpenBanking, initialMarket = 'stocks' }: { character: Character; onChange: (next: Character) => void; onOpenBanking: () => void; initialMarket?: 'stocks' | 'crypto' } = $props();
  let market = $state<'stocks' | 'crypto'>(initialMarket);
  $effect(() => { market = initialMarket; selected = null; filter = 'all'; });
  let filter = $state('all');
  let query = $state('');
  let selected = $state<InvestmentType | null>(null);
  let range = $state('1Y');
  let quantity = $state('1');
  let notice = $state('');
  let watchOnly = $state(false);
  const assets = $derived(MARKET_ASSETS.filter((asset) => asset.market === market));
  const holdings = $derived(character.investments ?? []);
  const current = $derived(selected ? MARKET_ASSETS.find((asset) => asset.type === selected) ?? null : null);
  const currentPrice = $derived(current ? getMarketPrice(character, current.type) : 0);
  const portfolioValue = $derived(holdings.filter((holding) => assets.some((asset) => asset.type === holding.type)).reduce((sum, holding) => sum + holding.units * getMarketPrice(character, holding.type), 0));
  const visibleAssets = $derived(assets.filter((asset) => {
    const holding = holdings.find((item) => item.type === asset.type);
    if (watchOnly && !(character.marketWatchlist ?? []).includes(asset.type)) return false;
    if (filter === 'holdings' && !holding) return false;
    if (filter === 'gainers' && change(asset) <= 0) return false;
    if (filter === 'losers' && change(asset) >= 0) return false;
    if (filter === 'trending' && Math.abs(change(asset)) < 1.5) return false;
    return !query || (asset.name + ' ' + asset.symbol + ' ' + asset.category).toLowerCase().includes(query.toLowerCase());
  }).sort((a,b) => filter === 'gainers' ? change(b)-change(a) : filter === 'losers' ? change(a)-change(b) : filter === 'trending' ? Math.abs(change(b))-Math.abs(change(a)) : b.basePrice-a.basePrice));
  const chart = $derived(current ? chartValues(current) : []);
  function price(asset: MarketAsset) { return getMarketPrice(character, asset.type); }
  function change(asset: MarketAsset) {
    const seed = character.year * 13.17 + asset.symbol.length * 2.73 + asset.basePrice * 0.017;
    return Math.round((Math.sin(seed) * 0.045 + Math.cos(seed * 0.43) * 0.018) * 10000) / 100;
  }
  function chartValues(asset: MarketAsset) {
    const count = range === '1H' ? 24 : range === '1D' ? 24 : range === '1W' ? 28 : range === '1M' ? 30 : range === '1Y' ? 36 : 48;
    const now = price(asset);
    return Array.from({ length: count }, (_, index) => {
      const t = index / Math.max(1, count - 1);
      const wave = Math.sin((index + character.year * 3 + asset.symbol.length) * 0.71) * asset.volatility * 0.09;
      const drift = (t - 0.5) * change(asset) / 100;
      return Math.max(0.01, now * (1 + wave + drift));
    });
  }
  const chartPath = (values: number[]) => {
    if (!values.length) return '';
    const min = Math.min(...values), max = Math.max(...values), spread = Math.max(0.0001, max-min);
    return values.map((value,index) => (index ? 'L' : 'M') + (index/(values.length-1)*100).toFixed(2) + ' ' + (92-(value-min)/spread*78).toFixed(2)).join(' ');
  };
  function toggleWatch(type: InvestmentType) {
    const list = character.marketWatchlist ?? [];
    const next = list.includes(type) ? list.filter((item) => item !== type) : [...list, type];
    onChange({ ...character, marketWatchlist: next });
  }
  function trade(action: 'buy' | 'sell') {
    if (!current) return;
    const next = tradeInvestment(character, current.type, action, Number(quantity));
    if (next === character) { notice = action === 'buy' ? 'Not enough available cash or invalid quantity.' : 'You do not own enough units to sell.'; return; }
    onChange(next); notice = action === 'buy' ? 'Purchase completed.' : 'Sale completed.';
  }
  function openAsset(asset: MarketAsset) { selected = asset.type; range = '1Y'; notice = ''; }
  function formatPrice(value: number) { return new Intl.NumberFormat(undefined, { style: 'currency', currency: character.currency || 'USD', maximumFractionDigits: 2 }).format(value); }
</script>

<section class="markets">
  {#if current}
    <button class="back-link" onclick={() => { selected=null; notice=''; }}>← {market === 'stocks' ? 'Stocks market' : 'Crypto market'}</button>
    <header class="asset-detail-head">
      <div><small>{current.symbol} · {current.category}</small><h2>{current.name}</h2></div>
      <button class="watch" class:watched={(character.marketWatchlist ?? []).includes(current.type)} aria-label="Toggle watchlist" onclick={() => toggleWatch(current.type)}>{(character.marketWatchlist ?? []).includes(current.type) ? '★' : '☆'}</button>
    </header>
    <div class="asset-price">{formatPrice(currentPrice)}</div>
    <div class:positive={change(current)>=0} class:negative={change(current)<0} class="asset-change">{change(current)>=0?'↗':'↘'} {change(current)>0?'+':''}{change(current).toFixed(2)}% · {range}</div>
    <div class="chart-wrap">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={current.name + ' illustrative simulated price trend'}>
        <defs><linearGradient id="market-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".24"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
        <path d={chartPath(chart) + ' L100 100 L0 100 Z'} fill="url(#market-fill)"/>
        <path d={chartPath(chart)} fill="none" stroke="var(--accent)" stroke-width="1.7" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="range-row">{#each ['1H','1D','1W','1M','1Y','ALL'] as item}<button class:active={range===item} onclick={() => range=item}>{item}</button>{/each}</div>
    <div class="key-grid"><article><small>Market category</small><strong>{current.category}</strong></article><article><small>Risk profile</small><strong>{current.volatility >= .65 ? 'High' : current.volatility >= .35 ? 'Moderate–high' : 'Moderate'}</strong></article><article><small>Owned units</small><strong>{holdings.find((item) => item.type===current.type)?.units ?? 0}</strong></article><article><small>Position value</small><strong>{formatPrice((holdings.find((item) => item.type===current.type)?.units ?? 0)*currentPrice)}</strong></article></div>
    <p class="asset-description">{current.description} Prices are simulated and update with the in-game economy at annual settlement. The chart illustrates simulated movement, not live market data.</p>
    <div class="trade-box"><label>Quantity<input type="number" min="1" max="1000000" bind:value={quantity}/></label><div class="trade-actions"><button class="primary" onclick={() => trade('buy')}>Buy</button><button onclick={() => trade('sell')} disabled={(holdings.find((item)=>item.type===current.type)?.units ?? 0) < 1}>Sell</button></div></div>
    {#if notice}<p class="notice" role="status">{notice}</p>{/if}
  {:else}
    <div class="portfolio-card"><small>{market === 'stocks' ? 'STOCK PORTFOLIO VALUE' : 'CRYPTO PORTFOLIO VALUE'}</small><strong>{formatPrice(portfolioValue)}</strong><span>Combined value across both markets</span></div>
    <button class="cash-card" onclick={onOpenBanking}><span>Available cash</span><strong>{formatCharacterMoney(character)}</strong><small>Manage funds in Banking →</small></button>
    <div class="market-tabs">
      {#each [{id:'all',label:'Market overview'},{id:'holdings',label:'My holdings'},{id:'trending',label:'Trending'},{id:'gainers',label:'Top gainers'},{id:'losers',label:'Top losers'}] as item}<button class:active={filter===item.id} onclick={() => filter=item.id}>{item.label}</button>{/each}
    </div>
    <div class="market-tools"><input aria-label="Search market" placeholder="Search name or symbol" bind:value={query}/><button class:active={watchOnly} onclick={() => watchOnly=!watchOnly}>Watchlist</button></div>
    <div class="market-list">
      {#each visibleAssets as asset (asset.type)}
        {@const holding=holdings.find((item)=>item.type===asset.type)}
        <button class="market-row" onclick={() => openAsset(asset)}>
          <span class="asset-icon">{asset.market==='crypto'?'₿':asset.symbol.slice(0,1)}</span>
          <span class="asset-name"><strong>{asset.name}</strong><small>{asset.symbol} · {holding ? holding.units+' owned' : asset.category}</small></span>
          <span class="asset-quote"><strong>{formatPrice(price(asset))}</strong><small class:positive={change(asset)>=0} class:negative={change(asset)<0}>{change(asset)>=0?'↗':'↘'} {change(asset)>0?'+':''}{change(asset).toFixed(2)}%</small></span>
        </button>
      {:else}
        <p class="empty">No assets match this view.</p>
      {/each}
    </div>
  {/if}
</section>

<style>
.markets{display:grid;gap:12px;min-width:0}.market-tabs button,.range-row button{border:0;background:transparent;color:var(--muted);border-radius:9px;padding:10px 12px;font-size:12px;white-space:nowrap}.market-tabs button.active,.range-row button.active{background:var(--text);color:var(--surface)}.portfolio-card{display:grid;gap:7px;padding:22px 18px;border:1px solid var(--line);border-radius:17px;background:linear-gradient(145deg,#252634,#08090d 85%);color:#fff}.portfolio-card small{color:#c5c6d0;font-size:11px}.portfolio-card strong{font-size:36px;font-weight:500;letter-spacing:-1.5px}.portfolio-card span{color:#a8a9b4;font-size:10px}.cash-card{display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 12px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--surface);color:var(--text);text-align:left}.cash-card span{font-size:12px;font-weight:700}.cash-card strong{font-size:14px}.cash-card small{grid-column:1/-1;color:var(--muted);font-size:10px}.market-tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}.market-tabs button{border:1px solid var(--line);background:var(--surface);padding:9px 13px}.market-tools{display:grid;grid-template-columns:1fr auto;gap:8px}.market-tools input,.trade-box input{min-width:0;width:100%;border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--surface);color:var(--text)}.market-tools button,.watch{border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text);padding:0 12px}.market-tools button.active,.watch.watched{color:var(--accent)}.market-list{overflow:hidden;border:1px solid var(--line);border-radius:14px;background:var(--surface)}.market-row{width:100%;display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:10px;align-items:center;padding:13px 12px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--text);text-align:left}.market-row:last-child{border-bottom:0}.asset-icon{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--surface-raised);font-size:16px;font-weight:800}.asset-name,.asset-quote{display:grid;gap:4px;min-width:0}.asset-name strong{font-size:13px}.asset-name small,.asset-quote small{font-size:10px;color:var(--muted)}.asset-quote{text-align:right}.asset-quote strong{font-size:12px}.positive{color:var(--success)!important}.negative{color:var(--danger)!important}.empty{padding:20px;color:var(--muted);font-size:12px}.back-link{justify-self:start;border:0;background:transparent;color:var(--muted);padding:4px 0}.asset-detail-head{display:flex;justify-content:space-between;align-items:center}.asset-detail-head small{color:var(--muted);font-size:11px}.asset-detail-head h2{font-size:19px;margin:3px 0}.watch{width:42px;height:42px;border-radius:50%;font-size:22px}.asset-price{font-size:36px;letter-spacing:-1px}.asset-change{font-size:12px}.chart-wrap{height:180px;border-radius:14px;overflow:hidden;background:color-mix(in srgb,var(--accent-soft) 22%,transparent)}.chart-wrap svg{width:100%;height:100%;overflow:visible}.range-row{display:flex;justify-content:space-between;gap:3px}.range-row button{padding:8px 10px}.key-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.key-grid article{display:grid;gap:6px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}.key-grid small,.asset-description{font-size:10px;color:var(--muted)}.key-grid strong{font-size:12px}.asset-description{line-height:1.5}.trade-box{display:grid;grid-template-columns:1fr auto;align-items:end;gap:10px;padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}.trade-box label{display:grid;gap:5px;font-size:10px;color:var(--muted)}.trade-actions{display:flex;gap:6px}.trade-actions button{border:1px solid var(--line);border-radius:9px;padding:10px 15px;background:var(--surface-raised);color:var(--text)}.trade-actions button.primary{background:var(--accent);color:var(--accent-foreground);border-color:transparent}.trade-actions button:disabled{opacity:.4}.notice{margin:0;color:var(--accent);font-size:11px}
@media(max-width:380px){.portfolio-card strong,.asset-price{font-size:30px}.market-row{grid-template-columns:36px minmax(0,1fr) auto;gap:7px;padding:12px 8px}.asset-quote strong{font-size:11px}.trade-box{grid-template-columns:1fr}.trade-actions button{flex:1}}
</style>
