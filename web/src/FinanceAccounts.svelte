<script lang="ts">
  import { addRecurringPayment, depositToAccount, getNetWorth, openBankAccount, setAutoDeposit, transferBetweenAccounts, withdrawFromAccount, formatCharacterMoney, getCreditProfile, getMinimumLoanRate } from './lib/simulation';
  import type { BankAccountType, Character } from './lib/types';
  import FinanceProducts from './FinanceProducts.svelte';
  import EmptyState from './components/EmptyState.svelte';
  import GameChoice from './GameChoice.svelte';
  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  let accountType = $state<BankAccountType>('checking');
  let fixedTermYears = $state('1');
  let accountName = $state('');
  let selectedAccount = $state('');
  let transferTarget = $state('');
  let amount = $state('100');
  let notice = $state('');
  let accountDialogOpen = $state(false);
  let depositMethod = $state<'fixed'|'percentage'>('percentage');
  let depositValue = $state('10');
  let autopayName = $state('');
  let autopayAmount = $state('100');
  let autopayCategory = $state<'subscription'|'bill'>('bill');
  let activeBankingView = $state<'accounts'|'cards'|'loans'|'savings'>('accounts');
  const accounts = $derived(character.bankAccounts ?? []);
  const accountProducts = [{ type: 'checking' as const, name: 'Everyday account', detail: 'Instant access · no interest' }, { type: 'savings' as const, name: 'Savings account', detail: '2% annual interest' }, { type: 'fixed-deposit' as const, name: 'Fixed deposit', detail: '4.5% annual interest · 1-year term' }];
  const creditProfile = $derived(getCreditProfile(character));
  const transactions = $derived([...(character.financialTransactions ?? [])].reverse().slice(0, 8));
  const selected = $derived(accounts.find((account) => account.id === selectedAccount) ?? accounts[0]);
  function createAccount(type: BankAccountType) { const names: Record<BankAccountType,string> = { checking: 'Everyday account', savings: 'Savings account', 'fixed-deposit': 'Fixed deposit' }; const next = openBankAccount(character, type, names[type], type === 'fixed-deposit' ? 1 : Number(fixedTermYears)); if (next === character) { notice = 'This account is unavailable or you already have this product.'; return; } onChange(next); notice = names[type] + ' opened.'; }
  function value() { const parsed = Number(amount); return Number.isFinite(parsed) ? Math.floor(parsed) : 0; }
  function deposit() { if (!selected) return; const next = depositToAccount(character, selected.id, value()); if (next === character) { notice = 'Check the amount and available cash.'; return; } onChange(next); notice = 'Deposit completed.'; }
  function withdraw() { if (!selected) return; const next = withdrawFromAccount(character, selected.id, value()); if (next === character) { notice = 'Check the amount and account balance.'; return; } onChange(next); notice = 'Withdrawal completed.'; }
  function transfer() { if (!selected) return; const target = transferTarget || accounts.find((account) => account.id !== selected.id)?.id; if (!target) { notice = 'Open another account to make a transfer.'; return; } const next = transferBetweenAccounts(character, selected.id, target, value()); if (next === character) { notice = 'Check the amount, source balance, and destination.'; return; } onChange(next); notice = 'Transfer completed.'; }
  function configureAutoDeposit() { if (!selected) return; const next = setAutoDeposit(character, selected.id, depositMethod, Number(depositValue)); if (next === character) { notice = 'Check the automatic deposit amount and account.'; return; } onChange(next); notice = 'Automatic deposit configured for ' + selected.name + '.'; }
  function configureAutopay() { if (!selected || selected.type === 'fixed-deposit') return; const next = addRecurringPayment(character, autopayName, valueFrom(autopayAmount), autopayCategory, 'account', selected.id); if (next === character) { notice = 'Check the payment name, amount and account eligibility.'; return; } onChange(next); notice = 'Automatic payment linked to ' + selected.name + '.'; autopayName = ''; }
  function valueFrom(raw: string) { const parsed = Number(raw); return Number.isFinite(parsed) ? Math.floor(parsed) : 0; }
