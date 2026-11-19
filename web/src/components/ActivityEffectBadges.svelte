<script lang="ts">
  import UiBadge from './UiBadge.svelte';
  import type { WeeklyActivityOutcomeEffect } from '../lib/simulation';

  let {
    effects = [],
    staminaCost = 0,
    staminaRecovery = 0,
    formatMoney
  }: {
    effects?: WeeklyActivityOutcomeEffect[];
    staminaCost?: number;
    staminaRecovery?: number;
    formatMoney?: (amount: number) => string;
  } = $props();
</script>

<div class="activity-effect-badges" aria-label="Expected activity effects">
  {#if staminaCost > 0}
    <UiBadge tone="danger" size="tiny">−{staminaCost} stamina</UiBadge>
  {/if}
  {#if staminaRecovery > 0}
    <UiBadge tone="success" size="tiny">+{staminaRecovery} stamina</UiBadge>
  {/if}
  {#each effects as effect (effect.key)}
    <UiBadge tone={effect.tone} size="tiny">
      {effect.delta > 0 ? '+' : '−'}{Math.abs(Number(effect.delta.toFixed(1)))}
      {#if effect.kind === 'money'}Cash {formatMoney ? formatMoney(Math.abs(effect.delta)) : Math.abs(effect.delta)}{:else} {effect.label}{/if}
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
