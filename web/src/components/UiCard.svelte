<script lang="ts">
  let { as = 'section', padded = true, interactive = false, children, class: className = '' }: {
    as?: 'section' | 'article' | 'div'; padded?: boolean; interactive?: boolean;
    children: import('svelte').Snippet; class?: string;
  } = $props();
</script>
<svelte:element this={as} class={`ui-card ${padded ? 'padded' : ''} ${interactive ? 'interactive' : ''} ${className}`}>
  {@render children()}
</svelte:element>
<style>
  .ui-card{min-width:0;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface);color:var(--text)}
  .ui-card.padded{padding:var(--space-4)}
  .ui-card.interactive{transition:border-color .15s,background .15s}
  .ui-card.interactive:hover{border-color:var(--line-strong);background:var(--surface-hover)}
</style>
