<script lang="ts">
 type Tone='default'|'accent'|'success'|'warning'|'danger'|'info';
 type Surface='surface'|'raised'|'tinted'|'outlined';
 type Density='compact'|'comfortable'|'spacious'|'flush';
 type Radius='sm'|'md'|'lg'|'xl';
 let {as='section',padded=true,density,interactive=false,tone='default',surface='surface',radius='lg',elevation='default',class:className='',children}:{
  as?:'section'|'article'|'div';padded?:boolean;density?:Density;interactive?:boolean;tone?:Tone;surface?:Surface;radius?:Radius;
  elevation?:'default'|'flat'|'glow';class?:string;children:import('svelte').Snippet;
 }=$props();
 const resolvedDensity=$derived(density??(padded?'comfortable':'flush'));
</script>
<svelte:element this={as} class="ui-card ui-card--{resolvedDensity} ui-card--{surface} ui-card--{tone} ui-card--radius-{radius} ui-card--{elevation} {interactive?'ui-card--interactive':''} {className}">
 {@render children()}
</svelte:element>
