<script lang="ts">
  import {
    convertMarketAsset, depositMarketFunds, formatCharacterMoney, getMarketPrice,
    moveMarketFunds, tradeMarketAsset
  } from './lib/simulation';
  import { MARKET_ASSETS, type MarketAsset } from './lib/markets';
  import type { Character, InvestmentType } from './lib/types';

  let { character, onChange, onOpenBanking, initialMarket = 'stocks' }: {
    character: Character;
    onChange: (next: Character) => void;
    onOpenBanking: () => void;
    initialMarket?: 'stocks' | 'crypto';
  } = $props();

  const market = $derived(initialMarket);
  let filter = $state('all');
  let query = $state('');
  let selected = $state<InvestmentType | null>(null);
  let range = $state('1W');
  let quantity = $state('1');
  let notice = $state('');
  let watchOnly = $state(false);
  let searchOpen = $state(false);
  let fundsAction = $state<'deposit' | 'move' | null>(null);
  let fundsAmount = $state('1000');
  let convertOpen = $state(false);
  let convertTarget = $state<InvestmentType | ''>('');
  let detailTab = $state('overview');

  const assets = $derived(MARKET_ASSETS.filter((asset) => asset.market === market));
  const holdings = $derived(character.investments ?? []);
  const current = $derived(selected ? MARKET_ASSETS.find((asset) => asset.type === selected) ?? null : null);
  const currentPrice = $derived(current ? getMarketPrice(character, current.type) : 0);
  const marketCash = $derived(character.marketCash ?? 0);
  const portfolioValue = $derived(holdings.filter((holding) => assets.some((asset) => asset.type === holding.type)).reduce((sum, holding) => sum + holding.units * getMarketPrice(character, holding.type), 0));
  const visibleAssets = $derived(assets.filter((asset) => {
    const holding = holdings.find((item) => item.type === asset.type);
    if (watchOnly && !(character.marketWatchlist ?? []).includes(asset.type)) return false;
    if (filter === 'holdings' && !holding) return false;
    if (filter === 'gainers' && change(asset) <= 0) return false;
    if (filter === 'movers' && Math.abs(change(asset)) < 0.1) return false;
    if (filter === 'trending' && asset.volumeRate < 0.05) return false;
    return !query || (asset.name + ' ' + asset.symbol + ' ' + asset.category).toLowerCase().includes(query.toLowerCase());
  }).sort((a, b) => {
    if (filter === 'gainers') return change(b) - change(a);
    if (filter === 'movers') return Math.abs(change(b)) - Math.abs(change(a));
    if (filter === 'trending') return volume(b) - volume(a);
    if (filter === 'marketcap') return marketCap(b) - marketCap(a);
    return marketCap(b) - marketCap(a);
  }));
  const chart = $derived(current ? chartValues(current) : []);
  const chartHigh = $derived(chart.length ? Math.max(...chart) : 0);
  const chartLow = $derived(chart.length ? Math.min(...chart) : 0);
  const chartChange = $derived(chart.length > 1 && chart[0] > 0 ? ((chart[chart.length - 1] / chart[0]) - 1) * 100 : 0);
  const currentHolding = $derived(current ? holdings.find((item) => item.type === current.type) : undefined);
  const currentMarketAssets = $derived(assets.filter((asset) => asset.type !== current?.type));
  const estimatedGross = $derived(current ? Math.round(currentPrice * Math.max(0, Math.floor(Number(quantity) || 0))) : 0);
  const estimatedFee = $derived(estimatedGross > 0 ? Math.ceil(estimatedGross * 0.005) : 0);

  function price(asset: MarketAsset) { return getMarketPrice(character, asset.type); }
  function history(asset: MarketAsset) {
    return (character.marketHistory ?? []).flatMap((point) => {
      const value = point.prices[asset.type];
      return typeof value === 'number' ? [{ date: point.date, value }] : [];
    });
  }
  function change(asset: MarketAsset) {
    const points = history(asset);
    if (points.length < 2 || points[points.length - 2].value <= 0) return 0;
    return ((points[points.length - 1].value / points[points.length - 2].value) - 1) * 100;
  }
  function marketCap(asset: MarketAsset) { return price(asset) * asset.circulatingSupply; }
  function volume(asset: MarketAsset) { return marketCap(asset) * asset.volumeRate; }
  function compact(value: number) {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(value);
  }
  function chartValues(asset: MarketAsset) {
    const points = history(asset);
    const latest = price(asset);
    if (range === '1H' || range === '1D') {
      const count = range === '1H' ? 24 : 24;
      const volatility = asset.volatility * (range === '1H' ? 0.012 : 0.035);
      const seed = Number((character.calendar?.currentDate ?? '').replaceAll('-', '') || character.year);
      return Array.from({ length: count }, (_, index) => {
        if (index === count - 1) return latest;
        const wave = Math.sin(seed * 0.0007 + index * 0.73 + asset.symbol.length) * volatility;
        const drift = ((index / (count - 1)) - 1) * change(asset) / 100 * 0.15;
        return Math.max(0.000001, latest * (1 + wave + drift));
      });
    }
    if (range === '1W') {
      const previous = points.length > 1 ? points[points.length - 2].value : latest * 0.99;
      return Array.from({ length: 7 }, (_, index) => {
        const t = index / 6;
        const wave = Math.sin(index * 1.31 + asset.symbol.length) * asset.volatility * 0.012;
        return index === 6 ? latest : Math.max(0.000001, previous + (latest - previous) * t + latest * wave);
      });
    }
    if (range === '1M') return points.slice(-5).map((point) => point.value);
    if (range === '1Y') return points.slice(-52).map((point) => point.value);
    return points.map((point) => point.value);
  }
  const chartPath = (values: number[]) => {
    if (!values.length) return '';
    const min = Math.min(...values), max = Math.max(...values), spread = Math.max(0.0001, max - min);
    return values.map((value, index) => (index ? 'L' : 'M') + (index / Math.max(1, values.length - 1) * 100).toFixed(2) + ' ' + (92 - (value - min) / spread * 78).toFixed(2)).join(' ');
  };
  function formatPrice(value: number) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: character.currency || 'USD', minimumFractionDigits: value < 1 ? 4 : 2, maximumFractionDigits: value < 1 ? 6 : 2 }).format(value);
  }
  function toggleWatch(type: InvestmentType) {
    const list = character.marketWatchlist ?? [];
    const next = list.includes(type) ? list.filter((item) => item !== type) : [...list, type];
    onChange({ ...character, marketWatchlist: next });
  }
  function openAsset(asset: MarketAsset) {
    selected = asset.type;
    range = '1W';
    detailTab = 'overview';
    convertOpen = false;
    notice = '';
  }
  function trade(action: 'buy' | 'sell') {
    if (!current) return;
    const next = tradeMarketAsset(character, current.type, action, Number(quantity));
    if (next === character) {
      notice = action === 'buy' ? 'Not enough investment cash or invalid quantity. Add funds to your investment wallet first.' : 'You do not own enough units to sell.';
      return;
    }
    onChange(next);
    notice = action === 'buy' ? 'Purchase completed.' : 'Sale completed.';
  }
  function moveFunds() {
    const next = fundsAction === 'deposit'
      ? depositMarketFunds(character, Number(fundsAmount))
      : moveMarketFunds(character, Number(fundsAmount));
    if (next === character) {
      notice = fundsAction === 'deposit' ? 'Enter a valid amount within your available cash.' : 'Enter a valid amount within your investment wallet balance.';
      return;
    }
    onChange(next);
    notice = fundsAction === 'deposit' ? 'Funds added to your investment wallet.' : 'Funds moved back to cash.';
    fundsAction = null;
  }
  function convert() {
    if (!current || !convertTarget) return;
    const next = convertMarketAsset(character, current.type, convertTarget, Number(quantity));
    if (next === character) {
      notice = 'Conversion could not be completed. Check your units and the value of the target asset.';
      return;
    }
    onChange(next);
    selected = convertTarget;
    convertTarget = '';
    convertOpen = false;
    notice = 'Conversion completed. Sale proceeds were used to buy the selected asset.';
  }
  function openFunds(action: 'deposit' | 'move') {
    fundsAction = action;
    fundsAmount = action === 'deposit' ? String(Math.min(1000, character.money)) : String(Math.min(1000, marketCash));
  }
