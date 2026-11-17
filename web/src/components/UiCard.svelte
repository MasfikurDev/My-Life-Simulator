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
  .ui-card{
    min-width:0;border:1px solid var(--line);border-radius:var(--panel-radius,var(--radius-md));
    background-color:var(--surface);background-image:var(--panel-wash,none);
    color:var(--text);box-shadow:var(--panel-shadow,none);
    transition:border-color .22s ease,background-color .22s ease,box-shadow .22s ease,transform .22s cubic-bezier(.2,.75,.25,1);
  }
  .ui-card.padded{padding:var(--space-4)}
  .ui-card.interactive{cursor:pointer}
  .ui-card.interactive:focus-within{border-color:color-mix(in srgb,var(--accent) 52%,var(--line));box-shadow:var(--focus-ring,0 0 0 2px var(--accent-soft))}
  @media(hover:hover) and (pointer:fine){
    .ui-card.interactive:hover{border-color:color-mix(in srgb,var(--accent) 38%,var(--line-strong));background-color:var(--surface-hover);transform:translateY(-2px);box-shadow:var(--panel-shadow,0 8px 24px color-mix(in srgb,var(--shadow-color) 22%,transparent))}
  }
  @media(prefers-reduced-motion:reduce){.ui-card{transition:none}.ui-card.interactive:hover{transform:none}}
</style>