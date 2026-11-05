<script lang="ts">
  import { onMount } from 'svelte';
  import { advanceYear, formatCharacterMoney, performActivity } from './lib/simulation';
  import { getAvailableActivityIds, getLifeStage } from './lib/progression';
  import { createGameDebugSnapshot } from './lib/debug-export';
  import { copyTextToClipboard } from './lib/clipboard';
  import CharacterCreation from './CharacterCreation.svelte';
  import { clearSave, getActiveSlotId, getSaveSlots, getSoundEnabled, loadSave, saveCharacter, setActiveSlotId, setSoundEnabled } from './lib/storage';
  import type { ActivityId, Character, SaveSlot, SaveSlotId } from './lib/types';
  type AndroidBridge = {
    isFullscreen: () => boolean;
    setFullscreen: (enabled: boolean) => void;
    reloadLatest: () => void;
  };
  function getAndroidBridge(): AndroidBridge | undefined {
    return (window as Window & { AndroidApp?: AndroidBridge }).AndroidApp;
  }

  let character = $state<Character | null>(null);
  let activeTab = $state('home');
  let toast = $state('');
  let fullscreen = $state(false);
  let showRestartConfirm = $state(false);
  let activeSlotId = $state<SaveSlotId>('slot-1');
  let slots = $state<SaveSlot[]>([]);
  let soundEnabled = $state(true);
  let slotToDelete = $state<SaveSlotId | null>(null);
  let pendingSlotId = $state<SaveSlotId | null>(null);
  let debugCopying = $state(false);
  onMount(() => {
    slots = getSaveSlots();
    activeSlotId = getActiveSlotId();
    character = loadSave(activeSlotId);
    soundEnabled = getSoundEnabled();
    fullscreen = getAndroidBridge()?.isFullscreen() ?? Boolean(document.fullscreenElement);
  });
  function notify(message: string) { toast = message; window.setTimeout(() => { if (toast === message) toast = ''; }, 2200); }
  function persist(next: Character) { character = next; saveCharacter(next, activeSlotId); slots = getSaveSlots(); }
  function startLife(nextCharacter: Character) {
    activeSlotId = pendingSlotId ?? activeSlotId; setActiveSlotId(activeSlotId);
    try {
      persist(nextCharacter);
      activeTab = 'home'; notify('Life saved.'); playSound('start');
    } catch { notify('The save could not be written. Check available device storage and try again.'); }
  }
  function openCreation(slotId: SaveSlotId) {
    if (slots.find((slot) => slot.id === slotId)?.character) { notify('Delete or switch that save slot before starting another life.'); return; }
    pendingSlotId = slotId;
    activeTab = 'create';
  }
  function startNewLife() {
    const empty = slots.find((slot) => !slot.character);
    if (!empty) { notify('All save slots are full. Delete a slot before starting another life.'); activeTab = 'settings'; return; }
    openCreation(empty.id);
  }
  function loadSlot(slot: SaveSlot) {
    if (!slot.character) return;
    activeSlotId = slot.id; setActiveSlotId(slot.id); character = slot.character;
    activeTab = 'home'; notify('Save loaded.');
  }
  function deleteSlot(slotId: SaveSlotId) {
    clearSave(slotId); slots = getSaveSlots(); slotToDelete = null;
    if (slotId === activeSlotId) character = null;
    notify('Save slot deleted.');
  }
  function toggleSounds(enabled: boolean) { soundEnabled = enabled; setSoundEnabled(enabled); }
  async function copyDebugSnapshot() {
    if (!character || debugCopying) return;
    debugCopying = true;
    try {
      const payload = JSON.stringify(createGameDebugSnapshot(character, activeSlotId), null, 2);
      const copied = await copyTextToClipboard(payload);
      notify(copied ? 'Gameplay snapshot copied to clipboard.' : 'Clipboard access failed. Try again or use a browser with clipboard access.');
    } catch { notify('Could not copy the gameplay snapshot.'); }
    finally { debugCopying = false; }
  }
  function playSound(kind: 'tap' | 'action' | 'year' | 'start' = 'tap') {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator(); const gain = context.createGain();
      const tones = kind === 'year' ? [440, 660] : kind === 'start' ? [392, 523, 659] : kind === 'action' ? [520] : [620];
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(tones[0], context.currentTime);
      if (tones.length > 1) oscillator.frequency.setValueAtTime(tones[tones.length - 1], context.currentTime + 0.08);
      gain.gain.setValueAtTime(0.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.17);
      oscillator.onended = () => { void context.close(); };
    } catch { /* Audio is optional and may be unavailable in a WebView. */ }
  }
  function activityTitle(activity: {id: ActivityId; title: string}, age: number) {
    if (age < 6 && activity.id === 'study') return 'Discover & learn';
    if (age < 16 && activity.id === 'study') return 'Learn & explore';
    if (age < 13 && activity.id === 'exercise') return 'Play & explore';
    if (age < 16 && activity.id === 'socialize') return 'Family & friends';
    if (age >= 16 && age < 18 && activity.id === 'work') return 'One-off work';
    if (age >= 65 && activity.id === 'study') return 'Lifelong learning';
    if (age >= 65 && activity.id === 'exercise') return 'Stay active';
    if (age >= 45 && age < 65 && activity.id === 'socialize') return 'Social connections';
    if (activity.id === 'apply-job') return age < 18 ? 'Find part-time work' : age >= 65 ? 'Find flexible work' : 'Apply for a job';
    if (activity.id === 'career') return 'Career development';
    return activity.title;
  }
  function activityDetail(activity: {id: ActivityId; detail: string}, age: number) {
    if (activity.id === 'apply-job') return age < 18 ? 'Apply for an age-appropriate part-time role.' : age >= 65 ? 'Look for flexible work that fits later life.' : 'Apply for paid employment and build a career.';
    if (activity.id === 'career') return 'Improve work performance and qualify for promotions.';
    if (activity.id === 'study') {
      if (age < 6) return 'Explore letters, numbers and new ideas.';
      if (age < 13) return 'Build school knowledge and learning habits.';
      if (age < 18) return 'Strengthen school subjects and prepare for next steps.';
      if (age < 65) return 'Develop skills for work and personal goals.';
      return 'Keep learning at your own pace.';
    }
    if (activity.id === 'exercise') {
      if (age < 6) return 'Play and move to build coordination.';
      if (age < 13) return 'Build coordination, strength and healthy habits.';
      if (age < 65) return 'Support fitness, health and mood.';
      return 'Maintain mobility and wellbeing.';
    }
    if (activity.id === 'socialize') {
      if (age < 6) return 'Spend time with family and familiar people.';
      if (age < 13) return 'Build friendships and family connections.';
      if (age < 18) return 'Spend time with friends and strengthen relationships.';
      if (age < 65) return 'Maintain friendships and social connections.';
      return 'Stay connected with family and community.';
    }
    if (age < 18) return 'Take a one-off paid shift for extra money.';
    if (age < 65) return 'Take extra work for additional earnings.';
    return 'Take an extra paid shift if it suits your circumstances.';
  }
  function activityCost(activity: {id: ActivityId; cost: string}, current: Character) {
    if (activity.id === 'apply-job' || activity.id === 'career') return 'Time';
    if (current.age < 16 && (activity.id === 'study' || activity.id === 'socialize')) return 'Time';
    const scale = current.currencyScale ?? 1;
    if (activity.id === 'work') return '+' + formatCharacterMoney(current, 180 * scale);
    if (activity.id === 'study') return formatCharacterMoney(current, 35 * scale);
    if (activity.id === 'socialize') return formatCharacterMoney(current, 20 * scale);
    return activity.cost;
  }
  function act(id: ActivityId) {
    if (!character) return;
    if (!character.actionsRemaining) { notify('You have used this year’s available time.'); return; }
    persist(performActivity(character, id)); playSound('action');
  }
  function nextYear() { if (character) { persist(advanceYear(character)); notify('A new year begins.'); playSound('year'); } }
  function restart() {
    clearSave(activeSlotId); slots = getSaveSlots(); character = null;
    showRestartConfirm = false; activeTab = 'create'; notify('The active save was reset.'); pendingSlotId = activeSlotId;
  }
  function reloadLatest() {
    const bridge = getAndroidBridge();
    if (bridge) bridge.reloadLatest();
    else refreshGame();
  }
  async function toggleFullscreen() {
    const next = !fullscreen;
    const bridge = getAndroidBridge();
    if (bridge) {
      bridge.setFullscreen(next);
      fullscreen = next;
      return;
    }
    try {
      if (next) await document.documentElement.requestFullscreen?.();
      else if (document.fullscreenElement) await document.exitFullscreen();
      fullscreen = Boolean(document.fullscreenElement);
    } catch { notify('Fullscreen is not available in this browser.'); }
  }
  function refreshGame() { const url = new URL(window.location.href); url.searchParams.set('refresh', Date.now().toString()); window.location.replace(url.toString()); }
  const activities: {id:ActivityId;title:string;detail:string;icon:string;cost:string}[] = [
    {id:'study',title:'Study',detail:'Build knowledge for future opportunities.',icon:'↗',cost:'35'},
    {id:'exercise',title:'Exercise',detail:'Improve fitness, health, and mood.',icon:'⌁',cost:'Time'},
    {id:'socialize',title:'Socialize',detail:'Make time for the people around you.',icon:'◎',cost:'20'},
    {id:'work',title:'Extra work',detail:'Earn a little more this year.',icon:'＋',cost:'+180'},
    {id:'apply-job',title:'Apply for a job',detail:'Find paid work suited to your age and education.',icon:'↗',cost:'Time'},
    {id:'career',title:'Career development',detail:'Improve performance and work toward a promotion.',icon:'◆',cost:'Time'}
  ];
