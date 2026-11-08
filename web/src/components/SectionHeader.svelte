<script lang="ts">
  let { title, description = '', eyebrow = '', children }: {
    title: string; description?: string; eyebrow?: string; children?: import('svelte').Snippet;
  } = $props();
</script>
<header class="ui-section-header">
  <div class="ui-section-copy">
    {#if eyebrow}<span class="ui-section-eyebrow">{eyebrow}</span>{/if}
    <h2>{title}</h2>
    {#if description}<p>{description}</p>{/if}
  </div>
  {#if children}<div class="ui-section-actions">{@render children()}</div>{/if}
</header>
<style>
  .ui-section-header{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--space-3);min-width:0}
  .ui-section-copy{min-width:0;display:grid;gap:4px}
  h2{margin:0;color:var(--text);font-size:18px;line-height:1.25}
  p{margin:0;color:var(--muted);font-size:13px;line-height:1.45}
  .ui-section-eyebrow{color:var(--subtle);font-size:10px;font-weight:800;letter-spacing:1.2px}
  .ui-section-actions{flex:none}
  @media(max-width:420px){.ui-section-header{align-items:flex-start}}
</style>