</script>
<section class="bank-panel">
  <div class="panel-heading"><div><small>FINANCIAL FOUNDATION</small><h2>Banking</h2></div><div class="net-worth"><small>NET WORTH*</small><strong>{formatCharacterMoney(character, getNetWorth(character))}</strong></div></div>
  <nav class="banking-nav" aria-label="Banking services">
    <button class:active={activeBankingView==='accounts'} onclick={() => activeBankingView='accounts'}>Accounts</button>
    <button class:active={activeBankingView==='cards'} onclick={() => activeBankingView='cards'}>Cards</button>
    <button class:active={activeBankingView==='loans'} onclick={() => activeBankingView='loans'} disabled={character.age<18}>Loans</button>
    <button class:active={activeBankingView==='savings'} onclick={() => activeBankingView='savings'}>Savings & vault</button>
  </nav>
  {#if character.age >= 18}
    <section class="credit-profile" aria-label="Credit score">
      <div class="credit-profile-heading">
        <div><small>CREDIT HEALTH</small><h3>Credit score</h3><span class="credit-rating">{creditProfile.rating} credit</span></div>
        <div class="credit-score"><strong>{creditProfile.score}</strong><small>out of 850</small></div>
      </div>
      <div class="credit-score-track" role="meter" aria-label="Credit score" aria-valuemin="300" aria-valuemax="850" aria-valuenow={creditProfile.score}><span style={'width:' + ((creditProfile.score - 300) / 550 * 100) + '%'}></span></div>
      <div class="credit-score-scale"><span>300 · Poor</span><span>850 · Excellent</span></div>
      <div class="credit-factors">
        <div><small>Payment record</small><strong>{creditProfile.successfulPayments} on time · {creditProfile.missedPayments} missed</strong></div>
        <div><small>Credit use</small><strong>{creditProfile.utilization}%</strong></div>
        <div><small>Total debt</small><strong>{formatCharacterMoney(character, creditProfile.totalDebt)}</strong></div>
        <div><small>Debt / annual income</small><strong>{creditProfile.debtToIncome === null ? 'No income record' : creditProfile.debtToIncome + '%'}</strong></div>
      </div>
      <p class="credit-guidance">{creditProfile.missedPayments > 0 ? 'Missed repayments are lowering your score. Keep future installments funded and pay outstanding balances.' : creditProfile.utilization > 30 ? 'Your credit usage is high. Paying down card balances can improve your score.' : creditProfile.hasCreditHistory ? 'Your payment record is building. Keep balances manageable and repayments on time.' : 'Your file is new. Responsible borrowing and on-time repayments will establish your credit history.'}</p>
      <small class="credit-rate-hint">Minimum loan rates · Personal {Math.round(getMinimumLoanRate(character, 'personal') * 1000) / 10}% · Mortgage {Math.round(getMinimumLoanRate(character, 'mortgage') * 1000) / 10}% · Business {Math.round(getMinimumLoanRate(character, 'business') * 1000) / 10}%</small>
    </section>
  {/if}
  {#if activeBankingView === 'accounts'}
  <div class="balances"><div><small>Cash</small><strong>{formatCharacterMoney(character)}</strong></div><div><small>In accounts</small><strong>{formatCharacterMoney(character, accounts.reduce((sum, account) => sum + account.balance, 0))}</strong></div></div>
  <div class="account-list">
    {#each accounts as account (account.id)}
      <button type="button" class="account account-select" onclick={() => { selectedAccount = account.id; transferTarget = ''; accountDialogOpen = true; }}>
        <div class="account-icon">{account.type === 'savings' || account.type === 'fixed-deposit' ? '◇' : '▤'}</div>
        <div class="account-info"><strong>{account.name}</strong><small>{account.type === 'savings' ? 'Savings · 2% annual interest' : account.type === 'fixed-deposit' ? 'Fixed deposit · 4.5% annual · matures year ' + account.maturesAtYear : 'Everyday · instant access'}</small></div>
        <strong class="account-balance">{formatCharacterMoney(character, account.balance)}</strong>
      </button>
    {/each}
    {#each accountProducts.filter((product) => !accounts.some((account) => account.type === product.type)) as product (product.type)}
      <article class="account account-available">
        <div class="account-icon">＋</div>
        <div class="account-info"><strong>{product.name}</strong><small>{product.detail}</small></div>
        <span class="account-availability">Available</span>
        <button class="primary" disabled={character.age < 16 || accounts.length >= 8} onclick={() => createAccount(product.type)}>Open</button>
      </article>
    {/each}
    {#if accounts.length === 0 && character.age < 16}<EmptyState title="Banking unlocks at age 16" description="Available account products will appear here when your character is eligible." />{/if}
  </div>
  {#if accountDialogOpen && selected}
    <dialog open class="account-dialog" aria-label={selected.name + ' account'}>
      <div class="account-dialog-heading"><div><small>ACCOUNT DETAILS</small><h3>{selected.name}</h3><strong>{formatCharacterMoney(character, selected.balance)}</strong></div><button class="quiet" onclick={() => accountDialogOpen = false}>Close</button></div>
      <p class="hint">{selected.type === 'fixed-deposit' && character.year < (selected.maturesAtYear ?? Number.MAX_SAFE_INTEGER) ? 'Fixed deposits are locked until maturity. Withdrawals and outgoing payments become available after maturity.' : selected.type === 'fixed-deposit' ? 'This fixed deposit has matured. Withdrawals and outgoing payments are now available.' : selected.type === 'savings' ? 'Savings account · 2% annual interest. Transfers and withdrawals are available.' : 'Everyday account · instant access for transfers, withdrawals and recurring payments.'}</p>
      <label>Amount<input type="number" min="1" step="1" bind:value={amount} inputmode="numeric" /></label>
      <button class="primary" onclick={deposit}>Deposit cash</button>
      {#if selected.type !== 'fixed-deposit' || character.year >= (selected.maturesAtYear ?? Number.MAX_SAFE_INTEGER)}
        <button onclick={withdraw}>Withdraw cash</button>
        {#if accounts.length > 1}
          <div class="choice-field"><span>Transfer to</span><GameChoice label="Transfer destination" value={transferTarget} options={accounts.filter((account) => account.id !== selected.id).map((account) => ({value:account.id,label:account.name,detail:formatCharacterMoney(character,account.balance)}))} onSelect={(value) => transferTarget = value} columns={2}/></div>
          <button class="primary" onclick={transfer}>Transfer money</button>
        {/if}
        <div class="account-tools">
          <h4>Automatic payments</h4>
          <div class="form-grid"><label>Payment name<input bind:value={autopayName} placeholder="Rent, utility or subscription"/></label><label>Annual amount<input type="number" min="1" bind:value={autopayAmount}/></label></div>
          <div class="choice-field"><span>Payment type</span><GameChoice label="Automatic payment type" value={autopayCategory} options={[{value:'bill',label:'Bill'},{value:'subscription',label:'Subscription'}]} onSelect={(value) => autopayCategory = value as 'bill'|'subscription'} columns={2}/></div>
          <button onclick={configureAutopay}>Set up automatic payment</button>
        </div>
      {:else}
        <small class="hint">Maturity year: {selected.maturesAtYear}. Outgoing transfers, withdrawals and autopay unlock at maturity.</small>
      {/if}
      <div class="account-tools">
        <h4>Automatic deposit</h4>
        <div class="form-grid"><div class="choice-field"><span>Method</span><GameChoice label="Automatic deposit method" value={depositMethod} options={[{value:'percentage',label:'Percentage'},{value:'fixed',label:'Fixed amount'}]} onSelect={(value) => depositMethod = value as 'fixed'|'percentage'} columns={2}/></div><label>{depositMethod === 'percentage' ? 'Income percentage' : 'Amount per year'}<input type="number" min="1" max={depositMethod === 'percentage' ? 90 : 100000000} value={depositValue} oninput={(event) => depositValue = event.currentTarget.value}/></label></div>
        <button onclick={configureAutoDeposit}>Set automatic deposit</button>
      </div>

    </dialog>
  {/if}
  {#if notice}<p class="notice" role="status">{notice}</p>{/if}
  <div class="transactions"><h3>Recent money activity</h3>{#if transactions.length === 0}<EmptyState title="No money activity recorded" description="Deposits, withdrawals, transfers, income and interest appear here." />{:else}{#each transactions as transaction}<div class="transaction"><div><strong>{transaction.description}</strong><small>Age {transaction.age} · {transaction.year} · {transaction.from} → {transaction.to}</small></div><b>{transaction.amount ? formatCharacterMoney(character, transaction.amount) : '—'}</b></div>{/each}{/if}</div>
  <small class="hint">*Net worth includes cash, bank accounts, vault cash, property, investments and business value, less loans and credit-card balances. Values are simplified estimates.</small>
  {:else if activeBankingView === 'cards'}
    <FinanceProducts {character} {onChange} view="cards" />
  {:else if activeBankingView === 'loans'}
    <FinanceProducts {character} {onChange} view="loans" />
  {:else}
    <FinanceProducts {character} {onChange} view="savings" />
  {/if}
</section>
<style>
.banking-nav{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:thin}.banking-nav button{flex:none;min-height:40px;padding:0 12px;border:1px solid color-mix(in srgb,var(--line-strong) 12%, transparent);border-radius:9px;background:color-mix(in srgb,var(--surface-raised) 4%, transparent);color:var(--muted);font-size:11px;font-weight:650;white-space:nowrap}.banking-nav button.active{border-color:color-mix(in srgb,var(--accent) 45%, transparent);background:color-mix(in srgb,var(--accent-strong) 10%, transparent);color:var(--accent)}.banking-nav button:disabled{opacity:.35}.bank-panel{background:color-mix(in srgb,var(--surface-raised) 2.5%, transparent);border:1px solid color-mix(in srgb,var(--line-strong) 9%, transparent);border-radius:18px;padding:18px;margin:18px 0;color:var(--text)}.panel-heading,.balances,.account,.transaction{display:flex;align-items:center;justify-content:space-between;gap:12px}.panel-heading small,.balances small,.account-info small,.hint,.transaction small,.net-worth small{display:block;color:var(--muted);font-size:11px}h2{font-size:22px;margin:4px 0 0}.net-worth{text-align:right}.net-worth strong{display:block;font-size:17px;color:var(--accent);margin-top:4px}.balances{margin:16px 0;padding:12px;background:color-mix(in srgb,var(--surface-raised) 3.5%, transparent);border-radius:12px}.balances strong{display:block;margin-top:4px;font-size:15px}.account-list{display:grid;gap:8px}.account{padding:12px;border:1px solid color-mix(in srgb,var(--line-strong) 8%, transparent);border-radius:12px}.account-icon{width:34px;height:34px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent-strong) 12%, transparent);color:var(--accent);border-radius:10px}.account-info{flex:1;min-width:0}.account-info strong{display:block;font-size:14px}.account-balance{font-size:14px;white-space:nowrap}.account-select{width:100%;text-align:left;color:var(--text);cursor:pointer;background:var(--surface)}.account-availability{font-size:10px;color:var(--muted);white-space:nowrap}.account-dialog{position:static;display:grid;gap:10px;width:100%;max-width:none;max-height:none;margin:12px 0 0;padding:14px;border:1px solid var(--accent);border-radius:13px;background:var(--surface-raised);color:var(--text)}.account-dialog-heading{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.account-dialog-heading small{color:var(--muted);font-size:9px;letter-spacing:.08em}.account-dialog-heading h3{margin:3px 0;font-size:16px}.account-dialog-heading strong{font-size:20px}.account-tools{display:grid;gap:8px;padding-top:10px;border-top:1px solid var(--line)}.account-tools h4{margin:0;font-size:12px}.account-available{border-style:dashed}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.choice-field{display:grid;gap:5px;margin:8px 0;color:var(--muted);font-size:12px}.choice-field :global(label){margin:0}label{display:grid;gap:6px;font-size:12px;color:var(--muted);margin:8px 0}input{width:100%;min-width:0;padding:11px;border-radius:9px;border:1px solid color-mix(in srgb,var(--line-strong) 12%, transparent);background:var(--surface);color:var(--text);font:inherit}button{border:1px solid color-mix(in srgb,var(--line-strong) 12%, transparent);background:color-mix(in srgb,var(--surface-raised) 6%, transparent);color:var(--text);padding:10px 12px;border-radius:9px;font:inherit;font-size:12px;font-weight:650;cursor:pointer}.primary{background:var(--accent,var(--accent-strong));color:var(--on-accent);border:0}.hint{margin-top:8px;line-height:1.5}.notice{font-size:12px;color:var(--accent);margin:10px 0 0}.transactions{border-top:1px solid color-mix(in srgb,var(--line-strong) 8%, transparent);margin-top:16px;padding-top:12px}.transactions h3{font-size:14px;margin:0 0 8px}.transaction{padding:9px 0;border-bottom:1px solid color-mix(in srgb,var(--line-strong) 5%, transparent)}.transaction div{min-width:0}.transaction strong{display:block;font-size:12px;line-height:1.4}.transaction small{margin-top:3px;overflow-wrap:anywhere}.transaction b{font-size:12px;white-space:nowrap}@media(max-width:480px){.bank-panel{padding:13px}.form-grid{grid-template-columns:1fr}.panel-heading{align-items:flex-start}}

.credit-profile{display:grid;gap:10px;padding:15px;border:1px solid var(--line);border-radius:14px;background:var(--surface)}
.credit-profile-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}
.credit-profile-heading>div:first-child{display:grid;gap:3px}
.credit-profile-heading small,.credit-factors small,.credit-rate-hint{font-size:10px;color:var(--muted)}
.credit-profile-heading h3{font-size:16px;margin:0}
.credit-rating{font-size:11px;color:var(--success);font-weight:700}
.credit-score{text-align:right;display:grid;gap:0}
.credit-score strong{font-size:28px;line-height:1;font-variant-numeric:tabular-nums}
.credit-score-track{height:8px;border-radius:99px;background:var(--surface-raised);overflow:hidden}
.credit-score-track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--danger),var(--warning),var(--success));transition:width .2s ease}
.credit-score-scale{display:flex;justify-content:space-between;color:var(--muted);font-size:9px}
.credit-factors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.credit-factors>div{display:grid;gap:3px;padding:9px;border-radius:9px;background:var(--surface-raised);min-width:0}
.credit-factors strong{font-size:11px;overflow-wrap:anywhere}
.credit-guidance{margin:0;color:var(--muted);font-size:11px;line-height:1.5}
.credit-rate-hint{line-height:1.5}
@media(max-width:360px){.credit-factors{grid-template-columns:1fr}}
</style>