<script lang="ts">
import { formatCharacterMoney, generateRandomCharacter } from './lib/simulation';
import type { Character, Gender } from './lib/types';

type Props = { slotLabel: string; onStart: (character: Character) => void; onCancel: () => void };
let { slotLabel, onStart, onCancel }: Props = $props();

const profiles = [
  { country: 'Bangladesh', nationality: 'Bangladeshi', currency: 'BDT', scale: 100, cities: ['Dhaka','Chattogram','Rajshahi','Sylhet','Khulna'], languages: ['Bengali'] },
  { country: 'India', nationality: 'Indian', currency: 'INR', scale: 100, cities: ['Delhi','Mumbai','Kolkata','Bengaluru','Chennai'], languages: ['Bengali','Hindi','Tamil','English'] },
  { country: 'United States', nationality: 'American', currency: 'USD', scale: 1, cities: ['New York','Chicago','Austin','Seattle'], languages: ['English','Spanish'] },
  { country: 'United Kingdom', nationality: 'British', currency: 'GBP', scale: 1, cities: ['London','Manchester','Birmingham','Bristol'], languages: ['English','Welsh'] },
  { country: 'Canada', nationality: 'Canadian', currency: 'CAD', scale: 1, cities: ['Toronto','Vancouver','Montreal','Ottawa'], languages: ['English','French'] },
  { country: 'Australia', nationality: 'Australian', currency: 'AUD', scale: 1, cities: ['Sydney','Melbourne','Brisbane','Perth'], languages: ['English'] },
  { country: 'Japan', nationality: 'Japanese', currency: 'JPY', scale: 100, cities: ['Tokyo','Osaka','Kyoto','Yokohama'], languages: ['Japanese'] },
  { country: 'Nigeria', nationality: 'Nigerian', currency: 'NGN', scale: 1000, cities: ['Lagos','Abuja','Kano','Ibadan'], languages: ['English','Hausa','Igbo','Yoruba'] },
  { country: 'Brazil', nationality: 'Brazilian', currency: 'BRL', scale: 10, cities: ['São Paulo','Rio de Janeiro','Brasília','Salvador'], languages: ['Portuguese'] },
  { country: 'Germany', nationality: 'German', currency: 'EUR', scale: 1, cities: ['Berlin','Hamburg','Munich','Cologne'], languages: ['German'] }
];
const backgrounds = [
  { name: 'Working-class', title: 'Tight beginnings', detail: 'Limited money. Every early decision matters.', multiplier: 0.65, icon: '⌁' },
  { name: 'Modest', title: 'Getting by', detail: 'A practical start with a little room to grow.', multiplier: 0.9, icon: '◇' },
  { name: 'Comfortable', title: 'A steady start', detail: 'More breathing room and fewer immediate pressures.', multiplier: 1.15, icon: '✦' },
  { name: 'Affluent', title: 'Well provided for', detail: 'Strong resources, with expectations of your own.', multiplier: 1.55, icon: '⬡' }
];
const lifeStages = [
  { label: 'Childhood', age: 10, range: '0–12' },
  { label: 'Teen years', age: 16, range: '13–17' },
  { label: 'Young adult', age: 18, range: '18–29' },
  { label: 'Adult', age: 30, range: '30–44' },
  { label: 'Midlife', age: 45, range: '45–64' },
  { label: 'Senior', age: 65, range: '65+' }
];
let age = $state(18);
let name = $state('');
let gender = $state<Gender>('male');
let country = $state('Bangladesh');
let birthplace = $state('Dhaka');
let language = $state('Bengali');
let background = $state('Modest');
let generated = $state<Character>(generateRandomCharacter(18));
const profile = $derived(profiles.find((item) => item.country === country) ?? profiles[0]);
const selectedBackground = $derived(backgrounds.find((item) => item.name === background) ?? backgrounds[1]);
const selectedStage = $derived(lifeStages.find((item) => age >= (item.label === 'Childhood' ? 0 : item.label === 'Teen years' ? 13 : item.label === 'Young adult' ? 18 : item.label === 'Adult' ? 30 : item.label === 'Midlife' ? 45 : 65) && age <= (item.label === 'Childhood' ? 12 : item.label === 'Teen years' ? 17 : item.label === 'Young adult' ? 29 : item.label === 'Adult' ? 44 : item.label === 'Midlife' ? 64 : 90)) ?? lifeStages[2]);
const baseFunds = $derived(age < 16 ? 0 : age < 18 ? 120 : 850);
const startingFunds = $derived(Math.round(baseFunds * profile.scale * selectedBackground.multiplier));
function syncOptions() { birthplace = profile.cities[0]; language = profile.languages[0]; }
function setStage(nextAge: number) { age = nextAge; }
function suggestName() { const next = generateRandomCharacter(age); generated = next; name = next.name; }
function start() {
  const next = generateRandomCharacter(age);
  next.name = name.trim().slice(0, 28) || next.name;
  next.gender = gender;
  next.nationality = profile.nationality;
  next.country = profile.country;
  next.currency = profile.currency;
  next.currencyScale = profile.scale;
  next.birthplace = birthplace;
  next.language = language;
  next.familyBackground = background;
  next.money = startingFunds;
  if (next.family) next.family = { ...next.family, people: next.family.people.map((person) => person.id === next.family?.playerPersonId ? { ...person, name: next.name, gender } : person) };
  next.history = next.history.map((item, index) => index === 0
    ? { ...item, title: 'A custom beginning', description: next.name + ' begins at age ' + age + ' in ' + birthplace + ', ' + profile.country + '. ' + selectedBackground.detail + ' The choices ahead are yours.' }
    : item);
  onStart(next);
}
</script>

