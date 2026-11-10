<script lang="ts">
import {formatCharacterMoney,generateRandomCharacter} from './lib/simulation';
import type {Character,Gender} from './lib/types';
type Props={slotLabel:string;onStart:(character:Character)=>void;onCancel:()=>void};
let {slotLabel,onStart,onCancel}:Props=$props();
const profiles=[
{country:'Bangladesh',nationality:'Bangladeshi',currency:'BDT',scale:100,cities:['Dhaka','Chattogram','Rajshahi','Sylhet','Khulna'],languages:['Bengali']},
{country:'India',nationality:'Indian',currency:'INR',scale:100,cities:['Delhi','Mumbai','Kolkata','Bengaluru','Chennai'],languages:['Bengali','Hindi','Tamil','English']},
{country:'United States',nationality:'American',currency:'USD',scale:1,cities:['New York','Chicago','Austin','Seattle'],languages:['English','Spanish']},
{country:'United Kingdom',nationality:'British',currency:'GBP',scale:1,cities:['London','Manchester','Birmingham','Bristol'],languages:['English','Welsh']},
{country:'Canada',nationality:'Canadian',currency:'CAD',scale:1,cities:['Toronto','Vancouver','Montreal','Ottawa'],languages:['English','French']},
{country:'Australia',nationality:'Australian',currency:'AUD',scale:1,cities:['Sydney','Melbourne','Brisbane','Perth'],languages:['English']},
{country:'Japan',nationality:'Japanese',currency:'JPY',scale:100,cities:['Tokyo','Osaka','Kyoto','Yokohama'],languages:['Japanese']},
{country:'Nigeria',nationality:'Nigerian',currency:'NGN',scale:1000,cities:['Lagos','Abuja','Kano','Ibadan'],languages:['English','Hausa','Igbo','Yoruba']},
{country:'Brazil',nationality:'Brazilian',currency:'BRL',scale:10,cities:['São Paulo','Rio de Janeiro','Brasília','Salvador'],languages:['Portuguese']},
{country:'Germany',nationality:'German',currency:'EUR',scale:1,cities:['Berlin','Hamburg','Munich','Cologne'],languages:['German']}];
const backgrounds=['Working-class','Modest','Comfortable','Affluent'];
let age=$state(18),name=$state(''),gender=$state<Gender>('male'),country=$state('Bangladesh'),birthplace=$state('Dhaka'),language=$state('Bengali'),background=$state('Modest');
let generated=$state<Character>(generateRandomCharacter(18));
const profile=$derived(profiles.find((item)=>item.country===country)??profiles[0]);
function syncOptions(){birthplace=profile.cities[0];language=profile.languages[0];}
function suggestName(){const next=generateRandomCharacter(age);generated=next;name=next.name;}
function start(){
const next=generateRandomCharacter(age);next.name=name.trim().slice(0,28)||next.name;next.gender=gender;next.nationality=profile.nationality;next.country=profile.country;next.currency=profile.currency;next.currencyScale=profile.scale;next.birthplace=birthplace;next.language=language;next.familyBackground=background;
const base=age<16?0:age<18?120:850;const mult=background==='Working-class'?.65:background==='Modest'?.9:background==='Comfortable'?1.15:1.55;next.money=Math.round(base*profile.scale*mult);
if(next.family)next.family={...next.family,people:next.family.people.map((person)=>person.id===next.family?.playerPersonId?{...person,name:next.name,gender}:person)};
next.history=next.history.map((item,index)=>index===0?{...item,description:next.name+' begins life at age '+age+' in '+birthplace+', '+profile.country+'. Their '+background.toLowerCase()+' upbringing shapes the starting point, but the choices ahead are yours.'}:item);
onStart(next);
}
</script>
<section class="creation-experience custom-start-wizard">
<div class="creation-heading"><div class="eyebrow">CUSTOM STARTING LIFE</div><h1>Build your <em>beginning.</em></h1><p>Set the character's identity and starting circumstances. The simulation will create the rest of their background.</p></div>
<div class="custom-wizard-grid"><div class="custom-form-card">
<div class="custom-form-section"><span>01 · IDENTITY</span><label>Character name<div class="custom-name-row"><input bind:value={name} maxlength="28" placeholder="Enter a name"/><button class="secondary-button" type="button" onclick={suggestName}>Suggest</button></div></label><label>Gender<select bind:value={gender}><option value="male">Male</option><option value="female">Female</option><option value="non-binary">Non-binary</option></select></label></div>
<div class="custom-form-section"><span>02 · ORIGIN</span><label>Nationality / country<select bind:value={country} onchange={syncOptions}>{#each profiles as item}<option value={item.country}>{item.nationality} · {item.country}</option>{/each}</select></label><label>Birthplace<select bind:value={birthplace}>{#each profile.cities as city}<option value={city}>{city}</option>{/each}</select></label><label>Primary language<select bind:value={language}>{#each profile.languages as item}<option value={item}>{item}</option>{/each}</select></label></div>
<div class="custom-form-section"><span>03 · STARTING CIRCUMSTANCES</span><label>Starting age <strong class="custom-age-value">{age}</strong><input class="custom-age-range" type="range" min="0" max="90" step="1" bind:value={age}/><div class="custom-range-ends"><small>Birth</small><small>90 years</small></div></label><label>Upbringing<select bind:value={background}>{#each backgrounds as item}<option value={item}>{item}</option>{/each}</select></label></div>
<div class="custom-form-actions"><button class="primary-button" onclick={start}>Create this life <span>→</span></button><button class="text-button" onclick={onCancel}>Back to menu</button></div><small class="start-note">Starting funds and early-life circumstances reflect this upbringing. Currency follows the selected country.</small>
</div><aside class="custom-preview-card"><div class="eyebrow">STARTING PROFILE</div><div class="custom-avatar">{(name.trim()||'Y').slice(0,1).toUpperCase()}</div><h2>{name.trim()||'Your character'}</h2><p>{gender==='non-binary'?'Non-binary':gender==='female'?'Female':'Male'} · Age {age}</p><div class="custom-preview-list"><div><span>Nationality</span><strong>{profile.nationality}</strong></div><div><span>Birthplace</span><strong>{birthplace}</strong></div><div><span>Language</span><strong>{language}</strong></div><div><span>Upbringing</span><strong>{background}</strong></div><div><span>Currency</span><strong>{profile.currency}</strong></div><div><span>Starting funds</span><strong>{formatCharacterMoney({...generated,currency:profile.currency,currencyScale:profile.scale,money:Math.round((age<16?0:age<18?120:850)*profile.scale*(background==='Working-class'?.65:background==='Modest'?.9:background==='Comfortable'?1.15:1.55))})}</strong></div></div></aside></div></section>