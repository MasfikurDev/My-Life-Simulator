<script lang="ts">
  import type { Character } from './lib/types';
  import { establishFamilyBackground, getFamilyConnections, validateFamilyState } from './lib/family';
  import { getValueColor } from './lib/progression';
  import { formatCharacterMoney, planFamilyInteractionInNextFreeTime, removePlannedActivity } from './lib/simulation';

  let { character, onChange }: { character: Character; onChange: (next: Character) => void } = $props();
  let supportAmount = $state(0);
  let feedback = $state('');
  const connections = $derived(getFamilyConnections(character));
  const family = $derived(character.family);
  const errors = $derived(family ? validateFamilyState(family) : []);
  const livingCount = $derived(connections.filter((item) => item.living).length);
  function interactionPlanned(personId: string, action: 'spend-time' | 'reach-out' | 'reconcile' | 'provide-support') {
    return (character.weeklySchedule?.activities ?? []).some((item) => item.action?.kind === 'family' && item.action.personId === personId && item.action.interaction === action);
  }
  function interact(personId: string, action: 'spend-time' | 'reach-out' | 'reconcile' | 'provide-support') {
    const existing = (character.weeklySchedule?.activities ?? []).find((item) => item.action?.kind === 'family' && item.action.personId === personId && item.action.interaction === action);
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
      <div class="eyebrow">FAMILY RECORDS</div>
      <h2>Family background not established</h2>
      <p>This save does not contain family records yet. You can create a modest family-of-origin background now. It will not assume a partner or children, and it will not change your character's stats or finances.</p>
      <button class="primary-action" onclick={() => onChange(establishFamilyBackground(character))}>Establish family background</button>
    </section>
  {:else if errors.length > 0}
    <section class="family-panel warning">
      <div class="eyebrow">FAMILY DATA NEEDS ATTENTION</div>
      <h2>Family records could not be validated</h2>
      {#each errors as error}<p>{error}</p>{/each}
      <p>Your existing save has not been changed. Export a gameplay snapshot before attempting recovery.</p>
    </section>
  {:else}
    {#if feedback}<p class="family-footnote" role="status">{feedback}</p>{/if}
    <section class="family-panel">
      <div class="family-panel-head">
        <div><div class="eyebrow">YOUR FAMILY</div><h2>Family connections</h2><p>People and relationships recorded in this life. Toggle an interaction to include or remove it from this week. Family interactions use stamina, not calendar slots.</p></div>
        <span class="family-count">{livingCount} living</span>
      </div>
      <div class="family-summary">
        <div><strong>{connections.length}</strong><span>Recorded relatives</span></div>
        <div><strong>{family.householdMemberIds.length}</strong><span>In your household</span></div>
        <div><strong>{family.dependentPersonIds.length}</strong><span>Dependants</span></div>
      </div>
      {#if character.age < 18 && family.primaryGuardianId}
        <div class="guardian-note">Primary guardian: {family.people.find((person) => person.id === family.primaryGuardianId)?.name ?? 'Recorded guardian'}. Your care and household context are represented separately from your financial status.</div>
      {/if}
    </section>

    {#if connections.length === 0}
      <section class="family-panel"><h3>No relatives recorded</h3><p>This is a valid family structure. Future family relationships can be added through explicit gameplay decisions.</p></section>
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
                <p class="last-contact">Last meaningful interaction: {connection.bond.lastInteractionYear}</p>
              {:else}
                <p class="last-contact">No meaningful interaction recorded yet.</p>
              {/if}
              {#if connection.living}
                <div class="relative-actions">
                  <button class:planned={interactionPlanned(connection.person.id, 'spend-time')} onclick={() => interact(connection.person.id, 'spend-time')}>{interactionPlanned(connection.person.id, 'spend-time') ? 'Remove spend-time plan' : 'Spend time · 6 stamina'}</button>
                  {#if character.age >= 10}<button class:planned={interactionPlanned(connection.person.id, 'reach-out')} onclick={() => interact(connection.person.id, 'reach-out')}>{interactionPlanned(connection.person.id, 'reach-out') ? 'Remove reach-out plan' : 'Reach out · 6 stamina'}</button>{/if}
                  {#if character.age >= 13 && connection.bond.tension >= 15}<button class:planned={interactionPlanned(connection.person.id, 'reconcile')} onclick={() => interact(connection.person.id, 'reconcile')}>{interactionPlanned(connection.person.id, 'reconcile') ? 'Remove plan' : 'Work through conflict · 6 stamina'}</button>{/if}
                </div>
                {#if character.age >= 18}
                  <div class="support-row">
                    <label>Support amount
                      <input type="number" min="1" step="1" bind:value={supportAmount} />
                    </label>
                    <button class:planned={interactionPlanned(connection.person.id, 'provide-support')} disabled={!interactionPlanned(connection.person.id, 'provide-support') && (!Number.isSafeInteger(supportAmount) || supportAmount <= 0 || supportAmount > character.money)} onclick={() => interact(connection.person.id, 'provide-support')}>{interactionPlanned(connection.person.id, 'provide-support') ? 'Remove support plan' : 'Provide support · 3 stamina'}</button>
                  </div>
                  <p class="support-note">Available cash: {formatCharacterMoney(character)}. Support is an actual expense and is recorded in Finance.</p>
                {/if}
              {/if}
            {/if}
          </article>
        {/each}
      </div>
    {/if}

    <section class="family-panel">
      <div class="eyebrow">FAMILY HISTORY</div>
      <h3>Recorded milestones and interactions</h3>
      {#if family.history.length === 0}<p>No family events have been recorded yet.</p>{:else}
        <div class="family-timeline">
          {#each [...family.history].reverse() as item (item.id)}
            <article><strong>{item.title}</strong><p>{item.description}</p><small>{item.year} · {item.type.replace('-', ' ')}</small></article>
          {/each}
        </div>
      {/if}
    </section>
    <p class="family-footnote">Relationship measures are separate, bounded indicators—not a single score. They change through recorded interactions. Family support is not guaranteed, and no future partnership, parenthood, caregiving, or inheritance is assumed.</p>
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
  .relative-actions button.planned{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
  .support-row{display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap}
  .support-row label{display:grid;gap:4px;font-size:10px;color:var(--muted);flex:1;min-width:120px}
  .support-row input{width:100%;min-height:38px;border:1px solid var(--line);border-radius:9px;background:var(--surface-raised);color:var(--text);padding:0 9px}
  .primary-action{margin-top:10px;background:var(--accent-soft);border-color:var(--line-strong);color:var(--accent)}
  .family-timeline{display:grid;gap:10px;margin-top:12px}
  .family-timeline article{border-left:2px solid var(--line-strong);padding:2px 0 2px 10px}
  .family-timeline strong{font-size:12px}.family-timeline small{font-size:9px;color:var(--muted);text-transform:uppercase}
  .family-footnote{font-size:10px;color:var(--muted);line-height:1.5;margin:0 2px}
  .warning{border-color:var(--warning)}
  @media(max-width:420px){.family-summary{gap:5px}.family-summary div{padding:8px}.bond-grid{gap:6px}.relative-head{align-items:center}}
</style>