</script>

<section class="markets">
  {#if current}
    <button class="back-link" onclick={() => { selected = null; notice = ''; convertOpen = false; }}>← {market === 'stocks' ? 'Stocks market' : 'Crypto market'}</button>
    <header class="asset-detail-head">
      <div><small>{current.symbol} · {current.category}</small><h2>{current.name}</h2></div>
      <button class="watch" class:watched={(character.marketWatchlist ?? []).includes(current.type)} aria-label="Toggle watchlist" onclick={() => toggleWatch(current.type)}>{(character.marketWatchlist ?? []).includes(current.type) ? '★' : '☆'}</button>
    </header>
    <div class="asset-price">{formatPrice(currentPrice)}</div>
    <div class:positive={chartChange >= 0} class:negative={chartChange < 0} class="asset-change">{chartChange >= 0 ? '↗' : '↘'} {chartChange > 0 ? '+' : ''}{chartChange.toFixed(2)}% · {range}</div>
    <div class="chart-wrap">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={current.name + ' simulated price history'}>
        <defs><linearGradient id="market-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".24"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
        <path d={chartPath(chart) + ' L100 100 L0 100 Z'} fill="url(#market-fill)"/>
        <path d={chartPath(chart)} fill="none" stroke="var(--accent)" stroke-width="1.7" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="chart-extremes"><span>↑ High<br/><strong>{formatPrice(chartHigh)}</strong></span><span>↓ Low<br/><strong>{formatPrice(chartLow)}</strong></span></div>
    <div class="range-row">{#each ['1H','1D','1W','1M','1Y','ALL'] as item}<button class:active={range === item} onclick={() => range = item}>{item}</button>{/each}</div>
    <nav class="detail-tabs" aria-label="Asset information">
      {#each [{id:'overview',label:'Overview'},{id:'market-data',label:'Market data'},{id:'ratings',label:market === 'stocks' ? 'Ratings' : 'Network'},{id:'earnings',label:market === 'stocks' ? 'Earnings' : 'Supply'}] as tab}
        <button class:active={detailTab === tab.id} onclick={() => detailTab = tab.id}>{tab.label}</button>
      {/each}
    </nav>
    {#if detailTab === 'overview'}
      <div class="key-grid">
        <article><small>Market cap</small><strong>{formatPrice(marketCap(current))}</strong></article>
        <article><small>24h volume · simulated</small><strong>{formatPrice(volume(current))}</strong></article>
        <article><small>Owned units</small><strong>{currentHolding?.units ?? 0}</strong></article>
        <article><small>Position value</small><strong>{formatPrice((currentHolding?.units ?? 0) * currentPrice)}</strong></article>
      </div>
      <p class="asset-description">{current.description}</p>
    {:else if detailTab === 'market-data'}
      <div class="key-grid">
        <article><small>52-week low</small><strong>{formatPrice(Math.min(...history(current).slice(-52).map((point) => point.value), currentPrice))}</strong></article>
        <article><small>52-week high</small><strong>{formatPrice(Math.max(...history(current).slice(-52).map((point) => point.value), currentPrice))}</strong></article>
        <article><small>Circulating supply</small><strong>{compact(current.circulatingSupply)}</strong></article>
        <article><small>Market volatility</small><strong>{current.volatility >= .65 ? 'High' : current.volatility >= .35 ? 'Moderate–high' : 'Moderate'}</strong></article>
      </div>
      <p class="asset-description">Market values and volume are generated by the in-game simulation. Weekly closing quotes are saved with your life; shorter chart ranges are modeled within the current week.</p>
    {:else if detailTab === 'ratings'}
      <div class="metric-panel"><strong>{market === 'stocks' ? 'Simulated analyst outlook' : 'Network activity profile'}</strong><p>{market === 'stocks' ? 'Company sentiment is represented by its in-game market trend and risk profile. No real analyst ratings are used.' : 'Network activity is represented by the simulated market volume profile, not real blockchain data.'}</p><span>{market === 'stocks' ? 'Market trend: ' + (change(current) >= 0 ? 'Positive' : 'Negative') : 'Volume profile: ' + compact(current.volumeRate * 100) + '% of market capitalization'}</span></div>
    {:else}
      <div class="metric-panel"><strong>{market === 'stocks' ? 'Company earnings profile' : 'Token supply'}</strong><p>{market === 'stocks' ? 'Earnings and dividend mechanics are not yet modeled. This panel will gain financial statements when company operations are introduced.' : 'The circulating supply is a fixed game-market parameter. Token issuance, burns and staking are not yet simulated.'}</p><span>{market === 'stocks' ? 'Dividend and earnings events: not yet modeled' : 'Circulating supply: ' + compact(current.circulatingSupply)}</span></div>
    {/if}
    <div class="trade-box">
      <label>Quantity<input type="number" min="1" step="1" max="1000000" bind:value={quantity}/></label>
      <div class="order-estimate"><span>Estimated order value</span><strong>{formatPrice(estimatedGross)}</strong><span>Brokerage fee (0.5%)</span><strong>{formatPrice(estimatedFee)}</strong></div>
      <div class="trade-actions">
        <button class="primary" onclick={() => trade('buy')}>Buy</button>
        <button onclick={() => trade('sell')} disabled={(currentHolding?.units ?? 0) < 1}>Sell</button>
        <button onclick={() => { convertOpen = !convertOpen; convertTarget = currentMarketAssets[0]?.type ?? ''; }}>Convert</button>
        <button disabled={character.money <= 0} onclick={() => openFunds('deposit')}>Deposit</button>
      </div>
    </div>
    {#if convertOpen}
      <div class="convert-panel">
        <label>Convert into
          <select bind:value={convertTarget}>
            {#each currentMarketAssets as asset}<option value={asset.type}>{asset.name} ({asset.symbol})</option>{/each}
          </select>
        </label>
        <button class="primary" disabled={!convertTarget || (currentHolding?.units ?? 0) < 1} onclick={convert}>Confirm conversion</button>
      </div>
    {/if}
    {#if notice}<p class="notice" role="status">{notice}</p>{/if}
  {:else}
    <div class="portfolio-card"><small>{market === 'stocks' ? 'STOCK PORTFOLIO VALUE' : 'CRYPTO PORTFOLIO VALUE'}</small><strong>{formatPrice(portfolioValue)}</strong><span>Current value of your {market === 'stocks' ? 'stock' : 'crypto'} holdings</span></div>
    <div class="cash-card"><span>Investment cash available</span><strong>{formatCharacterMoney(character, marketCash)}</strong><small>Bank cash: {formatCharacterMoney(character)} · <button class="text-link" onclick={onOpenBanking}>Open Banking</button></small></div>
    <div class="market-tabs">
      {#each [{id:'all',label:'All'},{id:'holdings',label:'My holdings'},{id:'movers',label:'Top movers'},{id:'gainers',label:'Top gainers'},{id:'marketcap',label:'Market cap'},{id:'trending',label:'Trending'}] as item}
        <button class:active={filter === item.id} onclick={() => filter = item.id}>{item.label}</button>
      {/each}
    </div>
    <div class="market-tools">{#if searchOpen}<input aria-label="Search market" placeholder="Search name or symbol" bind:value={query}/>{:else}<span class="search-hint">Search the market by name or symbol</span>{/if}<button class:active={watchOnly} onclick={() => watchOnly = !watchOnly}>Watchlist</button></div>
    <div class="market-list">
      {#each visibleAssets as asset (asset.type)}
        {@const holding = holdings.find((item) => item.type === asset.type)}
        <button class="market-row" onclick={() => openAsset(asset)}>
          <span class="asset-icon">{asset.market === 'crypto' ? asset.symbol.slice(0, 1) : asset.symbol.slice(0, 1)}</span>
          <span class="asset-name"><strong>{asset.name}</strong><small>{asset.symbol} · {compact(volume(asset))} Vol</small></span>
          <span class="asset-quote"><strong>{formatPrice(price(asset))}</strong><small class:positive={change(asset) >= 0} class:negative={change(asset) < 0}>{change(asset) >= 0 ? '↗' : '↘'} {change(asset) > 0 ? '+' : ''}{change(asset).toFixed(2)}%</small></span>
        </button>
      {:else}
        <p class="empty">No assets match this view.</p>
      {/each}
    </div>
    <div class="market-footer">
      <button class="primary" disabled={character.money <= 0} onclick={() => openFunds('deposit')}>＋ Add funds</button>
      <button disabled={marketCash <= 0} onclick={() => openFunds('move')}>⇄ Move</button>
      <button class="search-action" onclick={() => { searchOpen = !searchOpen; if (!searchOpen) query = ''; }}>⌕ Search</button>
    </div>
  {/if}

  {#if fundsAction}
    <div class="funds-overlay" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) fundsAction = null; }}>
      <div class="funds-dialog" role="dialog" aria-modal="true" aria-labelledby="funds-title" tabindex="-1">
        <h3 id="funds-title">{fundsAction === 'deposit' ? 'Add funds' : 'Move funds'}</h3>
        <p>{fundsAction === 'deposit' ? 'Transfer cash into your investment wallet. This does not create money.' : 'Move unused investment cash back to your available cash.'}</p>
        <label>Amount<input type="number" min="1" step="1" bind:value={fundsAmount}/></label>
        <small>{fundsAction === 'deposit' ? 'Available cash: ' + formatCharacterMoney(character) : 'Investment cash: ' + formatCharacterMoney(character, marketCash)}</small>
        <div class="dialog-actions"><button onclick={() => fundsAction = null}>Cancel</button><button class="primary" onclick={moveFunds}>{fundsAction === 'deposit' ? 'Add funds' : 'Move to cash'}</button></div>
      </div>
    </div>
  {/if}
</section>

<style lang="scss">
.markets{display:grid;gap:12px;min-width:0}.portfolio-card{display:grid;gap:7px;padding:22px 18px;border:1px solid var(--line);border-radius:17px;background:linear-gradient(145deg,var(--surface-raised),var(--surface) 85%);color:var(--text)} .portfolio-card small{color:var(--muted);font-size:11px}.portfolio-card strong{font-size:36px;font-weight:500;letter-spacing:-1.5px} .portfolio-card span{color:var(--muted);font-size:10px} .cash-card{display:grid;grid-template-columns:1fr;align-items:center;gap:5px 12px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--surface)}.cash-card span{font-size:12px;font-weight:700}.cash-card strong{font-size:15px} .cash-card small{grid-column:1/-1;color:var(--muted);font-size:10px}.text-link{border:0;background:transparent;color:var(--accent);padding:0}.market-tabs,.detail-tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}.market-tabs button,.detail-tabs button,.range-row button{flex:0 0 auto;border:1px solid var(--line);background:var(--surface);color:var(--muted);border-radius:999px;padding:9px 13px;font-size:12px;white-space:nowrap}.market-tabs button.active,.detail-tabs button.active,.range-row button.active{background:var(--text);color:var(--surface);border-color:var(--text)}.market-tools{display:grid;grid-template-columns:1fr auto;gap:8px}.search-hint{align-self:center;padding:10px 2px;color:var(--muted);font-size:11px}.order-estimate{display:grid;grid-template-columns:1fr auto;gap:5px 12px;align-items:center;font-size:10px;color:var(--muted)}.order-estimate strong{font-size:11px;color:var(--text);text-align:right}.market-tools input,.trade-box input,.funds-dialog input,.convert-panel select{min-width:0;width:100%;border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--surface);color:var(--text)}.market-tools button,.watch{border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text);padding:0 12px}.market-tools button.active,.watch.watched{color:var(--accent)}.market-list{overflow:hidden;border:1px solid var(--line);border-radius:14px;background:var(--surface)}.market-row{width:100%;display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:10px;align-items:center;padding:13px 12px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--text);text-align:left}.market-row:last-child{border-bottom:0}.asset-icon{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--surface-raised);font-size:15px;font-weight:800}.asset-name,.asset-quote{display:grid;gap:4px;min-width:0}.asset-name strong{font-size:13px}.asset-name small,.asset-quote small{font-size:10px;color:var(--muted)}.asset-quote{text-align:right}.asset-quote strong{font-size:12px}.positive{color:var(--success)!important}.negative{color:var(--danger)!important}.empty{padding:20px;color:var(--muted);font-size:12px}.back-link{justify-self:start;border:0;background:transparent;color:var(--muted);padding:4px 0}.asset-detail-head{display:flex;justify-content:space-between;align-items:center}.asset-detail-head small{color:var(--muted);font-size:11px}.asset-detail-head h2{font-size:19px;margin:3px 0}.watch{width:42px;height:42px;border-radius:50%;font-size:22px}.asset-price{font-size:36px;letter-spacing:-1px}.asset-change{font-size:12px}.chart-wrap{height:180px;border-radius:14px;overflow:hidden;background:color-mix(in srgb,var(--accent-soft) 22%,transparent)}.chart-wrap svg{width:100%;height:100%;overflow:visible}.chart-extremes{display:flex;justify-content:space-between;color:var(--muted);font-size:10px}.chart-extremes strong{display:inline-block;margin-top:3px;color:var(--text);font-size:12px}.range-row{display:flex;justify-content:space-between;gap:3px}.range-row button{border:0;background:transparent;padding:8px 10px}.key-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.key-grid article,.metric-panel{display:grid;gap:6px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}.key-grid small{font-size:10px;color:var(--muted)}.key-grid strong{font-size:12px}.asset-description,.metric-panel p{margin:0;font-size:11px;color:var(--muted);line-height:1.5}.metric-panel strong{font-size:14px}.metric-panel span{font-size:11px;color:var(--accent)}.trade-box{display:grid;grid-template-columns:1fr auto;align-items:end;gap:10px;padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}.trade-box label,.funds-dialog label,.convert-panel label{display:grid;gap:5px;font-size:10px;color:var(--muted)}.trade-actions{display:flex;gap:6px;flex-wrap:wrap}.trade-actions button,.convert-panel button,.dialog-actions button{border:1px solid var(--line);border-radius:9px;padding:10px 13px;background:var(--surface-raised);color:var(--text)}.trade-actions button.primary,.convert-panel button.primary,.dialog-actions button.primary{background:var(--accent);color:var(--accent-foreground);border-color:transparent}.trade-actions button:disabled,.convert-panel button:disabled{opacity:.4}.convert-panel{display:grid;grid-template-columns:1fr auto;align-items:end;gap:10px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}.notice{margin:0;color:var(--accent);font-size:11px}.market-footer{position:sticky;bottom:8px;display:grid;grid-template-columns:1fr 1fr auto;gap:8px;padding:8px;border-radius:18px;background:color-mix(in srgb,var(--surface) 92%,transparent);backdrop-filter:blur(12px);box-shadow:var(--shadow-card)}.market-footer button{border:0;border-radius:999px;background:var(--text);color:var(--surface);padding:12px 15px;font-size:12px} .market-footer button.primary{background:var(--accent);color:var(--on-accent)}.market-footer button.search-action{width:44px;padding:0;font-size:20px}.funds-overlay{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:18px;background:color-mix(in srgb,var(--overlay-color) 52%,transparent)}.funds-dialog{width:min(100%,380px);display:grid;gap:12px;padding:18px;border:1px solid var(--line);border-radius:18px;background:var(--surface);color:var(--text);box-shadow:var(--shadow-card)}.funds-dialog h3,.funds-dialog p{margin:0}.funds-dialog h3{font-size:17px}.funds-dialog p{font-size:12px;color:var(--muted);line-height:1.5}.funds-dialog small{font-size:10px;color:var(--muted)}.dialog-actions{display:flex;justify-content:flex-end;gap:8px}.dialog-actions button{padding:10px 14px}
@media(max-width:380px){.portfolio-card strong,.asset-price{font-size:30px}.market-row{grid-template-columns:36px minmax(0,1fr) auto;gap:7px;padding:12px 8px}.asset-quote strong{font-size:11px}.trade-box{grid-template-columns:1fr}.trade-actions button{flex:1}.convert-panel{grid-template-columns:1fr}}
</style>
