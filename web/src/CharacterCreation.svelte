<script lang="ts">
  import { formatCharacterMoney, generateRandomCharacter } from './lib/simulation';
  import type { Character } from './lib/types';
  import { getValueColor } from './lib/progression';
  type Props = { onStart: (character: Character) => void; onCancel: () => void };
  let { onStart, onCancel }: Props = $props();
  let character = $state<Character>(generateRandomCharacter(0));
  const countryFlags: Record<string, string> = {
    Bangladesh: '🇧🇩', India: '🇮🇳', 'United States': '🇺🇸', 'United Kingdom': '🇬🇧',
    Canada: '🇨🇦', Australia: '🇦🇺', Japan: '🇯🇵', Nigeria: '🇳🇬', Brazil: '🇧🇷', Germany: '🇩🇪'
  };
  const currencySymbols: Record<string, string> = {
    BDT: '৳', INR: '₹', USD: '$', GBP: '£', CAD: 'CA$', AUD: 'A$', JPY: '¥', NGN: '₦', BRL: 'R$', EUR: '€'
  };
  const countryFlag = $derived(countryFlags[character.country ?? ''] ?? '🌐');
  const currencySymbol = $derived(currencySymbols[character.currency ?? 'USD'] ?? character.currency ?? '¤');
  const genderIcon = $derived(character.gender === 'female' ? '♀' : character.gender === 'non-binary' ? '⚧' : '♂');
  const genderLabel = $derived(character.gender === 'non-binary' ? 'Non-binary' : character.gender === 'female' ? 'Female' : 'Male');
</script>
<section class="creation-experience">
  <div class="creation-heading-row">
    <div class="creation-heading">
      <div class="eyebrow">NEW CHARACTER</div>
      <h1>Your new life</h1>
      <p>Review your character’s identity, background and starting resources before beginning.</p>
    </div>
    <button class="text-button creation-back-button" onclick={onCancel}>← Back</button>
  </div>
  <article class="generated-character">
    <div class="generated-character-top">
      <div><div class="generated-label">BORN INTO A NEW LIFE</div><h2>{character.name}</h2><p class="character-gender"><span class="gender-icon" aria-hidden="true">{genderIcon}</span>{genderLabel} · Age {character.age}</p></div>
    </div>
    <div class="identity-grid">
      <div><small>Nationality</small><strong>{character.nationality}</strong></div>
      <div><small>Country</small><strong class="identity-country"><span class="country-flag" aria-hidden="true">{countryFlag}</span>{character.country}</strong></div>
      <div><small>Birthplace</small><strong>{character.birthplace}</strong></div>
      <div><small>Primary language</small><strong>{character.language}</strong></div>
      <div><small>Starting circumstances</small><strong>{character.familyBackground}</strong></div>
      <div><small>Education</small><strong>{character.education}</strong></div>
      <div><small>Native currency</small><strong class="identity-currency"><span class="currency-icon" aria-hidden="true">{currencySymbol}</span>{character.currency ?? 'USD'}</strong></div>
      <div><small>Starting money</small><strong>{formatCharacterMoney(character)}</strong></div>
      <div><small>Height</small><strong>{character.appearance?.height}</strong></div>
      <div><small>Build</small><strong>{character.appearance?.build}</strong></div>
      <div><small>Hair</small><strong>{character.appearance?.hair}</strong></div>
      <div><small>Eyes</small><strong>{character.appearance?.eyes}</strong></div>
    </div>
    <div class="traits-row"><span>Personality</span>{#each character.personality ?? [] as trait}<b>{trait}</b>{/each}</div>
    <div class="generated-stats">
      {#each [{label:'Health',value:character.health},{label:'Happiness',value:character.happiness},{label:'Intelligence',value:character.intelligence},{label:'Fitness',value:character.fitness},{label:'Stamina',value:character.stamina ?? 50},{label:'Focus',value:character.focus ?? 50},{label:'Confidence',value:character.confidence ?? 50},{label:'Discipline',value:character.discipline ?? 50},{label:'Creativity',value:character.creativity ?? 50},{label:'Social skills',value:character.socialSkills ?? 50}] as stat}
        <div class="generated-stat"><div><span>{stat.label}</span><strong>{stat.value}</strong></div><div class="meter"><span style="width:{stat.value}%;background:{getValueColor(stat.value)}"></span></div></div>
      {/each}
    </div>
    <div class="traits-row"><span>Wellbeing</span><b>Stress {character.stress ?? 30}/100</b></div>
  <p class="generation-note">Your country sets the birthplace, primary language and native currency. Your abilities and personality are generated independently of nationality and gender.</p>
  </article>
  <div class="creation-actions">
    <button class="primary-button" onclick={() => onStart(character)}>Start this life <span>→</span></button>
  </div>
</section>

<style>
  .creation-experience{margin:0}
  .creation-heading-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
  .identity-country,.identity-currency,.character-gender{display:flex;align-items:center;gap:7px}
  .country-flag{font-size:17px;line-height:1}
  .currency-icon{display:inline-grid;place-items:center;min-width:21px;height:21px;padding:0 4px;border:1px solid var(--line);border-radius:6px;background:var(--surface);font-size:12px;font-weight:850;line-height:1}
  .gender-icon{display:inline-grid;place-items:center;width:18px;height:18px;border:1px solid var(--line);border-radius:50%;font-size:13px;font-weight:800;line-height:1}
  .generation-note{margin:0}
  .creation-back-button{flex:none;white-space:nowrap;margin-top:2px}
  @media(max-width:520px){.creation-heading-row{gap:10px}.creation-back-button{padding:8px 10px}}
</style>