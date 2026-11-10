<script lang="ts">
  import type { Character } from './lib/types';
  import { establishFamilyBackground, getFamilyConnections, validateFamilyState } from './lib/family';
  import { getValueColor } from './lib/progression';
  import ActivityStatusSeal from './components/ActivityStatusSeal.svelte';
  import { formatCharacterMoney, planFamilyInteractionInNextFreeTime, planSocialInteractionInNextFreeTime, removePlannedActivity } from './lib/simulation';
  import { addSocialConnection, removeSocialConnection, setSocialConnectionHousehold } from './lib/lifestyle';

  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  let supportAmount = $state(0);
  let socialName = $state('');
  let socialType = $state<'friend' | 'partner' | 'child' | 'extended-family'>('friend');
  let socialLivesTogether = $state(false);
  let feedback = $state('');
  const connections = $derived(getFamilyConnections(character));
  const family = $derived(character.family);
  const errors = $derived(family ? validateFamilyState(family) : []);
  const livingCount = $derived(connections.filter((item) => item.living).length);
  const socialConnections = $derived(character.socialConnections ?? []);
  function addSocialPerson() {
    const next = addSocialConnection(character, socialName, socialType, socialLivesTogether);
    if (next === character) { feedback = 'Check the name, age requirement and whether a partner is already recorded.'; return; }
    onChange(next);
    feedback = socialName.trim() + ' added to your social circle.';
    socialName = '';
    socialLivesTogether = false;
  }
  function removeSocialPerson(id: string) {
    onChange(removeSocialConnection(character, id));
    feedback = 'Social connection removed.';
  }
  function socialInteractionPlanned(id: string) {
    return (character.weeklyPlan?.activities ?? []).find((item) => item.action?.kind === 'social' && item.action.connectionId === id);
  }
  function interactSocial(id: string) {
    const existing = socialInteractionPlanned(id);
    if (existing) {
      onChange(removePlannedActivity(character, existing.id));
      feedback = 'Time together removed from this week.';
      return;
    }
    const planned = planSocialInteractionInNextFreeTime(character, id);
    if (planned.issue) { feedback = planned.message ?? 'Could not plan time together.'; return; }
    onChange(planned.character);
    feedback = 'Time together added to this week.';
  }
  function toggleSocialHousehold(id: string, livesWithPlayer: boolean) {
    onChange(setSocialConnectionHousehold(character, id, livesWithPlayer));
  }
  function interactionPlanned(personId: string, action: 'spend-time' | 'reach-out' | 'reconcile' | 'provide-support') {
    return (character.weeklyPlan?.activities ?? []).some((item) => item.action?.kind === 'family' && item.action.personId === personId && item.action.interaction === action);
  }
  function interact(personId: string, action: 'spend-time' | 'reach-out' | 'reconcile' | 'provide-support') {
    const existing = (character.weeklyPlan?.activities ?? []).find((item) => item.action?.kind === 'family' && item.action.personId === personId && item.action.interaction === action);
    if (existing) { onChange(removePlannedActivity(character, existing.id)); feedback = 'Interaction removed from this week.'; return; }
    const planned = planFamilyInteractionInNextFreeTime(character, personId, action, supportAmount);
    if (planned.issue) { feedback = planned.message ?? 'That interaction could not be added.'; return; }
    onChange(planned.character);
    feedback = 'Interaction added to this week. It will take effect when the week resolves.';
  }
</script>

