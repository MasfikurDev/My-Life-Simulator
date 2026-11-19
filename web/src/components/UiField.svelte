<script lang="ts">
  let {
    label,
    description,
    error,
    controlId,
    required = false,
    children
  }: {
    label: string;
    description?: string;
    error?: string;
    controlId?: string;
    required?: boolean;
    children: import('svelte').Snippet;
  } = $props();
</script>

<div class:error class="ui-field">
  <label class="ui-field-label" for={controlId}>
    {label}{#if required}<span aria-hidden="true"> *</span>{/if}
  </label>
  {@render children()}
  {#if error}
    <p class="ui-field-message ui-field-error" role="alert">{error}</p>
  {:else if description}
    <p class="ui-field-message">{description}</p>
  {/if}
</div>

<style>
  .ui-field{display:grid;gap:6px;min-width:0}
  .ui-field-label{color:var(--text);font-size:11px;font-weight:700}
  .ui-field-label span{color:var(--danger)}
  .ui-field-message{margin:0;color:var(--muted);font-size:10px;line-height:1.45}
  .ui-field-error{color:var(--danger)}
  .ui-field.error :global(input),.ui-field.error :global(select),.ui-field.error :global(textarea){border-color:var(--danger)}
</style>
