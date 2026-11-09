<script lang="ts">
  import { addRecurringPayment, cancelRecurringPayment, depositToVault, formatCharacterMoney, getCreditScore, getCreditProfile, getNetWorth, getMinimumLoanRate, getHouseholdBudget, setSavingsGoalMonths, issueBankCard, loadPrepaidCard, makeCardPurchase, redeemCardRewards, payCreditCard, repayLoan, setAutoDeposit, takeLoan, rejectLoanApplication, withdrawFromVault } from './lib/simulation';
  import type { Character, LoanType, PaymentSourceType, SavingsGoalMonths } from './lib/types';
  import GameChoice from './GameChoice.svelte';
  let { character, onChange, view = 'all' }: { character: Character; onChange: (next: Character) => void; view?: 'all' | 'cards' | 'loans' | 'bills' | 'savings' } = $props();
  let cardAccount = $state('');
  const cardProducts = [{id:'everyday-debit',name:'Everyday Debit',type:'debit' as const,description:'Direct spending from your everyday account.',creditLimit:0,apr:0,minimumCreditScore:0,minimumAssets:0,rewardsRate:0.005,brand:'NORTHSTAR BANK'},{id:'starter-credit',name:'Starter Credit',type:'credit' as const,description:'A first credit line for building a payment record.',creditLimit:5000,apr:0.24,minimumCreditScore:520,minimumAssets:0,rewardsRate:0.005,brand:'NORTHSTAR BANK'},{id:'rewards-credit',name:'Rewards Credit',type:'credit' as const,description:'Higher limit and stronger everyday rewards.',creditLimit:15000,apr:0.18,minimumCreditScore:680,minimumAssets:15000,rewardsRate:0.015,brand:'SUMMIT FINANCIAL'},{id:'premium-credit',name:'Premium Credit',type:'credit' as const,description:'Premium rewards for established, higher-asset customers.',creditLimit:50000,apr:0.14,minimumCreditScore:760,minimumAssets:75000,rewardsRate:0.02,brand:'SUMMIT FINANCIAL'},{id:'prepaid-travel',name:'Travel Prepaid',type:'prepaid' as const,description:'Preload funds for controlled spending. No credit line or interest.',creditLimit:0,apr:0,minimumCreditScore:0,minimumAssets:0,rewardsRate:0,brand:'NORTHSTAR BANK'}];
  let loanDialogOpen = $state(false);
  let loanType = $state<LoanType>('personal'); let loanName = $state(''); let loanAmount = $state('10000'); let loanRate = $state('11'); let loanTerm = $state('5'); let loanAccount = $state('');
  let recurringName = $state(''); let recurringAmount = $state('120'); let recurringCategory = $state<'subscription'|'bill'>('subscription'); let recurringSource = $state<PaymentSourceType>('cash'); let recurringSourceId = $state('');
  let depositMethod = $state<'fixed'|'percentage'>('percentage'); let depositValue = $state('10'); let depositAccount = $state('');
  let vaultAmount = $state('100'); let purchaseAmount = $state('100'); let purchaseDescription = $state('Purchase'); let selectedCard = $state(''); let cardPayAmount = $state('100'); let prepaidCardId = $state(''); let prepaidLoadAmount = $state('100'); let selectedLoan = $state(''); let loanPayAmount = $state('100');
  let notice = $state('');
  const accounts = $derived(character.bankAccounts ?? []); const cards = $derived([...(character.cards ?? [])].sort((left, right) => ['credit', 'debit', 'prepaid'].indexOf(left.type) - ['credit', 'debit', 'prepaid'].indexOf(right.type))); const loans = $derived((character.loans ?? []).filter((loan)=>loan.active)); const recurring = $derived((character.recurringPayments ?? []).filter((item)=>item.active));
  const householdBudget = $derived(getHouseholdBudget(character));
  const savingsGoalTarget = $derived(character.savingsGoalMonths ? Math.round((householdBudget.total / 12) * character.savingsGoalMonths) : 0);
  function updateSavingsGoal(value: SavingsGoalMonths | null) { onChange(setSavingsGoalMonths(character, value)); }
  const creditProfile = $derived(getCreditProfile(character));
  const annualIncome = $derived(character.lastYearIncome ?? character.employment?.annualSalary ?? 0);
  const loanRejectionReasons = $derived.by(() => {
    const reasons: string[] = [];
    const principal = n(loanAmount);
    if (character.age < 18) reasons.push('You must be at least 18.');
    if (creditProfile.score < 520) reasons.push('Credit score is below the 520 minimum.');
    if (loans.length >= 5) reasons.push('The five-active-loan limit has been reached.');
    if (annualIncome <= 0) reasons.push('No annual income is recorded to support repayments.');
    else if (principal > annualIncome * (loanType === 'business' ? 4 : 3)) reasons.push('Requested principal exceeds the income-based borrowing limit.');
    if (annualIncome > 0 && (creditProfile.totalDebt + principal) / annualIncome > 4) reasons.push('Total debt would exceed four times annual income.');
    if (!Number.isFinite(principal) || principal <= 0) reasons.push('Enter a valid loan amount.');
    if (!Number.isFinite(Number(loanRate)) || Number(loanRate) / 100 < minimumLoanRate) reasons.push('Offered rate is below the minimum for this credit score.');
    if (!Number.isInteger(n(loanTerm)) || n(loanTerm) < 1 || n(loanTerm) > 30) reasons.push('Choose a repayment term from 1 to 30 years.');
    if (loanAccount && !accounts.some((account) => account.id === loanAccount && account.type !== 'fixed-deposit')) reasons.push('The selected repayment account is unavailable.');
    return reasons;
  });
  const creditScore = $derived(getCreditScore(character)); const minimumLoanRate = $derived(getMinimumLoanRate(character,loanType));
  const creditTier = $derived(creditScore>=750?'Excellent':creditScore>=700?'Good':creditScore>=650?'Fair':creditScore>=600?'Weak':'Poor');
  const creditCards = $derived(cards.filter((card)=>card.type==='credit' && card.active)); const prepaidCards = $derived(cards.filter((card)=>card.type==='prepaid' && card.active)); const paymentCards = $derived(cards.filter((card)=>card.active));
  function n(value:string){const v=Number(value);return Number.isFinite(v)?Math.floor(v):0}
  function run(action:()=>Character,success:string){const next=action();if(next===character){notice='The action could not be completed. Check eligibility, balances, limits and selected accounts.';return;}onChange(next);notice=success;}
  function canApplyCard(product: typeof cardProducts[number]) { return character.age >= (product.type === 'credit' ? 18 : 16) && cards.length < 6 && (product.type !== 'debit' || !!cardAccount) && creditScore >= product.minimumCreditScore && getNetWorth(character) >= product.minimumAssets * (character.currencyScale ?? 1) && !cards.some((card) => card.productId === product.id); }
  function applyCard(product: typeof cardProducts[number]) { const scale = character.currencyScale ?? 1; run(() => issueBankCard(character, product.type, product.name, cardAccount || undefined, Math.round(product.creditLimit * scale), { id: product.id, minimumCreditScore: product.minimumCreditScore, minimumAssets: Math.round(product.minimumAssets * scale), annualInterestRate: product.apr, rewardsRate: product.rewardsRate }), product.name + ' issued.'); }
  function createLoan(){
    if (loanRejectionReasons.length) {
      const reason = loanRejectionReasons.join(' ');
      onChange(rejectLoanApplication(character, reason));
      notice = 'Loan application rejected. ' + reason + ' Credit score decreased by 25 points.';
      loanDialogOpen = false;
      return;
    }
    const next = takeLoan(character,loanType,loanName,n(loanAmount),Number(loanRate)/100,n(loanTerm),loanAccount||undefined);
    if (next === character) {
      const reason = 'The lender could not verify the submitted application.';
      onChange(rejectLoanApplication(character, reason));
      notice = 'Loan application rejected. ' + reason + ' Credit score decreased by 25 points.';
    } else {
      onChange(next);
      notice = 'Loan approved. Proceeds were added to cash.';
      loanName = '';
    }
    loanDialogOpen = false;
  }
  function createRecurring(){run(()=>addRecurringPayment(character,recurringName,n(recurringAmount),recurringCategory,recurringSource,recurringSourceId||undefined),'Recurring payment saved.');recurringName='';}
  function createAutoDeposit(){run(()=>setAutoDeposit(character,depositAccount,depositMethod,n(depositValue)),'Automatic deposit configured.');}
  function depositVault(){run(()=>depositToVault(character,n(vaultAmount)),'Cash stored in your personal safe.');}
  function withdrawVault(){run(()=>withdrawFromVault(character,n(vaultAmount)),'Cash withdrawn from your personal safe.');}
  function buy(){run(()=>makeCardPurchase(character,selectedCard,n(purchaseAmount),purchaseDescription||'Card purchase'),'Purchase recorded.');}
  function loadPrepaid(){const card=prepaidCards.find((item)=>item.id===prepaidCardId);if(!card)return;run(()=>loadPrepaidCard(character,card.id,n(prepaidLoadAmount),card.linkedAccountId?'account':'cash',card.linkedAccountId),'Prepaid card loaded.');}
  function redeemRewards(cardId:string){run(()=>redeemCardRewards(character,cardId),'Card rewards credited to cash.');}
  function payCard(){const card=creditCards.find((item)=>item.id===selectedCard);if(!card)return;run(()=>payCreditCard(character,card.id,n(cardPayAmount),card.linkedAccountId?'account':'cash',card.linkedAccountId),'Card payment completed.');}
  function payLoan(){const loan=loans.find((item)=>item.id===selectedLoan);if(!loan)return;run(()=>repayLoan(character,loan.id,n(loanPayAmount),loan.paymentAccountId?'account':'cash',loan.paymentAccountId),'Loan payment completed.');}