<section class="family-workspace">
  {#if !family}
    <section class="family-panel">
      <div class="eyebrow">LIFE RECORDS</div>
      <h2>No background yet</h2>
      <p>Your story is missing its starting relationships. Create a background to begin.</p>
      <button class="primary-action" onclick={() => onChange(establishFamilyBackground(character))}>Begin</button>
    </section>
  {:else if errors.length > 0}
    <section class="family-panel warning">
      <div class="eyebrow">RECORD CHECK</div>
      <h2>Your relationship history needs attention</h2>
      {#each errors as error}<p>{error}</p>{/each}
      <p>Your progress has not been changed. Export a game snapshot before trying to repair these entries.</p>
    </section>
  {:else}
    {#if feedback}<p class="family-footnote" role="status">{feedback}</p>{/if}
    <section class="family-panel">
      <div class="family-panel-head">
        <div><div class="eyebrow">YOUR PEOPLE</div><h2>Your relatives</h2><p>Spend time, reach out or make things right. Your choices use stamina and shape these relationships when the week ends.</p></div>
        <span class="family-count">{livingCount} living</span>
      </div>
      <div class="family-summary">
        <div><strong>{connections.length}</strong><span>Relatives</span></div>
        <div><strong>{family.householdMemberIds.length}</strong><span>At home</span></div>
        <div><strong>{family.dependentPersonIds.length}</strong><span>You support</span></div>
      </div>
      {#if character.age < 18 && family.primaryGuardianId}
        <div class="guardian-note">{family.people.find((person) => person.id === family.primaryGuardianId)?.name ?? 'Your guardian'} looks after you.</div>
      {/if}
    </section>

    {#if connections.length === 0}
      <section class="family-panel"><h3>No relatives yet</h3><p>You haven't met or recorded any relatives in this story yet.</p></section>
    {:else}
      <div class="family-list">
        {#each connections as connection (connection.person.id)}
          <article class="relative-card">
            <div class="relative-head">
              <div><h3>{connection.person.name}</h3><p>{connection.role} · {connection.living ? 'Age ' : 'Died at age '}{connection.age}{connection.livesTogether ? ' · Lives with you' : ''}</p></div>
              <span class:deceased={!connection.living} class="relative-status">{connection.living ? 'Living' : 'Deceased'}</span>
            </div>
            {#if connection.bond}
              <div class="bond-grid">
                <div><span>Closeness</span><strong>{connection.bond.closeness}/100</strong><div class="bond-meter"><i style="width:{connection.bond.closeness}%;background:{getValueColor(connection.bond.closeness)}"></i></div></div>
                <div><span>Trust</span><strong>{connection.bond.trust}/100</strong><div class="bond-meter"><i style="width:{connection.bond.trust}%;background:{getValueColor(connection.bond.trust)}"></i></div></div>
                <div><span>Tension</span><strong>{connection.bond.tension}/100</strong><div class="bond-meter tension"><i style="width:{connection.bond.tension}%;background:{getValueColor(connection.bond.tension, true)}"></i></div></div>
              </div>
              {#if connection.bond.lastInteractionYear !== null}
                <p class="last-contact">Last time you connected: {connection.bond.lastInteractionYear}</p>
              {:else}
                <p class="last-contact">You haven't connected yet.</p>
              {/if}
              {#if connection.living}
                <div class="relative-actions">
                  <button onclick={() => interact(connection.person.id, 'spend-time')}>{interactionPlanned(connection.person.id, 'spend-time') ? 'Cancel plan' : 'Spend time · 6 stamina'} <ActivityStatusSeal status={interactionPlanned(connection.person.id, 'spend-time') ? 'planned' : 'available'} /></button>
                  {#if character.age >= 10}<button onclick={() => interact(connection.person.id, 'reach-out')}>{interactionPlanned(connection.person.id, 'reach-out') ? 'Cancel plan' : 'Reach out · 6 stamina'} <ActivityStatusSeal status={interactionPlanned(connection.person.id, 'reach-out') ? 'planned' : 'available'} /></button>{/if}
                  {#if character.age >= 13 && connection.bond.tension >= 15}<button onclick={() => interact(connection.person.id, 'reconcile')}>{interactionPlanned(connection.person.id, 'reconcile') ? 'Remove plan' : 'Work through conflict · 6 stamina'} <ActivityStatusSeal status={interactionPlanned(connection.person.id, 'reconcile') ? 'planned' : 'available'} /></button>{/if}
                </div>
                {#if character.age >= 18}
                  <div class="support-row">
                    <label>Amount to send
                      <input type="number" min="1" step="1" bind:value={supportAmount} />
                    </label>
                    <button disabled={!interactionPlanned(connection.person.id, 'provide-support') && (!Number.isSafeInteger(supportAmount) || supportAmount <= 0 || supportAmount > character.money)} onclick={() => interact(connection.person.id, 'provide-support')}>{interactionPlanned(connection.person.id, 'provide-support') ? 'Cancel plan' : 'Send money · 3 stamina'} <ActivityStatusSeal status={interactionPlanned(connection.person.id, 'provide-support') ? 'planned' : 'available'} /></button>
                  </div>
                  <p class="support-note">Cash available: {formatCharacterMoney(character)}. This gift will appear in your finances.</p>
                {/if}
              {/if}
            {/if}
          </article>
        {/each}
      </div>
    {/if}

    <section class="family-panel social-panel">
      <div class="eyebrow">YOUR SOCIAL CIRCLE</div>
      <h3>The people around you</h3>
      <p>Add friends, partners and others who shape your story.</p>
      <div class="family-culture-note"><strong>Home life · {(character.familyCulture ?? 'supportive').replace('-', ' ')}</strong><span>{character.familyCulture === 'structured' ? 'Regular meals and routines keep life organised.' : character.familyCulture === 'strained' ? 'There is some support at home, but tension gets in the way.' : character.familyCulture === 'neglectful' ? 'Meals and day-to-day support are less reliable.' : 'Shared meals and encouragement make everyday life easier.'}</span></div>
      <div class="social-add-row">
        <input aria-label="Person name" placeholder="Person's name" bind:value={socialName} maxlength="40" />
        <select aria-label="Relationship type" bind:value={socialType}>
          <option value="friend">Friend</option><option value="partner">Partner / spouse</option><option value="child">Child</option><option value="extended-family">Extended family</option>
        </select>
        <label><input type="checkbox" bind:checked={socialLivesTogether} /> Shares my home</label>
        <button class="primary-action" onclick={addSocialPerson} disabled={!socialName.trim()}>Add person</button>
      </div>
      {#if socialConnections.length}
        <div class="social-list">
          {#each socialConnections as person (person.id)}
            <article>
              <div><strong>{person.name}</strong><small>{person.type.replace('-', ' ')} · {person.closeness}/100 closeness</small></div>
              <label><input type="checkbox" checked={person.livesWithPlayer} onchange={(event) => toggleSocialHousehold(person.id, event.currentTarget.checked)} /> Shares your home</label>
              <button disabled={person.closeness >= 100 && !socialInteractionPlanned(person.id)} onclick={() => interactSocial(person.id)}>{socialInteractionPlanned(person.id) ? 'Remove plan' : person.closeness >= 100 ? 'Strong bond' : 'Spend time · 6 stamina'}</button>
              <button onclick={() => removeSocialPerson(person.id)} aria-label={'Remove ' + person.name}>Remove</button>
            </article>
          {/each}
        </div>
      {:else}
        <p class="family-footnote">No connections added yet.</p>
      {/if}
    </section>

    <section class="family-panel">
      <div class="eyebrow">YOUR STORY</div>
      <h3>Shared moments</h3>
      {#if family.history.length === 0}<p>No moments recorded yet.</p>{:else}
        <div class="family-timeline">
          {#each [...family.history].reverse() as item (item.id)}
            <article><strong>{item.title}</strong><p>{item.description}</p><small>{item.year} · {item.type.replace('-', ' ')}</small></article>
          {/each}
        </div>
      {/if}
    </section>
    <p class="family-footnote">Every choice leaves a mark. Time together can build trust, bring you closer or help resolve old tension.</p>
  {/if}
</section>

<style>
  .family-workspace{display:grid;gap:12px;min-width:0}
  .family-panel,.relative-card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px;min-width:0}
  .family-panel h2{font-size:20px;letter-spacing:-.4px;margin:4px 0}
  .family-panel h3,.relative-card h3{font-size:14px;margin:0}
  .family-panel p,.relative-card p{font-size:12px;color:var(--muted);line-height:1.55;margin:5px 0 0}
  .eyebrow{font-size:10px;font-weight:800;letter-spacing:1.1px;color:var(--accent)}
  .family-panel-head,.relative-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
  .family-count,.relative-status{font-size:10px;font-weight:750;border:1px solid var(--line);border-radius:20px;padding:5px 8px;color:var(--accent);white-space:nowrap}
  .relative-status.deceased{color:var(--muted)}
  .family-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}
  .family-summary div{background:var(--surface-raised);border-radius:10px;padding:10px;display:grid;gap:3px}
  .family-summary strong{font-size:18px}.family-summary span{font-size:10px;color:var(--muted)}
  .guardian-note{margin-top:12px;padding:10px;border-radius:9px;background:var(--accent-soft);font-size:11px;line-height:1.5;color:var(--text)}
  .family-list{display:grid;gap:10px}
  .family-culture-note{display:grid;gap:3px;margin-top:9px;padding:9px;border:1px solid var(--line);border-radius:9px;background:var(--surface-raised)}
  .family-culture-note strong{font-size:10px;text-transform:capitalize}
  .family-culture-note span{font-size:9px;line-height:1.4;color:var(--muted)}
  .social-add-row{display:grid;grid-template-columns:1.2fr 1fr;gap:8px;margin-top:12px}
  .social-add-row>input,.social-add-row>select{min-width:0;min-height:38px;border:1px solid var(--line);border-radius:9px;background:var(--surface-raised);color:var(--text);padding:0 9px;font-size:11px}
  .social-add-row>label,.social-list label{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--muted)}
  .social-add-row button{grid-column:2}
  .social-list{display:grid;gap:7px;margin-top:12px}
  .social-list article{display:flex;align-items:center;gap:10px;padding:9px;border-radius:9px;background:var(--surface-raised)}
  .social-list article>div{flex:1;min-width:0;display:grid;gap:3px}
  .social-list strong{font-size:11px}.social-list small{font-size:9px;color:var(--muted);text-transform:capitalize}
  .social-list button{border:1px solid var(--line);border-radius:7px;background:transparent;color:var(--muted);padding:6px 8px;font-size:9px}
  .social-panel>p{margin-top:5px}
  .relative-card{display:grid;gap:12px}
  .relative-head h3{font-size:15px}
  .bond-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
  .bond-grid>div{display:grid;grid-template-columns:1fr auto;gap:5px;align-items:center}
  .bond-grid span{font-size:10px;color:var(--muted)}.bond-grid strong{font-size:11px}
  .bond-meter{grid-column:1/-1;height:5px;border-radius:8px;background:var(--surface-raised);overflow:hidden}
  .bond-meter i{display:block;height:100%;border-radius:8px;background:var(--accent)}
  .bond-meter.tension i{background:var(--warning)}
  .last-contact,.support-note{font-size:10px!important}
  .relative-actions{display:flex;flex-wrap:wrap;gap:7px}
  .relative-actions button,.support-row button,.primary-action{min-height:38px;border:1px solid var(--line);border-radius:9px;padding:8px 11px;background:var(--surface-raised);color:var(--text);font-size:11px;font-weight:700}
  .relative-actions button:disabled,.support-row button:disabled{opacity:.4}
  
  .support-row{display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap}
  .support-row label{display:grid;gap:4px;font-size:10px;color:var(--muted);flex:1;min-width:120px}
  .support-row input{width:100%;min-height:38px;border:1px solid var(--line);border-radius:9px;background:var(--surface-raised);color:var(--text);padding:0 9px}
  .primary-action{margin-top:10px;background:var(--accent-soft);border-color:var(--line-strong);color:var(--accent)}
  .family-timeline{display:grid;gap:10px;margin-top:12px}
  .family-timeline article{border-left:2px solid var(--line-strong);padding:2px 0 2px 10px}
  .family-timeline strong{font-size:12px}.family-timeline small{font-size:9px;color:var(--muted);text-transform:uppercase}
  .family-footnote{font-size:10px;color:var(--muted);line-height:1.5;margin:0 2px}
  .warning{border-color:var(--warning)}
  @media(max-width:420px){.family-summary{gap:5px}.family-summary div{padding:8px}.bond-grid{gap:6px}.relative-head{align-items:center}.social-add-row{grid-template-columns:1fr}.social-add-row button{grid-column:auto}.social-list article{flex-wrap:wrap}}
</style>
