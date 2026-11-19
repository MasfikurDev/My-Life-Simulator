<script lang="ts">
  import UiBadge from './UiBadge.svelte';
  import type { WeeklyActivityOutcomeEffect } from '../lib/simulation';

  let {
    effects = [],
    staminaCost = 0,
    formatMoney
  }: {
    effects?: WeeklyActivityOutcomeEffect[];
    staminaCost?: number;
    formatMoney?: (amount: number) => string;
  } = $props();
</script>

<div class="activity-effect-badges" aria-label="Expected activity effects">
  {#if staminaCost > 0}
    <UiBadge tone="danger" size="tiny">−{staminaCost} stamina</UiBadge>
  {/if}
  {#each effects as effect (effect.key)}
    <UiBadge tone={effect.tone} size="tiny">
      {effect.delta > 0 ? '+' : '−'}{Math.abs(Number(effect.delta.toFixed(1)))}
      {#if effect.kind === 'money'}{formatMoney ? formatMoney(Math.abs(effect.delta)) : ' cash'}{:else} {effect.label}{/if}
    </UiBadge>
  {/each}
</div>

<style lang="scss">
  .activity-effect-badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }

  .activity-effect-badges :global(.ui-badge) {
    max-width: 100%;
  }
</style>
