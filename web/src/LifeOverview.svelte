<script lang="ts">
  import type { Character } from './lib/types';
  import { getLifeStage, getValueColor } from './lib/progression';

  let { character }: { character: Character } = $props();
  const stats = $derived([
    { label: 'Health', value: character.health, inverse: false },
    { label: 'Stamina', value: character.stamina ?? 50, inverse: false },
    { label: 'Intelligence', value: character.intelligence, inverse: false },
    { label: 'Fitness', value: character.fitness, inverse: false },
    { label: 'Happiness', value: character.happiness, inverse: false },
    { label: 'Stress', value: character.stress ?? 30, inverse: true }
  ]);
  const household = $derived(character.householdArrangement === 'family-supported' ? 'Family home'
    : character.householdArrangement === 'shared' ? 'Shared home'
    : character.householdArrangement === 'independent' ? 'Independent living'
    : 'Not arranged');
  const familyAtHome = $derived((character.family?.people ?? []).filter((person) =>
    person.id !== character.family?.playerPersonId &&
    (character.family?.householdMemberIds ?? []).includes(person.id) &&
    (person.deathYear === undefined || person.deathYear > character.year)
  ).length);
  const stage = $derived(getLifeStage(character.age));
</script>

<div class="page-heading life-overview-heading">
  <div><div class="eyebrow">LIFE AT A GLANCE</div><h1>Life <em>Overview</em></h1><p>Your current circumstances and the things shaping this chapter of your life.</p></div>
  <div class="life-overview-age"><strong>{character.age}</strong><span>YEARS OLD</span></div>
</div>

<section class="life-overview-panel domain-panel">
  <div class="life-overview-intro">
    <div><span class="eyebrow">CURRENT LIFE STAGE</span><h2>{stage.label}</h2><p>{stage.description}</p></div>
    <span class="life-overview-stage">{stage.ageRange}</span>
  </div>
  <div class="life-overview-facts">
    <div><small>EDUCATION</small><strong>{character.education || 'Not enrolled'}</strong></div>
    <div><small>WORK</small><strong>{character.employment ? 'Employed' : character.age >= 18 ? 'Not employed' : 'Not available yet'}</strong></div>
    <div><small>HOME</small><strong>{household}</strong></div>
    <div><small>FAMILY AT HOME</small><strong>{familyAtHome} {familyAtHome === 1 ? 'person' : 'people'}</strong></div>
  </div>
</section>

<section class="life-overview-stats domain-panel">
  <div class="section-heading"><div><span class="section-index">01</span><h3>Character Stats</h3></div><span class="section-hint">Current abilities and wellbeing</span></div>
  <div class="life-overview-stat-grid">
    {#each stats as stat}
      <div class="life-overview-stat">
        <div><span>{stat.label}</span><strong>{Math.round(stat.value)}%</strong></div>
        <div class="meter"><span style="width:{stat.value}%;background:{getValueColor(stat.value, stat.inverse)}"></span></div>
      </div>
    {/each}
  </div>
</section>

<style>
  .life-overview-heading{align-items:center}
  .life-overview-age{display:grid;justify-items:center;gap:2px;min-width:76px;padding:8px 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
  .life-overview-age strong{font-size:25px;line-height:1;font-weight:800;font-variant-numeric:tabular-nums}
  .life-overview-age span,.life-overview-facts small{font-size:8px;letter-spacing:1px;font-weight:800;color:var(--subtle)}
  .life-overview-panel,.life-overview-stats{display:grid;gap:16px;padding:16px}
  .life-overview-intro{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
  .life-overview-intro h2{margin:5px 0;font-size:20px}
  .life-overview-intro p{margin:0;color:var(--muted);font-size:12px;line-height:1.5;max-width:560px}
  .life-overview-stage{padding:5px 8px;border:1px solid var(--line);border-radius:8px;color:var(--muted);font-size:10px;font-weight:750;white-space:nowrap}
  .life-overview-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
  .life-overview-facts>div{display:grid;gap:5px;min-width:0;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--surface)}
  .life-overview-facts strong{font-size:12px;line-height:1.35;overflow-wrap:anywhere}
  .life-overview-stat-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px}
  .life-overview-stat{display:grid;gap:7px;min-width:0}
  .life-overview-stat>div:first-child{display:flex;justify-content:space-between;gap:8px}
  .life-overview-stat span{font-size:11px;color:var(--muted)}
  .life-overview-stat strong{font-size:12px;font-variant-numeric:tabular-nums}
  .life-overview-stat .meter{height:6px;overflow:hidden;border-radius:99px;background:var(--surface-raised,var(--surface))}
  .life-overview-stat .meter span{display:block;height:100%;border-radius:inherit}
  @media(max-width:560px){.life-overview-facts{grid-template-columns:repeat(2,minmax(0,1fr))}.life-overview-panel,.life-overview-stats{padding:12px}.life-overview-stat-grid{gap:12px}}
</style>
