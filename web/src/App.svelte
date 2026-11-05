<script lang="ts">
  import { onMount } from 'svelte';
  import { advanceYear, createCharacter, performActivity } from './lib/simulation';
  import { clearSave, loadSave, saveCharacter } from './lib/storage';
  import type { ActivityId, Character } from './lib/types';
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
  let showNewLife = $state(false);
  let toast = $state('');
  let fullscreen = $state(false);
  let showRestartConfirm = $state(false);
  onMount(() => {
    character = loadSave();
    fullscreen = getAndroidBridge()?.isFullscreen() ?? Boolean(document.fullscreenElement);
  });
  function notify(message: string) { toast = message; window.setTimeout(() => { if (toast === message) toast = ''; }, 2200); }
  function persist(next: Character) { character = next; saveCharacter(next); }
  function startLife() { persist(createCharacter(name)); showNewLife = false; activeTab = 'home'; notify('Your story starts here.'); }
  function act(id: ActivityId) {
    if (!character) return;
    if (!character.actionsRemaining) { notify('You have used this year’s available time.'); return; }
    persist(performActivity(character, id));
  }
  function nextYear() { if (character) { persist(advanceYear(character)); notify('A new year begins.'); } }
  function restart() {
    clearSave(); character = null; name = ''; showNewLife = false;
    showRestartConfirm = false; activeTab = 'home'; notify('Your save was reset. Start a new life whenever you are ready.');
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
    <a class="brand" href="#home" onclick={() => activeTab='home'}><span class="brand-mark">L</span><span>life<span class="brand-light">story</span></span></a>
    <div class="topbar-right"><span class="live-dot"></span><span class="topbar-label">YOUR STORY, YOUR PACE</span><button class="icon-button" aria-label="Open settings" title="Settings" onclick={() => activeTab='settings'}>⚙</button><button class="icon-button" aria-label="Start a new life" title="Start a new life" onclick={() => showNewLife=true}>＋</button></div>
  </header>
  {#if !character && activeTab !== 'settings'}
    <main class="welcome"><div class="welcome-orb orb-one"></div><div class="welcome-orb orb-two"></div>
      <div class="welcome-content"><div class="eyebrow"><span class="eyebrow-line"></span> EVERY LIFE IS DIFFERENT</div>
        <h1>A whole life.<br/><span>One choice at a time.</span></h1>
        <p>Build your story through the choices you make, the people you meet, and the moments that change everything.</p>
        <div class="start-card"><label for="character-name">What should we call you?</label><input id="character-name" maxlength="28" bind:value={name} placeholder="Your character's name" onkeydown={(e) => e.key==='Enter' && startLife()}/><button class="primary-button" onclick={startLife}>Begin your life <span>→</span></button><div class="start-note">✦ A new story, saved on this device.</div></div>
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
        {#if activeTab==='settings'}
          <div class="page-heading"><div><div class="eyebrow">PREFERENCES & CONTROLS</div><h1>Game <em>settings.</em></h1><p>Adjust how the game appears and manage your saved story.</p></div></div>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">01</span><div><h3>Display</h3><p>Choose how the game uses your screen.</p></div></div>
            <div class="setting-row"><div><strong>Immersive fullscreen</strong><p>Hide the status and navigation bars for a distraction-free view. Swipe from an edge to reveal system controls.</p></div><button class:setting-enabled={fullscreen} class="setting-toggle" role="switch" aria-checked={fullscreen} onclick={toggleFullscreen}><span></span><small>{fullscreen ? 'ON' : 'OFF'}</small></button></div>
            <div class="setting-note">Fullscreen can place content behind the camera cutout on some devices. Turn it off to keep the game inside the safe screen area.</div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">02</span><div><h3>Game controls</h3><p>Reload the hosted game or check for the newest version.</p></div></div>
            <div class="setting-action-row"><div><strong>Reload game</strong><p>Refresh the current page without changing your saved life.</p></div><button class="secondary-button" onclick={() => window.location.reload()}>Reload</button></div>
            <div class="setting-action-row"><div><strong>Check for updates</strong><p>Fetch the latest published game files and restart the game view. Your save is preserved.</p></div><button class="secondary-button" onclick={reloadLatest}>Check now</button></div>
          </section>
          <section class="settings-section danger-section">
            <div class="settings-section-heading"><span class="section-index">03</span><div><h3>Saved game</h3><p>Start over by deleting the life currently saved on this device.</p></div></div>
            <div class="setting-action-row"><div><strong>Restart your life</strong><p>Erase the current character and return to character creation. This cannot be undone.</p></div><button class="danger-button" onclick={() => showRestartConfirm=true}>Restart</button></div>
          </section>
          <div class="settings-version">MY LIFE SIMULATOR <span>·</span> EARLY PLAYABLE</div>
        {:else if character && activeTab==='home'}
          <div class="page-heading"><div><div class="eyebrow">YOUR LIFE AT A GLANCE</div><h1>Good things take <em>time.</em></h1><p>Make this year count, {character.name}.</p></div><div class="year-pill"><span class="year-dot"></span> YEAR {character.year}</div></div>
          <section class="hero-card"><div class="hero-copy"><div class="hero-kicker">THE STORY SO FAR</div><h2>Chapter {character.age-17}<br/><span>Finding your own way.</span></h2><p>You’re {character.age}. There’s no fixed path ahead — just the next decision.</p><button class="hero-button" onclick={() => activeTab='activities'}>Explore your options <span>→</span></button></div><div class="hero-art" aria-hidden="true"><div class="sun"></div><div class="hill hill-back"></div><div class="hill hill-front"></div><div class="art-caption">YOUR NEXT<br/>CHAPTER AWAITS</div></div></section>
          <div class="section-heading"><div><span class="section-index">01</span><h3>Your wellbeing</h3></div><span class="section-hint">A little balance goes a long way</span></div>
          <div class="stats-grid">{#each [{label:'Health',value:character.health,color:'mint',icon:'＋'},{label:'Happiness',value:character.happiness,color:'coral',icon:'♡'},{label:'Intelligence',value:character.intelligence,color:'blue',icon:'✳'},{label:'Fitness',value:character.fitness,color:'amber',icon:'⌁'}] as stat}
            <article class="stat-card"><div class="stat-top"><span class="stat-icon {stat.color}">{stat.icon}</span><span class="stat-label">{stat.label}</span></div><div class="stat-value">{stat.value}<small>/100</small></div><div class="meter"><span class={stat.color} style="width:{stat.value}%"></span></div></article>
          {/each}</div>
          <div class="section-heading"><div><span class="section-index">02</span><h3>Make this year yours</h3></div><span class="section-hint">{character.actionsRemaining} of 3 actions left</span></div>
          <div class="activity-grid">{#each activities as activity}
            <button class="activity-card" disabled={character.actionsRemaining===0} onclick={() => act(activity.id)}><span class="activity-icon">{activity.icon}</span><span class="activity-title">{activity.title}</span><span class="activity-detail">{activity.detail}</span><span class="activity-cost">{activity.cost} <span>→</span></span></button>
          {/each}</div>
          <div class="bottom-row"><section class="history-card"><div class="card-heading"><div><span class="section-index">03</span><h3>Recent moments</h3></div><button class="text-button" onclick={() => activeTab='history'}>View all →</button></div>
            {#each character.history.slice(0,3) as item}<div class="timeline-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>{/each}
          </section><section class="money-card"><div class="money-label">YOUR MONEY</div><div class="money-value">${character.money.toLocaleString('en-US')}</div><p>Available savings</p><div class="money-foot">◇ Keep an eye on your future</div></section></div>
          <div class="advance-row"><div><strong>Ready for what’s next?</strong><span>Advancing time starts a new year and refreshes your available actions.</span></div><button class="primary-button" onclick={nextYear}>Advance one year <span>→</span></button></div>
        {:else if character && activeTab==='activities'}
          <div class="page-heading"><div><div class="eyebrow">MAKE YOUR MOVE</div><h1>Time well <em>spent.</em></h1><p>Every choice uses a little of this year's time.</p></div><div class="year-pill">{character.actionsRemaining} ACTIONS LEFT</div></div>
          <div class="activity-grid activity-grid-large">{#each activities as activity}<button class="activity-card" disabled={character.actionsRemaining===0} onclick={() => act(activity.id)}><span class="activity-icon">{activity.icon}</span><span class="activity-title">{activity.title}</span><span class="activity-detail">{activity.detail}</span><span class="activity-cost">{activity.cost} <span>→</span></span></button>{/each}</div>
          <div class="info-panel"><strong>Your time is limited — by design.</strong><p>You can take three meaningful actions each year. When ready, return to Overview and advance time. Your age and circumstances change as your story moves forward.</p></div>
        {:else if character && activeTab==='history'}
          <div class="page-heading"><div><div class="eyebrow">EVERY CHOICE LEAVES A MARK</div><h1>Your life, <em>so far.</em></h1><p>A record of the moments that brought you here.</p></div></div>
          <section class="history-card full-history">{#each character.history as item}<div class="timeline-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>{/each}</section>
        {:else if character && activeTab==='finances'}
          <div class="page-heading"><div><div class="eyebrow">MONEY & POSSIBILITY</div><h1>Your financial <em>picture.</em></h1><p>Small decisions shape your financial future.</p></div></div>
          <section class="money-card finance-wide"><div class="money-label">AVAILABLE SAVINGS</div><div class="money-value">${character.money.toLocaleString('en-US')}</div><p>Your current balance. Work adds income; some activities have a cost.</p></section>
          <div class="info-panel"><strong>Finance simulation is being built in stages.</strong><p>Future updates will add employment, recurring income and expenses, savings goals, debt, and assets. Existing balances will be preserved as those systems arrive.</p></div>
        {:else if character}
          <div class="page-heading"><div><div class="eyebrow">THE PEOPLE IN YOUR LIFE</div><h1>Life is better <em>together.</em></h1><p>Relationships will become part of your story.</p></div></div>
          <div class="info-panel"><strong>Your social circle is still ahead.</strong><p>Family, friendships, romance, and the people who influence your life are planned as connected gameplay systems — not isolated meters.</p></div>
        {/if}
      </section>
    </main>
  {/if}
  {#if showRestartConfirm}
    <div class="modal-backdrop" role="presentation" onclick={(e) => e.target===e.currentTarget && (showRestartConfirm=false)}><section class="modal" role="dialog" aria-modal="true" aria-labelledby="restart-title"><button class="modal-close" onclick={() => showRestartConfirm=false} aria-label="Close">×</button><div class="eyebrow">THIS CANNOT BE UNDONE</div><h2 id="restart-title">Erase this life?</h2><p>Your character and life history saved on this device will be permanently deleted. This does not affect other apps or files.</p><button class="danger-button danger-confirm" onclick={restart}>Delete save and restart</button><button class="text-button cancel-button" onclick={() => showRestartConfirm=false}>Cancel</button></section></div>
  {/if}
  {#if showNewLife}
    <div class="modal-backdrop" role="presentation" onclick={(e) => e.target===e.currentTarget && (showNewLife=false)}><section class="modal" role="dialog" aria-modal="true" aria-labelledby="new-life-title"><button class="modal-close" onclick={() => showNewLife=false} aria-label="Close">×</button><div class="eyebrow">A FRESH START</div><h2 id="new-life-title">Begin another story?</h2><p>Your current life is saved on this device. Starting over replaces that save.</p><label for="new-name">Character name</label><input id="new-name" bind:value={name} maxlength="28" placeholder="A new name"/><button class="primary-button" onclick={startLife}>Start a new life <span>→</span></button><button class="text-button cancel-button" onclick={() => showNewLife=false}>Keep my current life</button></section></div>
  {/if}
  {#if toast}<div class="toast" role="status">{toast}</div>{/if}
  <footer class="footer"><span>life<span class="brand-light">story</span></span><span>YOUR LIFE. YOUR STORY.</span><span>v0.1 · EARLY PLAYABLE</span></footer>
</div>