</script>
<svelte:head><title>{character ? character.name + ' · My Life Simulator' : 'My Life Simulator'}</title></svelte:head>
<div class="app-shell">
  <header class="topbar">
    <a class="brand" href="#home" onclick={() => activeTab=character ? 'home' : 'create'}><span class="brand-mark">L</span><span>life<span class="brand-light">story</span></span></a>
    <div class="topbar-right">{#if activeTab !== 'settings'}<button class="icon-button" aria-label="Start a new life" title="Start a new life" onclick={startNewLife}>＋</button>{/if}</div>
  </header>
  {#if !character && activeTab !== 'settings' && activeTab !== 'create'}
    <main class="welcome"><CharacterCreation slotLabel={pendingSlotId ?? activeSlotId} onStart={startLife} onCancel={() => activeTab='settings'} /></main>
  {:else}
    <main class="main-layout">
      <aside class="side-nav"><div class="side-caption">YOUR WORLD</div>
        {#each [{id:'home',label:'Overview',icon:'⌂'},{id:'activities',label:'Activities',icon:'✳'},...(character && character.age >= 16 ? [{id:'finances',label:'Finances',icon:'◈'}] : []),{id:'history',label:'Life history',icon:'↗'},{id:'settings',label:'Settings',icon:'⚙'}] as item}
          <button class:active={activeTab===item.id} class="nav-item" onclick={() => activeTab=item.id}><span class="nav-icon">{item.icon}</span>{item.label}</button>
        {/each}
        {#if character}<div class="side-profile"><div class="avatar">{character.name.slice(0,1).toUpperCase()}</div><div><strong>{character.name}</strong><small>Age {character.age}</small></div></div>{/if}
      </aside>
      <section class="content">
        {#if activeTab==='create'}
          <CharacterCreation slotLabel={pendingSlotId ?? activeSlotId} onStart={startLife} onCancel={() => activeTab='home'} />
        {:else if activeTab==='settings'}
          <div class="page-heading"><div><div class="eyebrow">PREFERENCES & CONTROLS</div><h1>Game <em>settings.</em></h1><p>Adjust how the game appears and manage your saved story.</p></div></div>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">01</span><div><h3>Sound</h3><p>Control the small audio cues used for game actions.</p></div></div>
            <div class="setting-row"><div><strong>Sound effects</strong><p>Subtle original tones for actions, starting a life and advancing a year. No background music.</p></div><button class:setting-enabled={soundEnabled} class="setting-toggle" role="switch" aria-checked={soundEnabled} onclick={() => toggleSounds(!soundEnabled)}><span></span><small>{soundEnabled ? 'ON' : 'OFF'}</small></button></div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">02</span><div><h3>Save slots</h3><p>Keep up to three separate lives on this device.</p></div></div>
            <div class="save-slot-list">{#each slots as slot, index}<div class="save-slot-row"><div class="save-slot-meta"><strong>Slot {index + 1}</strong>{#if slot.character}<span>{slot.character.name} · Age {slot.character.age} · {formatCharacterMoney(slot.character)}</span><small>{slot.id === activeSlotId ? 'CURRENT SLOT' : 'SAVED LIFE'}</small>{:else}<span class="empty-slot-label">Empty slot</span>{/if}</div><div class="save-slot-actions">{#if slot.character}<button class="secondary-button" onclick={() => loadSlot(slot)} disabled={slot.id===activeSlotId}>Load</button><button class="danger-button" onclick={() => slotToDelete=slot.id}>Delete</button>{:else}<button class="secondary-button" onclick={() => openCreation(slot.id)}>New life</button>{/if}</div></div>{/each}</div>
            <div class="setting-note">Saves stay in this browser or app on this device. Clearing app data or browser storage can remove them. Cloud backup is not available yet.</div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">03</span><div><h3>Game log & debug</h3><p>Review recent gameplay records or copy the complete simulation state for testing.</p></div></div>
            {#if character}
              <div class="debug-export-row"><div><strong>Gameplay snapshot</strong><p>Includes the character, current stats, finances, save slot and complete life history. It excludes device identifiers and browser data.</p></div><button class="secondary-button" onclick={copyDebugSnapshot} disabled={debugCopying}>{debugCopying ? 'Copying…' : 'Copy snapshot'}</button></div>
              <div class="settings-log-list">{#each character.history.slice(0,6) as item}<div class="settings-log-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>{/each}</div>
              <button class="text-button settings-log-link" onclick={() => activeTab='history'}>Open complete life history →</button>
            {:else}
              <p class="settings-empty-log">The game log will appear here after a life is started.</p>
            {/if}
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">04</span><div><h3>Display</h3><p>Choose how the game uses your screen.</p></div></div>
            <div class="setting-row"><div><strong>Immersive fullscreen</strong><p>Hide the status and navigation bars for a distraction-free view. Swipe from an edge to reveal system controls.</p></div><button class:setting-enabled={fullscreen} class="setting-toggle" role="switch" aria-checked={fullscreen} onclick={toggleFullscreen}><span></span><small>{fullscreen ? 'ON' : 'OFF'}</small></button></div>
            <div class="setting-note">Fullscreen can place content behind the camera cutout on some devices. Turn it off to keep the game inside the safe screen area.</div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">05</span><div><h3>Game controls</h3><p>Reload the hosted game or check for the newest version.</p></div></div>
            <div class="setting-action-row"><div><strong>Reload game</strong><p>Refresh the current page without changing your saved life.</p></div><button class="secondary-button" onclick={() => window.location.reload()}>Reload</button></div>
            <div class="setting-action-row"><div><strong>Check for updates</strong><p>Fetch the latest published game files and restart the game view. Your save is preserved.</p></div><button class="secondary-button" onclick={reloadLatest}>Check now</button></div>
          </section>
          <section class="settings-section danger-section">
            <div class="settings-section-heading"><span class="section-index">06</span><div><h3>Saved game</h3><p>Start over by deleting the life currently saved on this device.</p></div></div>
            <div class="setting-action-row"><div><strong>Restart current life</strong><p>Delete only the active save slot and create a new life in that slot.</p></div><button class="danger-button" onclick={() => showRestartConfirm=true} disabled={!character}>Restart</button></div>
          </section>
          <div class="settings-version">MY LIFE SIMULATOR <span>·</span> EARLY PLAYABLE</div>
        {:else if character && activeTab==='home'}
          <div class="page-heading"><div><div class="eyebrow">OVERVIEW</div><h1>{character.name}</h1><p>Age {character.age}</p></div><div class="year-pill"><span class="year-dot"></span> YEAR {character.year}</div></div>
          <section class="money-card money-focus"><div class="money-focus-top"><div><div class="money-label">AVAILABLE BALANCE</div><div class="money-value">{formatCharacterMoney(character)}</div></div> </div></section>
          <div class="life-stage-strip"><div><strong>{getLifeStage(character.age).label}</strong><span>Age {character.age} · {getLifeStage(character.age).ageRange}</span></div><p>{getLifeStage(character.age).description}</p>{#if getLifeStage(character.age).nextAge !== null}<small>Next stage at age {getLifeStage(character.age).nextAge}</small>{/if}</div>

          <div class="section-heading"><div><span class="section-index">01</span><h3>Available actions</h3></div><span class="section-hint">{character.actionsRemaining} of 3 actions left</span></div>
          <div class="activity-grid">{#each activities.filter((activity) => getAvailableActivityIds(character!.age, character!.employment).includes(activity.id)) as activity}
            <button class="activity-card" disabled={character.actionsRemaining===0} onclick={() => act(activity.id)}><span class="activity-icon">{activity.icon}</span><span class="activity-title">{activityTitle(activity, character.age)}</span><span class="activity-detail">{activityDetail(activity, character.age)}</span><span class="activity-cost">{activityCost(activity, character)} <span>→</span></span></button>
          {/each}</div>
          <div class="section-heading"><div><span class="section-index">02</span><h3>Life stats</h3></div></div>
          <div class="stats-grid">{#each [{label:'Health',value:character.health,color:'mint',icon:'＋'},{label:'Happiness',value:character.happiness,color:'coral',icon:'♡'},{label:'Intelligence',value:character.intelligence,color:'blue',icon:'✳'},{label:'Fitness',value:character.fitness,color:'amber',icon:'⌁'}] as stat}
            <article class="stat-card"><div class="stat-top"><span class="stat-icon {stat.color}">{stat.icon}</span><span class="stat-label">{stat.label}</span></div><div class="stat-value">{stat.value}<small>/100</small></div><div class="meter"><span class={stat.color} style="width:{stat.value}%"></span></div></article>
          {/each}</div>
          <div class="bottom-row"><section class="history-card"><div class="card-heading"><div><span class="section-index">03</span><h3>Recent activity</h3></div><button class="text-button" onclick={() => activeTab='history'}>View all →</button></div>
            {#each character.history.slice(0,3) as item}<div class="timeline-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>{/each}
          </section></div>
        {:else if character && activeTab==='activities'}
          <div class="page-heading"><div><div class="eyebrow">AVAILABLE ACTIONS</div><h1>Activities</h1><p>Choose from the actions available at this age.</p></div><div class="year-pill">{character.actionsRemaining} ACTIONS LEFT</div></div>
          <div class="activity-grid activity-grid-large">{#each activities.filter((activity) => getAvailableActivityIds(character!.age, character!.employment).includes(activity.id)) as activity}<button class="activity-card" disabled={character.actionsRemaining===0} onclick={() => act(activity.id)}><span class="activity-icon">{activity.icon}</span><span class="activity-title">{activityTitle(activity, character.age)}</span><span class="activity-detail">{activityDetail(activity, character.age)}</span><span class="activity-cost">{activityCost(activity, character)} <span>→</span></span></button>{/each}</div>

        {:else if character && activeTab==='history'}
          <div class="page-heading"><div><div class="eyebrow">RECORDED EVENTS</div><h1>Life history</h1><p>Events and decisions recorded during this life.</p></div></div>
          <section class="history-card full-history">{#each character.history as item}<div class="timeline-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>{/each}</section>
        {:else if character && activeTab==='finances'}
          <div class="page-heading"><div><div class="eyebrow">FINANCES</div><h1>Balance & activity</h1><p>Available savings and the costs or earnings of current activities.</p></div></div>
          <section class="money-card finance-wide"><div class="money-label">AVAILABLE SAVINGS</div><div class="money-value">{formatCharacterMoney(character)}</div><p>Current cash balance after recorded earnings and costs.</p></section>
          <section class="career-finance-panel">
            <div class="section-heading"><div><span class="section-index">01</span><h3>Education & employment</h3></div></div>
            <div class="career-status-grid">
              <div><small>EDUCATION</small><strong>{character.education ?? 'Not recorded'}</strong>{#if character.education === 'Higher education'}<span>Higher education completed.</span>{:else}<span>{character.educationProgress ?? 0}% progress toward the next learning milestone</span><div class="meter"><span style="width:{character.educationProgress ?? 0}%"></span></div>{/if}</div>
              <div><small>EMPLOYMENT</small>{#if character.employment}<strong>{character.employment.title}</strong><span>{character.employment.type === 'part-time' ? 'Part-time' : character.employment.type === 'flexible' ? 'Flexible' : 'Full-time'} · {character.employment.experienceYears} years experience</span>{:else}<strong>Not employed</strong><span>{character.age < 16 ? 'Work unlocks at age 16.' : character.age < 18 ? 'Part-time roles are available.' : 'Apply for a job from Activities.'}</span>{/if}</div>
            </div>
            {#if character.employment}
              <div class="employment-pay-grid"><div><small>ANNUAL PAY</small><strong>{formatCharacterMoney(character, character.employment.annualSalary)}</strong></div><div><small>LAST YEAR'S LIVING COSTS</small><strong>{formatCharacterMoney(character, character.lastYearExpenses ?? 0)}</strong></div><div><small>LAST YEAR'S EARNINGS</small><strong>{formatCharacterMoney(character, character.lastYearIncome ?? 0)}</strong></div><div><small>PERFORMANCE</small><strong>{character.employment.performance}/100</strong></div></div>
              <div class="career-performance-meter"><span style="width:{character.employment.performance}%"></span></div>
            {/if}
            <p class="finance-footnote">Earnings are credited annually when you advance the year. Living costs are estimated from job type; these are simplified game values, not real-world salary data.</p>
          </section>
          <section class="finance-actions"><div class="section-heading"><div><span class="section-index">02</span><h3>Other money changes</h3></div></div><div class="finance-action-list"><div><span class="finance-action-icon positive">↗</span><span><strong>Extra work</strong><small>One-time earning action; separate from a regular job.</small></span><b class="positive-text">+{formatCharacterMoney(character, 180 * (character.currencyScale ?? 1))}</b></div><div><span class="finance-action-icon negative">＋</span><span><strong>Study</strong><small>Build knowledge; costs money from age 16.</small></span><b>{character.age < 16 ? 'Time' : '−' + formatCharacterMoney(character, 35 * (character.currencyScale ?? 1))}</b></div><div><span class="finance-action-icon negative">◎</span><span><strong>Socialize</strong><small>Spend time with people who matter.</small></span><b>{character.age < 16 ? 'Time' : '−' + formatCharacterMoney(character, 20 * (character.currencyScale ?? 1))}</b></div><div><span class="finance-action-icon">⌁</span><span><strong>Exercise</strong><small>Improves health and fitness without a direct money cost.</small></span><b class="neutral-text">{formatCharacterMoney(character, 0)}</b></div></div></section>
        {/if}
      </section>
    </main>
  {/if}
  {#if character && activeTab !== 'settings'}
    <button class="advance-fab" onclick={nextYear} aria-label="Advance one year" title="Advance one year">
      <span class="fab-arrow" aria-hidden="true">→</span><span class="fab-label">Advance year</span><span class="fab-count">{character.actionsRemaining}/3</span>
    </button>
  {/if}
  {#if slotToDelete}
    <div class="modal-backdrop" role="presentation"><div class="modal" role="dialog" aria-modal="true"><button class="modal-close" onclick={() => slotToDelete=null} aria-label="Close">×</button><div class="eyebrow">DELETE SAVED LIFE</div><h2>Delete this slot?</h2><p>This permanently removes the selected character and life history from this device. Other slots are not affected.</p><button class="danger-button danger-confirm" onclick={() => deleteSlot(slotToDelete!)}>Delete this save</button><button class="text-button cancel-button" onclick={() => slotToDelete=null}>Keep save</button></div></div>
  {/if}
  {#if showRestartConfirm}
    <div class="modal-backdrop" role="presentation" onclick={(e) => e.target===e.currentTarget && (showRestartConfirm=false)}><div class="modal" role="dialog" aria-modal="true" aria-labelledby="restart-title"><button class="modal-close" onclick={() => showRestartConfirm=false} aria-label="Close">×</button><div class="eyebrow">THIS CANNOT BE UNDONE</div><h2 id="restart-title">Erase this life?</h2><p>Your character and life history saved on this device will be permanently deleted. This does not affect other apps or files.</p><button class="danger-button danger-confirm" onclick={restart}>Delete save and restart</button><button class="text-button cancel-button" onclick={() => showRestartConfirm=false}>Cancel</button></div></div>
  {/if}
  {#if toast}<div class="toast" role="status">{toast}</div>{/if}
  <footer class="footer"><span>life<span class="brand-light">story</span></span><span>YOUR LIFE. YOUR STORY.</span><span>v0.1 · EARLY PLAYABLE</span></footer>
</div>
