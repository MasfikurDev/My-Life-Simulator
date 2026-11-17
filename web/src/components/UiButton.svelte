<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';
  type Size = 'small' | 'medium';
  let { variant = 'secondary', size = 'medium', disabled = false, type = 'button', onclick, children }: {
    variant?: Variant; size?: Size; disabled?: boolean; type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void; children: import('svelte').Snippet;
  } = $props();
</script>
<button class="ui-button ui-button--{variant} ui-button--{size}" {type} {disabled} {onclick}>
  <span class="ui-button-content">{@render children()}</span>
</button>
<style>
  .ui-button{
    position:relative;isolation:isolate;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:8px;
    min-height:var(--control-height,42px);padding:0 14px;border:1px solid var(--line);
    border-radius:var(--control-radius,var(--radius-md));
    background:linear-gradient(180deg,color-mix(in srgb,var(--text) 3%,transparent),transparent 70%),var(--surface-raised);
    color:var(--text);font:inherit;font-weight:700;cursor:pointer;
    box-shadow:inset 0 1px color-mix(in srgb,var(--text) 5%,transparent);
    transition:background .2s,border-color .2s,color .2s,box-shadow .22s,transform .18s,filter .18s;
    -webkit-tap-highlight-color:transparent;
  }
  .ui-button-content{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:inherit}
  .ui-button::after{
    content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0;
    background:linear-gradient(112deg,transparent 24%,color-mix(in srgb,white 18%,transparent) 48%,transparent 68%);
    transform:translateX(-75%);transition:opacity .2s,transform .55s cubic-bezier(.2,.75,.25,1);
  }
  .ui-button:hover:not(:disabled){border-color:var(--line-strong);background-color:var(--surface-hover);transform:translateY(-1px)}
  .ui-button:hover:not(:disabled)::after{opacity:.7;transform:translateX(75%)}
  .ui-button:active:not(:disabled){transform:translateY(1px) scale(.985);filter:brightness(.96)}
  .ui-button:focus-visible{outline:none;box-shadow:var(--focus-ring)}
  .ui-button:disabled{opacity:.42;cursor:not-allowed;filter:saturate(.55)}
  .ui-button--primary{
    background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 72%,var(--blue)));
    border-color:color-mix(in srgb,var(--accent) 82%,white);color:var(--on-accent);
    box-shadow:inset 0 1px color-mix(in srgb,white 28%,transparent),0 4px 14px color-mix(in srgb,var(--accent) 18%,transparent);
  }
  .ui-button--primary:hover:not(:disabled){border-color:var(--accent);filter:brightness(1.07);box-shadow:inset 0 1px color-mix(in srgb,white 34%,transparent),0 7px 19px color-mix(in srgb,var(--accent) 24%,transparent)}
  .ui-button--danger{color:var(--danger);border-color:color-mix(in srgb,var(--danger) 42%,var(--line));background:linear-gradient(145deg,var(--danger-soft),var(--surface-raised))}
  .ui-button--quiet{background:transparent;border-color:transparent;box-shadow:none}
  .ui-button--small{min-height:36px;padding-inline:10px;font-size:12px}
  @media(hover:none){.ui-button:hover:not(:disabled){transform:none}.ui-button:hover:not(:disabled)::after{opacity:0}}
  @media(prefers-reduced-motion:reduce){.ui-button,.ui-button::after{transition:none}.ui-button:hover:not(:disabled),.ui-button:active:not(:disabled){transform:none}}
</style>