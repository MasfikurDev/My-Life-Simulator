<script lang="ts">
  import { acceptJobOffer, acceptPromotionOffer, declineJobOffer, declinePromotionOffer, formatCharacterMoney, planActivityInNextFreeTime, planWorkActionInNextFreeTime, resignFromJob } from './lib/simulation';
  import { getCareerPath, getCareerRequirements, getCareerRole, getJobListings, getPromotionReadiness, isEligibleForRole } from './lib/work';
  import type { CareerPathId, Character } from './lib/types';

  let { character, onChange, onNotify }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void } = $props();
  type WorkView = 'jobs' | 'career' | 'history';
  let activeView = $state<WorkView>('jobs');
  let selectedPath = $state<CareerPathId>('operations');
  let confirmResignation = $state(false);

  const listings = $derived(getJobListings(character));
  const currentRole = $derived(getCareerRole(character.employment?.roleId, character.employment?.title));
  const promotion = $derived(getPromotionReadiness(character));
  const careerRoles = $derived(getCareerPath(selectedPath));
  $effect(() => { if (currentRole) selectedPath = currentRole.pathId; });
  const careerEvents = $derived(character.history.filter((item) => /job|work|career|promotion|interview|employment/i.test(item.title + ' ' + item.description)));

  function planWork(workAction: 'apply' | 'interview', jobId: string) {
    const result = planWorkActionInNextFreeTime(character, workAction, jobId);
    if (result.issue) { onNotify(result.message ?? 'That work activity could not be scheduled.'); return; }
    onChange(result.character);
    const slot = result.scheduledActivity;
    const when = slot ? slot.date + ' (' + slot.startPeriod + ')' : 'this week';
    onNotify(workAction === 'apply' ? 'Application confirmed for ' + when + '.' : 'Interview confirmed for ' + when + '.');
  }
  function confirmLeaveJob() {
    const next = resignFromJob(character);
    if (next === character) return;
    onChange(next); confirmResignation = false; onNotify('You left your previous role. Your career experience is retained.');
  }
  function planDevelopment() {
    if (!character.employment) return;
    const result = planActivityInNextFreeTime(character, 'career');
    if (result.issue) { onNotify(result.message ?? 'No suitable time is available this week.'); return; }
    onChange(result.character);
    const slot = result.scheduledActivity;
    onNotify(slot ? 'Career development confirmed for ' + slot.date + ' (' + slot.startPeriod + ').' : 'Career development confirmed.');
  }
  function acceptOffer(id: string) {
    const next = acceptJobOffer(character, id);
    if (next === character) { onNotify('This offer is no longer valid.'); return; }
    onChange(next); onNotify('Offer accepted. Your new role is now active.');
  }
  function acceptPromotion() {
    const next = acceptPromotionOffer(character);
    if (next === character) { onNotify('This promotion offer is no longer valid.'); return; }
    onChange(next); onNotify('Promotion accepted.');
  }
  function moneyRange(min: number, max: number) {
    return formatCharacterMoney(character, min) + '–' + formatCharacterMoney(character, max);
  }
</script>

