<script lang="ts">
  import type { GameTheme } from '../lib/theme';
  let { theme, title, description, selected, onSelect }: {
    theme: GameTheme; title: string; description: string; selected: boolean; onSelect: (theme: GameTheme) => void;
  } = $props();
  const swatches: Record<GameTheme, string[]> = {
    amoled: ['#000000','#101511','#72d69a'],
    midnight: ['#070b16','#141e32','#86b7ff'],
    graphite: ['#101114','#22252c','#c0a0ff'],
    paper: ['#f4f1e9','#fffdf7','#267447'],
    ocean: ['#07151b','#102b35','#55c6d8'],
    forest: ['#0b1711','#172b20','#83c58b'],
    lavender: ['#171326','#2a2140','#c5a6ff'],
    sunset: ['#20140f','#3a241a','#f0a45e'],
    rose: ['#1d1018','#38202d','#ed91b0']
  };
</script>
<button class="theme-option" class:selected type="button" aria-pressed={selected} onclick={() => onSelect(theme)}>
  <span class="theme-preview" aria-hidden="true">{#each swatches[theme] as color}<i style:background={color}></i>{/each}</span>
  <span class="theme-option-copy"><strong>{title}</strong><small>{description}</small></span>
  <span class="theme-check" aria-hidden="true">{selected ? '✓' : ''}</span>
</button>
<style>
  .theme-option{position:relative;display:flex;align-items:center;gap:10px;min-width:0;min-height:64px;padding:10px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface);color:var(--text);text-align:left;cursor:pointer}
  .theme-option:hover{background:var(--surface-hover);border-color:var(--line-strong)}
  .theme-option.selected{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
  .theme-preview{display:flex;flex:none;gap:3px;width:48px;height:40px;padding:4px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised)}
  .theme-preview i{flex:1;border-radius:4px;border:1px solid #80808030}
  .theme-option-copy{display:grid;gap:3px;min-width:0;flex:1}
  .theme-option-copy strong{font-size:12px}
  .theme-option-copy small{font-size:10px;color:var(--muted)}
  .theme-check{display:grid;place-items:center;width:20px;height:20px;flex:none;border:1px solid var(--line-strong);border-radius:50%;color:var(--bg);font-size:12px}
  .selected .theme-check{background:var(--accent);border-color:var(--accent)}
  @media(max-width:360px){.theme-option{gap:7px;padding:8px}.theme-preview{width:38px;height:34px}.theme-option-copy small{font-size:9px}}
</style>
