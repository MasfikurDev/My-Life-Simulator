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
    rose: ['#1d1018','#38202d','#ed91b0'],
    techno: ['#050811','#111d30','#39e6f2'],
    aurora: ['#101126','#29234a','#8fe8d4'],
    cyberpunk: ['#090713','#201432','#ff4fd8'],
    obsidian: ['#0b0b0d','#202024','#d6b875'],
    abyss: ['#06111b','#10283a','#4cc9f0'],
    verdant: ['#08140f','#192c20','#b1df78'],
    crimson: ['#180a10','#351622','#ff647c'],
    solstice: ['#1b1012','#3b2020','#ffb45f']
  };
  const animatedThemes: GameTheme[] = ['midnight','graphite','paper','ocean','forest','lavender','sunset','rose','techno','aurora','cyberpunk','obsidian','abyss','verdant','crimson','solstice'];
  const hasMotion = animatedThemes.includes(theme);
</script>
<button class="theme-option" class:selected class:theme-option-animated={hasMotion} type="button" aria-pressed={selected} data-theme-preview={theme} onclick={() => onSelect(theme)}>
  <span class="theme-preview" class:motion-preview={hasMotion} aria-hidden="true">{#each swatches[theme] as color}<i style:background={color}></i>{/each}</span>
  <span class="theme-option-copy"><strong>{title}</strong><small>{description}</small></span>
  <span class="theme-check" aria-hidden="true">{selected ? '✓' : ''}</span>
</button>
<style lang="scss">
  .theme-option{position:relative;display:flex;align-items:center;gap:10px;min-width:0;min-height:70px;padding:10px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface);color:var(--text);text-align:left;cursor:pointer;overflow:hidden;isolation:isolate;transition:border-color .2s,background .2s,box-shadow .2s,transform .2s}
  .theme-option::before{content:"";position:absolute;inset:0;z-index:-1;opacity:0;background:linear-gradient(105deg,transparent, color-mix(in srgb,var(--accent) 10%,transparent),transparent);transform:translateX(-100%);transition:transform .55s,opacity .25s}
  .theme-option:hover{background:var(--surface-hover);border-color:var(--line-strong);transform:translateY(-1px)}
  .theme-option:hover::before{opacity:1;transform:translateX(100%)}
  .theme-option.selected{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent),0 5px 18px color-mix(in srgb,var(--accent) 12%,transparent)}
  .theme-preview{position:relative;display:flex;flex:none;gap:3px;width:52px;height:42px;padding:4px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);overflow:hidden}
  .theme-preview::after{content:"";position:absolute;inset:-40%;pointer-events:none;opacity:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.38) 48%,transparent 62%)}
  .theme-preview i{position:relative;z-index:1;flex:1;border-radius:4px;border:1px solid #80808030}
  .motion-preview::after{opacity:.8;animation:theme-preview-sweep 3.8s ease-in-out infinite}
  .theme-option-animated .theme-preview{box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 25%,transparent),0 0 13px color-mix(in srgb,var(--accent) 16%,transparent)}
  .theme-option-animated .theme-preview i:first-child{opacity:.72}
  .theme-option-animated .theme-preview i:nth-child(2){opacity:.9}
  .theme-option-animated .theme-preview i:last-child{box-shadow:0 0 10px color-mix(in srgb,var(--accent) 45%,transparent)}
  .theme-option-animated .theme-option-copy strong::after{content:"";display:inline-block;width:5px;height:5px;margin:0 0 2px 6px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent);animation:theme-motion-pulse 1.8s ease-in-out infinite}
  .theme-option-copy{display:grid;gap:3px;min-width:0;flex:1}
  .theme-option-copy strong{font-size:12px}
  .theme-option-copy small{font-size:10px;color:var(--muted)}
  .theme-check{display:grid;place-items:center;width:20px;height:20px;flex:none;border:1px solid var(--line-strong);border-radius:50%;color:var(--bg);font-size:12px}
  .selected .theme-check{background:var(--accent);border-color:var(--accent)}
  @keyframes theme-preview-sweep{0%,20%{transform:translateX(-30%) rotate(8deg)}80%,100%{transform:translateX(45%) rotate(8deg)}}
  @keyframes theme-motion-pulse{0%,100%{opacity:.45;transform:scale(.82)}50%{opacity:1;transform:scale(1.18)}}
  @media(prefers-reduced-motion:reduce){
    .theme-option,.theme-option::before{transition:none}
    .motion-preview::after,.theme-option-animated .theme-option-copy strong::after{animation:none}
  }
  @media(max-width:420px){.theme-option{gap:7px;padding:8px;min-height:66px}.theme-preview{width:44px;height:38px}}
  @media(max-width:360px){.theme-option-copy small{font-size:9px}}
</style>