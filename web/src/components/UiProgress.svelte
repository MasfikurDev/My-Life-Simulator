<script lang="ts">
  type Tone = 'accent' | 'success' | 'info' | 'coral' | 'warning' | 'danger';
  type Size = 'small' | 'medium' | 'large';

  let {
    value,
    max = 100,
    tone = 'accent',
    size = 'medium',
    label,
    showValue = false,
    showLabel = true,
    valueText,
    previewValue,
    previewTone,
    indeterminate = false
  }: {
    value: number;
    max?: number;
    tone?: Tone;
    size?: Size;
    label: string;
    showValue?: boolean;
    showLabel?: boolean;
    valueText?: string;
    previewValue?: number;
    previewTone?: 'success' | 'danger';
    indeterminate?: boolean;
  } = $props();

  const safeMax = $derived(Number.isFinite(max) && max > 0 ? max : 100);
  const safeValue = $derived(Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : 0);
  const percent = $derived((safeValue / safeMax) * 100);
  const safePreview = $derived(previewValue === undefined ? safeValue : Number.isFinite(previewValue) ? Math.min(safeMax, Math.max(0, previewValue)) : safeValue);
  const previewPercent = $derived((safePreview / safeMax) * 100);
  const hasPreview = $derived(previewValue !== undefined && previewPercent !== percent);
  const previewPositive = $derived(safePreview > safeValue);
  const effectivePreviewTone = $derived(previewTone ?? (previewPositive ? 'success' : 'danger'));
</script>

<div class="ui-progress ui-progress--{tone} ui-progress--{size}">
  {#if showLabel || showValue}<div class="ui-progress-heading" class:ui-progress-heading--value-only={!showLabel}>
    {#if showLabel}<span>{label}</span>{/if}
    {#if showValue}<span class="ui-progress-value">{valueText ?? `${Math.round(percent)}%`}</span>{/if}
  </div>{/if}
  <div
    class="ui-progress-track"
    role="progressbar"
    aria-label={label}
    aria-valuemin="0"
    aria-valuemax={safeMax}
    aria-valuenow={indeterminate ? undefined : safePreview}
    aria-valuetext={valueText ?? (hasPreview ? `${safeValue} to ${safePreview}` : undefined)}
  >
    <span class="ui-progress-fill" class:ui-progress-fill--indeterminate={indeterminate} style:width={indeterminate ? '38%' : `${percent}%`}></span>
    {#if hasPreview && !indeterminate}
      <span class="ui-progress-preview" class:ui-progress-preview--success={effectivePreviewTone === 'success'} class:ui-progress-preview--danger={effectivePreviewTone === 'danger'} style:left={`${Math.min(percent, previewPercent)}%`} style:width={`${Math.abs(previewPercent - percent)}%`}></span>
    {/if}
  </div>
</div>

<style lang="scss">
  .ui-progress{display:grid;gap:6px;min-width:0;color:var(--text)}
  .ui-progress-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;font-weight:650}
  .ui-progress-heading--value-only{justify-content:flex-end}
  .ui-progress-value{color:var(--muted);font-variant-numeric:tabular-nums}
  .ui-progress-track{position:relative;height:8px;overflow:hidden;border:1px solid var(--line);border-radius:var(--radius-pill);background:linear-gradient(180deg,color-mix(in srgb,var(--surface-raised) 88%,var(--text)),var(--surface-raised));box-shadow:inset 0 2px 4px color-mix(in srgb,var(--shadow-color) 22%,transparent),0 1px color-mix(in srgb,var(--text) 5%,transparent)}
  .ui-progress-fill{display:block;height:100%;border-radius:inherit;background:linear-gradient(180deg,color-mix(in srgb,var(--ui-progress-color) 82%,white),var(--ui-progress-color));box-shadow:inset 0 1px color-mix(in srgb,white 24%,transparent),0 0 7px color-mix(in srgb,var(--ui-progress-color) 18%,transparent);transition:width 260ms cubic-bezier(.2,.75,.25,1)}
  .ui-progress-preview{position:absolute;top:0;height:100%;border-radius:inherit;pointer-events:none;transition:left 260ms cubic-bezier(.2,.75,.25,1),width 260ms cubic-bezier(.2,.75,.25,1)}
  .ui-progress-preview--success{background:linear-gradient(180deg,color-mix(in srgb,var(--success) 82%,white),var(--success));box-shadow:0 0 7px color-mix(in srgb,var(--success) 24%,transparent)}
  .ui-progress-preview--danger{background:linear-gradient(180deg,color-mix(in srgb,var(--danger) 82%,white),var(--danger));box-shadow:0 0 7px color-mix(in srgb,var(--danger) 24%,transparent)}
  .ui-progress-fill--indeterminate{animation:ui-progress-indeterminate 1.15s ease-in-out infinite alternate}
  @keyframes ui-progress-indeterminate{from{transform:translateX(-70%)}to{transform:translateX(190%)}}
  .ui-progress--accent{--ui-progress-color:var(--accent)}
  .ui-progress--success{--ui-progress-color:var(--success)}
  .ui-progress--info{--ui-progress-color:var(--info)}
  .ui-progress--coral{--ui-progress-color:var(--coral)}
  .ui-progress--warning{--ui-progress-color:var(--warning)}
  .ui-progress--danger{--ui-progress-color:var(--danger)}
  .ui-progress--small .ui-progress-track{height:5px}
  .ui-progress--large .ui-progress-track{height:11px}
  @media(prefers-reduced-motion:reduce){.ui-progress-fill,.ui-progress-preview{transition:none}.ui-progress-fill--indeterminate{animation:none;width:45%!important;transform:none}}
</style>
