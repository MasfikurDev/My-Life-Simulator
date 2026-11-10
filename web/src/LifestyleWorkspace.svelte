<script lang="ts">
  import EmptyState from './components/EmptyState.svelte';
  import GameChoice from './GameChoice.svelte';
  import type { Character, PaymentSourceType } from './lib/types';
  import { equipLifestyleItem } from './lib/lifestyle';
  import {
    addOwnedLifestyleItem, addRecurringPayment, cancelRecurringPayment,
    formatCharacterMoney, makeAccountPurchase, makeCardPurchase, makeCashPurchase,
    planOwnedFoodInNextFreeTime
  } from './lib/simulation';

  let { character, onChange, onNotify, initialView = 'supermarket' }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void; initialView?: LifestyleView } = $props();
  type LifestyleView = 'supermarket' | 'subscriptions' | 'owned';
  type MarketProduct = {
    id: string; name: string; category: string; description: string; price: number;
    kind: 'food' | 'usable' | 'permanent';
    staminaRecovery?: number; health?: number; happiness?: number; stress?: number; comfort?: number; styleScore?: number; formality?: number;
  };
  type Provider = { id: string; name: string; plan: string; category: string; price: number; detail: string };
  const activeView = $derived(initialView);
  let category = $state('All');
  let dialogKind = $state<'product' | 'subscription' | null>(null);
  let selectedProductId = $state('');
  let selectedProviderId = $state('');
  let quantity = $state('1');
  let paymentSource = $state<PaymentSourceType>('cash');
  let paymentSourceId = $state('');

  const scale = $derived(character.currencyScale ?? 1);
  const activeCards = $derived((character.cards ?? []).filter((card) => card.active));
  const accounts = $derived((character.bankAccounts ?? []).filter((account) => account.type !== 'fixed-deposit'));
  const activeSubscriptions = $derived((character.recurringPayments ?? []).filter((item) => item.active && item.category === 'subscription'));
  const ownedItems = $derived(character.ownedLifestyleItems ?? []);
  const products: MarketProduct[] = [
    { id: 'meal-rice', name: 'Rice meal', category: 'Food', description: 'A filling everyday meal', price: 8, kind: 'food', staminaRecovery: 4, happiness: 1 },
    { id: 'meal-eggs', name: 'Eggs & toast', category: 'Food', description: 'Protein and carbohydrates for steady energy', price: 14, kind: 'food', staminaRecovery: 6, health: 1 },
    { id: 'meal-milk', name: 'Milk', category: 'Food', description: 'A simple nutritious drink', price: 10, kind: 'food', staminaRecovery: 3, health: 1 },
    { id: 'meal-fruit', name: 'Fresh fruit', category: 'Food', description: 'A fresh snack with a small wellbeing boost', price: 12, kind: 'food', staminaRecovery: 3, health: 2, happiness: 1, stress: 1 },
    { id: 'meal-balanced', name: 'Balanced meal', category: 'Food', description: 'A complete meal for recovery and wellbeing', price: 28, kind: 'food', staminaRecovery: 9, health: 3, happiness: 2, stress: 1 },
    { id: 'meal-chicken', name: 'Chicken meal', category: 'Food', description: 'A substantial protein-rich meal', price: 34, kind: 'food', staminaRecovery: 10, health: 2, happiness: 2 },
    { id: 'meal-groceries', name: 'Weekly grocery basket', category: 'Food', description: 'A practical mix of groceries to cover regular meals throughout the week', price: 110, kind: 'food', staminaRecovery: 24, health: 4, happiness: 2, comfort: 1 },
    { id: 'meal-restaurant', name: 'Restaurant dinner', category: 'Eating out', description: 'A sit-down meal with better ambience and a social break', price: 85, kind: 'food', staminaRecovery: 5, health: 1, happiness: 5, comfort: 3, stress: 2 },
    { id: 'meal-delivery', name: 'Food delivery', category: 'Delivery', description: 'A convenient prepared meal delivered to your home', price: 65, kind: 'food', staminaRecovery: 5, happiness: 4, comfort: 3, stress: 1 },
    { id: 'phone-basic', name: 'Everyday smartphone', category: 'Electronics', description: 'A practical smartphone for daily use', price: 420, kind: 'permanent' },
    { id: 'laptop-basic', name: 'Personal laptop', category: 'Electronics', description: 'A general-purpose laptop for study and work', price: 850, kind: 'permanent' },
    { id: 'desktop-basic', name: 'Desktop PC', category: 'Electronics', description: 'A desktop computer for study, creative work and gaming', price: 1250, kind: 'permanent' },
    { id: 'headphones', name: 'Wireless headphones', category: 'Electronics', description: 'Portable audio for everyday listening', price: 95, kind: 'permanent' },
    { id: 'bicycle', name: 'City bicycle', category: 'Transport', description: 'A reusable personal bicycle', price: 260, kind: 'permanent' },
    { id: 'book-fiction', name: 'Paperback book', category: 'Books', description: 'A book for leisure reading', price: 18, kind: 'usable' },
    { id: 'textbook', name: 'Study reference book', category: 'Books', description: 'A reusable reference for independent learning', price: 42, kind: 'permanent' },
    { id: 'fitness-kit', name: 'Home fitness kit', category: 'Fitness', description: 'Basic reusable equipment for exercise', price: 110, kind: 'permanent' },
    { id: 'backpack', name: 'Everyday backpack', category: 'Accessories', description: 'A durable bag for daily essentials', price: 55, kind: 'permanent' },
    { id: 'desk-lamp', name: 'Desk lamp', category: 'Home', description: 'A useful addition to a study or work space', price: 38, kind: 'permanent' },
    { id: 'fashion-basic', name: 'Everyday basics', category: 'Fashion', description: 'Clean, practical clothing for everyday use', price: 45, kind: 'permanent', styleScore: 35, formality: 15 },
    { id: 'fashion-casual', name: 'Casual outfit', category: 'Fashion', description: 'A coordinated casual look for daily outings', price: 110, kind: 'permanent', styleScore: 55, formality: 25 },
    { id: 'fashion-smart', name: 'Smart casual outfit', category: 'Fashion', description: 'A polished look suitable for social occasions', price: 240, kind: 'permanent', styleScore: 70, formality: 55 },
    { id: 'fashion-formal', name: 'Business suit', category: 'Fashion', description: 'Well-tailored formalwear for interviews and professional settings', price: 620, kind: 'permanent', styleScore: 82, formality: 95 },
    { id: 'fashion-designer', name: 'Designer outfit', category: 'Fashion', description: 'Premium branded clothing with a distinctive look', price: 1450, kind: 'permanent', styleScore: 92, formality: 65 },
    { id: 'fashion-luxury', name: 'Luxury formalwear', category: 'Fashion', description: 'High-end formal clothing for important occasions', price: 2400, kind: 'permanent', styleScore: 96, formality: 100 }
  ];
  const providers: Provider[] = [
    { id: 'stream-basic', name: 'ViewFlix', category: 'Entertainment', plan: 'Standard streaming', price: 120, detail: 'Films and series · annual plan' },
    { id: 'music-plus', name: 'SoundWave', category: 'Entertainment', plan: 'Music premium', price: 72, detail: 'Ad-free music and offline listening' },
    { id: 'mobile-data', name: 'Connect Mobile', category: 'Connectivity', plan: 'Mobile data plan', price: 96, detail: 'Calls, messages and mobile data' },
    { id: 'home-internet', name: 'HomeNet', category: 'Connectivity', plan: 'Home internet', price: 180, detail: 'Home broadband service' },
    { id: 'fitness-club', name: 'Active Club', category: 'Health & fitness', plan: 'Gym membership', price: 240, detail: 'Access to fitness facilities' },
    { id: 'cloud-storage', name: 'CloudBox', category: 'Digital services', plan: 'Cloud storage', price: 48, detail: 'Personal file storage' }
  ];
  const categories = ['All', 'Food', 'Eating out', 'Delivery', 'Fashion', 'Electronics', 'Transport', 'Books', 'Fitness', 'Accessories', 'Home'];
  const selectedProduct = $derived(products.find((item) => item.id === selectedProductId));
  const selectedOwnedQuantity = $derived(selectedProduct ? (ownedItems.find((item) => item.productId === selectedProduct.id)?.quantity ?? 0) : 0);
  const selectedProvider = $derived(providers.find((item) => item.id === selectedProviderId));
  const orderQuantity = $derived(Math.max(1, Math.min(20, Math.floor(Number(quantity) || 1))));
  const orderTotal = $derived(selectedProduct ? Math.round(selectedProduct.price * scale) * orderQuantity : 0);
  const filteredProducts = $derived(category === 'All' ? products : products.filter((item) => item.category === category));
  const subscriptionCost = $derived(selectedProvider ? Math.round(selectedProvider.price * scale) : 0);
  function openProduct(product: MarketProduct) {
    selectedProductId = product.id;
    quantity = '1';
    paymentSource = 'cash';
    paymentSourceId = '';
    dialogKind = 'product';
  }
  function openSubscription(provider: Provider) {
    if (character.age < 16) { onNotify('Subscriptions unlock at age 16.'); return; }
    selectedProviderId = provider.id;
    paymentSource = 'cash';
    paymentSourceId = '';
    dialogKind = 'subscription';
  }
  function purchaseFrom(source: Character, amount: number, description: string): Character {
    if (paymentSource === 'cash') return makeCashPurchase(source, amount, description);
    if (paymentSource === 'account') return paymentSourceId ? makeAccountPurchase(source, paymentSourceId, amount, description) : source;
    return paymentSourceId ? makeCardPurchase(source, paymentSourceId, amount, description) : source;
  }
  function completePurchase() {
    if (!selectedProduct || !dialogKind || dialogKind === 'subscription') return;
    if (selectedOwnedQuantity + orderQuantity > 999) { onNotify('Your Owned inventory already has the maximum quantity for this item.'); return; }
    const description = 'Lifestyle supermarket · ' + selectedProduct.name + (orderQuantity > 1 ? ' × ' + orderQuantity : '');
    const paid = purchaseFrom(character, orderTotal, description);
    if (paid === character) { onNotify('Payment declined. Check the selected payment method and available balance or credit.'); return; }
    const next = addOwnedLifestyleItem(paid, {
      productId: selectedProduct.id, name: selectedProduct.name, category: selectedProduct.category,
      description: selectedProduct.description, quantity: orderQuantity,
      kind: selectedProduct.kind === 'permanent' ? 'permanent' : 'usable',
      ...(selectedProduct.kind === 'food' ? { foodEffects: { staminaRecovery: selectedProduct.staminaRecovery ?? 0, health: selectedProduct.health ?? 0, happiness: selectedProduct.happiness ?? 0, stress: selectedProduct.stress ?? 0, comfort: selectedProduct.comfort ?? 0 } } : {}),
      ...(selectedProduct.styleScore !== undefined ? { styleScore: selectedProduct.styleScore, formality: selectedProduct.formality ?? 0 } : {})
    });
    if (next === paid) { onNotify('Could not add this purchase to your inventory.'); return; }
    onChange(next); onNotify(selectedProduct.name + ' bought and added to Owned inventory.'); dialogKind = null;
  }
  function planFood(itemId: string) {
    const result = planOwnedFoodInNextFreeTime(character, itemId);
    if (result.issue) { onNotify(result.message ?? 'This food cannot be added to the weekly plan.'); return; }
    onChange(result.character); onNotify('Food reserved from your inventory for this week. It will be consumed when the week is resolved.');
  }
  function deviceService(item: { productId: string; category: string }) {
    if (item.productId === 'phone-basic') return activeSubscriptions.some((payment) => payment.name === 'Mobile data plan') ? 'Mobile service active' : 'Requires mobile service';
    if (item.productId === 'laptop-basic' || item.productId === 'desktop-basic') return activeSubscriptions.some((payment) => payment.name === 'Home internet') ? 'Broadband active' : 'Requires broadband';
    return null;
  }
  function wearFashionItem(id: string) {
    const next = equipLifestyleItem(character, id);
    if (next === character) return;
    onChange(next);
    onNotify('Outfit changed. Your presentation now reflects the clothes you are wearing.');
  }
  function startSubscription() {
    if (!selectedProvider) return;
    const sourceId = paymentSource === 'cash' ? undefined : paymentSourceId;
    if (paymentSource !== 'cash' && !sourceId) { onNotify('Choose a payment source.'); return; }
    const next = addRecurringPayment(character, selectedProvider.plan, subscriptionCost, 'subscription', paymentSource, sourceId);
    if (next === character) { onNotify('Could not start this subscription. Check age, payment method and active subscription limit.'); return; }
    onChange(next);
    dialogKind = null;
    onNotify(selectedProvider.plan + ' started. Annual billing is scheduled through your selected payment source.');
  }
  function cancelSubscription(id: string) {
    const next = cancelRecurringPayment(character, id);
    if (next === character) return;
    onChange(next);
    onNotify('Subscription cancelled. No further annual charges will be scheduled.');
  }
  function isSubscribed(provider: Provider) { return activeSubscriptions.some((item) => item.name === provider.plan); }
