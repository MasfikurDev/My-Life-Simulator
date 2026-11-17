<script lang="ts">
 type Variant='primary'|'secondary'|'quiet'|'danger';type Size='small'|'medium'|'large';type Shape='standard'|'pill'|'square';
 let {variant='secondary',size='medium',shape='standard',width='auto',disabled=false,type='button',onclick,class:className='',children}:{
  variant?:Variant;size?:Size;shape?:Shape;width?:'auto'|'full';disabled?:boolean;type?:'button'|'submit'|'reset';
  onclick?:(event:MouseEvent)=>void;class?:string;children:import('svelte').Snippet;
 }=$props();
</script>
<button class="ui-button ui-button--{variant} ui-button--{size} ui-button--{shape} ui-button--{width} {className}" {type} {disabled} {onclick}>
 <span class="ui-button-content">{@render children()}</span>
</button>
<style>
 .ui-button{position:relative;isolation:isolate;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:var(--control-height,44px);padding:0 14px;border:1px solid var(--line);border-radius:var(--ui-button-radius,var(--control-radius,var(--radius-md)));background:linear-gradient(180deg,color-mix(in srgb,var(--text) 3%,transparent),transparent 70%),var(--surface-raised);color:var(--text);font:inherit;font-weight:700;cursor:pointer;box-shadow:inset 0 1px color-mix(in srgb,var(--text) 5%,transparent);transition:background .2s,border-color .2s,color .2s,box-shadow .22s,transform .18s,filter .18s;-webkit-tap-highlight-color:transparent}
 .ui-button-content{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:8px}
 .ui-button::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0;background:linear-gradient(112deg,transparent 24%,color-mix(in srgb,white 18%,transparent) 48%,transparent 68%);transform:translateX(-75%);transition:opacity .2s,transform .55s cubic-bezier(.2,.75,.25,1)}
 .ui-button:hover:not(:disabled){border-color:var(--line-strong);background-color:var(--surface-hover);transform:translateY(-1px)}.ui-button:hover:not(:disabled)::after{opacity:.7;transform:translateX(75%)}
 .ui-button:active:not(:disabled){transform:translateY(1px) scale(.985);filter:brightness(.96)}.ui-button:focus-visible{outline:none;box-shadow:var(--focus-ring)}
 .ui-button:disabled{opacity:.42;cursor:not-allowed;filter:saturate(.55)}
 .ui-button--primary{background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 72%,var(--blue)));border-color:color-mix(in srgb,var(--accent) 82%,white);color:var(--on-accent);box-shadow:inset 0 1px color-mix(in srgb,white 28%,transparent),0 4px 14px color-mix(in srgb,var(--accent) 18%,transparent)}
 .ui-button--primary:hover:not(:disabled){border-color:var(--accent);filter:brightness(1.07);box-shadow:inset 0 1px color-mix(in srgb,white 34%,transparent),0 7px 19px color-mix(in srgb,var(--accent) 24%,transparent)}
 .ui-button--danger{color:var(--danger);border-color:color-mix(in srgb,var(--danger) 42%,var(--line));background:linear-gradient(145deg,var(--danger-soft),var(--surface-raised))}
 .ui-button--quiet{background:transparent;border-color:transparent;box-shadow:none}
 .ui-button--small{min-height:36px;padding-inline:10px;font-size:12px}.ui-button--large{min-height:48px;padding-inline:18px;font-size:14px}
 .ui-button--full{width:100%}.ui-button--pill{border-radius:var(--radius-pill)}.ui-button--square{aspect-ratio:1;padding-inline:0}
 @media(hover:none){.ui-button:hover:not(:disabled){transform:none}.ui-button:hover:not(:disabled)::after{opacity:0}}
 @media(prefers-reduced-motion:reduce){.ui-button,.ui-button::after{transition:none}.ui-button:hover:not(:disabled),.ui-button:active:not(:disabled){transform:none}}
</style>
