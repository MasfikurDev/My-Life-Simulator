<script lang="ts">
  import { onMount } from 'svelte';
  import { advanceYear, createCharacter, performActivity } from './lib/simulation';
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
  let name = $state('');
  let activeTab = $state('home');
  let toast = $state('');
  let fullscreen = $state(false);
  let showRestartConfirm = $state(false);
  let selectedAge = $state(18);
  let activeSlotId = $state<SaveSlotId>('slot-1');
  let slots = $state<SaveSlot[]>([]);
  let soundEnabled = $state(true);
  let slotToDelete = $state<SaveSlotId | null>(null);
  let pendingSlotId = $state<SaveSlotId | null>(null);
  onMount(() => {
    slots = getSaveSlots();
    activeSlotId = getActiveSlotId();
    character = loadSave(activeSlotId);
    soundEnabled = getSoundEnabled();
    fullscreen = getAndroidBridge()?.isFullscreen() ?? Boolean(document.fullscreenElement);
  });
  function notify(message: string) { toast = message; window.setTimeout(() => { if (toast === message) toast = ''; }, 2200); }
  function persist(next: Character) { character = next; saveCharacter(next, activeSlotId); slots = getSaveSlots(); }
  function startLife() {
    activeSlotId = pendingSlotId ?? activeSlotId; setActiveSlotId(activeSlotId);
    try {
      activeSlotId = pendingSlotId ?? activeSlotId; setActiveSlotId(activeSlotId);
      persist(createCharacter(name, selectedAge));
      activeTab = 'home'; notify('Your story starts here.'); playSound('start');
    } catch { notify('The save could not be written. Check available device storage and try again.'); }
  }
  function openCreation(slotId: SaveSlotId) {
    if (slots.find((slot) => slot.id === slotId)?.character) { notify('Delete or switch that save slot before starting another life.'); return; }
    pendingSlotId = slotId;
    name = ''; selectedAge = 18; activeTab = 'create';
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
  function lifeStage(age: number) {
    if (age < 2) return 'early childhood'; if (age < 6) return 'childhood'; if (age < 13) return 'school years';
    if (age < 18) return 'teenage years'; if (age < 30) return 'young adulthood'; if (age < 60) return 'adulthood'; return 'later life';
  }
  function activityTitle(activity: {id: ActivityId; title: string}, age: number) {
    if (age < 6 && activity.id === 'study') return 'Discover & learn';
    if (age < 16 && activity.id === 'study') return 'Learn & explore';
    if (age < 13 && activity.id === 'exercise') return 'Play & explore';
    if (age < 16 && activity.id === 'socialize') return 'Family & friends';
    return activity.title;
  }
  function activityCost(activity: {id: ActivityId; cost: string}, age: number) {
    return age < 16 && (activity.id === 'study' || activity.id === 'socialize') ? 'Time' : activity.cost;
  }
  function act(id: ActivityId) {
    if (!character) return;
    if (!character.actionsRemaining) { notify('You have used this year’s available time.'); return; }
    persist(performActivity(character, id)); playSound('action');
  }
  function nextYear() { if (character) { persist(advanceYear(character)); notify('A new year begins.'); playSound('year'); } }
  function restart() {
    clearSave(activeSlotId); slots = getSaveSlots(); character = null; name = '';
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
    {id:'work',title:'Extra work',detail:'Earn a little more this year.',icon:'＋',cost:'+180'}
  ];
</script>
<svelte:head><title>{character ? character.name + ' · My Life Simulator' : 'My Life Simulator'}</title></svelte:head>
<div class="app-shell">
  <header class="topbar">
    <a class="brand" href="#home" onclick={() => activeTab=character ? 'home' : 'create'}><span class="brand-mark">L</span><span>life<span class="brand-light">story</span></span></a>
    <div class="topbar-right"><span class="live-dot"></span><span class="topbar-label">YOUR STORY, YOUR PACE</span><button class="icon-button" aria-label="Open settings" title="Settings" onclick={() => activeTab='settings'}>⚙</button><button class="icon-button" aria-label="Start a new life" title="Start a new life" onclick={startNewLife}>＋</button></div>
  </header>
  {#if !character && activeTab !== 'settings' && activeTab !== 'create'}
    <main class="welcome"><div class="welcome-orb orb-one"></div><div class="welcome-orb orb-two"></div>
      <div class="welcome-content"><div class="eyebrow"><span class="eyebrow-line"></span> EVERY LIFE IS DIFFERENT</div>
        <h1>Your life.<br/><span>Your starting point.</span></h1>
        <p>Choose when your story begins. Grow up from the very beginning or step into a life already in motion.</p>
        <div class="start-card creation-card">
          <label for="character-name">Character name</label><input id="character-name" maxlength="28" bind:value={name} placeholder="What should we call you?"/>
          <div class="creation-label">Choose your starting age</div>
          <div class="age-choice-grid">{#each [{age:0,label:'Birth',detail:'A life from day one'},{age:6,label:'Childhood',detail:'Growing and learning'},{age:13,label:'Teenager',detail:'Finding your path'},{age:16,label:'Age 16',detail:'Choices start opening'},{age:18,label:'Age 18',detail:'Begin adult life'},{age:25,label:'Age 25',detail:'A fresh adult chapter'},{age:40,label:'Age 40',detail:'Midlife beginnings'},{age:60,label:'Age 60',detail:'Later-life journey'}] as option}
            <button class:age-choice-active={selectedAge===option.age} class="age-choice" onclick={() => selectedAge=option.age}><strong>{option.label}</strong><span>{option.detail}</span></button>
          {/each}</div>
          <label class="age-slider-label" for="starting-age">Or choose any age <strong>{selectedAge}</strong></label><input class="age-slider" id="starting-age" type="range" min="0" max="90" step="1" bind:value={selectedAge}/><label class="age-slider-label" for="create-starting-age">Or choose any age <strong>{selectedAge}</strong></label><input class="age-slider" id="create-starting-age" type="range" min="0" max="90" step="1" bind:value={selectedAge}/><div class="selected-age-note">Starting at age <strong>{selectedAge}</strong> · {lifeStage(selectedAge)}</div>
          <button class="primary-button" onclick={startLife}>Begin your life <span>→</span></button>
          <div class="start-note">✦ Saved locally in {pendingSlotId ?? activeSlotId}.</div>
        </div>
      </div><div class="welcome-side-note">A LIFE SIMULATION<br/>BUILT AROUND YOU</div>
    </main>
  {:else}
    <main class="main-layout">
      <aside class="side-nav"><div class="side-caption">YOUR WORLD</div>
        {#each [{id:'home',label:'Overview',icon:'⌂'},{id:'activities',label:'Activities',icon:'✳'},{id:'people',label:'People',icon:'◎'},{id:'finances',label:'Finances',icon:'◈'},{id:'history',label:'Life history',icon:'↗'},{id:'settings',label:'Settings',icon:'⚙'}] as item}
          <button class:active={activeTab===item.id} class="nav-item" onclick={() => activeTab=item.id}><span class="nav-icon">{item.icon}</span>{item.label}</button>
        {/each}
        {#if character}<div class="side-profile"><div class="avatar">{character.name.slice(0,1).toUpperCase()}</div><div><strong>{character.name}</strong><small>Age {character.age}</small></div></div>{/if}
      </aside>
      <section class="content">
        {#if activeTab==='create'}
          <div class="page-heading"><div><div class="eyebrow">A NEW STORY</div><h1>Choose your <em>beginning.</em></h1><p>Every starting age creates a different set of circumstances.</p></div></div>
          <section class="creation-panel"><label for="create-name">Character name</label><input id="create-name" maxlength="28" bind:value={name} placeholder="What should we call you?"/><div class="creation-label">Starting point</div><div class="age-choice-grid">{#each [{age:0,label:'Birth',detail:'From the very beginning'},{age:6,label:'Childhood',detail:'Learn and grow'},{age:13,label:'Teenager',detail:'Discover independence'},{age:16,label:'Age 16',detail:'New choices and paths'},{age:18,label:'Age 18',detail:'Young adulthood'},{age:25,label:'Age 25',detail:'A fresh adult chapter'},{age:40,label:'Age 40',detail:'Midlife beginnings'},{age:60,label:'Age 60',detail:'Later-life journey'}] as option}<button class:age-choice-active={selectedAge===option.age} class="age-choice" onclick={() => selectedAge=option.age}><strong>{option.label}</strong><span>{option.detail}</span></button>{/each}</div><div class="selected-age-note">Starting at age <strong>{selectedAge}</strong> · {lifeStage(selectedAge)}</div><button class="primary-button" onclick={startLife}>Create this life <span>→</span></button><button class="text-button cancel-button" onclick={() => activeTab=character ? 'home' : 'settings'}>Cancel</button></section>
        {:else if activeTab==='settings'}
          <div class="page-heading"><div><div class="eyebrow">PREFERENCES & CONTROLS</div><h1>Game <em>settings.</em></h1><p>Adjust how the game appears and manage your saved story.</p></div></div>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">01</span><div><h3>Sound</h3><p>Control the small audio cues used for game actions.</p></div></div>
            <div class="setting-row"><div><strong>Sound effects</strong><p>Subtle original tones for actions, starting a life and advancing a year. No background music.</p></div><button class:setting-enabled={soundEnabled} class="setting-toggle" role="switch" aria-checked={soundEnabled} onclick={() => toggleSounds(!soundEnabled)}><span></span><small>{soundEnabled ? 'ON' : 'OFF'}</small></button></div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">02</span><div><h3>Save slots</h3><p>Keep up to three separate lives on this device.</p></div></div>
            <div class="save-slot-list">{#each slots as slot, index}<div class="save-slot-row"><div class="save-slot-meta"><strong>Slot {index + 1}</strong>{#if slot.character}<span>{slot.character.name} · Age {slot.character.age} · ${slot.character.money.toLocaleString('en-US')}</span><small>{slot.id === activeSlotId ? 'CURRENT SLOT' : 'SAVED LIFE'}</small>{:else}<span class="empty-slot-label">Empty slot</span>{/if}</div><div class="save-slot-actions">{#if slot.character}<button class="secondary-button" onclick={() => loadSlot(slot)} disabled={slot.id===activeSlotId}>Load</button><button class="danger-button" onclick={() => slotToDelete=slot.id}>Delete</button>{:else}<button class="secondary-button" onclick={() => openCreation(slot.id)}>New life</button>{/if}</div></div>{/each}</div>
            <div class="setting-note">Saves stay in this browser or app on this device. Clearing app data or browser storage can remove them. Cloud backup is not available yet.</div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">03</span><div><h3>Display</h3><p>Choose how the game uses your screen.</p></div></div>
            <div class="setting-row"><div><strong>Immersive fullscreen</strong><p>Hide the status and navigation bars for a distraction-free view. Swipe from an edge to reveal system controls.</p></div><button class:setting-enabled={fullscreen} class="setting-toggle" role="switch" aria-checked={fullscreen} onclick={toggleFullscreen}><span></span><small>{fullscreen ? 'ON' : 'OFF'}</small></button></div>
            <div class="setting-note">Fullscreen can place content behind the camera cutout on some devices. Turn it off to keep the game inside the safe screen area.</div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">04</span><div><h3>Game controls</h3><p>Reload the hosted game or check for the newest version.</p></div></div>
            <div class="setting-action-row"><div><strong>Reload game</strong><p>Refresh the current page without changing your saved life.</p></div><button class="secondary-button" onclick={() => window.location.reload()}>Reload</button></div>
            <div class="setting-action-row"><div><strong>Check for updates</strong><p>Fetch the latest published game files and restart the game view. Your save is preserved.</p></div><button class="secondary-button" onclick={reloadLatest}>Check now</button></div>
          </section>
          <section class="settings-section danger-section">
            <div class="settings-section-heading"><span class="section-index">05</span><div><h3>Saved game</h3><p>Start over by deleting the life currently saved on this device.</p></div></div>
            <div class="setting-action-row"><div><strong>Restart current life</strong><p>Delete only the active save slot and create a new life in that slot.</p></div><button class="danger-button" onclick={() => showRestartConfirm=true} disabled={!character}>Restart</button></div>
          </section>
          <div class="settings-version">MY LIFE SIMULATOR <span>·</span> EARLY PLAYABLE</div>
        {:else if character && activeTab==='home'}
          <div class="page-heading"><div><div class="eyebrow">YOUR LIFE AT A GLANCE</div><h1>Good things take <em>time.</em></h1><p>Make this year count, {character.name}.</p></div><div class="year-pill"><span class="year-dot"></span> YEAR {character.year}</div></div>
          <section class="money-card money-focus"><div class="money-focus-top"><div><div class="money-label">AVAILABLE BALANCE</div><div class="money-value">${character.money.toLocaleString('en-US')}</div><p>Your money shapes the choices ahead.</p></div><button class="money-link" onclick={() => activeTab='finances'}>Money details →</button></div><div class="money-activity"><span><strong>+$180</strong> Extra work</span><span><strong>−$35</strong> Study</span><span><strong>−$20</strong> Socialize</span></div></section>
          <section class="hero-card"><div class="hero-copy"><div class="hero-kicker">THE STORY SO FAR</div><h2>{lifeStage(character.age)}<br/><span>Finding your own way.</span></h2><p>You’re {character.age}. There’s no fixed path ahead — just the next decision.</p><button class="hero-button" onclick={() => activeTab='activities'}>Explore your options <span>→</span></button></div><div class="hero-art" aria-hidden="true"><div class="sun"></div><div class="hill hill-back"></div><div class="hill hill-front"></div><div class="art-caption">YOUR NEXT<br/>CHAPTER AWAITS</div></div></section>
          <div class="section-heading"><div><span class="section-index">01</span><h3>Make this year yours</h3></div><span class="section-hint">{character.actionsRemaining} of 3 actions left</span></div>
          <div class="activity-grid">{#each activities.filter((activity) => (character!.age >= 3 || activity.id !== 'study') && (character!.age >= 16 || activity.id !== 'work')) as activity}
            <button class="activity-card" disabled={character.actionsRemaining===0} onclick={() => act(activity.id)}><span class="activity-icon">{activity.icon}</span><span class="activity-title">{activityTitle(activity, character.age)}</span><span class="activity-detail">{activity.detail}</span><span class="activity-cost">{activityCost(activity, character.age)} <span>→</span></span></button>
          {/each}</div>
          <div class="section-heading"><div><span class="section-index">03</span><h3>Life stats</h3></div><span class="section-hint">A little balance goes a long way</span></div>
          <div class="stats-grid">{#each [{label:'Health',value:character.health,color:'mint',icon:'＋'},{label:'Happiness',value:character.happiness,color:'coral',icon:'♡'},{label:'Intelligence',value:character.intelligence,color:'blue',icon:'✳'},{label:'Fitness',value:character.fitness,color:'amber',icon:'⌁'}] as stat}
            <article class="stat-card"><div class="stat-top"><span class="stat-icon {stat.color}">{stat.icon}</span><span class="stat-label">{stat.label}</span></div><div class="stat-value">{stat.value}<small>/100</small></div><div class="meter"><span class={stat.color} style="width:{stat.value}%"></span></div></article>
          {/each}</div>
          <div class="bottom-row"><section class="history-card"><div class="card-heading"><div><span class="section-index">04</span><h3>Recent moments</h3></div><button class="text-button" onclick={() => activeTab='history'}>View all →</button></div>
            {#each character.history.slice(0,3) as item}<div class="timeline-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>{/each}
          </section></div>
        {:else if character && activeTab==='activities'}
          <div class="page-heading"><div><div class="eyebrow">MAKE YOUR MOVE</div><h1>Time well <em>spent.</em></h1><p>Every choice uses a little of this year's time.</p></div><div class="year-pill">{character.actionsRemaining} ACTIONS LEFT</div></div>
          <div class="activity-grid activity-grid-large">{#each activities.filter((activity) => (character!.age >= 3 || activity.id !== 'study') && (character!.age >= 16 || activity.id !== 'work')) as activity}<button class="activity-card" disabled={character.actionsRemaining===0} onclick={() => act(activity.id)}><span class="activity-icon">{activity.icon}</span><span class="activity-title">{activityTitle(activity, character.age)}</span><span class="activity-detail">{activity.detail}</span><span class="activity-cost">{activityCost(activity, character.age)} <span>→</span></span></button>{/each}</div>
          <div class="info-panel"><strong>Your time is limited — by design.</strong><p>You can take three meaningful actions each year. When ready, return to Overview and advance time. Your age and circumstances change as your story moves forward.</p></div>
        {:else if character && activeTab==='history'}
          <div class="page-heading"><div><div class="eyebrow">EVERY CHOICE LEAVES A MARK</div><h1>Your life, <em>so far.</em></h1><p>A record of the moments that brought you here.</p></div></div>
          <section class="history-card full-history">{#each character.history as item}<div class="timeline-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>{/each}</section>
        {:else if character && activeTab==='finances'}
          <div class="page-heading"><div><div class="eyebrow">YOUR FINANCIAL LIFE</div><h1>Money & <em>choices.</em></h1><p>Track your balance and understand what each decision costs or earns.</p></div></div>
          <section class="money-card finance-wide"><div class="money-label">AVAILABLE SAVINGS</div><div class="money-value">${character.money.toLocaleString('en-US')}</div><p>Your current balance. Work adds income; some activities have a cost.</p></section>
          <section class="finance-actions"><div class="section-heading"><div><span class="section-index">01</span><h3>How you can change your balance</h3></div></div><div class="finance-action-list"><div><span class="finance-action-icon positive">↗</span><span><strong>Extra work</strong><small>Earn money at the cost of time and a little happiness.</small></span><b class="positive-text">+$180</b></div><div><span class="finance-action-icon negative">＋</span><span><strong>Study</strong><small>Invest in future opportunities.</small></span><b>−$35</b></div><div><span class="finance-action-icon negative">◎</span><span><strong>Socialize</strong><small>Spend time with people who matter.</small></span><b>−$20</b></div><div><span class="finance-action-icon">⌁</span><span><strong>Exercise</strong><small>Improves health and fitness without a direct money cost.</small></span><b class="neutral-text">$0</b></div></div></section><div class="info-panel"><strong>Financial systems will grow with the game.</strong><p>Employment, recurring income and expenses, savings goals, debt, and assets are planned. This screen currently reflects the money changes the playable build actually simulates.</p></div>
        {:else if character}
          <div class="page-heading"><div><div class="eyebrow">THE PEOPLE IN YOUR LIFE</div><h1>Life is better <em>together.</em></h1><p>Relationships will become part of your story.</p></div></div>
          <div class="info-panel"><strong>Your social circle is still ahead.</strong><p>Family, friendships, romance, and the people who influence your life are planned as connected gameplay systems — not isolated meters.</p></div>
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
    <div class="modal-backdrop" role="presentation"><section class="modal" role="dialog" aria-modal="true"><button class="modal-close" onclick={() => slotToDelete=null} aria-label="Close">×</button><div class="eyebrow">DELETE SAVED LIFE</div><h2>Delete this slot?</h2><p>This permanently removes the selected character and life history from this device. Other slots are not affected.</p><button class="danger-button danger-confirm" onclick={() => deleteSlot(slotToDelete!)}>Delete this save</button><button class="text-button cancel-button" onclick={() => slotToDelete=null}>Keep save</button></section></div>
  {/if}
  {#if showRestartConfirm}
    <div class="modal-backdrop" role="presentation" onclick={(e) => e.target===e.currentTarget && (showRestartConfirm=false)}><div class="modal" role="dialog" aria-modal="true" aria-labelledby="restart-title"><button class="modal-close" onclick={() => showRestartConfirm=false} aria-label="Close">×</button><div class="eyebrow">THIS CANNOT BE UNDONE</div><h2 id="restart-title">Erase this life?</h2><p>Your character and life history saved on this device will be permanently deleted. This does not affect other apps or files.</p><button class="danger-button danger-confirm" onclick={restart}>Delete save and restart</button><button class="text-button cancel-button" onclick={() => showRestartConfirm=false}>Cancel</button></div></div>
  {/if}
  {#if toast}<div class="toast" role="status">{toast}</div>{/if}
  <footer class="footer"><span>life<span class="brand-light">story</span></span><span>YOUR LIFE. YOUR STORY.</span><span>v0.1 · EARLY PLAYABLE</span></footer>
</div>
