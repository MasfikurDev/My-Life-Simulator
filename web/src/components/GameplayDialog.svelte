<script lang="ts">
  import { onMount } from 'svelte';
  import type { PendingGameEvent } from '../lib/types';

  let dialogElement: HTMLDialogElement;
  onMount(() => {
    if (!dialogElement.open) dialogElement.showModal();
    return () => { if (dialogElement.open) dialogElement.close(); };
  });

  let {
    event,
    age,
    money,
    formatMoney,
    plannedChoiceIds,
    onToggleChoice,
    onClose
  }: {
    event: PendingGameEvent;
    age: number;
    money: number;
    formatMoney: (amount: number) => string;
    plannedChoiceIds: string[];
    onToggleChoice: (choiceId: string) => void;
    onClose: () => void;
  } = $props();
</script>

<dialog bind:this={dialogElement} class="gameplay-dialog" aria-modal="true" aria-labelledby="gameplay-dialog-title" oncancel={(cancelEvent) => { cancelEvent.preventDefault(); onClose(); }}>
    <div class="dialog-topline">
      <span class="dialog-category">{event.category}</span>
      <span class="dialog-age">AGE {age}</span>
    </div>
    <button class="dialog-close" type="button" onclick={onClose} aria-label="Close situation">×</button>

    <div class="dialog-heading">
      <span class="dialog-kicker">A SITUATION HAS COME UP</span>
      <h2 id="gameplay-dialog-title">{event.title}</h2>
      <p>{event.description}</p>
    </div>

    <section class="dialog-choice-section" aria-label="Available decisions">
      <div class="dialog-section-heading">
        <h3>Your choices</h3>
        <span>{event.choices.length} {event.choices.length === 1 ? 'option' : 'options'}</span>
      </div>
      <div class="dialog-choices">
        {#each event.choices as choice (choice.id)}
          {@const planned = plannedChoiceIds.includes(choice.id)}
          <button
            class="dialog-choice"
            class:planned
            type="button"
            aria-pressed={planned}
            disabled={!planned && money < choice.moneyCost}
            onclick={() => onToggleChoice(choice.id)}
          >
            <span class="choice-mark" aria-hidden="true">{planned ? '✓' : '＋'}</span>
            <span class="choice-copy">
              <strong>{choice.label}</strong>
              <small>{choice.detail}</small>
              <span class="choice-costs">
                {#if choice.staminaCost > 0}<span>−{choice.staminaCost} stamina</span>{/if}
                {#if choice.moneyCost > 0}<span>Cost · {formatMoney(choice.moneyCost)}</span>{/if}
                {#if choice.staminaCost === 0 && choice.moneyCost === 0}<span class="cost-immediate">Immediate decision</span>{/if}
              </span>
            </span>
            <span class="choice-action">{planned ? 'Planned' : choice.staminaCost === 0 ? 'Choose' : 'Add to week'}</span>
          </button>
        {/each}
      </div>
    </section>

    <div class="dialog-footer">
      <p>Time-consuming choices are added to this week and resolve when you advance. You can leave this situation unanswered and return later.</p>
      <button class="dialog-later" type="button" onclick={onClose}>Decide later</button>
    </div>
  </dialog>

<style>
  /* Author display styles must not override the browser's closed-dialog hiding rule. */
  .gameplay-dialog:not([open]){display:none}
  .gameplay-dialog{position:fixed;inset:0;margin:auto;width:min(560px,calc(100% - 32px));max-width:none;max-height:min(88dvh,760px);overflow:auto;overscroll-behavior:contain;padding:22px;border:1px solid var(--line-strong);border-radius:18px;background:var(--surface-raised);color:var(--text);box-shadow:0 28px 100px color-mix(in srgb,var(--shadow-color) 58%,transparent);display:grid;gap:18px;animation:dialog-rise-in .18s ease-out}
  .gameplay-dialog::backdrop{background:color-mix(in srgb,var(--bg) 78%,transparent);backdrop-filter:blur(9px)}
  .dialog-topline{display:flex;align-items:center;gap:8px;padding-right:38px}
  .dialog-category,.dialog-age{padding:6px 8px;border:1px solid var(--line);border-radius:6px;color:var(--muted);font-size:8px;font-weight:850;letter-spacing:.8px;text-transform:uppercase}
  .dialog-category{border-color:color-mix(in srgb,var(--accent) 35%,var(--line));background:var(--accent-soft);color:var(--accent)}
  .dialog-close{position:absolute;right:16px;top:15px;width:36px;height:36px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--muted);font-size:22px;cursor:pointer}
  .dialog-heading{display:grid;gap:7px}
  .dialog-kicker{color:var(--accent);font-size:8px;font-weight:850;letter-spacing:1.1px}
  .dialog-heading h2{margin:0;font-size:clamp(21px,4vw,28px);line-height:1.15;letter-spacing:-.8px}
  .dialog-heading p{margin:0;color:var(--muted);font-size:12px;line-height:1.65}
  .dialog-choice-section{display:grid;gap:10px}
  .dialog-section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .dialog-section-heading h3{margin:0;font-size:12px}
  .dialog-section-heading span{font-size:9px;color:var(--subtle)}
  .dialog-choices{display:grid;gap:8px}
  .dialog-choice{width:100%;min-height:66px;display:grid;grid-template-columns:26px minmax(0,1fr) auto;align-items:center;gap:10px;padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--surface);color:var(--text);text-align:left;cursor:pointer;transition:border-color .16s ease,background .16s ease,transform .16s ease}
  .dialog-choice:hover:not(:disabled){border-color:var(--line-strong);transform:translateY(-1px)}
  .dialog-choice:focus-visible,.dialog-close:focus-visible,.dialog-later:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
  .dialog-choice:disabled{opacity:.45;cursor:not-allowed}
  .dialog-choice.planned{border-color:color-mix(in srgb,var(--accent) 55%,var(--line));background:color-mix(in srgb,var(--accent) 8%,var(--surface))}
  .choice-mark{width:25px;height:25px;display:grid;place-items:center;border:1px solid var(--line-strong);border-radius:8px;color:var(--accent);font-size:14px;font-weight:800}
  .planned .choice-mark{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
  .choice-copy{min-width:0;display:grid;gap:5px}
  .choice-copy strong{font-size:11px;line-height:1.35}
  .choice-copy small{color:var(--muted);font-size:9px;line-height:1.5}
  .choice-costs{display:flex;flex-wrap:wrap;gap:5px}
  .choice-costs span{padding:3px 6px;border-radius:5px;background:var(--surface-raised);color:var(--muted);font-size:8px;font-weight:750}
  .choice-costs .cost-immediate{color:var(--accent)}
  .choice-action{color:var(--accent);font-size:9px;font-weight:850;text-align:right;white-space:nowrap}
  .dialog-footer{display:grid;gap:10px;padding-top:13px;border-top:1px solid var(--line)}
  .dialog-footer p{margin:0;color:var(--muted);font-size:9px;line-height:1.55}
  .dialog-later{justify-self:end;min-height:40px;padding:0 14px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--text);font-size:10px;font-weight:750;cursor:pointer}
  @keyframes dialog-rise-in{from{opacity:0;transform:translateY(10px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
  @media(max-width:520px){
    .gameplay-dialog{inset:auto 8px max(8px,env(safe-area-inset-bottom));margin:0;width:auto;max-height:min(88dvh,760px);padding:18px 15px;border-radius:18px 18px 14px 14px;gap:15px}
    .dialog-choice{grid-template-columns:24px minmax(0,1fr);gap:9px;padding:11px}
    .choice-action{grid-column:2;justify-self:start;text-align:left}
  }
  @media(prefers-reduced-motion:reduce){
    .gameplay-dialog{animation:none}
    .dialog-choice{transition:none}
    .dialog-choice:hover:not(:disabled){transform:none}
  }
</style>
