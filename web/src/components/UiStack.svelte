<script lang="ts">
 let {as='div',direction='vertical',gap=12,align='stretch',justify='start',wrap=false,class:className='',children}:{
  as?:'div'|'section'|'nav';direction?:'vertical'|'horizontal';gap?:number;align?:'stretch'|'start'|'center'|'end';
  justify?:'start'|'center'|'between'|'end';wrap?:boolean;class?:string;children:import('svelte').Snippet;
 }=$props();
 const gapStyle='--ui-gap:'+Math.max(0,Math.min(48,gap))+'px;align-items:'+({stretch:'stretch',start:'flex-start',center:'center',end:'flex-end'}[align])+';justify-content:'+({start:'flex-start',center:'center',between:'space-between',end:'flex-end'}[justify]);
</script>
<svelte:element this={as} class="ui-stack ui-stack--{direction} {wrap?'ui-stack--wrap':''} {className}" style={gapStyle}>
 {@render children()}
</svelte:element>
