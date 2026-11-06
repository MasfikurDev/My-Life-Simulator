<script lang="ts">
  import { formatCharacterMoney, getHouseholdBudget, setHouseholdArrangement, setSavingsGoalMonths } from './lib/simulation';
  import type { Character, HouseholdArrangement, SavingsGoalMonths } from './lib/types';
  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  const budget = $derived(getHouseholdBudget(character));
  const goalTarget = $derived(character.savingsGoalMonths ? Math.round((budget.total / 12) * character.savingsGoalMonths) : 0);
  function changeArrangement(value: HouseholdArrangement) { onChange(setHouseholdArrangement(character, value)); }
  function changeGoal(value: SavingsGoalMonths | null) { onChange(setSavingsGoalMonths(character, value)); }
</script>

<div class="living-costs">
  <section class="household-budget-panel">
    <div class="section-heading"><div><span class="section-index">01</span><h3>Living arrangement</h3></div></div>
    <p class="finance-footnote">Choose how you live. The estimate is settled when you advance the year.</p>
    <div class="household-choice-grid">
      <button class:finance-choice-active={character.householdArrangement==='family-supported'} class="finance-choice" onclick={() => changeArrangement('family-supported')}><strong>Family-supported</strong><small>Shared family support; lowest personal costs.</small></button>
      <button class:finance-choice-active={character.householdArrangement==='shared'} class="finance-choice" onclick={() => changeArrangement('shared')}><strong>Shared household</strong><small>Split housing and household bills.</small></button>
      <button class:finance-choice-active={character.householdArrangement==='independent'} class="finance-choice" onclick={() => changeArrangement('independent')}><strong>Independent</strong><small>Cover your own housing and living costs.</small></button>
    </div>
    <div class="section-heading"><div><span class="section-index">02</span><h3>Estimated annual costs</h3></div><span class="section-hint">{character.employment ? 'Based on current income' : 'Unemployed baseline'}</span></div>
    <div class="household-budget-grid">
      {#each [{label:'Housing',value:budget.housing},{label:'Food',value:budget.food},{label:'Transport',value:budget.transport},{label:'Utilities',value:budget.utilities},{label:'Personal',value:budget.personal}] as item}
        <div><span>{item.label}</span><strong>{formatCharacterMoney(character,item.value)}</strong></div>
      {/each}
      <div class="budget-total"><span>Total planned costs</span><strong>{formatCharacterMoney(character,budget.total)}</strong></div>
    </div>
    <div class="employment-pay-grid">
      <div><small>ANNUAL INCOME</small><strong>{formatCharacterMoney(character,character.employment?.annualSalary ?? 0)}</strong></div>
      <div><small>LAST YEAR PAID</small><strong>{formatCharacterMoney(character,character.lastYearExpenses ?? 0)}</strong></div>
      <div><small>LAST YEAR SHORTFALL</small><strong>{formatCharacterMoney(character,character.lastYearShortfall ?? 0)}</strong></div>
      <div><small>LAST YEAR INCOME</small><strong>{formatCharacterMoney(character,character.lastYearIncome ?? 0)}</strong></div>
    </div>
    {#if (character.lastYearShortfall ?? 0) > 0}<p class="finance-pressure-note">Last year, available funds did not cover all estimated costs. The unpaid amount is recorded as a shortfall, not debt.</p>{:else if !character.employment}<p class="finance-footnote">No job income is currently recorded. Costs are paid from available funds where possible.</p>{/if}
  </section>
  <section class="household-budget-panel savings-goal-panel">
    <div class="section-heading"><div><span class="section-index">03</span><h3>Emergency savings target</h3></div></div>
    <p class="finance-footnote">Set a target of one, three, or six months of estimated living costs. Progress uses your current available balance.</p>
    <div class="savings-choice-row">
      {#each [1,3,6] as months}
        <button class:finance-choice-active={character.savingsGoalMonths===months} class="finance-choice savings-choice" onclick={() => changeGoal(months as SavingsGoalMonths)}>{months} month{months===1?'':'s'}</button>
      {/each}
      <button class:finance-choice-active={character.savingsGoalMonths===null || character.savingsGoalMonths===undefined} class="finance-choice savings-choice" onclick={() => changeGoal(null)}>No goal</button>
    </div>
    {#if character.savingsGoalMonths}
      <div class="savings-progress-row"><div><small>TARGET</small><strong>{formatCharacterMoney(character,goalTarget)}</strong></div><div><small>CURRENT BALANCE</small><strong>{formatCharacterMoney(character)}</strong></div></div>
      <div class="career-performance-meter"><span style="width:{Math.min(100,Math.round(character.money/Math.max(1,goalTarget)*100))}%"></span></div>
      <p class="finance-footnote">{Math.min(100,Math.round(character.money/Math.max(1,goalTarget)*100))}% of your selected target.</p>
    {/if}
  </section>
</div>
