<script lang="ts">
  type ChoiceOption = { value: string; label: string; detail?: string; meta?: string };
  let { value, options, onSelect, label, compact = false, columns = 2 }: {
    value: string;
    options: ChoiceOption[];
    onSelect: (value: string) => void;
    label: string;
    compact?: boolean;
    columns?: number;
  } = $props();
</script>

<div class:compact class="game-choice-grid" style="--choice-columns:{columns}" role="group" aria-label={label}>
  {#each options as option (option.value)}
    <button type="button" class:chosen={value === option.value} aria-pressed={value === option.value} onclick={() => onSelect(option.value)}>
      <span class="choice-copy"><strong>{option.label}</strong>{#if option.detail}<small>{option.detail}</small>{/if}</span>
      {#if option.meta}<span class="choice-meta">{option.meta}</span>{/if}
      <span class="choice-indicator" aria-hidden="true">{value === option.value ? '✓' : ''}</span>
    </button>
  {/each}
</div>

<style>
  .game-choice-grid{display:grid;grid-template-columns:repeat(var(--choice-columns,2),minmax(0,1fr));gap:7px;margin:7px 0 10px}
  .game-choice-grid button{position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;min-height:58px;padding:10px 11px;text-align:left;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised);color:var(--text);cursor:pointer;transition:border-color .15s,background .15s,transform .15s}
  .game-choice-grid button:hover{border-color:var(--line-strong);transform:translateY(-1px)}
  .game-choice-grid button.chosen{border-color:var(--accent);background:var(--accent-soft);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 18%,transparent)}
  .choice-copy{display:grid;gap:4px;min-width:0}.choice-copy strong{font-size:11px;line-height:1.3}.choice-copy small{font-size:9px;line-height:1.4;color:var(--muted)}
  .choice-meta{flex:none;font-size:9px;font-weight:750;color:var(--muted)}
  .choice-indicator{flex:none;width:17px;height:17px;display:grid;place-items:center;border:1px solid var(--line-strong);border-radius:50%;font-size:10px;color:var(--accent)}
  .chosen .choice-indicator{border-color:var(--accent);background:var(--accent);color:var(--surface)}
  .compact{grid-template-columns:repeat(var(--choice-columns,2),minmax(0,1fr))}
  .compact button{min-height:39px;padding:8px 9px;border-radius:8px}
  .compact .choice-copy strong{font-size:10px}.compact .choice-copy small{display:none}.compact .choice-indicator{width:14px;height:14px;font-size:9px}
  @media(max-width:520px){.game-choice-grid{grid-template-columns:repeat(min(var(--choice-columns,2),2),minmax(0,1fr))}.game-choice-grid button{min-height:52px;padding:9px}.choice-copy strong{font-size:10px}}
</style>
