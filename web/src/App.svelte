<script lang="ts">
  import { onMount } from 'svelte';
  import { advanceWeek, formatCharacterMoney, getWeeklyActivityReview, planEventChoiceInNextFreeTime, removePlannedActivity } from './lib/simulation';
  import { addCalendarDays, getWeekStart } from './lib/calendar';
  import { getEducationStage, getLifeStage } from './lib/progression';
  import { createGameDebugSnapshot } from './lib/debug-export';
  import { copyTextToClipboard } from './lib/clipboard';
  import CharacterCreation from './CharacterCreation.svelte';
  import MainMenu from './MainMenu.svelte';
  import CustomCharacterCreation from './CustomCharacterCreation.svelte';
  import FinanceWorkspace from './FinanceWorkspace.svelte';
  import LifeWorkspace from './LifeWorkspace.svelte';
  import WorkWorkspace from './WorkWorkspace.svelte';
  import EducationWorkspace from './EducationWorkspace.svelte';
  import ThemeOption from './components/ThemeOption.svelte';
  import EmptyState from './components/EmptyState.svelte';
  import UiCard from './components/UiCard.svelte';
  import type { GameTheme } from './lib/theme';
  import { clearSave, getActiveSlotId, getSaveSlots, getSoundEnabled, getThemePreference, loadSave, saveCharacter, setActiveSlotId, setSoundEnabled, setThemePreference } from './lib/storage';
  import type { Character, FinancialTransaction, SaveSlot, SaveSlotId } from './lib/types';
  type AndroidBridge = {
    isFullscreen: () => boolean;
    setFullscreen: (enabled: boolean) => void;
    reloadLatest: () => void;
    exitApp?: () => void;
  };
  function getAndroidBridge(): AndroidBridge | undefined {
    return (window as Window & { AndroidApp?: AndroidBridge }).AndroidApp;
  }

  let character = $state<Character | null>(null);
  let activeTab = $state('menu');
  let toast = $state('');
  let fullscreen = $state(false);
  let showRestartConfirm = $state(false);
  let activeSlotId = $state<SaveSlotId>('slot-1');
  let slots = $state<SaveSlot[]>([]);
  let soundEnabled = $state(true);
  let selectedTheme = $state<GameTheme>('amoled');
  let slotToDelete = $state<SaveSlotId | null>(null);
  let pendingSlotId = $state<SaveSlotId | null>(null);
  let debugCopying = $state(false);
  let advanceReviewOpen = $state(false);
  let weeklyFinanceOpen = $state(false);
  const weeklyReview = $derived(character ? getWeeklyActivityReview(character) : null);
  onMount(() => {
    slots = getSaveSlots();
    activeSlotId = getActiveSlotId();
    character = loadSave(activeSlotId);
    activeTab = character ? 'home' : 'menu';
    soundEnabled = getSoundEnabled();
    selectedTheme = getThemePreference();
    applyTheme(selectedTheme);
    fullscreen = getAndroidBridge()?.isFullscreen() ?? Boolean(document.fullscreenElement);
  });
  function calendarMonth(date: string | undefined) {
    if (!date) return '—';
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) return '—';
    return new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
  }
  function calendarWeek(date: string | undefined) {
    if (!date) return 1;
    const day = Number(date.split('-')[2]);
    return Number.isFinite(day) && day > 0 ? Math.min(4, Math.ceil(day / 7)) : 1;
  }

  function activityWeekKey(date: string | undefined) {
    if (!date) return 'earlier';
    try { return getWeekStart(date); }
    catch { return 'earlier'; }
  }
  function activityWeekLabel(weekStart: string) {
    const weekEnd = addCalendarDays(weekStart, 6);
    const start = new Date(weekStart + 'T00:00:00Z');
    const end = new Date(weekEnd + 'T00:00:00Z');
    const startMonth = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(start);
    const endMonth = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(end);
    const startDay = start.getUTCDate();
    const endDay = end.getUTCDate();
    const startYear = start.getUTCFullYear();
    const endYear = end.getUTCFullYear();
    if (startYear !== endYear) return startMonth + ' ' + startDay + ', ' + startYear + ' – ' + endMonth + ' ' + endDay + ', ' + endYear;
    return start.getUTCMonth() === end.getUTCMonth()
      ? startMonth + ' ' + startDay + '–' + endDay + ', ' + endYear
      : startMonth + ' ' + startDay + ' – ' + endMonth + ' ' + endDay + ', ' + endYear;
  }
  function financialFlow(type: FinancialTransaction['type']): 'income' | 'expense' | null {
    if (['income', 'interest', 'business-income', 'investment-sell', 'property-sale'].includes(type)) return 'income';
    if (['expense', 'family-support', 'loan-payment', 'loan-interest', 'card-purchase', 'card-interest', 'recurring-payment', 'investment-buy', 'property-purchase', 'property-rent', 'business-expense', 'tax', 'fee'].includes(type)) return 'expense';
    return null;
  }
  function groupWeeklyFinances(transactions: FinancialTransaction[], flow: 'income' | 'expense') {
    const groups = new Map<string, { source: string; total: number; transactions: FinancialTransaction[] }>();
    for (const transaction of transactions) {
      if (financialFlow(transaction.type) !== flow) continue;
      const source = flow === 'income' ? transaction.from : transaction.to;
      const group = groups.get(source) ?? { source, total: 0, transactions: [] };
      group.total += transaction.amount;
      group.transactions.push(transaction);
      groups.set(source, group);
    }
    return [...groups.values()].sort((a, b) => b.total - a.total);
  }
  function groupActivityHistory(items: Character['history']) {
    const groups = new Map<string, { key: string; label: string; sortDate: string; items: Character['history'] }>();
    for (const item of items) {
      const key = activityWeekKey(item.date);
      const label = key === 'earlier' ? 'Earlier records' : activityWeekLabel(key);
      const group = groups.get(key) ?? { key, label, sortDate: key === 'earlier' ? '0000-00-00' : key, items: [] };
      group.items.push(item);
      groups.set(key, group);
    }
    return [...groups.values()].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  }
  function groupLifeMilestones(character: Character) {
    const groups = new Map<string, { key: string; age: number; year: number; events: Character['history']; transactions: FinancialTransaction[] }>();
    for (const event of character.history.filter((item) => item.kind !== 'activity')) {
      const key = event.age + '-' + event.year;
      const group = groups.get(key) ?? { key, age: event.age, year: event.year, events: [], transactions: [] };
      group.events.push(event);
      groups.set(key, group);
    }
    for (const transaction of character.financialTransactions ?? []) {
      const key = transaction.age + '-' + transaction.year;
      const group = groups.get(key) ?? { key, age: transaction.age, year: transaction.year, events: [], transactions: [] };
      group.transactions.push(transaction);
      groups.set(key, group);
    }
    return [...groups.values()]
      .filter((group) => group.events.length || group.transactions.length)
      .sort((a, b) => b.year - a.year || b.age - a.age);
  }
  function notify(message: string) { toast = message; window.setTimeout(() => { if (toast === message) toast = ''; }, 2200); }
  function navigateTab(tab: string) { activeTab = tab; }
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
  function continueLife() {
    const available = slots.filter((slot) => slot.character).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    if (!available.length) return;
    loadSlot(available.find((slot) => slot.id === activeSlotId && slot.character) ?? available[0]);
  }
  function startNewLife() {
    const empty = slots.find((slot) => !slot.character);
    if (!empty) { notify('All save slots are full. Delete a slot before starting another life.'); activeTab = 'settings'; return; }
    openCreation(empty.id);
  }
  function openCustomLife() {
    const empty = slots.find((slot) => !slot.character);
    if (!empty) { notify('All save slots are full. Delete a slot before starting another life.'); activeTab = 'settings'; return; }
    pendingSlotId = empty.id; activeTab = 'custom';
  }
  function exitGame() {
    const bridge = getAndroidBridge();
    if (bridge?.exitApp) { bridge.exitApp(); return; }
    window.close();
    notify('If the window stays open, close it using your browser controls.');
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
  function applyTheme(theme: GameTheme) { if (typeof document !== 'undefined') document.documentElement.dataset.theme = theme; }
  function chooseTheme(theme: GameTheme) { selectedTheme = theme; setThemePreference(theme); applyTheme(theme); }
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
  function eventChoicePlanned(choiceId: string) {
    return (character?.weeklySchedule?.activities ?? []).find((item) => item.action?.kind === 'event' && item.action.choiceId === choiceId);
  }
  function chooseLifeEvent(choiceId: string) {
    if (!character) return;
    const existing = eventChoicePlanned(choiceId);
    if (existing) { persist(removePlannedActivity(character, existing.id)); notify('Decision removed from this week.'); return; }
    const planned = planEventChoiceInNextFreeTime(character, choiceId);
    if (planned.issue) { notify(planned.message ?? 'That decision could not be added.'); return; }
    const immediate = character.pendingGameEvent?.choices.find((choice) => choice.id === choiceId)?.timeBlocks === 0;
    persist(planned.character); playSound('action');
    notify(immediate ? 'Decision recorded.' : 'Decision added to this week.');
  }
  function openAdvanceReview() { if (!character) return; activeTab = 'home'; advanceReviewOpen = true; }
  function closeAdvanceReview() { advanceReviewOpen = false; }
  function advanceWeekNow() {
    if (!character) return;
    const result = advanceWeek(character);
    if (result.issue) { notify(result.issue === 'invalid-schedule' ? 'Fix the schedule conflicts before advancing.' : result.issue === 'already-resolved' ? 'This week has already been resolved.' : 'A planned action is no longer available. Remove or repair that reservation before advancing.'); return; }
    const crossedYear = result.character.year > character.year;
    persist(result.character); advanceReviewOpen = false;
    notify(crossedYear ? 'Week completed. A new year begins.' : 'Week completed. The next week begins.');
    playSound(crossedYear ? 'year' : 'action');
  }
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

</script>
<svelte:head><title>{character ? character.name + ' · My Life Simulator' : 'My Life Simulator'}</title></svelte:head>
<div class="app-shell">
  <header
    class="topbar"
    class:topbar-game={!!character && activeTab !== 'create'}
    class:topbar-persistent={!!character && activeTab !== 'create' && activeTab !== 'settings' && activeTab !== 'profile'}
    aria-label="Game header"
  >
    <a class="brand" href="#home" aria-label="My Life Simulator home" onclick={() => activeTab=character ? 'home' : 'menu'}>
      <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="brand-name">My Life <span class="brand-light">Simulator</span></span>
    </a>
    {#if character && activeTab !== 'settings' && activeTab !== 'profile' && activeTab !== 'create'}
      <div class="topbar-right" aria-label="Current life status">
        <div class="topbar-life-identity">
          <span class="topbar-life-dot" aria-hidden="true"></span>
          <span class="topbar-life-name">{character.name}</span>
          <span class="topbar-life-stage">AGE {character.age} · {getLifeStage(character.age).label}</span>
        </div>
        <div class="topbar-metrics">
          <div class="topbar-cash"><span>CASH</span><strong>{formatCharacterMoney(character)}</strong></div>
          <div><span>YEAR</span><strong>{character.year}</strong></div>
          <div class="topbar-month"><span>MONTH</span><strong>{calendarMonth(character.calendar?.currentDate)}</strong><div class="topbar-week-dots" role="img" aria-label={`Week ${calendarWeek(character.calendar?.currentDate)} of 4`}>{#each [1, 2, 3, 4] as week}<i class:current={week === calendarWeek(character.calendar?.currentDate)}></i>{/each}</div></div>
        </div>
      </div>
    {/if}
  </header>
  {#if !character && activeTab === 'menu'}
    <MainMenu {slots} onContinue={continueLife} onNewGame={startNewLife} onPresets={startNewLife} onFullCustom={openCustomLife} onAchievements={() => activeTab='achievements'} onSettings={() => activeTab='settings'} onExit={exitGame} />
  {:else}
    <main class="main-layout">
      <aside class="side-nav"><div class="side-caption">YOUR WORLD</div>
        {#each (character ? [{id:'home',label:'Overview',icon:'⌂'},{id:'education',label:'Education',icon:'▤'},...(character.age >= 16 ? [{id:'work',label:'Work',icon:'▣'},{id:'finances',label:'Finance',icon:'◈'}] : []),{id:'life',label:'Life',icon:'✳'},{id:'profile',label:'Profile',icon:'◉'}] : [{id:'settings',label:'Settings',icon:'⚙'}]) as item}
          <button class:active={activeTab===item.id} class="nav-item" onclick={() => navigateTab(item.id)}><span class="nav-icon">{item.icon}</span>{item.label}</button>
        {/each}
        {#if character}<div class="side-profile"><div class="avatar">{character.name.slice(0,1).toUpperCase()}</div><div><strong>Active save</strong><small>Slot {activeSlotId.slice(-1)}</small></div></div>{/if}
      </aside>
      <section class="content">
        {#if activeTab==='create'}
          <CharacterCreation slotLabel={pendingSlotId ?? activeSlotId} onStart={startLife} onCancel={() => activeTab='menu'} />
        {:else if activeTab==='custom'}
          <CustomCharacterCreation slotLabel={pendingSlotId ?? activeSlotId} onStart={startLife} onCancel={() => activeTab='menu'} />
        {:else if activeTab==='achievements'}
          <div class="page-heading"><div><div class="eyebrow">MILESTONES & PROGRESS</div><h1>Achievements</h1><p>Milestones earned across the lives saved on this device.</p></div></div>
          {@const allLives = slots.flatMap((slot) => slot.character ? [slot.character] : [])}
          <div class="achievement-grid">
            {#each [{title:'First Chapter',detail:'Start your first life.',done:allLives.length>0,mark:'✦'},{title:'Growing Up',detail:'Reach adulthood.',done:allLives.some((life)=>life.age>=18),mark:'⌁'},{title:'A Long Journey',detail:'Reach age 65.',done:allLives.some((life)=>life.age>=65),mark:'◇'},{title:'A Life Well Lived',detail:'Reach age 90.',done:allLives.some((life)=>life.age>=90),mark:'★'}] as achievement}
              <article class:achievement-unlocked={achievement.done} class="achievement-card"><div class="achievement-mark">{achievement.mark}</div><div><strong>{achievement.title}</strong><p>{achievement.detail}</p><small>{achievement.done ? 'UNLOCKED' : 'LOCKED'}</small></div></article>
            {/each}
          </div>
          <button class="text-button" onclick={() => activeTab='menu'}>← Back to main menu</button>
        {:else if activeTab==='profile' || activeTab==='settings'}
          <div class="page-heading"><div><div class="eyebrow">{character ? 'CHARACTER & GAME MANAGEMENT' : 'PREFERENCES & CONTROLS'}</div><h1>{character ? 'Your <em>profile</em>' : 'Game <em>settings</em>'}</h1><p>{character ? 'Character details and saved-life controls.' : 'Adjust how the game appears and manage your saved story.'}</p></div></div>
          {#if !character}<button class="text-button" onclick={() => activeTab='menu'}>← Back to main menu</button>{/if}
          {#if character}
            <section class="settings-section profile-character-section">
              <div class="settings-section-heading"><span class="section-index">01</span><div><h3>Character</h3></div></div>
              <div class="character-profile-card">
                <div class="character-avatar" aria-hidden="true">{character.name.trim().split(/\\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
                <div class="character-profile-copy"><div class="character-profile-heading"><h2>{character.name}</h2><span class="character-age">AGE {character.age}</span></div><p>{getLifeStage(character.age).label} · {character.country ?? character.nationality ?? 'Country not recorded'}</p><div class="character-profile-tags"><span>{character.gender ?? 'Gender not recorded'}</span><span>{character.nationality ?? 'Nationality not recorded'}</span></div></div>
              </div>
              <div class="overview-context profile-detail-grid">
                <div class="overview-context-item"><span>BIRTHPLACE</span><strong>{character.birthplace ?? 'Not recorded'}</strong></div>
                <div class="overview-context-item"><span>LANGUAGE</span><strong>{character.language ?? 'Not recorded'}</strong></div>
                <div class="overview-context-item"><span>PERSONALITY</span><strong>{character.personality?.join(' · ') ?? 'Not recorded'}</strong></div>
                <div class="overview-context-item"><span>FAMILY BACKGROUND</span><strong>{character.familyBackground ?? 'Not recorded'}</strong></div>
              </div>
              {#if character.appearance}
                <div class="overview-context profile-detail-grid">
                  <div class="overview-context-item"><span>HEIGHT</span><strong>{character.appearance.height}</strong></div>
                  <div class="overview-context-item"><span>BUILD</span><strong>{character.appearance.build}</strong></div>
                  <div class="overview-context-item"><span>HAIR</span><strong>{character.appearance.hair}</strong></div>
                  <div class="overview-context-item"><span>EYES</span><strong>{character.appearance.eyes}</strong></div>
                </div>
              {/if}
            </section>
            <section class="settings-section profile-attributes-section">
              <div class="settings-section-heading"><span class="section-index">02</span><div><h3>Attributes</h3></div></div>
              <div class="character-stats-grid">
                {#each [{label:'Health',value:character.health},{label:'Happiness',value:character.happiness},{label:'Fitness',value:character.fitness},{label:'Intelligence',value:character.intelligence},{label:'Stamina',value:character.stamina ?? 50},{label:'Focus',value:character.focus ?? 50},{label:'Discipline',value:character.discipline ?? 50},{label:'Confidence',value:character.confidence ?? 50},{label:'Creativity',value:character.creativity ?? 50},{label:'Social skills',value:character.socialSkills ?? 50},{label:'Stress',value:character.stress ?? 0}] as stat}
                  <div class="character-stat"><div class="character-stat-ring" class:stress-stat={stat.label === 'Stress'} style={`--stat-value: ${Math.max(0, Math.min(100, stat.value))}%`}><strong>{Math.round(stat.value)}</strong></div><span>{stat.label}</span>{#if stat.label === 'Stress'}<small>Higher is worse</small>{/if}</div>
                {/each}
              </div>
            </section>
          {/if}
          <details class="profile-settings-group">
            <summary><span><strong>{character ? 'Settings & management' : 'Game settings'}</strong><small>Appearance, sound, saves, display and game controls</small></span><i aria-hidden="true"></i></summary>
          <UiCard as="section" class="settings-section appearance-settings" padded={false}>
            <div class="settings-section-heading"><span class="section-index">{character ? '03' : '01'}</span><div><h3>Appearance</h3></div></div>
            <div class="theme-option-grid" role="group" aria-label="Game theme">
              <ThemeOption theme="amoled" title="AMOLED" description="Pure black and emerald" selected={selectedTheme === 'amoled'} onSelect={chooseTheme} />
              <ThemeOption theme="midnight" title="Midnight" description="Deep navy and blue" selected={selectedTheme === 'midnight'} onSelect={chooseTheme} />
              <ThemeOption theme="graphite" title="Graphite" description="Soft charcoal and violet" selected={selectedTheme === 'graphite'} onSelect={chooseTheme} />
              <ThemeOption theme="paper" title="Paper" description="Warm light and forest green" selected={selectedTheme === 'paper'} onSelect={chooseTheme} />
            </div>
            <div class="setting-note">Theme changes affect the interface only. Your characters, saves and game progress are unchanged.</div>
          </UiCard>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">{character ? '04' : '02'}</span><div><h3>Sound</h3><p>Control the small audio cues used for game actions.</p></div></div>
            <div class="setting-row"><div><strong>Sound effects</strong><p>Subtle original tones for actions, starting a life and advancing a week. No background music.</p></div><button class:setting-enabled={soundEnabled} class="setting-toggle" role="switch" aria-checked={soundEnabled} onclick={() => toggleSounds(!soundEnabled)}><span></span><small>{soundEnabled ? 'ON' : 'OFF'}</small></button></div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">{character ? '05' : '03'}</span><div><h3>Save slots</h3><p>Keep up to three separate lives on this device.</p></div></div>
            <div class="save-slot-list">{#each slots as slot, index}<div class="save-slot-row"><div class="save-slot-meta"><strong>Slot {index + 1}</strong>{#if slot.character}<span>{slot.character.name} · Age {slot.character.age} · {formatCharacterMoney(slot.character)}</span><small>{slot.id === activeSlotId ? 'CURRENT SLOT' : 'SAVED LIFE'}</small>{:else}<span class="empty-slot-label">Empty slot</span>{/if}</div><div class="save-slot-actions">{#if slot.character}<button class="secondary-button" onclick={() => loadSlot(slot)} disabled={slot.id===activeSlotId}>Load</button><button class="danger-button" onclick={() => slotToDelete=slot.id}>Delete</button>{:else}<button class="secondary-button" onclick={() => openCreation(slot.id)}>New life</button>{/if}</div></div>{/each}</div>
            <div class="setting-note">Saves stay in this browser or app on this device. Clearing app data or browser storage can remove them. Cloud backup is not available yet.</div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">{character ? '06' : '04'}</span><div><h3>Game log & debug</h3><p>Review recent gameplay records or copy the complete simulation state for testing.</p></div></div>
            {#if character}
              <div class="debug-export-row"><div><strong>Gameplay snapshot</strong><p>Includes the character, current stats, finances, save slot and complete life history. It excludes device identifiers and browser data.</p></div><button class="secondary-button" onclick={copyDebugSnapshot} disabled={debugCopying}>{debugCopying ? 'Copying…' : 'Copy snapshot'}</button></div>
              <div class="settings-log-list">{#each character.history.slice(0,6) as item}<div class="settings-log-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>{/each}</div>
              <button class="text-button settings-log-link" onclick={() => navigateTab('life')}>Open Life workspace →</button>
            {:else}
              <p class="settings-empty-log">The game log will appear here after a life is started.</p>
            {/if}
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">{character ? '07' : '05'}</span><div><h3>Display</h3><p>Choose how the game uses your screen.</p></div></div>
            <div class="setting-row"><div><strong>Immersive fullscreen</strong><p>Hide the status and navigation bars for a distraction-free view. Swipe from an edge to reveal system controls.</p></div><button class:setting-enabled={fullscreen} class="setting-toggle" role="switch" aria-checked={fullscreen} onclick={toggleFullscreen}><span></span><small>{fullscreen ? 'ON' : 'OFF'}</small></button></div>
            <div class="setting-note">Fullscreen can place content behind the camera cutout on some devices. Turn it off to keep the game inside the safe screen area.</div>
          </section>
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">{character ? '08' : '06'}</span><div><h3>Game controls</h3><p>Reload the hosted game or check for the newest version.</p></div></div>
            <div class="setting-action-row"><div><strong>Reload game</strong><p>Refresh the current page without changing your saved life.</p></div><button class="secondary-button" onclick={() => window.location.reload()}>Reload</button></div>
            <div class="setting-action-row"><div><strong>Check for updates</strong><p>Fetch the latest published game files and restart the game view. Your save is preserved.</p></div><button class="secondary-button" onclick={reloadLatest}>Check now</button></div>
          </section>
          <section class="settings-section danger-section">
            <div class="settings-section-heading"><span class="section-index">{character ? '09' : '07'}</span><div><h3>Saved game</h3><p>Start over by deleting the life currently saved on this device.</p></div></div>
            <div class="setting-action-row"><div><strong>Restart current life</strong><p>Delete only the active save slot and create a new life in that slot.</p></div><button class="danger-button" onclick={() => showRestartConfirm=true} disabled={!character}>Restart</button></div>
          </section>
          <div class="settings-version">MY LIFE SIMULATOR <span>·</span> EARLY PLAYABLE</div>
          </details>
        {:else if character && activeTab==='home'}
          {@const educationStatus = character.educationEnrollment ? character.educationEnrollment.field + ' · ' + character.educationEnrollment.institution : character.education ?? getEducationStage(character.age)}
          {@const workStatus = character.employment
            ? character.employment.title
            : character.age < 16
              ? 'Not eligible yet'
              : character.age < 18
                ? 'Part-time opportunities'
                : character.age >= 65
                  ? 'Flexible work available'
                  : 'Job search'}
          {@const workDetail = character.employment
            ? character.employment.type === 'part-time' ? 'Part-time employment' : character.employment.type === 'flexible' ? 'Flexible employment' : 'Full-time employment'
            : character.age < 16 ? 'Employment unlocks at age 16' : character.age < 18 ? 'School-age work only' : character.age >= 65 ? 'Optional later-life work' : 'No current position'}
          {@const currentWeekStart = activityWeekKey(character.calendar?.currentDate)}
          {@const weeklyTransactions = (character.financialTransactions ?? []).filter((item) => item.date && activityWeekKey(item.date) === currentWeekStart)}
          {@const weeklyIncomeGroups = groupWeeklyFinances(weeklyTransactions, 'income')}
          {@const weeklyExpenseGroups = groupWeeklyFinances(weeklyTransactions, 'expense')}
          {@const weeklyIncome = weeklyIncomeGroups.reduce((sum, group) => sum + group.total, 0)}
          {@const weeklyExpense = weeklyExpenseGroups.reduce((sum, group) => sum + group.total, 0)}
          {#if weeklyFinanceOpen}
            <div class="weekly-finance-backdrop" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) weeklyFinanceOpen = false; }}>
              <section class="weekly-finance-dialog" role="dialog" aria-modal="true" aria-labelledby="weekly-finance-title">
                <header><div><div class="eyebrow">WEEKLY MONEY REPORT</div><h2 id="weekly-finance-title">Income & expenses</h2><p>{activityWeekLabel(currentWeekStart)}</p></div><button class="weekly-finance-close" aria-label="Close breakdown" onclick={() => weeklyFinanceOpen = false}>×</button></header>
                <div class="weekly-finance-totals">
                  <div><small>MONEY IN</small><strong class="weekly-finance-in">+{formatCharacterMoney(character, weeklyIncome)}</strong></div>
                  <div><small>MONEY OUT</small><strong class="weekly-finance-out">−{formatCharacterMoney(character, weeklyExpense)}</strong></div>
                </div>
                {#each [{ title: 'Income by source', groups: weeklyIncomeGroups, flow: 'income' as const }, { title: 'Expenses by source', groups: weeklyExpenseGroups, flow: 'expense' as const }] as section}
                  <section class="weekly-finance-source-section"><h3>{section.title}</h3>
                    {#if section.groups.length}
                      {#each section.groups as group}
                        <details class="weekly-finance-source" open>
                          <summary><span>{group.source}</span><strong class:weekly-finance-in={section.flow === 'income'} class:weekly-finance-out={section.flow === 'expense'}>{section.flow === 'income' ? '+' : '−'}{formatCharacterMoney(character, group.total)}</strong></summary>
                          {#each group.transactions as transaction}
                            <div class="weekly-finance-transaction"><span><strong>{transaction.description}</strong><small>{transaction.date ?? 'Date unavailable'} · {transaction.type.replaceAll('-', ' ')}</small></span><b>{formatCharacterMoney(character, transaction.amount)}</b></div>
                          {/each}
                        </details>
                      {/each}
                    {:else}
                      <p class="weekly-finance-empty">No {section.flow} recorded this week.</p>
                    {/if}
                  </section>
                {/each}
                <p class="weekly-finance-note">Only transactions recorded during this game week are included. Transfers between your own accounts are excluded from income and expenses.</p>
              </section>
            </div>
          {/if}
          <section class="character-profile-card" aria-label="Character profile">
            <div class="character-avatar" aria-hidden="true">{character.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
            <div class="character-profile-copy">
              <div class="character-profile-heading"><h2>{character.name}</h2><span class="character-age">AGE {character.age}</span></div>
              <p>{character.gender ?? 'Gender not recorded'} <span>·</span> {character.country ?? character.nationality ?? 'Country not recorded'}</p>
              <div class="character-profile-tags"><span>{character.employment?.title ?? 'Not employed'}</span><span>{character.educationEnrollment?.institution ?? (character.educationLevel ? character.educationLevel.replaceAll('-', ' ') : getEducationStage(character.age))}</span></div>
            </div>
            <div class="character-cash-summary"><small>AVAILABLE CASH</small><strong>{formatCharacterMoney(character)}</strong></div>
            <button class="character-profile-weekly character-profile-weekly-trigger" aria-label="Open weekly income and expense breakdown" onclick={() => weeklyFinanceOpen = true}>
              <div class="character-profile-flow character-profile-income"><small>WEEKLY IN</small><strong class="weekly-finance-in">+{formatCharacterMoney(character, weeklyIncome)}</strong></div>
              <div class="character-profile-flow character-profile-expense"><small>WEEKLY OUT</small><strong class="weekly-finance-out">−{formatCharacterMoney(character, weeklyExpense)}</strong></div>
              <div class="character-profile-flow"><small>WEEKLY NET</small><strong>{weeklyIncome - weeklyExpense < 0 ? '−' : '+'}{formatCharacterMoney(character, Math.abs(weeklyIncome - weeklyExpense))}</strong></div>
            </button>
          </section>
          <section class="overview-context" aria-label="Current situation">
            <div class="overview-context-item">
              <span>EDUCATION</span>
              <strong>{educationStatus}</strong>
              <small>{character.age < 3 ? 'Early development' : character.age < 6 ? 'Early learning stage' : character.age < 18 ? 'School-age learning' : character.educationEnrollment ? Math.round(character.educationEnrollment.grade) + '% current grade' : character.academicHistory?.length ? character.academicHistory.length + ' completed programme(s)' : 'No active enrollment'}</small>
            </div>
            <div class="overview-context-item">
              <span>WORK & CAREER</span>
              <strong>{workStatus}</strong>
              <small>{workDetail}</small>
            </div>
          </section>
          {#if character.lastYearRecap?.length}
            <section class="year-recap">
              <div class="eyebrow">YEAR {character.year - 1} · RECAP</div>
              <h2>What changed</h2>
              <ul>{#each character.lastYearRecap as recap}<li>{recap}</li>{/each}</ul>
            </section>
          {/if}
          {#if character.pendingGameEvent}
            {@const lifeEvent = character.pendingGameEvent}
            <section class="game-event-panel">
              <div class="game-event-top"><span class="eyebrow">THIS YEAR · {lifeEvent.category.toUpperCase()}</span><span class="game-event-status">DECISION</span></div>
              <h2>{lifeEvent.title}</h2>
              <p class="game-event-description">{lifeEvent.description}</p>
              <div class="game-event-choices">
                {#each lifeEvent.choices as choice}
                  <button class="game-event-choice" class:planned={!!eventChoicePlanned(choice.id)} disabled={!eventChoicePlanned(choice.id) && character.money < choice.moneyCost} onclick={() => chooseLifeEvent(choice.id)}>
                    <span class="game-event-choice-copy"><strong>{choice.label}</strong><small>{choice.detail}</small></span>
                    <span class="game-event-choice-cost">
                      {#if choice.timeBlocks > 0}<span>Stamina 5</span>{/if}
                      {#if choice.moneyCost > 0}<span>{formatCharacterMoney(character, choice.moneyCost)}</span>{/if}
                      {#if choice.timeBlocks === 0 && choice.moneyCost === 0}<span>Immediate</span>{/if}
                    </span>
                  </button>
                {/each}
              </div>
              <p class="game-event-footnote">Toggle a decision to include or remove it from this week. Non-immediate choices use stamina; you can also leave the situation unanswered.</p>
            </section>
          {/if}
          {#if advanceReviewOpen && weeklyReview}
            <div class="modal-backdrop week-review-backdrop" role="presentation">
              <dialog open class="modal week-review-dialog" aria-modal="true" aria-labelledby="week-review-title">
                <button class="modal-close" onclick={closeAdvanceReview} aria-label="Close weekly review">×</button>
                <div class="eyebrow">WEEKLY SIMULATION · AGE {character.age}</div>
                <h2 id="week-review-title">Review this week</h2>
                <p class="game-event-description">{weeklyReview.weekStart} – {weeklyReview.weekEnd}. Review the effort, expected rewards and combined effects before resolving the week.</p>

                <section class="review-section">
                  <div class="review-section-heading"><h3>Planned activities</h3><span>{weeklyReview.activities.length} total</span></div>
                  {#if weeklyReview.activities.length}
                    <div class="review-activity-list">
                      {#each weeklyReview.activities as activity}
                        <article class="review-activity-row">
                          <div><strong>{activity.title}</strong><small>{activity.reward}</small></div>
                          <div class="review-activity-cost"><b>{activity.staminaCost ? '−' + activity.staminaCost + ' stamina' : 'No stamina cost'}</b>{#if activity.moneyCost > 0}<small>{formatCharacterMoney(character, activity.moneyCost)}</small>{/if}</div>
                        </article>
                      {/each}
                    </div>
                  {:else}
                    <p class="review-empty">No personal activities are planned. Recurring school and work commitments still resolve normally.</p>
                  {/if}
                  <div class="review-cash-row"><span>Total direct activity costs</span><strong>{formatCharacterMoney(character, weeklyReview.totalMoneyCost)}</strong></div>
                </section>

                <section class="review-section">
                  <div class="review-section-heading"><h3>Stamina forecast</h3><span>After activity effects and recovery</span></div>
                  <div class="review-resource-grid">
                    <div><small>Current</small><strong>{Math.round(weeklyReview.currentStamina)}%</strong></div>
                    <div><small>Effort cost</small><strong>−{weeklyReview.staminaCost}</strong></div>
                    <div><small>Projected</small><strong>{Math.round(weeklyReview.projectedStamina)}%</strong></div>
                  </div>
                  <div class="review-stamina-track"><span style="width:{weeklyReview.projectedStamina}%"></span></div>
                </section>

                <section class="review-section">
                  <div class="review-section-heading"><h3>Combined character impact</h3><span>Simulation forecast</span></div>
                  {#if weeklyReview.changes.length}
                    <div class="review-change-grid">
                      {#each weeklyReview.changes as change}
                        <div class="review-change-row">
                          <span>{change.label}</span>
                          <strong class:positive={change.key === 'stress' || change.key === 'family-tension' ? change.delta < 0 : change.delta > 0} class:negative={change.key === 'stress' || change.key === 'family-tension' ? change.delta > 0 : change.delta < 0}>{change.delta > 0 ? '+' : ''}{Math.round(change.delta)} <small>({Math.round(change.after)}%)</small></strong>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <p class="review-empty">No tracked character stats are expected to change.</p>
                  {/if}
                  <div class="review-cash-row"><span>Projected cash after weekly resolution</span><strong>{formatCharacterMoney(character, weeklyReview.projectedCash)}</strong></div>
                </section>

                {#if weeklyReview.warnings.length}
                  <section class="review-warning-list" aria-label="Weekly risks">
                    {#each weeklyReview.warnings as warning}<p>{warning}</p>{/each}
                  </section>
                {/if}
                {#if character.pendingGameEvent}
                  <p class="year-review-warning">Unresolved situation: {character.pendingGameEvent.title}. It remains available for now but may expire at the year boundary if left unanswered.</p>
                {/if}
                <p class="year-review-note">This preview is calculated without changing your save. Resolving applies the same weekly simulation once; annual financial settlements remain on their yearly boundary.</p>
                <div class="year-review-actions">
                  <button class="secondary-button" onclick={closeAdvanceReview}>Back to this week</button>
                  <button class="primary-button" disabled={weeklyReview.issue !== null} onclick={advanceWeekNow}>Resolve reviewed week</button>
                </div>
              </dialog>
            </div>
          {/if}
          {@const activities = character.history.filter((item) => item.kind === 'activity')}
          {@const activityWeeks = groupActivityHistory(activities)}
          <section class="history-card overview-activity-feed" aria-label="All activities">
            <div class="page-heading"><div><div class="eyebrow">EVERYDAY LIFE</div><h2>Activities</h2><p>Your recorded actions, grouped by week.</p></div><span class="year-pill">{activities.length} ACTIVITIES</span></div>
            {#if activityWeeks.length}
              {#each activityWeeks as group}
                <details class="activity-week-group" open={group.key === activityWeekKey(character.calendar?.currentDate)}>
                  <summary><span>{group.label}</span><span class="activity-week-meta">{group.items.length} {group.items.length === 1 ? 'ACTIVITY' : 'ACTIVITIES'} <i aria-hidden="true"></i></span></summary>
                  <div class="activity-week-items">
                    {#each group.items as item}
                      <div class="timeline-item"><span class="timeline-dot activity"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>
                    {/each}
                  </div>
                </details>
              {/each}
            {:else}
              <EmptyState title="No activity recorded" description="Confirmed actions appear here, grouped by simulation week." />
            {/if}
          </section>
        {:else if character && activeTab==='education'}
          <EducationWorkspace {character} onChange={persist} onNotify={notify} />
                {:else if character && activeTab==='work' && character.age >= 16}
          <WorkWorkspace {character} onChange={persist} onNotify={notify} />

        {:else if character && activeTab==='life'}
          <LifeWorkspace {character} onChange={persist} onNotify={notify} />
        {:else if character && activeTab==='finances'}
          <FinanceWorkspace {character} onChange={persist} />
        {/if}
      </section>
    </main>
  {/if}
  {#if character && activeTab !== 'settings' && activeTab !== 'profile'}
    <button class="advance-fab" onclick={openAdvanceReview} aria-label="Advance" title="Advance">
      <span class="fab-arrow" aria-hidden="true">→</span><span class="fab-label">Advance</span>
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

<style>
  .week-review-backdrop{z-index:1000;align-items:center;justify-content:center;padding:16px;overflow-y:auto}
  .week-review-dialog{position:relative;margin:0;inset:auto;width:min(680px,100%);max-width:none;max-height:min(90dvh,900px);overflow:auto;display:grid;gap:14px;padding:20px}
  .week-review-dialog h2{margin:0;font-size:clamp(22px,4vw,28px);letter-spacing:-.6px}
  .week-review-dialog .game-event-description{margin:0}
  .review-section{display:grid;gap:9px;padding-top:12px;border-top:1px solid var(--line)}
  .review-section-heading{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
  .review-section-heading h3{margin:0;font-size:13px;color:var(--text)}
  .review-section-heading>span{font-size:9px;color:var(--muted);text-align:right}
  .review-activity-list{display:grid;gap:7px}
  .review-activity-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--surface)}
  .review-activity-row>div:first-child{display:grid;gap:4px;min-width:0}
  .review-activity-row strong{font-size:11px;color:var(--text)}
  .review-activity-row small{font-size:9px;line-height:1.4;color:var(--muted)}
  .review-activity-cost{flex:none;display:grid;gap:4px;text-align:right}
  .review-activity-cost b{font-size:10px;color:var(--text)}
  .review-resource-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
  .review-resource-grid>div{display:grid;gap:4px;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
  .review-resource-grid small{font-size:9px;color:var(--muted)}
  .review-resource-grid strong{font-size:17px;color:var(--text)}
  .review-stamina-track{height:7px;overflow:hidden;border-radius:10px;background:var(--surface-raised)}
  .review-stamina-track span{display:block;height:100%;border-radius:inherit;background:var(--accent)}
  .review-change-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px 12px}
  .review-change-row,.review-cash-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)}
  .review-change-row>span,.review-cash-row>span{font-size:10px;color:var(--muted)}
  .review-change-row strong,.review-cash-row strong{font-size:11px;color:var(--text);font-variant-numeric:tabular-nums}
  .review-change-row strong.positive{color:var(--green)}
  .review-change-row strong.negative{color:var(--coral)}
  .game-event-choice.planned{border-color:var(--accent);background:var(--accent-soft)}
  .review-change-row strong small{font-size:9px;color:var(--muted);font-weight:500}
  .review-empty{margin:0;padding:10px;border-radius:9px;background:var(--surface);font-size:10px;line-height:1.5;color:var(--muted)}
  .review-warning-list{display:grid;gap:6px;padding:10px;border:1px solid color-mix(in srgb,var(--amber) 45%,transparent);border-radius:10px;background:color-mix(in srgb,var(--amber) 8%,transparent)}
  .review-warning-list p{margin:0;font-size:10px;line-height:1.45;color:var(--text)}
  .week-review-dialog .year-review-note{margin:0}
  @media(max-width:480px){.week-review-dialog{padding:15px;gap:12px}.review-activity-row{gap:8px;padding:8px}.review-change-grid{grid-template-columns:1fr}}
</style>
