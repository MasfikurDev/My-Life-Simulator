<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';
  type Size = 'small' | 'medium';
  let { variant = 'secondary', size = 'medium', disabled = false, type = 'button', onclick, children }: {
    variant?: Variant; size?: Size; disabled?: boolean; type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void; children: import('svelte').Snippet;
  } = $props();
</script>
<button class="ui-button ui-button--{variant} ui-button--{size}" {type} {disabled} {onclick}>
  {@render children()}
</button>
<style>
  .ui-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:var(--control-height);padding:0 14px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-raised);color:var(--text);font:inherit;font-weight:700;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
  .ui-button:hover:not(:disabled){background:var(--surface-hover);border-color:var(--line-strong)}
  .ui-button:focus-visible{outline:none;box-shadow:var(--focus-ring)}
  .ui-button:disabled{opacity:.42;cursor:not-allowed}
  .ui-button--primary{background:var(--accent);border-color:var(--accent);color:var(--bg)}
  .ui-button--primary:hover:not(:disabled){filter:brightness(1.06)}
  .ui-button--danger{color:var(--danger)}
  .ui-button--quiet{background:transparent;border-color:transparent}
  .ui-button--small{min-height:36px;padding-inline:10px;font-size:12px}
</style>
