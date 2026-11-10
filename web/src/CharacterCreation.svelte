<script lang="ts">
  import { formatCharacterMoney, generateRandomCharacter } from './lib/simulation';
  import type { Character } from './lib/types';
  import { getValueColor } from './lib/progression';
  type Props = { slotLabel: string; onStart: (character: Character) => void; onCancel: () => void };
  let { slotLabel, onStart, onCancel }: Props = $props();
  let character = $state<Character>(generateRandomCharacter(0));
  function reroll() { character = generateRandomCharacter(0); }
</script>
<section class="creation-experience">
  <div class="creation-heading">
    <div class="eyebrow">NEW CHARACTER</div>
    <h1>Create a character</h1>
    <p>Every new game begins at birth. A complete character is generated automatically.</p>
  </div>
  <article class="generated-character">
    <div class="generated-character-top">
      <div><div class="generated-label">BORN INTO A NEW LIFE</div><h2>{character.name}</h2><p>Age {character.age} · {character.gender === 'non-binary' ? 'Non-binary' : character.gender === 'female' ? 'Female' : 'Male'}</p></div>
      <button class="reroll-button" onclick={reroll} aria-label="Generate another character" title="Generate another character">↻ <span>Reroll</span></button>
    </div>
    <div class="identity-grid">
      <div><small>Nationality</small><strong>{character.nationality}</strong></div>
      <div><small>Country</small><strong>{character.country}</strong></div>
      <div><small>Birthplace</small><strong>{character.birthplace}</strong></div>
      <div><small>Primary language</small><strong>{character.language}</strong></div>
      <div><small>Starting circumstances</small><strong>{character.familyBackground}</strong></div>
      <div><small>Education</small><strong>{character.education}</strong></div>
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
  <p class="generation-note">Country determines the name pool, birthplace, language and currency. Ability and personality are generated independently of gender and nationality.</p>
  </article>
  <div class="creation-actions">
    <button class="primary-button" onclick={() => onStart(character)}>Start this life <span>→</span></button>
    <button class="text-button" onclick={reroll}>Generate another</button>
    <button class="text-button" onclick={onCancel}>Cancel</button>
  </div>
  <div class="start-note">This life will be saved in {slotLabel}.</div>
</section>