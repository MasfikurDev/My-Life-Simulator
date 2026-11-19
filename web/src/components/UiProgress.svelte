<script lang="ts">
  type Tone = 'accent' | 'success' | 'info' | 'warning' | 'danger';
  type Size = 'small' | 'medium' | 'large';

  let {
    value,
    max = 100,
    tone = 'accent',
    size = 'medium',
    label,
    showValue = false
  }: {
    value: number;
    max?: number;
    tone?: Tone;
    size?: Size;
    label: string;
    showValue?: boolean;
  } = $props();

  const safeMax = $derived(Number.isFinite(max) && max > 0 ? max : 100);
  const safeValue = $derived(Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : 0);
  const percent = $derived((safeValue / safeMax) * 100);
</script>

<div class="ui-progress ui-progress--{tone} ui-progress--{size}">
  <div class="ui-progress-heading">
    <span>{label}</span>
    {#if showValue}<span class="ui-progress-value">{Math.round(percent)}%</span>{/if}
  </div>
  <div
    class="ui-progress-track"
    role="progressbar"
    aria-label={label}
    aria-valuemin="0"
    aria-valuemax={safeMax}
    aria-valuenow={safeValue}
  >
    <span class="ui-progress-fill" style:width="{percent}%"></span>
  </div>
</div>

<style>
  .ui-progress{display:grid;gap:6px;min-width:0;color:var(--text)}
  .ui-progress-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;font-weight:650}
  .ui-progress-value{color:var(--muted);font-variant-numeric:tabular-nums}
  .ui-progress-track{height:8px;overflow:hidden;border:1px solid var(--line);border-radius:var(--radius-pill);background:var(--surface-raised)}
  .ui-progress-fill{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--ui-progress-color),color-mix(in srgb,var(--ui-progress-color) 68%,white));transition:width 260ms cubic-bezier(.2,.75,.25,1)}
  .ui-progress--accent{--ui-progress-color:var(--accent)}
  .ui-progress--success{--ui-progress-color:var(--success)}
  .ui-progress--info{--ui-progress-color:var(--info)}
  .ui-progress--warning{--ui-progress-color:var(--warning)}
  .ui-progress--danger{--ui-progress-color:var(--danger)}
  .ui-progress--small .ui-progress-track{height:5px}
  .ui-progress--large .ui-progress-track{height:11px}
  @media(prefers-reduced-motion:reduce){.ui-progress-fill{transition:none}}
</style>
