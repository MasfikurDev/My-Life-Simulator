<script lang="ts">
  import { formatCharacterMoney, generateRandomCharacter } from './lib/simulation';
  import type { Character } from './lib/types';
  type Props = { slotLabel: string; onStart: (character: Character) => void; onCancel: () => void };
  let { slotLabel, onStart, onCancel }: Props = $props();
  const lifePaths = [
    { age: 0, label: 'Birth', detail: 'Family and early development' },
    { age: 6, label: 'Childhood', detail: 'School, family and growth' },
    { age: 13, label: 'Teen years', detail: 'Identity and friendships' },
    { age: 18, label: 'Young adult', detail: 'Education and independence' },
    { age: 30, label: 'Established adult', detail: 'Career and relationships' },
    { age: 45, label: 'Midlife', detail: 'Responsibilities and new paths' },
    { age: 65, label: 'Later life', detail: 'Retirement, family and legacy' }
  ];
  let selectedAge = $state(18);
  let character = $state<Character>(generateRandomCharacter(18));
  function chooseAge(age: number) { selectedAge = age; character = generateRandomCharacter(age); }
  function reroll() { character = generateRandomCharacter(selectedAge); }
</script>
<section class="creation-experience">
  <div class="creation-heading">
    <div class="eyebrow">A LIFE OF YOUR OWN</div>
    <h1>Meet your <em>character.</em></h1>
    <p>Choose a life stage. We'll create a complete, believable starting character.</p>
  </div>
  <div class="life-path-picker" aria-label="Choose a starting life stage">
    {#each lifePaths as path}
      <button class:life-path-active={selectedAge === path.age} class="life-path-option" onclick={() => chooseAge(path.age)}>
        <strong>{path.label}</strong><small>Age {path.age}</small>
      </button>
    {/each}
  </div>
  <article class="generated-character">
    <div class="generated-character-top">
      <div><div class="generated-label">RANDOMLY GENERATED LIFE</div><h2>{character.name}</h2><p>Age {character.age} · {character.gender === 'non-binary' ? 'Non-binary' : character.gender === 'female' ? 'Female' : 'Male'}</p></div>
      <button class="reroll-button" onclick={reroll} aria-label="Generate another character" title="Generate another character">↻ <span>Reroll</span></button>
    </div>
    <div class="identity-grid">
      <div><small>Nationality</small><strong>{character.nationality}</strong></div>
      <div><small>Country</small><strong>{character.country}</strong></div>
      <div><small>Birthplace</small><strong>{character.birthplace}</strong></div>
      <div><small>Primary language</small><strong>{character.language}</strong></div>
      <div><small>Family background</small><strong>{character.familyBackground}</strong></div>
      <div><small>Education</small><strong>{character.education}</strong></div>
      <div><small>Starting money</small><strong>{formatCharacterMoney(character)}</strong></div>
      <div><small>Height</small><strong>{character.appearance?.height}</strong></div>
      <div><small>Build</small><strong>{character.appearance?.build}</strong></div>
      <div><small>Hair</small><strong>{character.appearance?.hair}</strong></div>
      <div><small>Eyes</small><strong>{character.appearance?.eyes}</strong></div>
    </div>
    <div class="traits-row"><span>Personality</span>{#each character.personality ?? [] as trait}<b>{trait}</b>{/each}</div>
    <div class="generated-stats">
      {#each [{label:'Health',value:character.health},{label:'Happiness',value:character.happiness},{label:'Intelligence',value:character.intelligence},{label:'Fitness',value:character.fitness}] as stat}
        <div class="generated-stat"><div><span>{stat.label}</span><strong>{stat.value}</strong></div><div class="meter"><span style="width:{stat.value}%"></span></div></div>
      {/each}
    </div>
    <p class="generation-note">Nationality controls the name pool, birthplace and currency. Age and family circumstances shape starting education and finances. Personality and ability stats are independent of nationality and gender.</p>
  </article>
  <div class="creation-actions">
    <button class="primary-button" onclick={() => onStart(character)}>Start this life <span>→</span></button>
    <button class="text-button" onclick={reroll}>Generate another</button>
    <button class="text-button" onclick={onCancel}>Cancel</button>
  </div>
  <div class="start-note">✦ This life will be saved in {slotLabel}. Reroll until you're ready.</div>
</section>