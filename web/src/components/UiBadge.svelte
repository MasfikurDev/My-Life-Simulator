<script lang="ts">
  type Tone = 'accent' | 'success' | 'info' | 'special' | 'warning' | 'risk' | 'danger' | 'neutral';
  type Size = 'tiny' | 'small' | 'medium';
  type Shape = 'pill' | 'rounded' | 'square';

  let {
    tone = 'neutral',
    size = 'small',
    shape = 'pill',
    dot = false,
    wrap = false,
    prefix,
    class: className = '',
    animateOnEnter = false,
    title,
    ariaLabel,
    children
  }: {
    tone?: Tone;
    size?: Size;
    shape?: Shape;
    dot?: boolean;
    wrap?: boolean;
    prefix?: string;
    class?: string;
    animateOnEnter?: boolean;
    title?: string;
    ariaLabel?: string;
    children: import('svelte').Snippet;
  } = $props();

  const classes = $derived([
    'ui-badge',
    `ui-badge--${tone}`,
    `ui-badge--${size}`,
    `ui-badge--${shape}`,
    wrap ? 'ui-badge--wrap' : '',
    className,
    dot ? 'ui-badge--dot' : '',
    animateOnEnter ? 'ui-badge--animate' : ''
  ].filter(Boolean).join(' '));
</script>

<span class={classes} {title} aria-label={ariaLabel}>
  {#if prefix}<span class="ui-badge-prefix" aria-hidden="true">{prefix}</span>{:else if dot}<span class="ui-badge-dot" aria-hidden="true"></span>{/if}
  <span class="ui-badge-label">{@render children()}</span>
</span>

<style lang="scss">
  .ui-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    min-width: 0;
    min-height: 22px;
    padding: 3px 8px;
    border: 1px solid transparent;
    border-radius: var(--radius-pill);
    font-size: 10px;
    font-weight: 750;
    line-height: 1.2;
    letter-spacing: .01em;
    vertical-align: middle;
    white-space: nowrap;
    box-shadow: inset 0 1px color-mix(in srgb, var(--text) 7%, transparent);
    transition: color .16s ease, background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
  }

  .ui-badge-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ui-badge-dot {
    width: 6px;
    height: 6px;
    flex: none;
    border-radius: 50%;
    background: currentColor;
  }

  .ui-badge--tiny { min-height: 18px; padding: 2px 6px; font-size: 9px; letter-spacing: .035em; }
  .ui-badge--small { min-height: 22px; padding: 3px 8px; font-size: 10px; }
  .ui-badge--medium { min-height: 26px; padding: 4px 10px; font-size: 11px; }

  .ui-badge--pill { border-radius: var(--radius-pill); }
  .ui-badge--rounded { border-radius: var(--radius-sm); }
  .ui-badge--square { border-radius: 5px; }
  .ui-badge--wrap { white-space: normal; }
  .ui-badge--wrap .ui-badge-label { overflow: visible; text-overflow: clip; overflow-wrap: anywhere; }
  .ui-badge-prefix { flex: none; font-size: 1.05em; line-height: 1; }

  .ui-badge--accent { color: var(--accent); background: var(--accent-soft); border-color: color-mix(in srgb, var(--accent) 34%, var(--line)); }
  .ui-badge--success {
    color: var(--success);
    background: var(--success-soft);
    border-color: color-mix(in srgb, var(--success) 32%, var(--line));
  }
  .ui-badge--info {
    color: var(--info);
    background: var(--info-soft);
    border-color: color-mix(in srgb, var(--info) 30%, var(--line));
  }
  .ui-badge--special {
    color: var(--special);
    background: color-mix(in srgb, var(--special) 14%, var(--surface));
    border-color: color-mix(in srgb, var(--special) 34%, var(--line));
  }
  .ui-badge--warning {
    color: var(--warning);
    background: var(--warning-soft);
    border-color: color-mix(in srgb, var(--warning) 32%, var(--line));
  }
  .ui-badge--risk {
    color: color-mix(in srgb, var(--warning) 54%, var(--danger));
    background: color-mix(in srgb, var(--warning-soft) 55%, var(--danger-soft));
    border-color: color-mix(in srgb, var(--warning) 38%, var(--danger));
  }
  .ui-badge--danger {
    color: var(--danger);
    background: var(--danger-soft);
    border-color: color-mix(in srgb, var(--danger) 34%, var(--line));
  }
  .ui-badge--neutral {
    color: var(--muted);
    background: var(--surface-raised);
    border-color: var(--line);
  }

  .ui-badge--animate { animation: badge-enter .24s cubic-bezier(.2,.75,.25,1) both; }
  @keyframes badge-enter {
    from { opacity: 0; transform: translateY(2px) scale(.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media(prefers-reduced-motion: reduce) {
    .ui-badge { transition: none; }
    .ui-badge--animate { animation: none; }
  }
</style>
