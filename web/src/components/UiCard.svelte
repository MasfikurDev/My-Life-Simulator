<script lang="ts">
 type Tone='default'|'accent'|'success'|'warning'|'danger'|'info';
 type Surface='surface'|'raised'|'tinted'|'outlined';
 type Density='compact'|'comfortable'|'spacious'|'flush'|'inherit';
 type Radius='sm'|'md'|'lg'|'xl';
 let {as='section',padded=true,density,interactive=false,tone='default',surface='surface',radius='lg',elevation='default',class:className='',children}:{
  as?:'section'|'article'|'div';padded?:boolean;density?:Density;interactive?:boolean;tone?:Tone;surface?:Surface;radius?:Radius;
  elevation?:'default'|'flat'|'raised'|'floating'|'glow';class?:string;children:import('svelte').Snippet;
 }=$props();
 const resolvedDensity=$derived(density??(padded?'comfortable':'inherit'));
</script>
<svelte:element this={as} class="ui-card ui-card--{resolvedDensity} ui-card--{surface} ui-card--{tone} ui-card--radius-{radius} ui-card--elevation-{elevation} {interactive?'ui-card--interactive interactive':''} {className}">
 {@render children()}
</svelte:element>
<style>
 .ui-card{position:relative;isolation:isolate;min-width:0;color:var(--text);border:1px solid var(--line);border-radius:var(--ui-card-radius,var(--radius-lg,16px));background:linear-gradient(155deg,color-mix(in srgb,var(--surface-raised,var(--surface)) 36%,var(--surface)) 0%,var(--surface) 72%);box-shadow:var(--elevation-1);transition:background .2s ease,border-color .2s ease,box-shadow .22s ease,transform .22s cubic-bezier(.2,.75,.25,1)}
 .ui-card::before{content:"";position:absolute;inset:0 0 auto;height:1px;pointer-events:none;border-radius:inherit;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--text) 14%,transparent),transparent);opacity:.72}
 .ui-card--compact{padding:var(--space-2,8px)}.ui-card--comfortable{padding:var(--space-4,16px)}.ui-card--spacious{padding:var(--space-6,24px)}.ui-card--flush,.ui-card--inherit{padding:0}
 .ui-card--radius-sm{border-radius:var(--radius-sm,8px)}.ui-card--radius-md{border-radius:var(--radius-md,12px)}.ui-card--radius-lg{border-radius:var(--radius-lg,16px)}.ui-card--radius-xl{border-radius:22px}
 .ui-card--surface{background:linear-gradient(155deg,color-mix(in srgb,var(--surface-raised,var(--surface)) 32%,var(--surface)),var(--surface))}
 .ui-card--raised{background:linear-gradient(145deg,var(--surface-raised,var(--surface)),color-mix(in srgb,var(--surface) 78%,var(--surface-raised,var(--surface))));border-color:var(--surface-edge,var(--line))}
 .ui-card--tinted{background:linear-gradient(145deg,color-mix(in srgb,var(--accent-soft) 82%,var(--surface-raised)),var(--surface-raised));border-color:color-mix(in srgb,var(--accent) 24%,var(--line))}
 .ui-card--outlined{background:transparent;box-shadow:none}
 .ui-card--accent{border-color:color-mix(in srgb,var(--accent) 36%,var(--line))}
 .ui-card--success{border-color:color-mix(in srgb,var(--success) 34%,var(--line))}
 .ui-card--warning{border-color:color-mix(in srgb,var(--warning) 38%,var(--line))}
 .ui-card--danger{border-color:color-mix(in srgb,var(--danger) 38%,var(--line))}
 .ui-card--info{border-color:color-mix(in srgb,var(--info) 34%,var(--line))}
 .ui-card--elevation-flat{box-shadow:none}.ui-card--elevation-default{box-shadow:var(--elevation-1)}.ui-card--elevation-raised{box-shadow:var(--elevation-2)}.ui-card--elevation-floating{box-shadow:var(--elevation-3)}.ui-card--elevation-glow{box-shadow:var(--elevation-accent)}
 .ui-card--interactive{cursor:pointer;-webkit-tap-highlight-color:transparent}
 .ui-card--interactive:focus-within{outline:2px solid var(--accent);outline-offset:2px}
 @media(hover:hover) and (pointer:fine){.ui-card--interactive:hover{transform:translateY(-2px);border-color:var(--line-strong);box-shadow:var(--elevation-2)}}
 @media(hover:none){.ui-card--interactive:active{transform:translateY(1px);filter:brightness(.98)}}
 @media(prefers-reduced-motion:reduce){.ui-card{transition:none}.ui-card--interactive:hover,.ui-card--interactive:active{transform:none}}
</style>
