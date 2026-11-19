<script lang="ts">
  import UiBadge from './UiBadge.svelte';

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
  const tones: Record<ActivityStatus, 'accent' | 'neutral' | 'warning' | 'info' | 'success'> = {
    planned: 'accent',
    locked: 'neutral',
    requirements: 'warning',
    available: 'info',
    completed: 'success',
    unavailable: 'neutral'
  };
</script>
<UiBadge tone={tones[status]} size="tiny" shape="square" prefix={symbols[status]} ariaLabel={label ?? defaults[status]}>{label ?? defaults[status]}</UiBadge>
