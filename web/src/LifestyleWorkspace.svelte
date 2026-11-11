<script lang="ts">
  import EmptyState from './components/EmptyState.svelte';
  import GameChoice from './GameChoice.svelte';
  import type { Character, PaymentSourceType } from './lib/types';
  import { equipLifestyleItem } from './lib/lifestyle';
  import {
    addOwnedLifestyleItem, addRecurringPayment, cancelRecurringPayment,
    formatCharacterMoney, makeCashPurchase, planOwnedFoodInNextFreeTime
  } from './lib/simulation';

  let { character, onChange, onNotify, initialView = 'supermarket' }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void; initialView?: LifestyleView } = $props();
  type LifestyleView = 'supermarket' | 'subscriptions' | 'owned';
  type ShopStage = 'browse' | 'cart' | 'payment' | 'receipt';
  type Receipt = { items: { name: string; quantity: number; total: number }[]; total: number; year: number; age: number; cashBefore: number; cashAfter: number };
  type MarketProduct = {
    id: string; name: string; category: string; description: string; price: number;
    kind: 'food' | 'usable' | 'permanent';
    staminaRecovery?: number; health?: number; happiness?: number; stress?: number; comfort?: number; styleScore?: number; formality?: number;
  };
  type Provider = { id: string; name: string; plan: string; category: string; price: number; detail: string };
  const activeView = $derived(initialView);
  let category = $state('All');
  let dialogKind = $state<'subscription' | null>(null);
  let shopStage = $state<ShopStage>('browse');
  let cart = $state<Record<string, number>>({});
  let receipt = $state<Receipt | null>(null);
  let selectedProviderId = $state('');
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
  const selectedProvider = $derived(providers.find((item) => item.id === selectedProviderId));
  const uniqueProducts = new Set(['phone-basic', 'laptop-basic', 'desktop-basic', 'headphones', 'bicycle', 'textbook', 'fitness-kit', 'backpack', 'desk-lamp']);
  const cartEntries = $derived(products.filter((product) => (cart[product.id] ?? 0) > 0).map((product) => ({ product, quantity: cart[product.id], total: Math.round(product.price * scale) * cart[product.id] })));
  const cartCount = $derived(cartEntries.reduce((sum, entry) => sum + entry.quantity, 0));
  const cartTotal = $derived(cartEntries.reduce((sum, entry) => sum + entry.total, 0));
  const filteredProducts = $derived(category === 'All' ? products : products.filter((item) => item.category === category));
  const subscriptionCost = $derived(selectedProvider ? Math.round(selectedProvider.price * scale) : 0);
  function isUnavailable(product: MarketProduct) {
    return uniqueProducts.has(product.id) && ownedItems.some((item) => item.productId === product.id && item.quantity > 0);
  }
  function addToCart(product: MarketProduct) {
    if (isUnavailable(product)) { onNotify(product.name + ' is already in your Inventory.'); return; }
    const current = cart[product.id] ?? 0;
    if (uniqueProducts.has(product.id) && current >= 1) return;
    if (current >= 20) { onNotify('Cart quantity limit reached for this item.'); return; }
    cart = { ...cart, [product.id]: current + 1 };
    onNotify(product.name + ' added to cart.');
  }
  function changeCartQuantity(productId: string, delta: number) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const nextQuantity = Math.max(0, Math.min(uniqueProducts.has(productId) ? 1 : 20, (cart[productId] ?? 0) + delta));
    cart = { ...cart, [productId]: nextQuantity };
  }
  function beginCheckout() {
    if (!cartEntries.length) return;
    shopStage = 'payment';
  }
  function completeCartPurchase() {
    if (!cartEntries.length || !Number.isSafeInteger(cartTotal) || cartTotal <= 0) return;
    for (const entry of cartEntries) {
      if (isUnavailable(entry.product) && uniqueProducts.has(entry.product.id)) { onNotify(entry.product.name + ' is no longer available.'); return; }
      const existingQuantity = ownedItems.find((item) => item.productId === entry.product.id)?.quantity ?? 0;
      if (entry.quantity < 1 || entry.quantity > 20 || existingQuantity + entry.quantity > 999 || (uniqueProducts.has(entry.product.id) && entry.quantity !== 1)) { onNotify('This order exceeds the available inventory limit for ' + entry.product.name + '.'); return; }
    }
    const cashBefore = character.money;
    const description = 'Supermarket order · ' + cartEntries.map((entry) => entry.product.name + ' ×' + entry.quantity).join(', ');
    const paid = makeCashPurchase(character, cartTotal, description);
    if (paid === character) { onNotify('Payment declined. You do not have enough cash for this order.'); return; }
    let next = paid;
    for (const entry of cartEntries) {
      const product = entry.product;
      next = addOwnedLifestyleItem(next, {
        productId: product.id, name: product.name, category: product.category,
        description: product.description, quantity: entry.quantity,
        kind: product.kind === 'permanent' ? 'permanent' : 'usable',
        ...(product.kind === 'food' ? { foodEffects: { staminaRecovery: product.staminaRecovery ?? 0, health: product.health ?? 0, happiness: product.happiness ?? 0, stress: product.stress ?? 0, comfort: product.comfort ?? 0 } } : {}),
        ...(product.styleScore !== undefined ? { styleScore: product.styleScore, formality: product.formality ?? 0 } : {})
      });
    }
    receipt = { items: cartEntries.map((entry) => ({ name: entry.product.name, quantity: entry.quantity, total: entry.total })), total: cartTotal, year: character.year, age: character.age, cashBefore, cashAfter: next.money };
    onChange(next);
    cart = {};
    shopStage = 'receipt';
  }
  function productBoosts(product: MarketProduct) {
    const boosts = [product.staminaRecovery ? 'Stamina +' + product.staminaRecovery : '', product.health ? 'Health +' + product.health : '', product.happiness ? 'Happiness +' + product.happiness : '', product.stress ? 'Stress +' + product.stress : '', product.comfort ? 'Comfort +' + product.comfort : ''].filter(Boolean);
    return boosts.join(' · ');
  }
  function openSubscription(provider: Provider) {
    if (character.age < 16) { onNotify('Subscriptions unlock at age 16.'); return; }
    selectedProviderId = provider.id;
    paymentSource = 'cash';
    paymentSourceId = '';
    dialogKind = 'subscription';
  }
  function planFood(itemId: string) {
    const result = planOwnedFoodInNextFreeTime(character, itemId);
    if (result.issue) { onNotify(result.message ?? 'This food cannot be added to the weekly plan.'); return; }
    onChange(result.character); onNotify('Added to this week’s plan. The reserved portion will be consumed when the week is resolved.');
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
    <div><div class="eyebrow">LIFESTYLE · EVERYDAY NEEDS</div><h2>{activeView === 'supermarket' ? 'Supermarket' : activeView === 'subscriptions' ? 'Subscriptions' : 'Inventory'}</h2><p>{activeView === 'supermarket' ? 'Browse everyday goods and build an order.' : activeView === 'subscriptions' ? 'Manage services and recurring memberships.' : 'Your purchased items and supplies.'}</p></div>
    {#if activeView === 'subscriptions'}<span class="service-count">{activeSubscriptions.length} ACTIVE</span>{:else if activeView === 'owned'}<span class="service-count">{ownedItems.reduce((sum, item) => sum + item.quantity, 0)} ITEMS</span>{/if}
  </header>
  {#if activeView === 'supermarket'}
    {#if shopStage === 'browse'}
    <div class="shop-toolbar"><span>{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</span><button class="cart-button" onclick={() => shopStage = 'cart'} disabled={cartCount === 0}>Cart · {formatCharacterMoney(character, cartTotal)}</button></div>
    <nav class="market-categories" aria-label="Supermarket categories">
      {#each categories as item}<button class:active={category === item} onclick={() => category = item}>{item}</button>{/each}
    </nav>
    <section class="market-section">
      <div class="market-section-heading"><div><small>SHOPPING</small><h3>{category === 'All' ? 'Available Products' : category}</h3></div><span>{filteredProducts.length} ITEMS</span></div>
      <div class="product-grid">
        {#each filteredProducts as product (product.id)}
          <article class="market-product" class:unavailable={isUnavailable(product)}>
            <div class="product-mark">{product.kind === 'food' ? 'FOOD' : product.category.toUpperCase()}</div>
            <strong>{product.name}</strong>
            {#if product.kind === 'food'}<small class="product-boost">{productBoosts(product)}</small>{/if}
            <b>{formatCharacterMoney(character, Math.round(product.price * scale))}</b>
            {#if isUnavailable(product)}<span class="stock-state">Out of Stock</span>{:else if cart[product.id]}<span class="stock-state in-cart">In Cart · {cart[product.id]}</span>{:else}<button class="add-cart-button" onclick={() => addToCart(product)}>Add to Cart</button>{/if}
          </article>
        {/each}
      </div>
    </section>
    {:else if shopStage === 'cart'}
      <section class="service-section shop-page"><div class="market-section-heading"><div><small>YOUR ORDER</small><h3>Shopping Cart</h3></div><span>{cartCount} ITEMS</span></div>
        {#each cartEntries as entry (entry.product.id)}<article class="cart-line"><div><strong>{entry.product.name}</strong><small>{formatCharacterMoney(character, Math.round(entry.product.price * scale))} each</small></div><div class="cart-quantity"><button onclick={() => changeCartQuantity(entry.product.id, -1)} aria-label="Remove one">−</button><b>{entry.quantity}</b><button onclick={() => changeCartQuantity(entry.product.id, 1)} aria-label="Add one" disabled={uniqueProducts.has(entry.product.id) || entry.quantity >= 20}>+</button></div><strong>{formatCharacterMoney(character, entry.total)}</strong></article>{/each}
        {#if !cartEntries.length}<EmptyState title="Your cart is empty" description="Add products from the Supermarket to build an order." />{/if}
        <div class="cart-total"><span>Order Total</span><strong>{formatCharacterMoney(character, cartTotal)}</strong></div>
        <div class="shop-actions"><button class="secondary" onclick={() => shopStage = 'browse'}>Continue Shopping</button><button class="primary" onclick={beginCheckout} disabled={!cartEntries.length}>Continue to Checkout</button></div>
      </section>
    {:else if shopStage === 'payment'}
      <section class="service-section shop-page"><div class="market-section-heading"><div><small>CHECKOUT</small><h3>Payment</h3></div><span>CASH</span></div>
        {#each cartEntries as entry (entry.product.id)}<div class="payment-line"><span>{entry.product.name} × {entry.quantity}</span><strong>{formatCharacterMoney(character, entry.total)}</strong></div>{/each}
        <div class="cart-total"><span>Total Due</span><strong>{formatCharacterMoney(character, cartTotal)}</strong></div>
        <div class="cash-payment"><span>Payment Method</span><strong>Cash</strong><small>Available Cash: {formatCharacterMoney(character, character.money)}</small><small>Cash After Purchase: {formatCharacterMoney(character, Math.max(0, character.money - cartTotal))}</small></div>
        <div class="shop-actions"><button class="secondary" onclick={() => shopStage = 'cart'}>Back to Cart</button><button class="primary" onclick={completeCartPurchase} disabled={character.money < cartTotal}>Pay {formatCharacterMoney(character, cartTotal)}</button></div>
        {#if character.money < cartTotal}<small class="payment-error">Not enough cash to complete this order.</small>{/if}
      </section>
    {:else if shopStage === 'receipt' && receipt}
      <section class="receipt-wrap"><div class="receipt-paper"><div class="receipt-brand">SUPERMARKET</div><small>SALES RECEIPT</small><div class="receipt-rule"></div><div class="receipt-meta"><span>Year {receipt.year} · Age {receipt.age}</span><span>Paid: Cash</span></div><div class="receipt-rule dashed"></div>{#each receipt.items as item}<div class="receipt-line"><span>{item.name}<small>{item.quantity} × {formatCharacterMoney(character, item.total / item.quantity)}</small></span><b>{formatCharacterMoney(character, item.total)}</b></div>{/each}<div class="receipt-rule"></div><div class="receipt-total"><span>TOTAL PAID</span><strong>{formatCharacterMoney(character, receipt.total)}</strong></div><div class="receipt-cash"><span>Cash Before</span><b>{formatCharacterMoney(character, receipt.cashBefore)}</b><span>Cash After</span><b>{formatCharacterMoney(character, receipt.cashAfter)}</b></div><div class="receipt-rule dashed"></div><div class="receipt-thanks">THANK YOU</div><small>Items have been added to your Inventory.</small></div><div class="shop-actions"><button class="secondary" onclick={() => shopStage = 'browse'}>Back to Shop</button><button class="primary" onclick={() => shopStage = 'browse'}>Done</button></div></section>
    {/if}
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
            <article class="owned-item"><div class="owned-item-top"><strong>{item.name}</strong><span>{item.quantity > 1 ? '×' + item.quantity : item.kind === 'permanent' ? 'PERMANENT' : 'USABLE'}</span></div><small>{item.category} · Bought in year {item.purchasedAtYear}{item.category === 'Fashion' ? ' · Condition ' + (item.condition ?? 100) + '%' : ''}</small>{#if deviceService(item)}<small class="device-service">{deviceService(item)}</small>{/if}{#if item.foodEffects}<small class="inventory-boost">{[item.foodEffects.staminaRecovery > 0 ? 'Stamina +' + item.foodEffects.staminaRecovery : '', item.foodEffects.health > 0 ? 'Health +' + item.foodEffects.health : '', item.foodEffects.happiness > 0 ? 'Happiness +' + item.foodEffects.happiness : '', item.foodEffects.stress > 0 ? 'Stress +' + item.foodEffects.stress : '', item.foodEffects.comfort > 0 ? 'Comfort +' + item.foodEffects.comfort : ''].filter(Boolean).join(' · ')}</small><button class="plan-food-button" onclick={() => planFood(item.id)} disabled={item.quantity <= (character.weeklyPlan?.activities ?? []).filter((activity) => activity.action?.kind === 'food' && activity.action.ownedItemId === item.id).reduce((sum, activity) => sum + (activity.action?.kind === 'food' ? activity.action.quantity : 0), 0)}>Plan for This Week</button>{/if}{#if item.category === 'Fashion' && item.styleScore !== undefined}<small>Style {item.styleScore}/100 · Formality {item.formality ?? 0}/100</small><button class="wear-outfit-button" class:equipped={item.equipped === true} onclick={() => wearFashionItem(item.id)} disabled={item.equipped === true}>{item.equipped ? 'Currently wearing' : 'Wear this outfit'}</button>{/if}</article>
          {/each}
        </div>
      {:else}
        <EmptyState title="Inventory is empty" description="Purchased food, supplies and personal items will appear here after checkout." />
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
        {/if}
      </dialog>
    </div>
  {/if}
</section>

<style>
  .lifestyle-workspace{display:grid;gap:10px;min-width:0}
  .lifestyle-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:10px}
  .lifestyle-heading h2{font-size:24px;line-height:1.2;letter-spacing:-.7px;margin:3px 0 4px}
  .lifestyle-heading p{font-size:11px;line-height:1.5;color:var(--muted);margin:0}
  .service-count,.market-section-heading>span{font-size:9px;color:var(--muted);white-space:nowrap}
  .market-categories{display:flex;gap:6px;overflow-x:auto;padding:2px 0 7px;scrollbar-width:thin}
  .market-categories button{flex:none;min-height:40px;padding:0 12px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--muted);font-size:11px;font-weight:650;white-space:nowrap}
  .market-categories button.active{background:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 50%,transparent);color:var(--accent)}
  .market-section,.service-section{padding:12px;border:1px solid var(--line);border-radius:13px;background:var(--surface);display:grid;gap:8px;min-width:0}
  .market-section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .market-section-heading small{font-size:8px;letter-spacing:.8px;color:var(--muted);font-weight:800}
  .market-section-heading h3{font-size:15px;margin:3px 0 0}
  .product-grid,.owned-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
  .market-product,.owned-item{display:grid;align-content:start;gap:6px;min-width:0;padding:10px;border:1px solid var(--line);border-radius:11px;background:var(--surface-raised)}
  .market-product{aspect-ratio:1/1;min-height:130px}
  .market-product>strong{font-size:11px;line-height:1.3}
  .market-product>b{font-size:11px;margin-top:auto}
  .product-boost{font-size:8px;line-height:1.35;color:var(--muted)}
  .stock-state{font-size:9px;font-weight:750;color:var(--muted);padding:6px 0}
  .stock-state.in-cart{color:var(--accent)}
  .market-product.unavailable{opacity:.62}
  .add-cart-button,.cart-button{min-height:31px;padding:0 9px;border:1px solid var(--line);border-radius:8px;background:var(--accent-soft);color:var(--accent);font-size:9px;font-weight:800}
  .shop-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--muted);font-size:10px}
  .cart-button:disabled{opacity:.4}
  .shop-page{gap:12px}
  .cart-line{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}
  .cart-line>div:first-child{min-width:0}.cart-line strong{font-size:11px}.cart-line small{display:block;color:var(--muted);font-size:9px;margin-top:3px}
  .cart-quantity{display:flex;align-items:center;gap:7px}.cart-quantity button{width:27px;height:27px;border:1px solid var(--line);border-radius:7px;background:var(--surface-raised);color:var(--text)}.cart-quantity button:disabled{opacity:.35}.cart-quantity b{font-size:10px;min-width:10px;text-align:center}
  .cart-total{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid var(--line);font-size:11px}.cart-total strong{font-size:17px;font-variant-numeric:tabular-nums}
  .shop-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.shop-actions button{min-height:38px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font-size:10px;font-weight:750}.shop-actions .primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}.shop-actions .secondary{background:transparent}
  .payment-line{display:flex;justify-content:space-between;gap:10px;font-size:10px}.payment-line strong{font-size:10px}.cash-payment{display:grid;gap:5px;padding:11px;border:1px solid var(--line);border-radius:9px;background:var(--surface-raised)}.cash-payment span,.cash-payment small{font-size:9px;color:var(--muted)}.cash-payment strong{font-size:13px}.payment-error{color:var(--danger);font-size:9px}
  .receipt-wrap{display:grid;justify-items:center;gap:12px}.receipt-paper{width:min(340px,100%);padding:22px 19px;background:#f5f1e8;color:#25231f;box-shadow:0 8px 24px rgba(0,0,0,.18);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;display:grid;gap:9px;clip-path:polygon(0 0,100% 0,100% 98%,96% 100%,92% 98%,88% 100%,84% 98%,80% 100%,76% 98%,72% 100%,68% 98%,64% 100%,60% 98%,56% 100%,52% 98%,48% 100%,44% 98%,40% 100%,36% 98%,32% 100%,28% 98%,24% 100%,20% 98%,16% 100%,12% 98%,8% 100%,4% 98%,0 100%)}
  .receipt-brand,.receipt-thanks{text-align:center;font-weight:900;letter-spacing:1.4px;font-size:15px}.receipt-paper>small{text-align:center;font-size:8px;color:#625d52}.receipt-rule{height:1px;background:#b8b1a4}.receipt-rule.dashed{background:repeating-linear-gradient(90deg,#999184 0 4px,transparent 4px 7px)}.receipt-meta,.receipt-cash{display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:8px}.receipt-line{display:flex;justify-content:space-between;gap:8px;font-size:9px}.receipt-line small{display:block;font-size:8px;color:#625d52;margin-top:3px}.receipt-total{display:flex;justify-content:space-between;align-items:center;font-size:10px}.receipt-total strong{font-size:15px}.receipt-cash span{color:#625d52}.receipt-thanks{font-size:12px}
  .wear-outfit-button{justify-self:start;border:1px solid var(--line);border-radius:8px;padding:7px 9px;background:var(--surface);color:var(--text);font-size:10px;font-weight:700}
  .plan-food-button{justify-self:start;min-height:34px;padding:0 10px;border:1px solid color-mix(in srgb,var(--accent) 45%,var(--line));border-radius:8px;background:var(--accent-soft);color:var(--accent);font-size:10px;font-weight:800}
  .wear-outfit-button.equipped{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
  .product-mark{font-size:7px;letter-spacing:.7px;color:var(--accent);font-weight:850}
  .product-info{min-width:0}
  .provider-card button,.owned-service button{min-height:34px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--text);font-size:10px;font-weight:750}
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
  .owned-item>small{line-height:1.4}.inventory-boost{font-size:9px;line-height:1.45;color:var(--accent);font-weight:700}
  .lifestyle-note{font-size:9px;line-height:1.5;color:var(--muted);margin:0}
  .quiet{background:transparent!important}
  .purchase-dialog-backdrop{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(0,0,0,.72);overflow-y:auto}
  .purchase-dialog{position:relative;inset:auto;margin:auto;width:min(480px,100%);max-width:none;max-height:90dvh;overflow:auto;display:grid;gap:12px;padding:20px;border:1px solid var(--line-strong);border-radius:15px;background:var(--surface);color:var(--text);box-shadow:0 24px 80px rgba(0,0,0,.35)}
  .purchase-dialog h3{font-size:20px;line-height:1.2;margin:0}
  .purchase-dialog>p{font-size:10px;line-height:1.5;color:var(--muted);margin:0}
  .dialog-close{position:absolute;top:10px;right:10px;width:30px;height:30px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font-size:18px}
  .device-service{color:var(--accent)!important;font-weight:700}
  .dialog-total{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
  .dialog-total span{font-size:10px;color:var(--muted)}
  .dialog-total strong{font-size:17px;font-variant-numeric:tabular-nums}
  .dialog-actions{display:flex;justify-content:flex-end;gap:8px}
  .dialog-actions button{min-height:38px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font-size:10px;font-weight:750}
  .dialog-actions .primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
  .dialog-actions .secondary{background:transparent}
  .purchase-dialog :global(.game-choice){min-width:0}
  @media(max-width:520px){.lifestyle-heading{align-items:flex-start;flex-direction:column}.product-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.owned-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.market-product{min-height:126px}.purchase-dialog{padding:16px}.provider-card{gap:8px}.cart-line{grid-template-columns:minmax(0,1fr) auto}.cart-line>strong{grid-column:1/-1;text-align:right}}
</style>