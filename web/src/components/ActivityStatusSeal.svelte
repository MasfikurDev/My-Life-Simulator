<script lang="ts">
  type ActivityStatus = 'planned' | 'locked' | 'requirements' | 'available' | 'completed' | 'unavailable';
  let { status, label }: { status: ActivityStatus; label?: string } = $props();
  const defaults: Record<ActivityStatus, string> = {
    planned: 'PLANNED',
    locked: 'LOCKED',
    requirements: 'REQUIREMENTS NOT MET',
    available: 'AVAILABLE',
    completed: 'COMPLETED',
    unavailable: 'UNAVAILABLE'
  };
  const symbols: Record<ActivityStatus, string> = {
    planned: '✓',
    locked: '▣',
    requirements: '!',
    available: '＋',
    completed: '✓',
    unavailable: '—'
  };
</script>

<span class="activity-status-seal" class:planned={status === 'planned'} class:locked={status === 'locked'} class:requirements={status === 'requirements'} class:available={status === 'available'} class:completed={status === 'completed'} class:unavailable={status === 'unavailable'} role="status">
  <span aria-hidden="true">{symbols[status]}</span>{label ?? defaults[status]}
</span>

<style>
  .activity-status-seal{display:inline-flex;align-items:center;justify-content:center;gap:4px;max-width:100%;width:max-content;min-height:18px;padding:3px 6px;border:1px solid var(--line);border-radius:5px;background:var(--surface-raised);color:var(--muted);font-size:7px;font-weight:850;letter-spacing:.65px;line-height:1.2;text-transform:uppercase;white-space:normal}
  .activity-status-seal>span{font-size:9px;line-height:1}
  .activity-status-seal.planned{border-style:solid;border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
  .activity-status-seal.locked{border-style:dashed;border-color:var(--muted);background:var(--surface);color:var(--muted)}
  .activity-status-seal.requirements{border-color:color-mix(in srgb,var(--amber) 62%,var(--line));background:color-mix(in srgb,var(--amber) 12%,var(--surface));color:var(--amber)}
  .activity-status-seal.available{border-color:color-mix(in srgb,var(--blue) 48%,var(--line));background:color-mix(in srgb,var(--blue) 9%,var(--surface));color:var(--blue)}
  .activity-status-seal.completed{border-color:color-mix(in srgb,var(--green) 52%,var(--line));background:color-mix(in srgb,var(--green) 10%,var(--surface));color:var(--green)}
  .activity-status-seal.unavailable{border-color:var(--line);background:var(--surface);color:var(--subtle);opacity:.82}
</style>