</script>

<section class="lifestyle-workspace">
  <header class="lifestyle-heading">
    <div><div class="eyebrow">LIFESTYLE · EVERYDAY NEEDS</div><h2>{activeView === 'supermarket' ? 'Supermarket' : activeView === 'subscriptions' ? 'Subscriptions' : 'Owned'}</h2><p>{activeView === 'supermarket' ? 'Buy food and useful things for everyday life.' : activeView === 'subscriptions' ? 'Manage services and recurring memberships.' : 'Your purchased items and personal inventory.'}</p></div>
    {#if activeView === 'subscriptions'}<span class="service-count">{activeSubscriptions.length} ACTIVE</span>{:else if activeView === 'owned'}<span class="service-count">{ownedItems.reduce((sum, item) => sum + item.quantity, 0)} ITEMS</span>{/if}
  </header>
  {#if activeView === 'supermarket'}
    <nav class="market-categories" aria-label="Supermarket categories">
      {#each categories as item}<button class:active={category === item} onclick={() => category = item}>{item}</button>{/each}
    </nav>
    <section class="market-section">
      <div class="market-section-heading"><div><small>SHOPPING</small><h3>{category === 'All' ? 'Available Products' : category}</h3></div><span>{filteredProducts.length} ITEMS</span></div>
      <div class="product-grid">
        {#each filteredProducts as product (product.id)}
          <article class="market-product">
            <div class="product-mark">{product.kind === 'food' ? 'FOOD' : product.category.toUpperCase()}</div>
            <div class="product-info"><strong>{product.name}</strong><p>{product.description}</p><b>{formatCharacterMoney(character, Math.round(product.price * scale))}</b></div>
            <button class="buy-button" onclick={() => openProduct(product)}>{'Buy'}</button>
          </article>
        {/each}
      </div>
    </section>
  {:else if activeView === 'subscriptions'}
    <section class="service-section">
      <div class="market-section-heading"><div><small>YOUR SERVICES</small><h3>Active subscriptions</h3></div><span>{activeSubscriptions.length} ACTIVE</span></div>
      {#if activeSubscriptions.length}
        {#each activeSubscriptions as item (item.id)}
          <article class="owned-service"><div><strong>{item.name}</strong><small>{formatCharacterMoney(character, item.amount)} / year · Paid by {item.sourceType === 'cash' ? 'Cash' : item.sourceType === 'account' ? (accounts.find((account) => account.id === item.sourceId)?.name ?? 'Bank account') : (activeCards.find((card) => card.id === item.sourceId)?.name ?? 'Payment card')} · Since year {item.startedAtYear}</small></div><button class="quiet" onclick={() => cancelSubscription(item.id)}>Cancel</button></article>
        {/each}
      {:else}
        <EmptyState title="No active subscriptions" description="Choose a service below to start a recurring subscription." />
      {/if}
    </section>
    <section class="service-section">
      <div class="market-section-heading"><div><small>AVAILABLE PROVIDERS</small><h3>Discover services</h3></div></div>
      <div class="provider-grid">
        {#each providers as provider (provider.id)}
          <article class="provider-card"><div class="provider-mark">{provider.name.slice(0, 1)}</div><div class="provider-info"><strong>{provider.name}</strong><small>{provider.detail}</small><b>{formatCharacterMoney(character, Math.round(provider.price * scale))} / year</b></div>{#if isSubscribed(provider)}<span class="owned-label">Active</span>{:else}<button onclick={() => openSubscription(provider)} disabled={character.age < 16 || activeSubscriptions.length >= 12}>Subscribe</button>{/if}</article>
        {/each}
      </div>
      <small class="lifestyle-note">Subscriptions use the shared recurring-payment system and are billed once per simulated year. Manage payment cards in Banking.</small>
    </section>
  {:else}
    <section class="service-section">
      <div class="market-section-heading"><div><small>PERSONAL INVENTORY</small><h3>Purchased items</h3></div><span>{ownedItems.length} TYPES</span></div>
      {#if ownedItems.length}
        <div class="owned-grid">
          {#each ownedItems as item (item.id)}
            <article class="owned-item"><div class="owned-item-top"><strong>{item.name}</strong><span>{item.quantity > 1 ? '×' + item.quantity : item.kind === 'permanent' ? 'PERMANENT' : 'USABLE'}</span></div><small>{item.category} · Bought in year {item.purchasedAtYear}{item.category === 'Fashion' ? ' · Condition ' + (item.condition ?? 100) + '%' : ''}</small>{#if deviceService(item)}<small class="device-service">{deviceService(item)}</small>{/if}<p>{item.description}</p>{#if item.category === 'Food' && item.foodEffects}<button class="wear-outfit-button" onclick={() => planFood(item.id)} disabled={item.quantity <= (character.weeklyPlan?.activities ?? []).filter((activity) => activity.action?.kind === 'food' && activity.action.ownedItemId === item.id).reduce((sum, activity) => sum + (activity.action?.kind === 'food' ? activity.action.quantity : 0), 0)}>Use this week</button>{/if}{#if item.category === 'Fashion' && item.styleScore !== undefined}<small>Style {item.styleScore}/100 · Formality {item.formality ?? 0}/100</small><button class="wear-outfit-button" class:equipped={item.equipped === true} onclick={() => wearFashionItem(item.id)} disabled={item.equipped === true}>{item.equipped ? 'Currently wearing' : 'Wear this outfit'}</button>{/if}</article>
          {/each}
        </div>
      {:else}
        <EmptyState title="Nothing owned yet" description="Food, reusable goods and permanent purchases from the Supermarket appear here after checkout." />
      {/if}
    </section>
  {/if}

  {#if dialogKind}
    <div class="purchase-dialog-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && (dialogKind = null)}>
      <dialog open class="purchase-dialog" aria-modal="true" aria-labelledby="purchase-dialog-title">
        <button class="dialog-close" onclick={() => dialogKind = null} aria-label="Close">×</button>
        {#if dialogKind === 'subscription' && selectedProvider}
          <div class="eyebrow">SUBSCRIPTION CHECKOUT</div>
          <h3 id="purchase-dialog-title">{selectedProvider.name}</h3>
          <p>{selectedProvider.detail}. This plan renews annually until cancelled.</p>
          <div class="dialog-total"><span>Annual charge</span><strong>{formatCharacterMoney(character, subscriptionCost)}</strong></div>
          <div class="choice-field"><span>Payment source</span><GameChoice label="Subscription payment source" value={paymentSource === 'cash' ? 'cash' : paymentSourceId} options={[{value:'cash',label:'Cash',detail:'Wallet balance'},...accounts.map((account) => ({value:account.id,label:account.name,detail:formatCharacterMoney(character, account.balance)})),...activeCards.map((card) => ({value:card.id,label:card.name,detail:card.type + ' card'}))]} onSelect={(value) => { if (value === 'cash') { paymentSource = 'cash'; paymentSourceId = ''; } else if (accounts.some((account) => account.id === value)) { paymentSource = 'account'; paymentSourceId = value; } else { paymentSource = 'card'; paymentSourceId = value; } }} columns={2}/></div>
          <div class="dialog-actions"><button class="secondary" onclick={() => dialogKind = null}>Cancel</button><button class="primary" onclick={startSubscription} disabled={paymentSource !== 'cash' && !paymentSourceId}>Confirm subscription</button></div>
        {:else if selectedProduct}
          <div class="eyebrow">SUPERMARKET CHECKOUT</div>
          <h3 id="purchase-dialog-title">{selectedProduct.name}</h3>
          <p>{selectedProduct.description}</p>
          <div class="quantity-field"><span>Quantity</span><div class="quantity-stepper"><button type="button" aria-label="Decrease quantity" onclick={() => quantity = String(Math.max(1, orderQuantity - 1))} disabled={orderQuantity <= 1}>−</button><input type="number" min="1" max="20" bind:value={quantity} /><button type="button" aria-label="Increase quantity" onclick={() => quantity = String(Math.min(20, orderQuantity + 1))} disabled={orderQuantity >= 20}>+</button></div></div>
          <p class="dialog-note">Checkout adds the item to Owned inventory. Choose food from Owned when you want to include it in this week's review.</p>
          <div class="choice-field"><span>Payment source</span><GameChoice label="Purchase payment source" value={paymentSource === 'cash' ? 'cash' : paymentSourceId} options={[{value:'cash',label:'Cash',detail:formatCharacterMoney(character, character.money)},...accounts.map((account) => ({value:account.id,label:account.name,detail:formatCharacterMoney(character, account.balance)})),...activeCards.map((card) => ({value:card.id,label:card.name,detail:card.type + ' card'}))]} onSelect={(value) => { if (value === 'cash') { paymentSource = 'cash'; paymentSourceId = ''; } else if (accounts.some((account) => account.id === value)) { paymentSource = 'account'; paymentSourceId = value; } else { paymentSource = 'card'; paymentSourceId = value; } }} columns={2}/></div>
          <div class="dialog-total"><span>Total · {orderQuantity} {orderQuantity === 1 ? 'item' : 'items'}</span><strong>{formatCharacterMoney(character, orderTotal)}</strong></div>
          <div class="dialog-actions"><button class="secondary" onclick={() => dialogKind = null}>Cancel</button><button class="primary" onclick={completePurchase} disabled={dialogKind === 'product' && selectedOwnedQuantity + orderQuantity > 999}>Confirm purchase</button></div>
        {/if}
      </dialog>
    </div>
  {/if}
</section>

<style>
  .lifestyle-workspace{display:grid;gap:12px;min-width:0}
  .lifestyle-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:10px}
  .lifestyle-heading h2{font-size:24px;line-height:1.2;letter-spacing:-.7px;margin:3px 0 4px}
  .lifestyle-heading p{font-size:11px;line-height:1.5;color:var(--muted);margin:0}
  .service-count,.market-section-heading>span{font-size:9px;color:var(--muted);white-space:nowrap}
  .market-categories{display:flex;gap:6px;overflow-x:auto;padding:2px 0 7px;scrollbar-width:thin}
  .market-categories button{flex:none;min-height:40px;padding:0 12px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--muted);font-size:11px;font-weight:650;white-space:nowrap}
  .market-categories button.active{background:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 50%,transparent);color:var(--accent)}
  .market-section,.service-section{padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--surface);display:grid;gap:10px;min-width:0}
  .market-section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .market-section-heading small{font-size:8px;letter-spacing:.8px;color:var(--muted);font-weight:800}
  .market-section-heading h3{font-size:15px;margin:3px 0 0}
  .product-grid,.owned-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .market-product,.owned-item{display:grid;gap:5px;min-width:0;padding:9px;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised)}
  .wear-outfit-button{justify-self:start;border:1px solid var(--line);border-radius:8px;padding:7px 9px;background:var(--surface);color:var(--text);font-size:10px;font-weight:700}
  .wear-outfit-button.equipped{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
  .product-mark{font-size:7px;letter-spacing:.7px;color:var(--accent);font-weight:850}
  .product-info{min-width:0}
  .product-info strong,.product-info b{display:block;font-size:11px}
  .product-info p,.owned-item p{font-size:9px;line-height:1.4;color:var(--muted);margin:4px 0}
  .product-info b{font-size:10px;margin-top:5px}
  .buy-button,.provider-card button,.owned-service button{min-height:34px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--text);font-size:10px;font-weight:750}
  .buy-button{justify-self:start}
  .provider-grid{display:grid;gap:7px}
  .provider-card,.owned-service{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}
  .provider-card:last-child,.owned-service:last-child{border-bottom:0}
  .provider-mark{width:32px;height:32px;flex:none;display:grid;place-items:center;border-radius:9px;background:var(--accent-soft);color:var(--accent);font-weight:800}
  .provider-info,.owned-service>div{flex:1;min-width:0}
  .provider-info strong,.provider-info small,.provider-info b,.owned-service strong,.owned-service small{display:block}
  .provider-info strong,.owned-service strong{font-size:11px}
  .provider-info small,.owned-service small{font-size:9px;color:var(--muted);line-height:1.45;margin-top:2px}
  .provider-info b{font-size:10px;margin-top:4px}
  .owned-label{font-size:9px;color:var(--accent);white-space:nowrap}
  .owned-item-top{display:flex;justify-content:space-between;align-items:flex-start;gap:7px}
  .owned-item-top strong{font-size:11px}
  .owned-item-top span,.owned-item>small{font-size:8px;color:var(--muted)}
  .owned-item>small{line-height:1.4}
  .lifestyle-note,.dialog-note{font-size:9px;line-height:1.5;color:var(--muted);margin:0}
  .quiet{background:transparent!important}
  .purchase-dialog-backdrop{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(0,0,0,.72);overflow-y:auto}
  .purchase-dialog{position:relative;inset:auto;margin:auto;width:min(480px,100%);max-width:none;max-height:90dvh;overflow:auto;display:grid;gap:12px;padding:20px;border:1px solid var(--line-strong);border-radius:15px;background:var(--surface);color:var(--text);box-shadow:0 24px 80px rgba(0,0,0,.35)}
  .purchase-dialog h3{font-size:20px;line-height:1.2;margin:0}
  .purchase-dialog>p{font-size:10px;line-height:1.5;color:var(--muted);margin:0}
  .dialog-close{position:absolute;top:10px;right:10px;width:30px;height:30px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font-size:18px}
  .quantity-field{display:grid;gap:5px;font-size:10px;color:var(--muted)}
  .quantity-stepper{display:grid;grid-template-columns:42px minmax(0,1fr) 42px;gap:7px}
  .quantity-stepper button{min-height:40px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font-size:20px;font-weight:700}
  .quantity-stepper button:disabled{opacity:.35}
  .quantity-stepper input{width:100%;min-height:40px;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);text-align:center}
  .device-service{color:var(--accent)!important;font-weight:700}
  .dialog-total{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
  .dialog-total span{font-size:10px;color:var(--muted)}
  .dialog-total strong{font-size:17px;font-variant-numeric:tabular-nums}
  .dialog-actions{display:flex;justify-content:flex-end;gap:8px}
  .dialog-actions button{min-height:38px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font-size:10px;font-weight:750}
  .dialog-actions .primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
  .dialog-actions .secondary{background:transparent}
  .purchase-dialog :global(.game-choice){min-width:0}
  @media(max-width:520px){.lifestyle-heading{align-items:flex-start;flex-direction:column}.product-grid,.owned-grid{grid-template-columns:1fr}.purchase-dialog{padding:16px}.provider-card{gap:8px}}
</style>