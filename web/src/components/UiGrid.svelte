<script lang="ts">
 let {as='div',columns=2,minWidth,gap=12,class:className='',children}:{
  as?:'div'|'section';columns?:number|'auto';minWidth?:number;gap?:number;class?:string;children:import('svelte').Snippet;
 }=$props();
 const auto=$derived(columns==='auto'||minWidth!==undefined);
 const gridStyle='--ui-columns:'+(auto?'auto-fit':Math.max(1,Math.min(6,Number(columns))))+';--ui-min-width:'+Math.max(100,minWidth??140)+'px;--ui-gap:'+Math.max(0,Math.min(48,gap))+'px';
</script>
<svelte:element this={as} class="ui-grid {auto?'ui-grid--auto':''} {className}" style={gridStyle}>
 {@render children()}
</svelte:element>