<section class="creation-experience custom-start-experience">
  <div class="creation-heading-row">
    <div class="creation-heading">
      <div class="eyebrow">BUILD YOUR OWN SCENARIO</div>
      <h1>Full Custom Starting</h1>
      <p>Choose where your story begins, then shape the character and circumstances around it.</p>
    </div>
    <button class="text-button creation-back-button" onclick={onCancel}>← Back</button>
  </div>

  <div class="custom-start-layout">
    <div class="custom-start-main">
      <section class="custom-game-section">
        <div class="custom-section-heading"><span class="custom-step">01</span><div><h2>Choose your life stage</h2><p>Pick a chapter or set an exact starting age.</p></div></div>
        <div class="life-stage-options">
          {#each lifeStages as stage}
            <button class:stage-active={selectedStage.label === stage.label} class="life-stage-option" onclick={() => setStage(stage.age)} aria-pressed={selectedStage.label === stage.label}>
              <strong>{stage.label}</strong><small>{stage.range}</small>
            </button>
          {/each}
        </div>
        <div class="exact-age-control"><div><label for="custom-age">Exact starting age</label><strong>{age} <small>years old</small></strong></div><input id="custom-age" type="range" min="0" max="90" step="1" bind:value={age}/><div class="custom-age-ends"><span>Birth</span><span>90 years</span></div></div>
      </section>

      <section class="custom-game-section">
        <div class="custom-section-heading"><span class="custom-step">02</span><div><h2>Set your starting hand</h2><p>Your circumstances affect the resources you begin with.</p></div></div>
        <div class="background-options">
          {#each backgrounds as option}
            <button class:background-active={background === option.name} class="background-option" onclick={() => background = option.name} aria-pressed={background === option.name}>
              <span class="background-icon">{option.icon}</span><span><strong>{option.title}</strong><small>{option.detail}</small></span><i>{background === option.name ? '✓' : ''}</i>
            </button>
          {/each}
        </div>
      </section>

      <section class="custom-game-section">
        <div class="custom-section-heading"><span class="custom-step">03</span><div><h2>Shape your character</h2><p>Choose an identity and where they come from.</p></div></div>
        <div class="custom-identity-grid">
          <label class="custom-field custom-field-wide">Character name<div class="custom-name-row"><input bind:value={name} maxlength="28" placeholder="Leave blank to generate a name"/><button class="secondary-button" type="button" onclick={suggestName}>Suggest</button></div></label>
          <label class="custom-field">Gender<select bind:value={gender}><option value="male">Male</option><option value="female">Female</option><option value="non-binary">Non-binary</option></select></label>
          <label class="custom-field">Country<select bind:value={country} onchange={syncOptions}>{#each profiles as item}<option value={item.country}>{item.nationality} · {item.country}</option>{/each}</select></label>
          <label class="custom-field">Birthplace<select bind:value={birthplace}>{#each profile.cities as city}<option value={city}>{city}</option>{/each}</select></label>
          <label class="custom-field">Primary language<select bind:value={language}>{#each profile.languages as item}<option value={item}>{item}</option>{/each}</select></label>
        </div>
      </section>
    </div>

    <aside class="custom-start-preview">
      <div class="eyebrow">YOUR STARTING PROFILE</div>
      <div class="custom-preview-emblem">{(name.trim() || 'Y').slice(0,1).toUpperCase()}</div>
      <h2>{name.trim() || 'Your character'}</h2>
      <p>{gender === 'non-binary' ? 'Non-binary' : gender === 'female' ? 'Female' : 'Male'} · {profile.nationality}</p>
      <div class="custom-preview-age"><span>{selectedStage.label}</span><strong>AGE {age}</strong></div>
      <div class="custom-preview-facts">
        <div><small>LOCATION</small><strong>{birthplace}, {profile.country}</strong></div>
        <div><small>LANGUAGE</small><strong>{language}</strong></div>
        <div><small>STARTING HAND</small><strong>{background}</strong></div>
        <div><small>NATIVE CURRENCY</small><strong>{profile.currency}</strong></div>
        <div><small>STARTING FUNDS</small><strong>{formatCharacterMoney({ ...generated, currency: profile.currency, currencyScale: profile.scale, money: startingFunds })}</strong></div>
      </div>
      <div class="custom-preview-note"><span>YOUR STORY</span><p>{selectedBackground.detail} Your age and circumstances shape the first chapter.</p></div>
      <button class="primary-button custom-create-button" onclick={start}>Create this life <span>→</span></button>
      <small class="custom-achievement-note">Custom starts are separate from achievement-eligible New Game lives.</small>
    </aside>
  </div>
</section>

<style>
.custom-start-experience{margin:0}
.creation-heading-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.creation-back-button{flex:none;white-space:nowrap;margin-top:2px}
.custom-start-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(250px,.75fr);gap:16px;align-items:start;margin-top:20px}
.custom-start-main{display:grid;gap:13px;min-width:0}
.custom-game-section,.custom-start-preview{border:1px solid var(--line);border-radius:17px;background:var(--surface);padding:15px}
.custom-section-heading{display:flex;align-items:center;gap:10px;margin-bottom:13px}
.custom-step{display:grid;place-items:center;flex:none;width:29px;height:29px;border-radius:9px;background:var(--surface-raised,var(--surface));color:var(--accent);font-size:11px;font-weight:900}
.custom-section-heading h2{font-size:15px;margin:0}
.custom-section-heading p{font-size:11px;color:var(--muted);margin:3px 0 0}
.life-stage-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.life-stage-option{display:grid;gap:4px;text-align:left;padding:10px;border:1px solid var(--line);border-radius:11px;background:var(--surface-raised,var(--surface));color:var(--text);cursor:pointer}
.life-stage-option strong{font-size:11px}
.life-stage-option small{font-size:10px;color:var(--muted)}
.life-stage-option.stage-active{border-color:var(--accent);background:var(--surface)}
.exact-age-control{margin-top:14px;padding:11px;border-radius:11px;background:var(--surface-raised,var(--surface))}
.exact-age-control>div:first-child{display:flex;justify-content:space-between;align-items:center;gap:8px}
.exact-age-control label{font-size:11px;color:var(--muted)}
.exact-age-control strong{font-size:15px}
.exact-age-control strong small{font-size:10px;color:var(--muted);font-weight:500}
.exact-age-control input{width:100%;margin:12px 0 3px;accent-color:var(--accent)}
.custom-age-ends{display:flex;justify-content:space-between;font-size:9px;color:var(--muted)}
.background-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.background-option{display:flex;align-items:center;gap:9px;min-width:0;text-align:left;padding:11px;border:1px solid var(--line);border-radius:12px;background:var(--surface-raised,var(--surface));color:var(--text);cursor:pointer}
.background-option.background-active{border-color:var(--accent);background:var(--surface)}
.background-icon{display:grid;place-items:center;flex:none;width:31px;height:31px;border-radius:9px;background:var(--surface);color:var(--accent);font-size:16px}
.background-option>span:nth-child(2){display:grid;gap:3px;min-width:0}
.background-option strong{font-size:11px}
.background-option small{font-size:9px;line-height:1.35;color:var(--muted)}
.background-option i{margin-left:auto;color:var(--accent);font-style:normal;font-weight:900}
.custom-identity-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.custom-field{display:grid;gap:5px;font-size:10px;font-weight:750;color:var(--muted);min-width:0}
.custom-field-wide{grid-column:1/-1}
.custom-field input,.custom-field select{width:100%;min-width:0;border:1px solid var(--line);border-radius:9px;background:var(--surface-raised,var(--surface));color:var(--text);padding:10px;font:inherit;font-size:12px}
.custom-name-row{display:flex;gap:7px}
.custom-name-row input{flex:1}
.custom-name-row .secondary-button{flex:none;padding:8px 10px;font-size:10px}
.custom-start-preview{position:sticky;top:14px}
.custom-preview-emblem{display:grid;place-items:center;width:48px;height:48px;margin:12px 0 8px;border:1px solid var(--line);border-radius:14px;background:var(--surface-raised,var(--surface));font-size:21px;font-weight:900;color:var(--accent)}
.custom-start-preview h2{font-size:20px;margin:0}
.custom-start-preview>p{font-size:11px;color:var(--muted);margin:4px 0 13px}
.custom-preview-age{display:flex;justify-content:space-between;align-items:center;padding:10px 11px;border-radius:10px;background:var(--surface-raised,var(--surface));font-size:11px}
.custom-preview-age strong{font-size:10px;letter-spacing:.08em;color:var(--accent)}
.custom-preview-facts{display:grid;gap:10px;padding:13px 2px}
.custom-preview-facts>div{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.custom-preview-facts small{font-size:9px;color:var(--muted);letter-spacing:.07em}
.custom-preview-facts strong{font-size:11px;text-align:right;overflow-wrap:anywhere}
.custom-preview-note{padding:11px;border-left:2px solid var(--accent);border-radius:0 9px 9px 0;background:var(--surface-raised,var(--surface))}
.custom-preview-note span{font-size:9px;font-weight:850;letter-spacing:.1em;color:var(--muted)}
.custom-preview-note p{font-size:11px;line-height:1.45;margin:5px 0 0}
.custom-create-button{width:100%;justify-content:center;margin-top:13px}
.custom-achievement-note{display:block;margin-top:8px;font-size:9px;line-height:1.4;color:var(--muted)}
@media(max-width:760px){.custom-start-layout{grid-template-columns:1fr}.custom-start-preview{position:static}}
@media(max-width:460px){.life-stage-options{grid-template-columns:repeat(2,minmax(0,1fr))}.background-options{grid-template-columns:1fr}.custom-game-section,.custom-start-preview{padding:12px}}
</style>
