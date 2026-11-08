<script lang="ts">
  import { addRecurringPayment, cancelRecurringPayment, formatCharacterMoney, makeAccountPurchase, makeCashPurchase, makeCardPurchase } from './lib/simulation';
  import FinanceLivingCosts from './FinanceLivingCosts.svelte';
  import EmptyState from './components/EmptyState.svelte';
  import GameChoice from './GameChoice.svelte';
  import type { Character, PaymentSourceType } from './lib/types';
  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  let activeView = $state<'discover' | 'services' | 'home'>('discover');
  let category = $state('All');
  let paymentSource = $state<PaymentSourceType>('cash');
  let paymentCardId = $state('');
  let paymentAccountId = $state('');
  let groceryQuantity = $state('1');
  let notice = $state('');

  const scale = $derived(character.currencyScale ?? 1);
  const activeSubscriptions = $derived((character.recurringPayments ?? []).filter((item) => item.active && item.category === 'subscription'));
  const activeCards = $derived((character.cards ?? []).filter((item) => item.active));
  const providers = [
    { id: 'stream-basic', name: 'ViewFlix', category: 'Entertainment', plan: 'Standard streaming', price: 120, detail: 'Films and series · annual plan' },
    { id: 'music-plus', name: 'SoundWave', category: 'Entertainment', plan: 'Music premium', price: 72, detail: 'Ad-free music and offline listening' },
    { id: 'mobile-data', name: 'Connect Mobile', category: 'Connectivity', plan: 'Mobile data plan', price: 96, detail: 'Calls, messages and mobile data' },
    { id: 'home-internet', name: 'HomeNet', category: 'Connectivity', plan: 'Home internet', price: 180, detail: 'Home broadband service' },
    { id: 'fitness-club', name: 'Active Club', category: 'Health & fitness', plan: 'Gym membership', price: 240, detail: 'Access to fitness facilities' },
    { id: 'cloud-storage', name: 'CloudBox', category: 'Digital services', plan: 'Cloud storage', price: 48, detail: 'Personal file storage' }
  ];
  const categories = ['All', 'Entertainment', 'Connectivity', 'Health & fitness', 'Digital services', 'Supermarket'];
  const groceries = [
    { id: 'rice', name: 'Rice · 1 kg', price: 8 },
    { id: 'eggs', name: 'Eggs · 6 pack', price: 12 },
    { id: 'milk', name: 'Milk · 1 litre', price: 10 },
    { id: 'bread', name: 'Bread · 1 loaf', price: 7 },
    { id: 'vegetables', name: 'Seasonal vegetables · 1 portion', price: 9 },
    { id: 'chicken', name: 'Chicken · 500 g', price: 32 }
  ];
  let quantities = $state<Record<string, number>>({});
  const basketTotal = $derived(groceries.reduce((sum, item) => sum + item.price * (quantities[item.id] ?? 0), 0) * scale);
  const filteredProviders = $derived(category === 'All' ? providers : providers.filter((item) => item.category === category));
  function providerOwned(id: string) { return activeSubscriptions.some((item) => item.name === providers.find((p) => p.id === id)?.plan); }
  function purchaseSubscription(provider: typeof providers[number]) {
    if (character.age < 16) { notice = 'Personal subscriptions unlock at age 16.'; return; }
    const sourceId = paymentSource === 'card' ? paymentCardId : paymentSource === 'account' ? paymentAccountId : undefined;
    const next = addRecurringPayment(character, provider.plan, provider.price * scale, 'subscription', paymentSource, sourceId);
    if (next === character) { notice = 'Could not start this plan. Check your age, payment method and active subscription limit.'; return; }
    onChange(next); notice = provider.plan + ' started. It will be charged annually.';
  }
  function updateQuantity(id: string, value: string) {
    const amount = Math.max(0, Math.min(99, Math.floor(Number(value) || 0)));
    quantities = { ...quantities, [id]: amount };
  }
  function checkoutGroceries() {
    if (!basketTotal) { notice = 'Add items to your basket first.'; return; }
    let next = character;
    if (paymentSource === 'card') {
      if (!paymentCardId) { notice = 'Choose a payment card.'; return; }
      next = makeCardPurchase(character, paymentCardId, basketTotal, 'Supermarket grocery purchase');
    } else if (paymentSource === 'account') {
      if (!paymentAccountId) { notice = 'Choose a bank account.'; return; }
      next = makeAccountPurchase(character, paymentAccountId, basketTotal, 'Supermarket grocery purchase');
    } else {
      next = makeCashPurchase(character, basketTotal, 'Supermarket grocery purchase');
    }
    if (next === character) { notice = 'Payment declined. Check your available cash or card balance/limit.'; return; }
    onChange(next); quantities = {}; notice = 'Supermarket purchase completed.';
  }
  function cancelSubscription(id: string) {
    const next = cancelRecurringPayment(character, id);
    if (next === character) return;
    onChange(next); notice = 'Subscription cancelled. No further annual charges will be scheduled.';
  }
  function paymentLabel(sourceType: PaymentSourceType, sourceId?: string) {
    if (sourceType === 'cash') return 'Cash';
    if (sourceType === 'account') return (character.bankAccounts ?? []).find((item) => item.id === sourceId)?.name ?? 'Bank account';
    return (character.cards ?? []).find((item) => item.id === sourceId)?.name ?? 'Payment card';
  }
