<script lang="ts">
import { formatCharacterMoney, generateRandomCharacter } from './lib/simulation';
import type { Character } from './lib/types';

type Preset = {
  id: string; title: string; age: number; stage: string; category: string;
  background: string; summary: string; challenge: string; icon: string;
};
type Props = { onStart: (character: Character) => void; onCancel: () => void };
let { onStart, onCancel }: Props = $props();

const presets: Preset[] = [
  { id: 'school-years', title: 'School Years', age: 10, stage: 'Childhood', category: 'Growing up', background: 'Modest', summary: 'A young life with school, family and plenty of time to find your strengths.', challenge: 'Your future is wide open. Build good habits early.', icon: '✦' },
  { id: 'teenage-dreams', title: 'Teenage Dreams', age: 16, stage: 'Teen years', category: 'Coming of age', background: 'Comfortable', summary: 'You are old enough to make bigger choices, but still have room to experiment.', challenge: 'Balance education, friendships and your first responsibilities.', icon: '⌁' },
  { id: 'first-independence', title: 'First Independence', age: 18, stage: 'Young adult', category: 'Fresh start', background: 'Modest', summary: 'Adulthood begins. Decide what to study, where to work and how to manage money.', challenge: 'Build stability while opportunities begin to open up.', icon: '↗' },
  { id: 'career-reset', title: 'Career Reset', age: 30, stage: 'Adult', category: 'New direction', background: 'Working-class', summary: 'Start again with adult responsibilities and a career path still waiting to be shaped.', challenge: 'Make your next move count and get your finances in order.', icon: '◇' },
  { id: 'midlife-rebuild', title: 'Midlife Rebuild', age: 45, stage: 'Midlife', category: 'Second chance', background: 'Comfortable', summary: 'There is still time to change direction, pursue ambitions and rethink priorities.', challenge: 'Use your experience without letting old choices define what comes next.', icon: '⟳' },
  { id: 'later-chapter', title: 'Later Chapter', age: 65, stage: 'Senior', category: 'A new chapter', background: 'Affluent', summary: 'Begin later in life with a different pace and a fresh set of priorities.', challenge: 'Make the most of your time, resources and relationships.', icon: '⌂' }
];
let selectedId = $state('first-independence');
let generated = $state<Character>(generateRandomCharacter(18));
const selected = $derived(presets.find((item) => item.id === selectedId) ?? presets[2]);
const presetFunds = $derived(Math.round((selected.age < 16 ? 0 : selected.age < 18 ? 120 : 850) * (generated.currencyScale ?? 1) * (selected.background === 'Working-class' ? 0.65 : selected.background === 'Modest' ? 0.9 : selected.background === 'Comfortable' ? 1.15 : 1.55)));
function preview(preset: Preset) {
  selectedId = preset.id;
  generated = generateRandomCharacter(preset.age);
}
function start() {
  const next = generateRandomCharacter(selected.age);
  next.familyBackground = selected.background;
  const scale = next.currencyScale ?? 1;
  const base = selected.age < 16 ? 0 : selected.age < 18 ? 120 : 850;
  const multiplier = selected.background === 'Working-class' ? 0.65 : selected.background === 'Modest' ? 0.9 : selected.background === 'Comfortable' ? 1.15 : 1.55;
  next.money = Math.round(base * scale * multiplier);
  next.history = next.history.map((item, index) => index === 0
    ? { ...item, title: selected.title, description: 'Your story begins at age ' + selected.age + '. ' + selected.summary + ' ' + selected.challenge }
    : item);
  onStart(next);
}
</script>

