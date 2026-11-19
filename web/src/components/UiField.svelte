<script lang="ts">
  let {
    label,
    description,
    error,
    controlId,
    required = false,
    layout = 'stacked',
    size = 'medium',
    class: className = '',
    children
  }: {
    label: string;
    description?: string;
    error?: string;
    controlId?: string;
    required?: boolean;
    layout?: 'stacked' | 'inline';
    size?: 'compact' | 'medium';
    class?: string;
    children: import('svelte').Snippet;
  } = $props();
</script>

<div class:error class="ui-field ui-field--{layout} ui-field--{size} {className}">
  <label class="ui-field-label" for={controlId}>
    {label}{#if required}<span aria-hidden="true"> *</span>{/if}
  </label>
  <div class="ui-field-control">{@render children()}</div>
  {#if error}
    <p class="ui-field-message ui-field-error" role="alert">{error}</p>
  {:else if description}
    <p class="ui-field-message">{description}</p>
  {/if}
</div>

<style>
  .ui-field{display:grid;gap:6px;min-width:0}
  .ui-field-control{min-width:0}
  .ui-field--compact{gap:4px}
  .ui-field--compact .ui-field-label{font-size:10px}
  .ui-field--inline{grid-template-columns:minmax(88px,auto) minmax(0,1fr);align-items:center;column-gap:12px}
  .ui-field--inline .ui-field-message{grid-column:2}
  .ui-field-label{color:var(--text);font-size:11px;font-weight:700}
  .ui-field-label span{color:var(--danger)}
  .ui-field-message{margin:0;color:var(--muted);font-size:10px;line-height:1.45}
  .ui-field-error{color:var(--danger)}
  .ui-field.error :global(input),.ui-field.error :global(select),.ui-field.error :global(textarea){border-color:var(--danger)}
</style>