</script>

<section class="lifestyle-workspace">
  <header class="lifestyle-heading">
    <div><div class="eyebrow">LIFE · MARKET</div><h2>{activeView === 'discover' ? 'Discover services' : activeView === 'services' ? 'My services' : 'Home & household'}</h2><p>{activeView === 'discover' ? 'Shop with providers and everyday stores.' : activeView === 'services' ? 'Your active subscriptions and payment methods.' : 'Your living arrangement and planned household costs.'}</p></div>
    {#if activeView === 'services'}<span class="service-count">{activeSubscriptions.length} ACTIVE</span>{/if}
  </header>
  <nav class="lifestyle-nav" aria-label="Lifestyle sections">
    <button class:active={activeView==='discover'} onclick={() => activeView='discover'}>Discover</button>
    <button class:active={activeView==='services'} onclick={() => activeView='services'}>My services</button>
    <button class:active={activeView==='home'} onclick={() => activeView='home'}>Home</button>
  </nav>

  {#if activeView === 'discover'}
    <section class="market-payment">
      <div><strong>Payment method</strong><small>Choose how purchases and new subscriptions are paid.</small></div>
      <div class="payment-controls">
        <GameChoice label="Payment method" value={paymentSource} options={[{value:'cash',label:'Cash',detail:'Pay from wallet'},{value:'account',label:'Bank account',detail:'Pay from your balance'},{value:'card',label:'Payment card',detail:'Use an active card'}]} onSelect={(value) => paymentSource = value as PaymentSourceType} columns={3} compact/>
        {#if paymentSource === 'account'}<GameChoice label="Bank account" value={paymentAccountId} options={[{value:'',label:'Choose account'},...(character.bankAccounts ?? []).map((account) => ({value:account.id,label:account.name,detail:formatCharacterMoney(character,account.balance)}))]} onSelect={(value) => paymentAccountId = value} columns={2}/>{:else if paymentSource === 'card'}<GameChoice label="Payment card" value={paymentCardId} options={[{value:'',label:'Choose card'},...activeCards.map((card) => ({value:card.id,label:card.name,detail:card.type}))]} onSelect={(value) => paymentCardId = value} columns={2}/>{/if}
      </div>
    </section>
    <nav class="market-categories" aria-label="Store categories">
      {#each categories as item}<button class:active={category===item} onclick={() => category=item}>{item}</button>{/each}
    </nav>
    {#if category === 'All' || category === 'Supermarket'}
      <section class="market-section">
        <div class="market-section-heading"><div><small>EVERYDAY SHOPPING</small><h3>FreshMart supermarket</h3></div><span>Basket · {formatCharacterMoney(character,basketTotal)}</span></div>
        <p class="market-copy">Buy household groceries. Purchases are charged immediately and recorded in your financial activity.</p>
        <div class="grocery-list">
          {#each groceries as item}
            <div class="grocery-item"><div><strong>{item.name}</strong><small>{formatCharacterMoney(character,item.price*scale)} each</small></div><input aria-label={'Quantity of '+item.name} type="number" min="0" max="99" value={quantities[item.id] ?? 0} oninput={(event) => updateQuantity(item.id,event.currentTarget.value)} /></div>
          {/each}
        </div>
        <button class="primary" onclick={checkoutGroceries} disabled={basketTotal<=0 || (paymentSource==='card' && !paymentCardId) || (paymentSource==='account' && !paymentAccountId)}>Checkout · {formatCharacterMoney(character,basketTotal)}</button>
      </section>
    {/if}
    {#if category === 'All' || category !== 'Supermarket'}
      <section class="market-section">
        <div class="market-section-heading"><div><small>SUBSCRIPTIONS & PROVIDERS</small><h3>{category === 'All' ? 'Available plans' : category}</h3></div><span>{filteredProviders.length} PLANS</span></div>
        <div class="provider-grid">
          {#each filteredProviders as provider}
            <article class="provider-card"><div class="provider-mark">{provider.name.slice(0,1)}</div><div class="provider-info"><strong>{provider.name}</strong><small>{provider.detail}</small><b>{formatCharacterMoney(character,provider.price*scale)} / year</b></div>{#if providerOwned(provider.id)}<span class="owned-label">Owned</span>{:else}<button onclick={() => purchaseSubscription(provider)} disabled={character.age<16 || (paymentSource==='card' && !paymentCardId) || (paymentSource==='account' && !paymentAccountId)}>Subscribe</button>{/if}</article>
          {/each}
        </div>
        <small class="lifestyle-note">Plans are fictional game services with simplified annual pricing. Charges are processed during year advancement; a missed charge does not silently create debt.</small>
      </section>
    {/if}
  {:else if activeView === 'services'}
    <section class="service-summary">
      <div><small>ACTIVE SUBSCRIPTIONS</small><strong>{activeSubscriptions.length}</strong></div>
      <div><small>ESTIMATED ANNUAL COST</small><strong>{formatCharacterMoney(character,activeSubscriptions.reduce((sum,item)=>sum+item.amount,0))}</strong></div>
      <div><small>ACTIVE PAYMENT CARDS</small><strong>{activeCards.length}</strong></div>
    </section>
    <section class="service-section">
      <div class="market-section-heading"><div><small>YOUR COMMITMENTS</small><h3>Subscriptions</h3></div></div>
      {#if activeSubscriptions.length === 0}<EmptyState title="No active subscriptions" description="Discover providers to add a subscription." />{:else}
        {#each activeSubscriptions as item}
          <article class="owned-service"><div><strong>{item.name}</strong><small>{formatCharacterMoney(character,item.amount)} / year · Paid by {paymentLabel(item.sourceType,item.sourceId)} · Since year {item.startedAtYear}</small></div><button class="quiet" onclick={() => cancelSubscription(item.id)}>Cancel</button></article>
        {/each}
      {/if}
    </section>
    <section class="service-section">
      <div class="market-section-heading"><div><small>PAYMENT METHODS</small><h3>Cards in use</h3></div><span>Manage in Banking</span></div>
      {#if activeCards.length === 0}<EmptyState title="No active cards" description="Manage payment cards in Banking." />{:else}
        {#each activeCards as card}
          <article class="owned-service"><div><strong>{card.name}</strong><small>{card.type === 'credit' ? 'Credit · '+formatCharacterMoney(character,card.balance)+' owed of '+formatCharacterMoney(character,card.creditLimit) : card.type === 'prepaid' ? 'Prepaid · '+formatCharacterMoney(character,card.balance)+' available' : 'Debit card'}{#if card.linkedAccountId} · Linked to {(character.bankAccounts ?? []).find((account)=>account.id===card.linkedAccountId)?.name ?? 'bank account'}{/if}</small></div><span class="managed-label">Banking</span></article>
        {/each}
      {/if}
    </section>
    <section class="service-section">
      <div class="market-section-heading"><div><small>OTHER RECURRING PAYMENTS</small><h3>Household & provider payments</h3></div></div>
      {#each (character.recurringPayments ?? []).filter((item)=>item.active && item.category==='bill') as item}
        <article class="owned-service"><div><strong>{item.name}</strong><small>{formatCharacterMoney(character,item.amount)} / year · {paymentLabel(item.sourceType,item.sourceId)}</small></div><span class="managed-label">Recurring</span></article>
      {:else}<EmptyState title="No other recurring payments" />{/each}
    </section>
  {:else}
    <FinanceLivingCosts {character} {onChange} />
  {/if}
  {#if notice}<p class="lifestyle-notice" role="status">{notice}</p>{/if}
</section>

<style>
.lifestyle-workspace{display:grid;gap:12px;min-width:0}.lifestyle-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:10px}.lifestyle-heading h2{font-size:19px;margin:3px 0}.lifestyle-heading p,.market-copy{font-size:11px;line-height:1.5;color:var(--muted);margin:0}.service-count,.market-section-heading>span{font-size:9px;color:var(--muted);white-space:nowrap}.lifestyle-nav,.market-categories{display:flex;gap:6px;overflow-x:auto;padding:2px 0 7px;scrollbar-width:thin}.lifestyle-nav button,.market-categories button{flex:none;min-height:40px;padding:0 12px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--muted);font-size:11px;font-weight:650;white-space:nowrap}.lifestyle-nav button.active,.market-categories button.active{background:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 50%, transparent);color:var(--accent)}.market-payment,.market-section,.service-section{padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}.market-payment{display:flex;justify-content:space-between;align-items:center;gap:12px}.market-payment strong,.market-payment small{display:block}.market-payment strong{font-size:12px}.market-payment small{font-size:10px;color:var(--muted);margin-top:3px}.payment-controls{display:flex;gap:6px;min-width:0}.payment-controls select,.grocery-item input{max-width:150px;min-width:0;padding:9px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font-size:11px}.market-section{display:grid;gap:10px}.market-section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}.market-section-heading small{font-size:8px;letter-spacing:.8px;color:var(--muted);font-weight:800}.market-section-heading h3{font-size:15px;margin:3px 0 0}.grocery-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.grocery-item{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px;border:1px solid var(--line);border-radius:9px;min-width:0}.grocery-item strong,.grocery-item small{display:block}.grocery-item strong{font-size:10px}.grocery-item small{font-size:9px;color:var(--muted);margin-top:3px}.grocery-item input{width:55px;text-align:center}.primary{min-height:40px;border:0;border-radius:9px;padding:9px 12px;background:var(--accent);color:var(--on-accent);font-size:11px;font-weight:750}.primary:disabled{opacity:.4}.provider-grid{display:grid;gap:7px}.provider-card,.owned-service{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}.provider-card:last-child,.owned-service:last-child{border-bottom:0}.provider-mark{width:32px;height:32px;flex:none;display:grid;place-items:center;border-radius:9px;background:var(--accent-soft);color:var(--accent);font-weight:800}.provider-info,.owned-service>div{flex:1;min-width:0}.provider-info strong,.provider-info small,.provider-info b,.owned-service strong,.owned-service small{display:block}.provider-info strong,.owned-service strong{font-size:11px}.provider-info small,.owned-service small{font-size:9px;color:var(--muted);line-height:1.45;margin-top:2px}.provider-info b{font-size:10px;margin-top:4px}.provider-card button,.owned-service button{flex:none;min-height:34px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font-size:10px;font-weight:700}.owned-label,.managed-label{font-size:9px;color:var(--accent);white-space:nowrap}.lifestyle-note{font-size:10px;line-height:1.5;color:var(--muted);margin:0}.service-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.service-summary>div{padding:11px;border:1px solid var(--line);border-radius:10px;background:var(--surface)}.service-summary small,.service-summary strong{display:block}.service-summary small{font-size:8px;color:var(--muted);line-height:1.4}.service-summary strong{font-size:15px;margin-top:4px}.lifestyle-notice{font-size:11px;color:var(--accent);margin:0}.quiet{background:transparent!important}.service-section{display:grid;gap:8px}.market-section-heading>span{font-size:9px}.lifestyle-workspace :global(.living-costs){margin:0}.lifestyle-workspace :global(.household-budget-panel){margin:0}
@media(max-width:520px){.market-payment{align-items:flex-start;flex-direction:column}.payment-controls{width:100%}.payment-controls select{flex:1;max-width:none}.grocery-list{grid-template-columns:1fr}.service-summary{grid-template-columns:1fr 1fr}.lifestyle-heading{align-items:flex-start;flex-direction:column}}
</style>