<section class="creation-experience preset-experience">
  <div class="creation-heading-row">
    <div class="creation-heading">
      <div class="eyebrow">CHOOSE YOUR STARTING STORY</div>
      <h1>Presets</h1>
      <p>Pick a life stage and a set of starting circumstances. Your character is generated for that scenario.</p>
    </div>
    <button class="text-button creation-back-button" onclick={onCancel}>← Back</button>
  </div>

  <div class="preset-layout">
    <div class="preset-list">
      <div class="preset-section-heading"><span>SELECT A SCENARIO</span><small>{presets.length} starting stories</small></div>
      <div class="preset-grid">
        {#each presets as preset}
          <button class="preset-card" class:preset-selected={selectedId === preset.id} onclick={() => preview(preset)} aria-pressed={selectedId === preset.id}>
            <span class="preset-card-icon">{preset.icon}</span>
            <span class="preset-card-copy"><small>{preset.category}</small><strong>{preset.title}</strong><span>Age {preset.age} · {preset.stage}</span></span>
            <span class="preset-card-arrow">{selectedId === preset.id ? '✓' : '→'}</span>
          </button>
        {/each}
      </div>
    </div>

    <aside class="preset-detail">
      <div class="preset-detail-top"><span class="eyebrow">SCENARIO BRIEF</span><span class="preset-age">AGE {selected.age}</span></div>
      <div class="preset-detail-mark">{selected.icon}</div>
      <h2>{selected.title}</h2>
      <p>{selected.summary}</p>
      <div class="preset-detail-facts">
        <div><small>LIFE STAGE</small><strong>{selected.stage}</strong></div>
        <div><small>STARTING CIRCUMSTANCES</small><strong>{selected.background}</strong></div>
        <div><small>COUNTRY</small><strong>{generated.country ?? generated.nationality}</strong></div>
        <div><small>STARTING FUNDS</small><strong>{formatCharacterMoney({ ...generated, money: presetFunds })}</strong></div>
      </div>
      <div class="preset-challenge"><small>YOUR FIRST CHALLENGE</small><p>{selected.challenge}</p></div>
      <button class="primary-button preset-start" onclick={start}>Play this scenario <span>→</span></button>
      <small class="preset-footnote">Each start generates a fresh character. Preset lives do not count toward achievements.</small>
    </aside>
  </div>
</section>

<style>
.preset-experience{margin:0}
.creation-heading-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.creation-back-button{flex:none;white-space:nowrap;margin-top:2px}
.preset-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.85fr);gap:16px;align-items:start;margin-top:22px}
.preset-list,.preset-detail{border:1px solid var(--line);border-radius:18px;background:var(--surface);padding:16px}
.preset-section-heading,.preset-detail-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.preset-section-heading>span{font-size:10px;font-weight:850;letter-spacing:.13em;color:var(--muted)}
.preset-section-heading small,.preset-detail-top .eyebrow{font-size:10px;color:var(--muted)}
.preset-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.preset-card{display:flex;align-items:center;gap:10px;min-width:0;text-align:left;padding:12px;border:1px solid var(--line);border-radius:13px;background:var(--surface-raised,var(--surface));color:var(--text);cursor:pointer;transition:border-color .16s,background .16s}
.preset-card:hover,.preset-selected{border-color:var(--accent);background:var(--surface)}
.preset-card-icon{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:10px;background:var(--surface);font-size:18px;color:var(--accent)}
.preset-card-copy{display:grid;gap:3px;min-width:0}
.preset-card-copy small{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.preset-card-copy strong{font-size:13px;line-height:1.25}
.preset-card-copy>span{font-size:10px;color:var(--muted)}
.preset-card-arrow{margin-left:auto;color:var(--accent);font-weight:850}
.preset-detail{position:sticky;top:14px}
.preset-age{font-size:10px;font-weight:850;letter-spacing:.1em;color:var(--accent)}
.preset-detail-mark{display:grid;place-items:center;width:48px;height:48px;border:1px solid var(--line);border-radius:14px;background:var(--surface-raised,var(--surface));font-size:25px;color:var(--accent);margin:10px 0}
.preset-detail h2{margin:0;font-size:22px}
.preset-detail>p{margin:7px 0 16px;color:var(--muted);font-size:12px;line-height:1.55}
.preset-detail-facts{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px;border-radius:12px;background:var(--surface-raised,var(--surface))}
.preset-detail-facts>div{display:grid;gap:4px;min-width:0}
.preset-detail-facts small,.preset-challenge small{font-size:9px;color:var(--muted);letter-spacing:.08em;font-weight:800}
.preset-detail-facts strong{font-size:12px;overflow-wrap:anywhere}
.preset-challenge{margin:14px 0;padding:12px;border-left:2px solid var(--accent);background:var(--surface-raised,var(--surface));border-radius:0 10px 10px 0}
.preset-challenge p{font-size:12px;line-height:1.5;margin:5px 0 0}
.preset-start{width:100%;justify-content:center}
.preset-footnote{display:block;margin-top:9px;font-size:10px;line-height:1.45;color:var(--muted)}
@media(max-width:720px){.preset-layout{grid-template-columns:1fr}.preset-detail{position:static}.preset-grid{grid-template-columns:1fr 1fr}}
@media(max-width:420px){.preset-grid{grid-template-columns:1fr}.preset-list,.preset-detail{padding:12px}}
</style>
