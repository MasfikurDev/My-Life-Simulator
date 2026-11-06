<script lang="ts">
  import { formatCharacterMoney, getHouseholdBudget, setHouseholdArrangement } from './lib/simulation';
  import type { Character, HouseholdArrangement } from './lib/types';
  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  const budget = $derived(getHouseholdBudget(character));
  function changeArrangement(value: HouseholdArrangement) { onChange(setHouseholdArrangement(character, value)); }
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

</div>