<section class="work-workspace">
  <header class="work-header">
    <div><div class="eyebrow">WORK & CAREER</div><h1>Work</h1><p>Find opportunities, build experience and make deliberate career decisions.</p></div>
    <span class="work-date">{character.calendar?.currentDate ?? character.year}</span>
  </header>
  <nav class="work-nav" aria-label="Work sections">
    <button class:active={activeView === 'jobs'} aria-current={activeView === 'jobs' ? 'page' : undefined} onclick={() => activeView='jobs'}>Jobs & applications</button>
    <button class:active={activeView === 'career'} aria-current={activeView === 'career' ? 'page' : undefined} onclick={() => activeView='career'}>Career path</button>
    <button class:active={activeView === 'history'} aria-current={activeView === 'history' ? 'page' : undefined} onclick={() => activeView='history'}>Career history</button>
  </nav>

  {#if character.promotionOffer}
    <section class="work-offer promotion-offer">
      <div><div class="eyebrow">PROMOTION OFFER</div><h2>{character.promotionOffer.title}</h2><p>New annual pay: <strong>{formatCharacterMoney(character, character.promotionOffer.annualSalary)}</strong> · Respond by {character.promotionOffer.expiresAt}</p></div>
      <div class="offer-actions"><button class="work-primary" onclick={acceptPromotion}>Accept promotion</button><button class="work-secondary" onclick={() => { onChange(declinePromotionOffer(character)); onNotify('Promotion declined.'); }}>Stay in current role</button></div>
    </section>
  {/if}

  {#if activeView === 'jobs'}
    {#if character.employment}
      <section class="work-panel current-job">
        <div class="work-panel-heading"><div><div class="eyebrow">CURRENT POSITION</div><h2>{character.employment.title}</h2><p>{character.employment.employer ?? 'Employer not recorded'} · {character.employment.type === 'part-time' ? 'Part-time' : character.employment.type === 'flexible' ? 'Flexible' : 'Full-time'}</p></div><span class="work-status">EMPLOYED</span></div>
        <div class="work-metrics">
          <div><span>Annual base pay</span><strong>{formatCharacterMoney(character, character.employment.annualSalary)}</strong></div>
          <div><span>Performance</span><strong>{character.employment.performance}/100</strong></div>
          <div><span>Role experience</span><strong>{character.employment.experienceYears} years</strong></div>
          <div><span>Career experience</span><strong>{character.careerExperienceYears ?? character.employment.experienceYears} years</strong></div>
        </div>
        <p class="work-note">Regular shifts: {character.employment.type === 'full-time' ? 'Monday–Friday, mornings and afternoons' : character.employment.type === 'part-time' ? 'Monday, Wednesday and Friday afternoons' : 'Tuesday, Thursday and Saturday mornings'}.</p>
        <p class="work-note">Pay is shown as annual base salary. Payroll is currently settled annually; monthly payroll and benefits are planned separately.</p>
        <div class="current-job-actions"><button class="work-secondary" onclick={planDevelopment}>Plan career development session</button><button class="work-secondary" onclick={() => confirmResignation = true}>Leave this job</button></div>
        {#if confirmResignation}<div class="resign-confirm"><strong>Leave {character.employment.title}?</strong><p>You will become unemployed. Your career experience and history will be kept.</p><div><button class="work-primary" onclick={confirmLeaveJob}>Confirm resignation</button><button class="work-secondary" onclick={() => confirmResignation = false}>Keep job</button></div></div>{/if}
      </section>
    {:else}
      <section class="work-panel">
        <div class="work-panel-heading"><div><div class="eyebrow">EMPLOYMENT STATUS</div><h2>Looking for work</h2><p>Applications take time. Shortlisted candidates receive an interview invitation, and successful interviews lead to an offer you can accept or decline.</p></div><span class="work-status">JOB SEARCH</span></div>
      </section>
    {/if}

    {#if (character.jobOffers ?? []).length > 0}
      <div class="work-section-heading"><div><span class="eyebrow">DECISION REQUIRED</span><h2>Job offers</h2></div><span>{character.jobOffers!.length} waiting</span></div>
      {#each character.jobOffers ?? [] as offer (offer.id)}
        <article class="work-listing offer-card">
          <div class="listing-main"><div class="eyebrow">{offer.employer}</div><h3>{offer.title}</h3><p>{offer.type === 'part-time' ? 'Part-time' : offer.type === 'flexible' ? 'Flexible' : 'Full-time'} · Annual base pay</p><strong class="listing-pay">{formatCharacterMoney(character, offer.annualSalary)} / year</strong><small>Offer expires {offer.expiresAt}</small></div>
          <div class="listing-actions"><button class="work-primary" onclick={() => acceptOffer(offer.id)}>Accept offer</button><button class="work-secondary" onclick={() => { onChange(declineJobOffer(character, offer.id)); onNotify('Offer declined.'); }}>Decline</button></div>
        </article>
      {/each}
    {/if}

    {#if (character.jobApplications ?? []).some((application) => application.status === 'interview')}
      <div class="work-section-heading"><div><span class="eyebrow">NEXT STEP</span><h2>Interview invitations</h2></div></div>
      {#each (character.jobApplications ?? []).filter((application) => application.status === 'interview') as application (application.id)}
        <article class="work-listing">
          <div class="listing-main"><div class="eyebrow">{application.employer}</div><h3>{application.title}</h3><p>Your application was shortlisted. Confirm the interview; the game will find two consecutive free periods.</p></div>
          <button class="work-primary" onclick={() => planWork('interview', application.id)}>Confirm interview</button>
        </article>
      {/each}
    {/if}

    <div class="work-section-heading"><div><span class="eyebrow">OPEN POSITIONS</span><h2>Job opportunities</h2></div><span>{listings.length} openings this week</span></div>
    {#if listings.length === 0}
      <section class="work-panel"><p>No suitable openings are listed this week. Check again after the next weekly advance.</p></section>
    {:else}
      <div class="work-list">
        {#each listings as listing (listing.id)}
          {@const role = getCareerRole(listing.roleId)}
          {@const requirements = role ? getCareerRequirements(character, role) : []}
          {@const eligible = role ? isEligibleForRole(character, role) : false}
          {@const alreadyApplied = (character.jobApplications ?? []).some((application) => application.listingId === listing.id)}
          <article class="work-listing">
            <div class="listing-main"><div class="eyebrow">{listing.employer} · {listing.sector}</div><h3>{listing.title}</h3><p>{listing.pathName} · {listing.type === 'part-time' ? 'Part-time' : listing.type === 'flexible' ? 'Flexible' : 'Full-time'} · {listing.location}</p><strong class="listing-pay">{formatCharacterMoney(character, listing.annualSalary)} / year</strong></div>
            <div class="listing-requirements">
              {#each requirements as requirement}
                <span class:met={requirement.met}><span>{requirement.met ? '✓' : '•'}</span>{requirement.label}: {requirement.detail}</span>
              {/each}
            </div>
            <div class="listing-actions">
              <button class="work-primary" disabled={!eligible || alreadyApplied} onclick={() => planWork('apply', listing.id)}>{alreadyApplied ? 'Applied' : eligible ? 'Apply' : 'Requirements not met'}</button>
            </div>
          </article>
        {/each}
      </div>
    {/if}
    {#if (character.jobApplications ?? []).length > 0}
      <div class="work-section-heading"><div><span class="eyebrow">TRACKING</span><h2>Applications</h2></div></div>
      <section class="work-panel application-list">
        {#each [...(character.jobApplications ?? [])].reverse() as application (application.id)}
          <div class="application-row"><div><strong>{application.title}</strong><small>{application.employer}</small></div><span class="application-status {application.status}">{application.status}</span><p>{application.outcome ?? ''}</p></div>
        {/each}
      </section>
    {/if}
  {:else if activeView === 'career'}
    <section class="work-panel">
      <div class="work-panel-heading"><div><div class="eyebrow">CAREER PROGRESSION</div><h2>{currentRole?.pathName ?? 'Explore career paths'}</h2><p>Career paths are guides, not promises. Estimated salary bands are not job offers.</p></div></div>
      <label class="path-picker">Career path
          <select bind:value={selectedPath}>
            <option value="operations">Operations</option><option value="customer-service">Customer service</option><option value="technology">Technology</option><option value="sales">Sales</option>
          </select>
      </label>
      <div class="career-path">
        {#each careerRoles as role, index (role.id)}
          {@const requirements = getCareerRequirements(character, role)}
          {@const current = character.employment?.roleId === role.id || (currentRole?.id === role.id)}
          {@const ready = isEligibleForRole(character, role)}
          <article class:current={current} class:eligible={ready} class="career-role">
            <div class="career-level">LEVEL {role.level}</div><div><h3>{role.title}</h3><p>{role.description}</p><strong>{moneyRange(Math.round(role.annualSalaryMin * (character.currencyScale ?? 1)), Math.round(role.annualSalaryMax * (character.currencyScale ?? 1)))} <small>estimated full-time annual pay</small></strong></div>
            <span class="career-state">{current ? 'Current role' : ready ? 'Meets entry requirements' : 'Future opportunity'}</span>
            {#if !current}<details><summary>View requirements</summary><ul>{#each requirements as requirement}<li class:met={requirement.met}>{requirement.met ? '✓' : '•'} {requirement.label}: {requirement.detail}</li>{/each}</ul></details>{/if}
          </article>
          {#if index < careerRoles.length - 1}<div class="career-connector"></div>{/if}
        {/each}
      </div>
      {#if character.employment && promotion.role}
        <div class="promotion-readiness">
          <div class="eyebrow">NEXT ROLE READINESS</div><h3>{promotion.role.title}</h3><p>Performance and role requirements are assessed separately. There is no fixed weekly promotion timer.</p>
          <ul>{#each promotion.requirements as requirement}<li class:met={requirement.met}>{requirement.met ? '✓' : '•'} {requirement.label}: {requirement.detail}</li>{/each}</ul>
          {#if promotion.salaryEstimate}<p>Estimated annual pay range: <strong>{moneyRange(promotion.salaryEstimate.min, promotion.salaryEstimate.max)}</strong></p>{/if}
          <p class="work-note">{promotion.ready ? 'You meet the current criteria. A promotion decision is made during annual career review.' : 'Work on the unmet requirements to become eligible.'}</p>
        </div>
      {/if}
    </section>
  {:else}
    <div class="work-section-heading"><div><span class="eyebrow">RECORDED OUTCOMES</span><h2>Career history</h2></div><span>{careerEvents.length} records</span></div>
    <section class="work-panel career-history">
      {#if careerEvents.length === 0}<p>No career events have been recorded yet.</p>{:else}
        {#each careerEvents as item}
          <article><span class="history-dot"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></article>
        {/each}
      {/if}
    </section>
  {/if}
</section>

<style>
  .work-workspace{display:grid;gap:14px;min-width:0}
  .work-header{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
  .work-header h1{margin:4px 0;color:var(--text);font-size:clamp(25px,4vw,34px);letter-spacing:-.8px}
  .work-header p{margin:0;color:var(--muted);font-size:12px;line-height:1.5}
  .work-date{flex:none;padding:8px 10px;border:1px solid var(--line);border-radius:9px;color:var(--muted);font-size:10px}
  .work-nav{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px}
  .work-nav button{flex:none;min-height:40px;padding:0 12px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--muted);font-size:11px;font-weight:650}
  .work-nav button.active{border-color:var(--accent);background:var(--accent-soft);color:var(--text)}
  .work-panel,.work-listing,.work-offer{min-width:0;padding:15px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}
  .work-panel-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  .work-panel h2,.work-offer h2{margin:4px 0;color:var(--text);font-size:21px}
  .work-panel p,.work-offer p{margin:5px 0;color:var(--muted);font-size:11px;line-height:1.55}
  .work-status{flex:none;padding:6px 8px;border-radius:7px;background:var(--accent-soft);color:var(--text);font-size:9px;font-weight:750;letter-spacing:.5px}
  .work-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}
  .work-metrics div{display:grid;gap:5px;min-width:0;padding:10px;border:1px solid var(--line);border-radius:9px}
  .work-metrics span{color:var(--muted);font-size:9px}.work-metrics strong{color:var(--text);font-size:15px;overflow-wrap:anywhere}
  .work-note{margin-top:12px!important;font-size:10px!important}
  .current-job-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.resign-confirm{display:grid;gap:7px;margin-top:12px;padding:12px;border:1px solid #c58b72;border-radius:9px}.resign-confirm strong{color:var(--text);font-size:12px}.resign-confirm p{margin:0}.resign-confirm>div{display:flex;flex-wrap:wrap;gap:7px}
  .work-secondary,.work-primary{min-height:38px;padding:8px 11px;border-radius:8px;font-size:10px;font-weight:700}
  .work-primary{border:1px solid var(--accent);background:var(--accent);color:#102016}
  .work-primary:disabled{opacity:.45;cursor:not-allowed}
  .work-secondary{border:1px solid var(--line);background:var(--surface-raised);color:var(--text)}
  .work-section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-top:4px}
  .work-section-heading h2{margin:3px 0;color:var(--text);font-size:18px}
  .work-section-heading>span{color:var(--muted);font-size:10px}
  .work-list{display:grid;gap:9px}
  .work-listing{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(180px,.9fr) auto;align-items:center;gap:12px}
  .listing-main{min-width:0}.listing-main h3{margin:4px 0;color:var(--text);font-size:15px}.listing-main p{margin:3px 0;color:var(--muted);font-size:10px}
  .listing-pay{display:block;margin-top:7px;color:var(--text);font-size:13px}.listing-main small{display:block;margin-top:4px;color:var(--muted);font-size:9px}
  .listing-requirements{display:grid;gap:4px}.listing-requirements span,.career-role li{color:var(--muted);font-size:9px}.listing-requirements span.met,.career-role li.met{color:var(--accent)}
  .listing-requirements span>span{margin-right:5px}
  .listing-actions{display:grid;gap:6px;min-width:130px}
  .offer-card{grid-template-columns:minmax(0,1fr) auto}
  .offer-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px}
  .application-list{display:grid;gap:0}.application-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 10px;padding:10px 0;border-bottom:1px solid var(--line)}.application-row:last-child{border-bottom:0}
  .application-row strong,.application-row small{display:block}.application-row strong{color:var(--text);font-size:11px}.application-row small{margin-top:3px;color:var(--muted);font-size:9px}.application-row p{grid-column:1/-1;margin:0;font-size:10px}
  .application-status{align-self:center;color:var(--muted);font-size:9px;text-transform:capitalize}.application-status.interview,.application-status.offered{color:var(--accent)}
  .path-picker{display:grid;gap:5px;max-width:260px;color:var(--muted);font-size:10px}.path-picker select{min-height:38px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text)}
  .career-path{display:grid;gap:0;margin-top:12px}
  .career-role{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:10px;align-items:start;padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised)}
  .career-role.current{border-color:var(--accent);background:var(--accent-soft)}
  .career-level{color:var(--muted);font-size:9px;font-weight:750}.career-role h3{margin:0;color:var(--text);font-size:13px}.career-role p{margin:4px 0;font-size:10px}.career-role strong{color:var(--text);font-size:11px}.career-role strong small{color:var(--muted);font-size:9px;font-weight:500}
  .career-state{color:var(--muted);font-size:9px;text-align:right}.career-role details{grid-column:2/-1;color:var(--muted);font-size:10px}.career-role summary{cursor:pointer}.career-role ul,.promotion-readiness ul{display:grid;gap:5px;padding-left:17px}
  .career-connector{width:2px;height:14px;margin-left:27px;background:var(--line-strong)}
  .promotion-readiness{margin-top:18px;padding:13px;border:1px solid var(--line);border-radius:10px}.promotion-readiness h3{margin:4px 0;color:var(--text);font-size:15px}.promotion-readiness p{color:var(--muted);font-size:10px}
  .promotion-readiness li.met{color:var(--accent)}
  .career-history{display:grid;gap:0}.career-history article{display:grid;grid-template-columns:10px minmax(0,1fr);gap:10px;padding:11px 0;border-bottom:1px solid var(--line)}.career-history article:last-child{border:0}
  .career-history strong{color:var(--text);font-size:11px}.career-history p{margin:4px 0}.career-history small{color:var(--muted);font-size:9px}
  .history-dot{width:7px;height:7px;margin-top:5px;border-radius:50%;background:var(--accent)}
  @media(max-width:700px){.work-listing{grid-template-columns:minmax(0,1fr)}.listing-actions{min-width:0}.work-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.career-role{grid-template-columns:48px minmax(0,1fr)}.career-state{grid-column:2;text-align:left}.career-role details{grid-column:2}.offer-card{grid-template-columns:minmax(0,1fr)}.offer-actions{justify-content:flex-start}}
</style>