</script>
<section class="products-panel">
  <div class="products-title"><div><small>{view === 'cards' ? 'BANK CARDS' : view === 'loans' ? 'CREDIT SERVICES' : view === 'bills' ? 'RECURRING PAYMENTS' : view === 'savings' ? 'SAVINGS TOOLS' : 'FINANCIAL TOOLS'}</small><h2>{view === 'cards' ? 'Cards' : view === 'loans' ? 'Loans' : view === 'bills' ? 'Bills & subscriptions' : view === 'savings' ? 'Automatic savings & vault' : 'Credit, payments & savings'}</h2></div>{#if view === 'all' || view === 'savings'}<span class="vault-total">Safe · {formatCharacterMoney(character,character.vaultBalance??0)}</span>{/if}</div>
  {#if view === 'all' || view === 'cards'}
  <section class="cards-section"><h3>Your cards <small>{cards.length}/6</small></h3>
    {#each cards as card}<div class="product-row"><div><strong>{card.name}</strong><small>{card.type==='credit'?'Credit · '+formatCharacterMoney(character,card.balance)+' owed / '+formatCharacterMoney(character,card.creditLimit)+' limit':card.type==='prepaid'?'Prepaid · '+formatCharacterMoney(character,card.balance)+' available':'Debit · linked to '+(accounts.find((a)=>a.id===card.linkedAccountId)?.name??'unavailable account')} · rewards {formatCharacterMoney(character,card.rewardBalance??0)}</small></div><b>{card.type==='credit'?formatCharacterMoney(character,Math.max(0,card.creditLimit-card.balance))+' available':card.type==='prepaid'?formatCharacterMoney(character,card.balance)+' stored':'Active'}</b></div>{/each}
    {#each cards.filter((card) => card.active && (card.rewardBalance ?? 0) >= 1) as card}<div class="product-row"><div><strong>{card.name} rewards</strong><small>{formatCharacterMoney(character,card.rewardBalance??0)} available to redeem</small></div><button onclick={()=>redeemRewards(card.id)}>Redeem</button></div>{/each}
    <div class="choice-field"><span>Default linked account for new cards</span><GameChoice label="Card funding and repayment account" value={cardAccount} options={[{value:'',label:'Choose account'},...accounts.filter((a)=>a.type!=='fixed-deposit').map((a) => ({value:a.id,label:a.name,detail:formatCharacterMoney(character,a.balance)}))]} onSelect={(value) => cardAccount = value} columns={2}/></div>
    <h3 class="catalogue-heading">Available cards</h3>
    <div class="card-catalogue">
      {#each cardProducts as product (product.id)}
        {@const owned = cards.find((card) => card.productId === product.id)}
        {@const eligible = canApplyCard(product)}
        <article class="bank-card-product">
          <div class="bank-card-face"><div class="bank-card-top"><strong>{product.brand}</strong><span>{product.type.toUpperCase()}</span></div><div class="bank-card-chip"></div><strong>{product.name}</strong><small>•••• •••• •••• {String(1200 + cardProducts.indexOf(product) * 137).slice(-4)}</small><div class="bank-card-bottom"><span>{product.type === 'credit' ? 'CREDIT LINE' : product.type === 'debit' ? 'ACCOUNT LINKED' : 'PREPAID'}</span><span>{product.type === 'credit' ? (product.apr*100).toFixed(1)+'% APR' : 'NO APR'}</span></div></div>
          <div class="bank-card-terms"><strong>{product.name}</strong><p>{product.description}</p><div><span>Credit limit</span><b>{product.type === 'credit' ? formatCharacterMoney(character, product.creditLimit * (character.currencyScale ?? 1)) : '—'}</b></div><div><span>APR</span><b>{product.type === 'credit' ? (product.apr*100).toFixed(1)+'%' : 'None'}</b></div><div><span>Minimum credit score</span><b>{product.minimumCreditScore || 'Not required'}</b></div><div><span>Minimum assets</span><b>{product.minimumAssets ? formatCharacterMoney(character,product.minimumAssets*(character.currencyScale??1)) : 'None'}</b></div><div><span>Rewards</span><b>{(product.rewardsRate*100).toFixed(1)}%</b></div>
            <button class="primary" disabled={!!owned || !eligible} onclick={() => applyCard(product)}>{owned ? 'Applied' : eligible ? 'Apply' : product.type === 'debit' && !cardAccount ? 'Choose an account' : 'Requirements not met'}</button>
            {#if !owned && !eligible}<small class="hint">{product.type === 'credit' && creditScore < product.minimumCreditScore ? 'Requires credit score '+product.minimumCreditScore+'.' : getNetWorth(character) < product.minimumAssets * (character.currencyScale ?? 1) ? 'Requires higher total assets.' : cards.length >= 6 ? 'Card limit reached.' : 'Not currently eligible.'}</small>{/if}
          </div>
        </article>
      {/each}
    </div>
    {#if cards.length>0}<div class="form-grid"><div class="choice-field"><span>Record purchase with</span><GameChoice label="Purchase card" value={selectedCard} options={[{value:'',label:'Choose card'},...cards.filter((card)=>card.active).map((card) => ({value:card.id,label:card.name,detail:card.type}))]} onSelect={(value) => selectedCard = value} columns={2}/></div><label>Amount<input type="number" min="1" bind:value={purchaseAmount}/></label></div><label>Purchase description<input bind:value={purchaseDescription}/></label><button onclick={buy}>Record card purchase</button>{/if}
    {#if prepaidCards.length>0}<div class="form-grid"><div class="choice-field"><span>Load prepaid card</span><GameChoice label="Prepaid card" value={prepaidCardId} options={[{value:'',label:'Choose prepaid card'},...prepaidCards.map((card) => ({value:card.id,label:card.name,detail:formatCharacterMoney(character,card.balance)}))]} onSelect={(value) => prepaidCardId = value} columns={2}/></div><label>Load amount<input type="number" min="1" bind:value={prepaidLoadAmount}/></label></div><button onclick={loadPrepaid}>Load prepaid card</button>{/if}
    {#if creditCards.length>0}<div class="form-grid"><div class="choice-field"><span>Pay credit card</span><GameChoice label="Credit card to pay" value={selectedCard} options={[{value:'',label:'Choose card'},...creditCards.map((card) => ({value:card.id,label:card.name,detail:formatCharacterMoney(character,card.balance)+' owed'}))]} onSelect={(value) => selectedCard = value} columns={2}/></div><label>Payment amount<input type="number" min="1" bind:value={cardPayAmount}/></label></div><button onclick={payCard}>Pay card balance</button>{/if}
  </section>
  {/if}
  {#if view === 'all' || view === 'loans'}
  <section class="loan-section">
    <div class="loan-section-heading"><div><strong>Active loans</strong><small>{loans.length} of 5 active</small></div><button class="primary" onclick={() => loanDialogOpen = true} disabled={character.age < 18 || loans.length >= 5}>Apply for a loan</button></div>
    {#if loans.length}
      <div class="loan-list">{#each loans as loan (loan.id)}
        <article class="loan-row"><div class="loan-row-main"><div><strong>{loan.name}</strong><small>{loan.type} · {loan.termYears}-year term</small></div><b>{formatCharacterMoney(character,loan.balance)} owed</b></div><div class="loan-meta"><span>Original {formatCharacterMoney(character,loan.principal)}</span><span>{(loan.annualInterestRate*100).toFixed(1)}% APR</span><span>{Math.round((1-loan.balance/Math.max(1,loan.principal))*100)}% repaid</span></div><div class="loan-progress"><span style={'width:' + Math.max(0,Math.min(100,(1-loan.balance/Math.max(1,loan.principal))*100)) + '%'}></span></div></article>
      {/each}</div>
      <div class="form-grid"><div class="choice-field"><span>Repay loan</span><GameChoice label="Loan to repay" value={selectedLoan} options={[{value:'',label:'Choose loan'},...loans.map((loan) => ({value:loan.id,label:loan.name,detail:formatCharacterMoney(character,loan.balance)+' owed'}))]} onSelect={(value) => selectedLoan = value} columns={2}/></div><label>Repayment amount<input type="number" min="1" bind:value={loanPayAmount}/></label></div>
      <button onclick={payLoan}>Make extra repayment</button>
    {:else}
      <p class="hint">No active loans. Applications are assessed against income, existing debt, credit standing and repayment terms.</p>
    {/if}
    {#if loanDialogOpen}
      <div class="loan-dialog-backdrop"><dialog open class="loan-dialog" aria-label="Apply for a loan">
        <div class="loan-dialog-heading"><div><small>NEW CREDIT APPLICATION</small><h3>Apply for a loan</h3></div><button class="quiet" onclick={() => loanDialogOpen = false}>Close</button></div>
        <div class="loan-dialog-score"><span>Current credit score</span><strong>{creditScore} · {creditTier}</strong></div>
        <div class="form-grid">
          <div class="choice-field"><span>Loan type</span><GameChoice label="Loan type" value={loanType} options={[{value:'personal',label:'Personal',detail:'Individual borrowing'},{value:'mortgage',label:'Mortgage',detail:'Property financing'},{value:'business',label:'Business',detail:'Business capital'}]} onSelect={(value) => loanType = value as LoanType} columns={3}/></div>
          <label>Name<input bind:value={loanName} placeholder="Personal loan"/></label>
          <label>Principal<input type="number" min="1" bind:value={loanAmount}/></label>
          <label>Annual interest %<input type="number" min="0" max="50" step="0.5" bind:value={loanRate}/></label>
          <label>Term (years)<input type="number" min="1" max="30" bind:value={loanTerm}/></label>
          <div class="choice-field"><span>Repayment account</span><GameChoice label="Repayment account" value={loanAccount} options={[{value:'',label:'Use cash'},...accounts.filter((account)=>account.type!=='fixed-deposit').map((account) => ({value:account.id,label:account.name,detail:formatCharacterMoney(character,account.balance)}))]} onSelect={(value) => loanAccount = value} columns={2}/></div>
        </div>
        <div class="loan-criteria"><strong>Application assessment</strong>{#if loanRejectionReasons.length}<ul>{#each loanRejectionReasons as reason}<li class="criteria-fail">{reason}</li>{/each}</ul>{:else}<p class="criteria-pass">The application meets the displayed basic criteria. Final approval is recorded when submitted.</p>{/if}<small>Minimum rate for this score: {(minimumLoanRate*100).toFixed(1)}%. A rejected application reduces your credit score by 25 points.</small></div>
        <div class="loan-dialog-actions"><button onclick={() => loanDialogOpen = false}>Cancel</button><button class="primary" onclick={createLoan}>Submit application</button></div>
      </dialog></div>
    {/if}
    <small class="hint">Annual interest and scheduled installments are settled during year progression. Missed installments remain outstanding and reduce credit standing.</small>
  </section>
  {/if}
  {#if view === 'all' || view === 'bills'}
  <details open={view !== 'all'}><summary>Subscriptions & recurring bills <span>{recurring.length}/12 active</span></summary>
    {#each recurring as item}<div class="product-row"><div><strong>{item.name}</strong><small>{item.category} · {item.sourceType} · {formatCharacterMoney(character,item.amount)} / year</small></div><button class="quiet" onclick={()=>run(()=>cancelRecurringPayment(character,item.id),'Recurring payment cancelled.')}>Cancel</button></div>{/each}
    <div class="form-grid"><label>Name<input bind:value={recurringName} placeholder="Music subscription"/></label><label>Annual amount<input type="number" min="1" bind:value={recurringAmount}/></label><div class="choice-field"><span>Category</span><GameChoice label="Recurring payment category" value={recurringCategory} options={[{value:'subscription',label:'Subscription',detail:'Optional service or membership'},{value:'bill',label:'Recurring bill',detail:'Regular household expense'}]} onSelect={(value) => recurringCategory = value as 'subscription'|'bill'} columns={2} compact/></div><div class="choice-field"><span>Payment source</span><GameChoice label="Recurring payment source" value={recurringSource} options={[{value:'cash',label:'Cash'},{value:'account',label:'Bank account'},{value:'card',label:'Payment card'}]} onSelect={(value) => { recurringSource = value as PaymentSourceType; recurringSourceId = ''; }} columns={3} compact/></div></div>
    {#if recurringSource==='account'}<div class="choice-field"><span>Account</span><GameChoice label="Recurring payment account" value={recurringSourceId} options={[{value:'',label:'Choose account'},...accounts.filter((a)=>a.type!=='fixed-deposit').map((a) => ({value:a.id,label:a.name,detail:formatCharacterMoney(character,a.balance)}))]} onSelect={(value) => recurringSourceId = value} columns={2}/></div>{:else if recurringSource==='card'}<div class="choice-field"><span>Payment card</span><GameChoice label="Recurring payment card" value={recurringSourceId} options={[{value:'',label:'Choose card'},...paymentCards.map((card) => ({value:card.id,label:card.name,detail:card.type}))]} onSelect={(value) => recurringSourceId = value} columns={2}/></div>{/if}
    <button class="primary" onclick={createRecurring} disabled={recurring.length>=12}>Add recurring payment</button><small class="hint">Charges run once per simulated year. Failed cash/account charges are logged as missed and do not create debt. Credit cards use available credit; prepaid cards use their loaded balance.</small>
  </details>
  {/if}
  {#if view === 'all' || view === 'savings'}
  <details open={view !== 'all'}><summary>Automatic savings deposits</summary>
    <div class="form-grid"><div class="choice-field"><span>Destination account</span><GameChoice label="Savings destination" value={depositAccount} options={[{value:'',label:'Choose account'},...accounts.map((a) => ({value:a.id,label:a.name,detail:formatCharacterMoney(character,a.balance)}))]} onSelect={(value) => depositAccount = value} columns={2}/></div><div class="choice-field"><span>Deposit method</span><GameChoice label="Automatic savings method" value={depositMethod} options={[{value:'percentage',label:'Percentage',detail:'Save a share of income'},{value:'fixed',label:'Fixed amount',detail:'Save a set amount each year'}]} onSelect={(value) => depositMethod = value as 'fixed'|'percentage'} columns={2}/></div><label>{depositMethod==='percentage'?'Percentage (1–90)':'Amount per year'}<input type="number" min="1" max={depositMethod==='percentage'?90:100000000} bind:value={depositValue}/></label></div>
    <button class="primary" onclick={createAutoDeposit} disabled={!depositAccount}>Save automatic deposit</button><small class="hint">Applied after annual income and household expenses, only when cash is sufficient.</small>
  </details>
  <details open={view !== 'all'}><summary>Emergency savings target</summary>
    <p class="hint">Set a target based on one, three, or six months of estimated living costs.</p>
    <div class="action-row">
      {#each [1,3,6] as months}
        <button class:goal-active={character.savingsGoalMonths===months} disabled={character.age<18} onclick={() => updateSavingsGoal(months as SavingsGoalMonths)}>{months} month{months===1?'':'s'}</button>
      {/each}
    </div>
    <button class="quiet" disabled={character.age<18} onclick={() => updateSavingsGoal(null)}>No savings target</button>
    {#if character.age<18}<small class="hint">Emergency savings targets unlock at age 18.</small>{/if}
    {#if character.savingsGoalMonths}
      <div class="vault-balance"><small>TARGET · {character.savingsGoalMonths} MONTHS</small><strong>{formatCharacterMoney(character,savingsGoalTarget)}</strong><small>Cash balance · {formatCharacterMoney(character)}</small></div>
      <div class="savings-progress"><span style="width:{Math.min(100,Math.round(character.money/Math.max(1,savingsGoalTarget)*100))}%"></span></div>
      <small class="hint">{Math.min(100,Math.round(character.money/Math.max(1,savingsGoalTarget)*100))}% of your target.</small>
    {/if}
  </details>
  <details open={view !== 'all'}><summary>Personal safe / vault</summary>
    <div class="vault-balance"><small>STORED SECURELY</small><strong>{formatCharacterMoney(character,character.vaultBalance??0)}</strong></div>
    <label>Amount<input type="number" min="1" bind:value={vaultAmount}/></label><div class="action-row"><button onclick={depositVault}>Store cash</button><button onclick={withdrawVault}>Withdraw cash</button></div><small class="hint">The safe holds physical cash. It earns no interest and is included in net worth.</small>
  </details>
  {/if}
  {#if notice}<p class="notice" role="status">{notice}</p>{/if}
</section>
<style>
.card-catalogue{display:grid;gap:10px;margin:12px 0}.bank-card-product{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;padding:10px;border:1px solid var(--line);border-radius:13px}.bank-card-face{min-height:150px;padding:13px;border-radius:12px;background:linear-gradient(135deg,#182c42,#31546a 58%,#172a3b);color:#fff;display:flex;flex-direction:column;justify-content:space-between;gap:10px;box-shadow:0 8px 20px #0003}.bank-card-top,.bank-card-bottom{display:flex;justify-content:space-between;gap:8px;font-size:9px;letter-spacing:.08em}.bank-card-face>strong{font-size:15px}.bank-card-face>small{letter-spacing:.16em;font-size:10px}.bank-card-chip{width:27px;height:20px;border-radius:5px;background:linear-gradient(135deg,#d8c78c,#8e805c);border:1px solid #f1e2ad}.bank-card-terms{display:grid;align-content:start;gap:5px;min-width:0}.bank-card-terms>strong{font-size:13px}.bank-card-terms p{font-size:10px;color:var(--muted);margin:0 0 4px}.bank-card-terms>div{display:flex;justify-content:space-between;gap:6px;font-size:10px}.bank-card-terms>div span{color:var(--muted)}.bank-card-terms button{margin-top:5px}.products-panel{border:1px solid color-mix(in srgb,var(--line-strong) 9%, transparent);border-radius:16px;padding:16px;margin:16px 0;background:color-mix(in srgb,var(--surface-raised) 2%, transparent)}.credit-score{display:flex;align-items:center;gap:12px;padding:10px;margin:10px 0;border-radius:10px;background:color-mix(in srgb,var(--surface-raised) 4%, transparent)}.credit-score>div{min-width:76px}.credit-score small,.credit-score span{display:block;color:var(--muted);font-size:9px}.credit-score strong{display:block;font-size:21px;margin:2px 0}.credit-score p{font-size:10px;line-height:1.45;color:var(--muted);margin:0}.products-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}.products-title small,.vault-total,.hint,.product-row small,.vault-balance small{color:var(--muted);font-size:11px}.products-title h2{font-size:17px;margin:3px 0}.cards-section{display:grid;gap:8px;margin:10px 0}.cards-section h3{display:flex;justify-content:space-between;font-size:13px;margin:0}.cards-section h3 small{color:var(--muted);font-size:10px;font-weight:500}.loan-section{display:grid;gap:12px}.loan-section-heading,.loan-row-main,.loan-meta,.loan-dialog-heading,.loan-dialog-actions{display:flex;align-items:center;justify-content:space-between;gap:10px}.loan-section-heading>div{display:grid;gap:3px}.loan-section-heading strong{font-size:14px}.loan-section-heading small,.loan-meta,.loan-dialog-heading small,.loan-dialog-score span{font-size:10px;color:var(--muted)}.loan-list{display:grid;gap:8px}.loan-row{padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--surface)}.loan-row-main strong,.loan-row-main small{display:block}.loan-row-main strong{font-size:12px}.loan-row-main small{font-size:10px;color:var(--muted);margin-top:3px}.loan-row-main b{font-size:13px;white-space:nowrap}.loan-meta{flex-wrap:wrap;margin:9px 0 6px}.loan-progress{height:6px;border-radius:99px;background:var(--surface-raised);overflow:hidden}.loan-progress span{display:block;height:100%;background:var(--success);border-radius:inherit}.catalogue-heading{font-size:13px;margin:12px 0 0}.loan-dialog-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:14px;background:#0009}.loan-dialog{position:relative;display:grid;gap:12px;width:min(100%,560px);max-height:90vh;overflow:auto;margin:0;padding:14px;border:1px solid var(--accent);border-radius:13px;background:var(--surface-raised);color:var(--text)}.loan-dialog-heading h3{margin:3px 0;font-size:17px}.loan-dialog-score{display:flex;justify-content:space-between;gap:8px;padding:9px;border-radius:8px;background:var(--surface)}.loan-dialog-score strong{font-size:12px}.loan-criteria{padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--surface)}.loan-criteria>strong{font-size:12px}.loan-criteria ul{padding-left:18px;margin:7px 0}.loan-criteria li,.loan-criteria p,.loan-criteria small{font-size:10px;line-height:1.5}.criteria-fail{color:var(--danger);margin:3px 0}.criteria-pass{color:var(--success);margin:7px 0}.loan-criteria small{color:var(--muted)}.loan-dialog-actions{justify-content:flex-end}.products-panel details{border-top:1px solid color-mix(in srgb,var(--line-strong) 8%, transparent);padding:12px 0}.products-panel summary{cursor:pointer;font-size:13px;font-weight:700;display:flex;justify-content:space-between}.products-panel summary span{color:var(--muted);font-weight:500}.product-row{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid color-mix(in srgb,var(--line-strong) 5%, transparent)}.product-row strong,.product-row small{display:block}.product-row strong{font-size:12px}.product-row small{margin-top:3px}.product-row b{font-size:12px;white-space:nowrap}.choice-field{display:grid;gap:5px;margin:8px 0;color:var(--muted);font-size:11px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}label{display:grid;gap:5px;margin:9px 0;color:var(--muted);font-size:11px}input{width:100%;min-width:0;padding:10px;border:1px solid color-mix(in srgb,var(--line-strong) 13%, transparent);border-radius:8px;background:var(--surface);color:var(--text);font:inherit;font-size:12px}.products-panel button{padding:9px 12px;border-radius:8px;border:1px solid color-mix(in srgb,var(--line-strong) 13%, transparent);background:color-mix(in srgb,var(--surface-raised) 6%, transparent);color:inherit;font-size:11px;font-weight:650}.products-panel button.primary{background:var(--accent,var(--accent-strong));color:var(--on-accent);border:0}.products-panel button.quiet{padding:5px 8px}.action-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.vault-balance{padding:12px;border-radius:10px;background:color-mix(in srgb,var(--surface-raised) 3.5%, transparent)}.vault-balance strong{display:block;font-size:17px;margin-top:4px}.goal-active{border-color:var(--accent)!important;color:var(--accent)!important;background:color-mix(in srgb,var(--accent-strong) 10%, transparent)!important}.savings-progress{height:7px;margin-top:9px;border-radius:9px;background:color-mix(in srgb,var(--surface-raised) 8%, transparent);overflow:hidden}.savings-progress span{display:block;height:100%;border-radius:inherit;background:var(--accent,var(--accent-strong))}.hint{display:block;line-height:1.5;margin:8px 0}.notice{font-size:12px;color:var(--accent)}@media(max-width:560px){.loan-section-heading{align-items:flex-start;flex-direction:column}.loan-row-main{align-items:flex-start}.bank-card-product{grid-template-columns:1fr}.bank-card-face{min-height:145px}}@media(max-width:460px){.products-panel{padding:12px}.form-grid{grid-template-columns:1fr}.products-title{align-items:flex-start;flex-direction:column}}
</style>