<script lang="ts">
  import FinanceAssets from './FinanceAssets.svelte';
  import MarketsWorkspace from './MarketsWorkspace.svelte';
  import type { Character } from './lib/types';

  let { character, onChange, onOpenBanking }: {
    character: Character;
    onChange: (next: Character) => void;
    onOpenBanking: () => void;
  } = $props();
  let section = $state<'stocks' | 'crypto' | 'other'>('stocks');
</script>

<section class="investment-workspace">
  <nav class="investment-tabs" aria-label="Investment markets">
    <button class:active={section === 'stocks'} onclick={() => section = 'stocks'}>Stocks</button>
    <button class:active={section === 'crypto'} onclick={() => section = 'crypto'}>Crypto</button>
    <button class:active={section === 'other'} onclick={() => section = 'other'}>Other assets</button>
  </nav>
  {#if section === 'other'}
    <FinanceAssets {character} {onChange} view="investments" />
  {:else}
    {#key section}
      <MarketsWorkspace {character} {onChange} initialMarket={section} {onOpenBanking} />
    {/key}
  {/if}
</section>

<style lang="scss">
.investment-workspace{display:grid;gap:12px;min-width:0}.investment-tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 4px}.investment-tabs button{flex:0 0 auto;border:1px solid var(--line);border-radius:999px;padding:9px 15px;background:var(--surface);color:var(--muted);font-size:12px}.investment-tabs button.active{background:var(--text);border-color:var(--text);color:var(--surface)}
</style>
