<script lang="ts">
  let { title, description = '' }: { title: string; description?: string } = $props();
</script>

<div class="ui-empty-state">
  <strong>{title}</strong>
  {#if description}<p>{description}</p>{/if}
</div>

<style>
  .ui-empty-state {
    display: grid;
    gap: 5px;
    min-width: 0;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
  }
  strong {
    color: var(--text);
    font-size: 11px;
    line-height: 1.4;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.5;
  }
</style>
