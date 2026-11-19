<script lang="ts">
  import { onMount } from 'svelte';
  import { advanceWeek, formatCharacterMoney, getWeeklyActivityReview, planEventChoiceInNextFreeTime, removePlannedActivity } from './lib/simulation';
  import type { WeeklyActivityOutcomeEffect, WeeklyActivityReviewItem } from './lib/simulation';
  import { addCalendarDays, getWeekStart } from './lib/calendar';
  import { getEducationStage, getLifeStage, getValueTone } from './lib/progression';
  import { createGameDebugSnapshot } from './lib/debug-export';
  import { copyTextToClipboard } from './lib/clipboard';
  import CharacterCreation from './CharacterCreation.svelte';
  import MainMenu from './MainMenu.svelte';
  import CustomCharacterCreation from './CustomCharacterCreation.svelte';
  import Presets from './Presets.svelte';
  import FinanceWorkspace from './FinanceWorkspace.svelte';
  import LifeWorkspace from './LifeWorkspace.svelte';
  import WorkWorkspace from './WorkWorkspace.svelte';
  import EducationWorkspace from './EducationWorkspace.svelte';
  import ThemeOption from './components/ThemeOption.svelte';
  import UiBadge from './components/UiBadge.svelte';
  import UiProgress from './components/UiProgress.svelte';
  import ActivityEffectBadges from './components/ActivityEffectBadges.svelte';
  import EmptyState from './components/EmptyState.svelte';
  import UiCard from './components/UiCard.svelte';
  import GameplayDialog from './components/GameplayDialog.svelte';
  import type { GameTheme } from './lib/theme';
  import { clearSave, getActiveSlotId, getSaveFormatIssue, getSaveSlots, resetSaveData, getSoundEnabled, getThemePreference, loadSave, saveCharacter, setActiveSlotId, setSoundEnabled, setThemePreference } from './lib/storage';
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
  let saveFormatIssue = $state<string | null>(null);
  let soundEnabled = $state(true);
  let selectedTheme = $state<GameTheme>('amoled');
  let slotToDelete = $state<SaveSlotId | null>(null);
  let pendingSlotId = $state<SaveSlotId | null>(null);
  let pendingAchievementEligible = $state(false);
  let debugCopying = $state(false);
  let advanceReviewOpen = $state(false);
  let eventDialogOpen = $state(false);
  let weeklyFinanceOpen = $state(false);
  const weeklyReview = $derived(character ? getWeeklyActivityReview(character) : null);
  const CHARACTER_STAT_KEYS = new Set(['health', 'happiness', 'intelligence', 'fitness', 'stress', 'focus', 'confidence', 'comfort', 'discipline', 'creativity', 'socialSkills']);
  function groupReviewedActivities(items: WeeklyActivityReviewItem[]): WeeklyActivityReviewItem[] {
    const purchases = items.filter((item) => item.seal === 'BOUGHT' && item.moneyCost > 0);
    if (purchases.length < 2) return items;
    const sourceIds = purchases.map((item) => item.id);
    const effectMap = new Map<string, WeeklyActivityOutcomeEffect>();
    for (const item of purchases) {
      for (const effect of item.effects) {
        const prior = effectMap.get(effect.key);
        const delta = (prior?.delta ?? 0) + effect.delta;
        const inverse = effect.key === 'stress' || effect.key.endsWith('-tension');
        effectMap.set(effect.key, {
          ...effect,
          delta,
          tone: effect.kind === 'money' ? delta > 0 ? 'success' : 'danger' : (inverse ? delta < 0 : delta > 0) ? 'success' : 'danger'
        });
      }
    }
    const grouped: WeeklyActivityReviewItem = {
      ...purchases[0],
      id: 'food-purchases',
      sourceIds,
      title: 'Food purchases',
      staminaCost: purchases.reduce((total, item) => total + item.staminaCost, 0),
      staminaRecovery: purchases.reduce((total, item) => total + item.staminaRecovery, 0),
      moneyCost: purchases.reduce((total, item) => total + item.moneyCost, 0),
      effects: [...effectMap.values()].filter((effect) => effect.delta !== 0),
      items: purchases.flatMap((item) => item.items),
      itemCount: purchases.reduce((total, item) => total + item.itemCount, 0)
    };
    const rows: WeeklyActivityReviewItem[] = [];
    let inserted = false;
    for (const item of items) {
      if (sourceIds.includes(item.id)) {
        if (!inserted) { rows.push(grouped); inserted = true; }
      } else rows.push(item);
    }
    return rows;
  }
  const weeklyReviewActivities = $derived(weeklyReview ? groupReviewedActivities(weeklyReview.activities) : []);
  const plannedEventChoiceIds = $derived((character?.weeklyPlan?.activities ?? []).flatMap((item) => item.action?.kind === 'event' ? [item.action.choiceId] : []));
  onMount(() => {
    saveFormatIssue = getSaveFormatIssue();
    slots = getSaveSlots();
    activeSlotId = getActiveSlotId();
    character = loadSave(activeSlotId);
    eventDialogOpen = !!character?.pendingGameEvent;
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
  function persist(next: Character) {
    const previousEventId = character?.pendingGameEvent?.id ?? null;
    character = next;
    if (!next.pendingGameEvent) eventDialogOpen = false;
    else if (next.pendingGameEvent.id !== previousEventId) eventDialogOpen = true;
    saveCharacter(next, activeSlotId);
    slots = getSaveSlots();
  }
  function startLife(nextCharacter: Character) {
    if (saveFormatIssue) { notify('Reset the unsupported old saves before starting a new life.'); return; }
    activeSlotId = pendingSlotId ?? activeSlotId; setActiveSlotId(activeSlotId);
    try {
      persist({ ...nextCharacter, achievementEligible: pendingAchievementEligible });
      activeTab = 'home'; notify('Life saved.'); playSound('start');
    } catch { notify('The save could not be written. Check available device storage and try again.'); }
  }
  function resetUnsupportedSaves() {
    if (!saveFormatIssue || !window.confirm('Discard the unsupported old save data on this device and start with empty slots? This cannot be undone.')) return;
    resetSaveData(); saveFormatIssue = null; slots = getSaveSlots(); activeSlotId = 'slot-1'; setActiveSlotId('slot-1');
    notify('Old saves cleared. You can start a new life.');
  }
  function openCreation(slotId: SaveSlotId, achievementEligible: boolean) {
    if (slots.find((slot) => slot.id === slotId)?.character) { notify('Delete or switch that save slot before starting another life.'); return; }
    pendingSlotId = slotId;
    pendingAchievementEligible = achievementEligible;
    activeTab = 'create';
  }
  function continueLife() {
    const available = slots.filter((slot) => slot.character).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    if (!available.length) return;
    loadSlot(available.find((slot) => slot.id === activeSlotId && slot.character) ?? available[0]);
  }
  function startNewLife() {
    if (saveFormatIssue) { notify('Reset the unsupported old saves before starting a new life.'); return; }
    const empty = slots.find((slot) => !slot.character);
    if (!empty) { notify('All save slots are full. Delete a slot before starting another life.'); activeTab = 'settings'; return; }
    openCreation(empty.id, true);
  }
  function openPresetLife() {
    if (saveFormatIssue) { notify('Reset the unsupported old saves before starting a new life.'); return; }
    const empty = slots.find((slot) => !slot.character);
    if (!empty) { notify('All save slots are full. Delete a slot before starting another life.'); activeTab = 'settings'; return; }
    pendingSlotId = empty.id;
    pendingAchievementEligible = false;
    activeTab = 'presets';
  }
  function openCustomLife() {
    if (saveFormatIssue) { notify('Reset the unsupported old saves before starting a new life.'); return; }
    const empty = slots.find((slot) => !slot.character);
    if (!empty) { notify('All save slots are full. Delete a slot before starting another life.'); activeTab = 'settings'; return; }
    pendingSlotId = empty.id;
    pendingAchievementEligible = false;
    activeTab = 'custom';
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
    eventDialogOpen = !!slot.character.pendingGameEvent;
    activeTab = 'home'; notify('Save loaded.');
  }
  function deleteSlot(slotId: SaveSlotId) {
    clearSave(slotId); slots = getSaveSlots(); slotToDelete = null;
    if (slotId === activeSlotId) { character = null; eventDialogOpen = false; }
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
  function openPendingEventDialog() { if (character?.pendingGameEvent) eventDialogOpen = true; }
  function eventChoicePlanned(choiceId: string) {
    return (character?.weeklyPlan?.activities ?? []).find((item) => item.action?.kind === 'event' && item.action.choiceId === choiceId);
  }
  function chooseLifeEvent(choiceId: string) {
    if (!character) return;
    const existing = eventChoicePlanned(choiceId);
    if (existing) { persist(removePlannedActivity(character, existing.id)); notify('Decision removed from this week.'); return; }
    const planned = planEventChoiceInNextFreeTime(character, choiceId);
    if (planned.issue) { notify(planned.message ?? 'That decision could not be added.'); return; }
    const immediate = character.pendingGameEvent?.choices.find((choice) => choice.id === choiceId)?.staminaCost === 0;
    persist(planned.character); playSound('action');
    notify(immediate ? 'Decision recorded.' : 'Decision added to this week.');
  }
  function openAdvanceReview() { if (!character) return; activeTab = 'home'; advanceReviewOpen = true; }
  function closeAdvanceReview() { advanceReviewOpen = false; }
  function removeReviewedActivity(activityId: string) {
    if (!character) return;
    const planned = character.weeklyPlan?.activities.find((item) => item.id === activityId);
    if (!planned) return;
    persist(removePlannedActivity(character, activityId));
    notify('Activity removed from this week. Forecast updated.');
  }
  function removeReviewedActivityGroup(activityIds: string[]) {
    if (!character || !activityIds.length) return;
    const next = activityIds.reduce((current, id) => removePlannedActivity(current, id), character);
    if (next === character) return;
    persist(next);
    notify('Food purchases removed from this week. Forecast updated.');
  }
  function advanceWeekNow() {
    if (!character) return;
    const result = advanceWeek(character);
    if (result.issue) { notify(result.issue === 'insufficient-stamina' ? 'Your plan exceeds the available stamina. Add recovery or remove activities.' : result.issue === 'invalid-plan' ? 'The weekly plan is invalid and needs attention before advancing.' : result.issue === 'already-resolved' ? 'This week has already been resolved.' : 'A planned action is no longer available. Remove it before advancing.'); return; }
    const crossedYear = result.character.year > character.year;
    persist(result.character); advanceReviewOpen = false;
    notify(crossedYear ? 'Week completed. A new year begins.' : 'Week completed. The next week begins.');
    playSound(crossedYear ? 'year' : 'action');
  }
  function restart() {
    const keepAchievementEligibility = character?.achievementEligible === true;
    clearSave(activeSlotId); slots = getSaveSlots(); character = null; eventDialogOpen = false;
    showRestartConfirm = false; activeTab = 'create'; notify('The active save was reset.');
    pendingSlotId = activeSlotId; pendingAchievementEligible = keepAchievementEligibility;
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
    {#if saveFormatIssue}
      <section class="game-event-panel save-format-notice">
        <div class="eyebrow">SAVE FORMAT UPDATE</div>
        <h2>Start with a fresh save</h2>
        <p>{saveFormatIssue}</p>
        <button class="primary-button" onclick={resetUnsupportedSaves}>Discard old saves and start fresh</button>
      </section>
    {/if}
    <MainMenu {slots} onContinue={continueLife} onNewGame={startNewLife} onPresets={openPresetLife} onFullCustom={openCustomLife} onAchievements={() => activeTab='achievements'} onSettings={() => activeTab='settings'} onExit={exitGame} />
  {:else}
    <main class="main-layout" class:main-layout-no-sidebar={!character && ['create','custom','presets'].includes(activeTab)}>
      {#if character}
      <aside class="side-nav"><div class="side-caption">YOUR WORLD</div>
        {#each [{id:'home',label:'Overview',icon:'⌂'},{id:'education',label:'Education',icon:'▤'},...(character.age >= 16 ? [{id:'work',label:'Work',icon:'▣'},{id:'finances',label:'Finance',icon:'◈'}] : []),{id:'life',label:'Life',icon:'✳'},{id:'profile',label:'Profile',icon:'◉'}] as item}
          <button class:active={activeTab===item.id} class="nav-item" onclick={() => navigateTab(item.id)}><span class="nav-icon">{item.icon}</span>{item.label}</button>
        {/each}
        {#if character}<div class="side-profile"><div class="avatar">{character.name.slice(0,1).toUpperCase()}</div><div><strong>Active save</strong><small>Slot {activeSlotId.slice(-1)}</small></div></div>{/if}
      </aside>
      {/if}
      <section class="content">
        {#if activeTab==='create'}
          <CharacterCreation onStart={startLife} onCancel={() => activeTab='menu'} />
        {:else if activeTab==='presets'}
          <Presets onStart={startLife} onCancel={() => activeTab='menu'} />
        {:else if activeTab==='custom'}
          <CustomCharacterCreation slotLabel={pendingSlotId ?? activeSlotId} onStart={startLife} onCancel={() => activeTab='menu'} />
        {:else if activeTab==='achievements'}
          <div class="page-heading"><div><div class="eyebrow">MILESTONES & PROGRESS</div><h1>Achievements</h1><p>Milestones earned across the lives saved on this device.</p></div></div>
          {@const allLives = slots.flatMap((slot) => slot.character?.achievementEligible === true ? [slot.character] : [])}
          <div class="achievement-grid">
            {#each [{title:'First Chapter',detail:'Start your first life.',done:allLives.length>0,mark:'✦'},{title:'Growing Up',detail:'Reach adulthood.',done:allLives.some((life)=>life.age>=18),mark:'⌁'},{title:'A Long Journey',detail:'Reach age 65.',done:allLives.some((life)=>life.age>=65),mark:'◇'},{title:'A Life Well Lived',detail:'Reach age 90.',done:allLives.some((life)=>life.age>=90),mark:'★'}] as achievement}
              <article class:achievement-unlocked={achievement.done} class="achievement-card"><div class="achievement-mark">{achievement.mark}</div><div><strong>{achievement.title}</strong><p>{achievement.detail}</p><small>{achievement.done ? 'UNLOCKED' : 'LOCKED'}</small></div></article>
            {/each}
          </div>
          <button class="text-button" onclick={() => activeTab='menu'}>← Back to main menu</button>
        {:else if activeTab==='profile' || activeTab==='settings'}
          <div class="page-heading"><div><div class="eyebrow">{character ? 'CHARACTER & GAME MANAGEMENT' : 'PREFERENCES & CONTROLS'}</div><h1>{#if character}Your <em>profile</em>{:else}Game <em>settings</em>{/if}</h1><p>{character ? 'Character details and saved-life controls.' : 'Adjust how the game appears and manage your saved story.'}</p></div></div>
          {#if !character}<button class="text-button" onclick={() => activeTab='menu'}>← Back to main menu</button>{/if}
          {#if character}
            <section class="settings-section profile-character-section">
              <div class="settings-section-heading"><span class="section-index">01</span><div><h2>Character</h2></div></div>
              <div class="character-profile-card">
                <div class="character-avatar" aria-hidden="true">{character.name.trim().split(/\\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
                <div class="character-profile-copy"><div class="character-profile-heading"><h3>{character.name}</h3><span class="character-age">AGE {character.age}</span></div><p>{getLifeStage(character.age).label} · {character.country ?? character.nationality ?? 'Country not recorded'}</p><div class="character-profile-tags"><UiBadge>{character.gender ?? 'Gender not recorded'}</UiBadge><UiBadge>{character.nationality ?? 'Nationality not recorded'}</UiBadge></div></div>
              </div>
              <div class="overview-context profile-detail-grid">
                <UiCard as="div" density="compact" surface="raised" radius="md" class="overview-context-item"><span>BIRTHPLACE</span><strong>{character.birthplace ?? 'Not recorded'}</strong></UiCard>
                <UiCard as="div" density="compact" surface="raised" radius="md" class="overview-context-item"><span>LANGUAGE</span><strong>{character.language ?? 'Not recorded'}</strong></UiCard>
                <UiCard as="div" density="compact" surface="raised" radius="md" class="overview-context-item"><span>PERSONALITY</span><strong>{character.personality?.join(' · ') ?? 'Not recorded'}</strong></UiCard>
                <UiCard as="div" density="compact" surface="raised" radius="md" class="overview-context-item"><span>UPBRINGING</span><strong>{character.familyBackground ?? 'Not recorded'}</strong></UiCard>
              </div>
              {#if character.appearance}
                <div class="overview-context profile-detail-grid">
                  <UiCard as="div" density="compact" surface="raised" radius="md" class="overview-context-item"><span>HEIGHT</span><strong>{character.appearance.height}</strong></UiCard>
                  <UiCard as="div" density="compact" surface="raised" radius="md" class="overview-context-item"><span>BUILD</span><strong>{character.appearance.build}</strong></UiCard>
                  <UiCard as="div" density="compact" surface="raised" radius="md" class="overview-context-item"><span>HAIR</span><strong>{character.appearance.hair}</strong></UiCard>
                  <UiCard as="div" density="compact" surface="raised" radius="md" class="overview-context-item"><span>EYES</span><strong>{character.appearance.eyes}</strong></UiCard>
                </div>
              {/if}
            </section>
            <section class="settings-section profile-attributes-section">
              <div class="settings-section-heading"><span class="section-index">02</span><div><h2>Attributes</h2></div></div>
              <div class="character-stats-grid">
                {#each [{label:'Health',value:character.health},{label:'Happiness',value:character.happiness},{label:'Fitness',value:character.fitness},{label:'Intelligence',value:character.intelligence}] as stat}
                  <div class="character-stat"><div class="character-stat-ring" style={`--stat-value: ${Math.max(0, Math.min(100, stat.value))}%`}><strong>{Math.round(stat.value)}</strong></div><span>{stat.label}</span></div>
                {/each}
              </div>
              <details class="profile-more-attributes">
                <summary><span>More attributes</span><small>7 additional</small></summary>
                <div class="character-stats-grid">
                  {#each [{label:'Stamina',value:character.stamina ?? 50},{label:'Focus',value:character.focus ?? 50},{label:'Discipline',value:character.discipline ?? 50},{label:'Confidence',value:character.confidence ?? 50},{label:'Creativity',value:character.creativity ?? 50},{label:'Social skills',value:character.socialSkills ?? 50},{label:'Stress',value:character.stress ?? 0}] as stat}
                    <div class="character-stat"><div class="character-stat-ring" class:stress-stat={stat.label === 'Stress'} style={`--stat-value: ${Math.max(0, Math.min(100, stat.value))}%`}><strong>{Math.round(stat.value)}</strong></div><span>{stat.label}</span>{#if stat.label === 'Stress'}<small>Higher is worse</small>{/if}</div>
                  {/each}
                </div>
              </details>
            </section>
          {/if}
          <details class="profile-settings-group">
            <summary><span><strong>Appearance</strong><small>Choose the visual theme used throughout the game.</small></span><i aria-hidden="true"></i></summary>
          <UiCard as="section" class="settings-section appearance-settings" padded={false}>
            <div class="theme-option-grid" role="group" aria-label="Game theme">
              <ThemeOption theme="amoled" title="AMOLED" description="Pure black and emerald" selected={selectedTheme === 'amoled'} onSelect={chooseTheme} />
              <ThemeOption theme="midnight" title="Midnight" description="Deep navy and blue" selected={selectedTheme === 'midnight'} onSelect={chooseTheme} />
              <ThemeOption theme="graphite" title="Graphite" description="Soft charcoal and violet" selected={selectedTheme === 'graphite'} onSelect={chooseTheme} />
              <ThemeOption theme="paper" title="Paper" description="Warm light and forest green" selected={selectedTheme === 'paper'} onSelect={chooseTheme} />
              <ThemeOption theme="ocean" title="Ocean" description="Deep blue with cool aqua accents" selected={selectedTheme === 'ocean'} onSelect={chooseTheme} />
              <ThemeOption theme="forest" title="Forest" description="Evergreen surfaces and soft green" selected={selectedTheme === 'forest'} onSelect={chooseTheme} />
              <ThemeOption theme="lavender" title="Lavender" description="Dark plum with gentle violet" selected={selectedTheme === 'lavender'} onSelect={chooseTheme} />
              <ThemeOption theme="sunset" title="Sunset" description="Warm charcoal with amber highlights" selected={selectedTheme === 'sunset'} onSelect={chooseTheme} />
              <ThemeOption theme="rose" title="Rose" description="Deep berry with soft pink accents" selected={selectedTheme === 'rose'} onSelect={chooseTheme} />
              <ThemeOption theme="techno" title="Techno" description="Neon cyan with electric blue" selected={selectedTheme === 'techno'} onSelect={chooseTheme} />
              <ThemeOption theme="aurora" title="Aurora" description="Atmospheric violet with mint light" selected={selectedTheme === 'aurora'} onSelect={chooseTheme} />
              <ThemeOption theme="cyberpunk" title="Cyberpunk" description="Neon magenta, cyan and electric grid" selected={selectedTheme === 'cyberpunk'} onSelect={chooseTheme} />
              <ThemeOption theme="obsidian" title="Obsidian" description="Black glass with brushed gold accents" selected={selectedTheme === 'obsidian'} onSelect={chooseTheme} />
              <ThemeOption theme="abyss" title="Abyss" description="Deep ocean blue with underwater light" selected={selectedTheme === 'abyss'} onSelect={chooseTheme} />
              <ThemeOption theme="verdant" title="Verdant" description="Lush emerald with organic textures" selected={selectedTheme === 'verdant'} onSelect={chooseTheme} />
              <ThemeOption theme="crimson" title="Crimson" description="Dramatic burgundy with flowing red accents" selected={selectedTheme === 'crimson'} onSelect={chooseTheme} />
              <ThemeOption theme="solstice" title="Solstice" description="Warm dusk with amber and sunset gradients" selected={selectedTheme === 'solstice'} onSelect={chooseTheme} />
            </div>
            <div class="setting-note">Theme changes affect the interface only. Your characters, saves and game progress are unchanged.</div>
          </UiCard>
          </details>
          <details class="profile-settings-group">
            <summary><span><strong>Sound</strong><small>Control the audio cues used for game actions.</small></span><i aria-hidden="true"></i></summary>
          <section class="settings-section">
            <div class="setting-row"><div><strong>Sound effects</strong><p>Subtle original tones for actions, starting a life and advancing a week. No background music.</p></div><button class:setting-enabled={soundEnabled} class="setting-toggle" role="switch" aria-checked={soundEnabled} onclick={() => toggleSounds(!soundEnabled)}><span></span><small>{soundEnabled ? 'ON' : 'OFF'}</small></button></div>
          </section>
          </details>
          <details class="profile-settings-group">
            <summary><span><strong>Save slots</strong><small>Manage up to three separate lives on this device.</small></span><i aria-hidden="true"></i></summary>
          <section class="settings-section">
            <div class="save-slot-list">{#each slots as slot, index}<div class="save-slot-row"><div class="save-slot-meta"><strong>Slot {index + 1}</strong>{#if slot.character}<span>{slot.character.name} · Age {slot.character.age} · {formatCharacterMoney(slot.character)}</span><small>{slot.id === activeSlotId ? 'CURRENT SLOT' : 'SAVED LIFE'}</small>{:else}<span class="empty-slot-label">Empty slot</span>{/if}</div><div class="save-slot-actions">{#if slot.character}<button class="secondary-button" onclick={() => loadSlot(slot)} disabled={slot.id===activeSlotId}>Load</button><button class="danger-button" onclick={() => slotToDelete=slot.id}>Delete</button>{:else}<button class="secondary-button" onclick={() => openCreation(slot.id, false)}>New life</button>{/if}</div></div>{/each}</div>
            <div class="setting-note">Saves stay in this browser or app on this device. Clearing app data or browser storage can remove them. Cloud backup is not available yet.</div>
          </section>
          </details>
          <details class="profile-settings-group">
            <summary><span><strong>Game log & debug</strong><small>Review gameplay records or copy a simulation snapshot.</small></span><i aria-hidden="true"></i></summary>
          <section class="settings-section">
            {#if character}
              <div class="debug-export-row"><div><strong>Gameplay snapshot</strong><p>Includes the character, current stats, finances, save slot and complete life history. It excludes device identifiers and browser data.</p></div><button class="secondary-button" onclick={copyDebugSnapshot} disabled={debugCopying}>{debugCopying ? 'Copying…' : 'Copy snapshot'}</button></div>
              <div class="settings-log-list">{#each character.history.slice(0,6) as item}<div class="settings-log-item"><span class="timeline-dot {item.kind}"></span><div><strong>{item.title}</strong><p>{item.description}</p><small>AGE {item.age} · {item.year}</small></div></div>{/each}</div>
              <button class="text-button settings-log-link" onclick={() => navigateTab('life')}>Open Life workspace →</button>
            {:else}
              <p class="settings-empty-log">The game log will appear here after a life is started.</p>
            {/if}
          </section>
          </details>
          <details class="profile-settings-group">
            <summary><span><strong>Display</strong><small>Choose how the game uses your screen.</small></span><i aria-hidden="true"></i></summary>
          <section class="settings-section">
            <div class="setting-row"><div><strong>Immersive fullscreen</strong><p>Hide the status and navigation bars for a distraction-free view. Swipe from an edge to reveal system controls.</p></div><button class:setting-enabled={fullscreen} class="setting-toggle" role="switch" aria-checked={fullscreen} onclick={toggleFullscreen}><span></span><small>{fullscreen ? 'ON' : 'OFF'}</small></button></div>
            <div class="setting-note">Fullscreen can place content behind the camera cutout on some devices. Turn it off to keep the game inside the safe screen area.</div>
          </section>
          </details>
          <details class="profile-settings-group">
            <summary><span><strong>Game controls</strong><small>Reload the game or check for the latest published version.</small></span><i aria-hidden="true"></i></summary>
          <section class="settings-section">
            <div class="setting-action-row"><div><strong>Reload game</strong><p>Refresh the current page without changing your saved life.</p></div><button class="secondary-button" onclick={() => window.location.reload()}>Reload</button></div>
            <div class="setting-action-row"><div><strong>Check for updates</strong><p>Fetch the latest published game files and restart the game view. Your save is preserved.</p></div><button class="secondary-button" onclick={reloadLatest}>Check now</button></div>
          </section>
          </details>
          <details class="profile-settings-group">
            <summary><span><strong>Saved game</strong><small>Restart the current life by deleting its active save.</small></span><i aria-hidden="true"></i></summary>
          <section class="settings-section danger-section">
            <div class="setting-action-row"><div><strong>Restart current life</strong><p>Delete only the active save slot and create a new life in that slot.</p></div><button class="danger-button" onclick={() => showRestartConfirm=true} disabled={!character}>Restart</button></div>
          </section>
          </details>
          <div class="settings-version">MY LIFE SIMULATOR <span>·</span> EARLY PLAYABLE</div>
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
              <div class="weekly-finance-dialog" role="dialog" aria-modal="true" aria-labelledby="weekly-finance-title">
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
              </div>
            </div>
          {/if}
          <section class="character-profile-card" aria-label="Character profile">
            <div class="character-avatar" aria-hidden="true">{character.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
            <div class="character-profile-copy">
              <div class="character-profile-heading"><h2>{character.name}</h2><span class="character-age">AGE {character.age}</span></div>
              <p>{character.gender ?? 'Gender not recorded'} <span>·</span> {character.country ?? character.nationality ?? 'Country not recorded'}</p>
              <div class="character-profile-tags"><UiBadge>{character.employment?.title ?? 'Not employed'}</UiBadge><UiBadge>{character.educationEnrollment?.institution ?? (character.educationLevel ? character.educationLevel.replaceAll('-', ' ') : getEducationStage(character.age))}</UiBadge></div>
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
            <button class="pending-event-trigger" type="button" onclick={openPendingEventDialog}>
              <span class="pending-event-indicator">SITUATION</span>
              <span class="pending-event-copy"><strong>{character.pendingGameEvent.title}</strong><small>{character.pendingGameEvent.category} · Awaiting your decision</small></span>
              <span class="pending-event-arrow" aria-hidden="true">→</span>
            </button>
          {/if}
          {#if advanceReviewOpen && weeklyReview}
            <div class="modal-backdrop week-review-backdrop" role="presentation">
              <dialog open class="modal week-review-dialog" aria-modal="true" aria-labelledby="week-review-title">
                <button class="modal-close" onclick={closeAdvanceReview} aria-label="Close weekly review">×</button>
                <div class="eyebrow">WEEKLY SIMULATION · AGE {character.age}</div>
                <h2 id="week-review-title">Review this week</h2>
                <p class="game-event-description">{weeklyReview.weekStart} – {weeklyReview.weekEnd}. Review the effort and expected outcomes before resolving the week.</p>

                <section class="review-section">
                  <div class="review-section-heading"><h3>Weekly Stat Forecast</h3><span>Changes expected this week</span></div>
                  {#if weeklyReview.changes.filter((change) => CHARACTER_STAT_KEYS.has(change.key)).length}
                    <div class="review-change-grid">
                      {#each weeklyReview.changes.filter((change) => CHARACTER_STAT_KEYS.has(change.key)) as change}
                        <div class="review-change-row">
                          <div class="review-change-heading">
                            <span>{change.label}</span>
                            <strong class:positive={change.key === 'stress' ? change.delta < 0 : change.delta > 0} class:negative={change.key === 'stress' ? change.delta > 0 : change.delta < 0}>
                              {Number(change.before.toFixed(1))} → {Number(change.after.toFixed(1))}
                            </strong>
                          </div>
                          <UiProgress label={change.label} value={change.before} previewValue={change.after} previewTone={change.key === 'stress' ? change.delta < 0 ? 'success' : 'danger' : change.delta > 0 ? 'success' : 'danger'} tone={getValueTone(change.before, change.key === 'stress')} size="small" showLabel={false} />
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <p class="review-empty">No character stats are expected to change this week.</p>
                  {/if}
                  <div class="review-stamina-summary">
                    <div><span>Stamina</span><strong>{Math.round(weeklyReview.currentStamina)}% → {Math.round(weeklyReview.projectedStamina)}%</strong></div>
                    <div><span>Effort −{weeklyReview.staminaCost} · Recovery +{weeklyReview.staminaRecovery} · {weeklyReview.staminaDrift > 0 ? 'Natural +' + weeklyReview.staminaDrift : 'Workload −' + Math.abs(weeklyReview.staminaDrift)}</span><div class="review-stamina-track"><span style="width:{weeklyReview.projectedStamina}%"></span></div></div>
                  </div>
                  {#if Math.min(100, weeklyReview.currentStamina + weeklyReview.staminaRecovery) < weeklyReview.staminaCost}<p class="year-review-warning">The plan exceeds your stamina budget. Select recovery activities or remove demanding activities before resolving.</p>{/if}
                  <div class="review-cash-row"><span>Projected cash after weekly resolution</span><strong>{formatCharacterMoney(character, weeklyReview.projectedCash)}</strong></div>
                </section>

                <section class="review-section">
                  <details class="review-planned-details">
                    <summary class="review-planned-summary">
                      <span class="review-planned-heading"><strong>Activities</strong><small>{weeklyReview.activities.length + weeklyReview.passiveActivities.length} total · {weeklyReview.activities.length} planned · {weeklyReview.passiveActivities.length} automatic</small></span>
                      <span class="review-planned-totals"><span>{weeklyReview.staminaCost} stamina</span><strong>{formatCharacterMoney(character, weeklyReview.totalMoneyCost)}</strong><i aria-hidden="true"></i></span>
                    </summary>
                    {#if weeklyReview.activities.length || weeklyReview.passiveActivities.length}
                      <div class="review-activity-list">
                        {#each weeklyReviewActivities as activity (activity.id)}
                          <article class="review-activity-row">
                            <div class="review-activity-copy">
                              <div class="review-activity-heading"><strong>{activity.title}</strong><UiBadge tone="accent" size="tiny">PLANNED</UiBadge>{#if activity.seal}<UiBadge size="tiny">{activity.seal}</UiBadge>{/if}</div>
                              <ActivityEffectBadges effects={activity.effects} staminaCost={activity.staminaCost} staminaRecovery={activity.staminaRecovery} moneyCost={activity.moneyCost} formatMoney={(amount) => formatCharacterMoney(character!, amount)} />
                              {#if activity.itemCount > 0}<UiBadge size="tiny">{activity.itemCount} {activity.itemCount === 1 ? 'item' : 'items'}</UiBadge>{/if}
                              {#if activity.sourceIds && activity.items.length > 0}
                                <details class="review-item-details"><summary>View items</summary><ul>{#each activity.items as item, index}<li>{item.name}{item.quantity > 1 ? ' × ' + item.quantity : ''}</li>{/each}</ul></details>
                              {/if}
                              {#if activity.effects.length === 0 && activity.staminaCost === 0 && activity.staminaRecovery === 0 && activity.moneyCost === 0}<UiBadge size="tiny">No tracked stat change</UiBadge>{/if}
                            </div>
                            <button class="review-remove-button" type="button" aria-label={'Remove ' + activity.title + ' from this week'} title="Remove from this week" onclick={() => activity.sourceIds ? removeReviewedActivityGroup(activity.sourceIds) : removeReviewedActivity(activity.id)}>×</button>
                          </article>
                        {/each}
                        {#each weeklyReview.passiveActivities as activity (activity.id)}
                          <article class="review-activity-row review-passive-row">
                            <div class="review-activity-copy">
                              <div class="review-activity-heading"><strong>{activity.title}</strong><UiBadge size="tiny">AUTOMATIC</UiBadge></div>
                              <ActivityEffectBadges effects={activity.effects} staminaRecovery={activity.staminaRecovery} />
                            </div>
                          </article>
                        {/each}
                      </div>
                    {:else}
                      <p class="review-empty">No planned or automatic activities are currently contributing this week.</p>
                    {/if}
                  </details>
                </section>

                {#if weeklyReview.warnings.length}
                  <section class="review-warning-list" aria-label="Weekly risks">
                    {#each weeklyReview.warnings as warning}<p>{warning}</p>{/each}
                  </section>
                {/if}
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
          <EducationWorkspace {character} projectedCharacter={weeklyReview?.projectedCharacter ?? character} onChange={persist} onNotify={notify} />
                {:else if character && activeTab==='work' && character.age >= 16}
          <WorkWorkspace {character} projectedCharacter={weeklyReview?.projectedCharacter ?? character} onChange={persist} onNotify={notify} />

        {:else if character && activeTab==='life'}
          <LifeWorkspace {character} projectedCharacter={weeklyReview?.projectedCharacter ?? character} onChange={persist} onNotify={notify} />
        {:else if character && activeTab==='finances'}
          <FinanceWorkspace {character} projectedCharacter={weeklyReview?.projectedCharacter ?? character} onChange={persist} />
        {/if}
      </section>
    </main>
  {/if}
  {#if character && activeTab !== 'settings' && activeTab !== 'profile'}
    <button class="advance-fab" onclick={openAdvanceReview} aria-label="Advance" title="Advance">
      <span class="fab-arrow" aria-hidden="true">→</span><span class="fab-label">Advance</span>
    </button>
  {/if}
  {#if character?.pendingGameEvent && eventDialogOpen}
    <GameplayDialog
      event={character.pendingGameEvent}
      age={character.age}
      money={character.money}
      formatMoney={(amount) => formatCharacterMoney(character!, amount)}
      plannedChoiceIds={plannedEventChoiceIds}
      onToggleChoice={chooseLifeEvent}
      onClose={() => eventDialogOpen = false}
    />
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

<style lang="scss">
  .pending-event-trigger{width:100%;display:flex;align-items:center;gap:12px;margin:0 0 15px;padding:13px 14px;border:1px solid var(--line-strong);border-radius:12px;background:linear-gradient(110deg,color-mix(in srgb,var(--accent) 9%,var(--surface)),var(--surface));color:var(--text);text-align:left;cursor:pointer;min-height:64px}
  .pending-event-trigger:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
  .pending-event-indicator{flex:none;padding:6px 7px;border-radius:6px;background:var(--accent-soft);color:var(--accent);font-size:8px;font-weight:850;letter-spacing:.8px}
  .pending-event-copy{display:grid;gap:4px;min-width:0;flex:1}
  .pending-event-copy strong{font-size:12px;line-height:1.35}
  .pending-event-copy small{font-size:9px;color:var(--muted);text-transform:capitalize}
  .pending-event-arrow{font-size:20px;color:var(--accent)}
  .week-review-backdrop{z-index:1000;align-items:center;justify-content:center;padding:16px;overflow-y:auto}
  .week-review-dialog{position:relative;margin:0;inset:auto;width:min(680px,100%);max-width:none;max-height:min(90dvh,900px);overflow:auto;display:grid;gap:9px;padding:14px}
  .week-review-dialog h2{margin:0;font-size:clamp(22px,4vw,28px);letter-spacing:-.6px}
  .week-review-dialog .game-event-description{margin:0}
  .review-section{display:grid;gap:6px;padding-top:8px;border-top:1px solid var(--line)}
  .review-planned-details{min-width:0}
  .review-planned-summary{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:38px;cursor:pointer;list-style:none}
  .review-planned-summary::-webkit-details-marker{display:none}
  .review-planned-heading{display:grid;gap:3px;min-width:0}
  .review-planned-heading strong{font-size:13px;color:var(--text)}
  .review-planned-heading small{font-size:9px;color:var(--muted)}
  .review-planned-totals{display:flex;align-items:center;gap:10px;flex:none}
  .review-planned-totals>span{font-size:9px;color:var(--muted);white-space:nowrap}
  .review-planned-totals>strong{font-size:11px;color:var(--text);white-space:nowrap}
  .review-planned-totals i{width:8px;height:8px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg);transition:transform .18s;flex:none;margin:0 3px 4px}
  .review-planned-details[open] .review-planned-totals i{transform:rotate(225deg);margin-top:6px}
  .review-planned-details[open] .review-planned-summary{margin-bottom:8px}
  .review-section-heading{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
  .review-section-heading h3{margin:0;font-size:13px;color:var(--text)}
  .review-section-heading>span{font-size:9px;color:var(--muted);text-align:right}
  .review-activity-list{display:grid;gap:5px}
  .review-activity-row{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface)}
  .review-passive-row{opacity:.62;filter:saturate(.55);background:var(--surface-raised)}
  .review-passive-seal{justify-self:start;padding:3px 6px;border:1px solid var(--line);border-radius:5px;color:var(--muted);font-size:7px;font-weight:850;letter-spacing:.7px}
  .review-activity-row>div:first-child{display:grid;gap:3px;min-width:0}
  .review-activity-copy{flex:1;min-width:0}
  .review-bought-seal{justify-self:start;padding:3px 6px;border:1px solid color-mix(in srgb,var(--accent) 48%,transparent);border-radius:5px;background:var(--accent-soft);color:var(--accent);font-size:7px;font-weight:850;letter-spacing:.7px}
  .review-activity-row strong{font-size:11px;color:var(--text)}
  
  
  .review-remove-button{flex:none;align-self:center;border:1px solid color-mix(in srgb,var(--coral) 38%,var(--line));border-radius:7px;background:transparent;color:var(--coral);padding:6px 8px;font-size:9px;font-weight:750;cursor:pointer}
  .review-remove-button:hover{background:color-mix(in srgb,var(--coral) 10%,transparent);border-color:var(--coral)}
  .review-remove-button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  
  .review-item-details{font-size:9px;color:var(--muted)}
  .review-item-details summary{width:max-content;cursor:pointer;color:var(--accent);font-weight:700}
  .review-item-details ul{display:grid;gap:3px;margin:5px 0 0;padding-left:16px;line-height:1.4}
  .review-activity-heading{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;min-width:0}
  .review-stamina-summary{display:grid;gap:4px;margin-top:5px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface)}
  .review-stamina-summary>div:first-child{display:flex;justify-content:space-between;gap:8px;font-size:10px;color:var(--muted)}
  .review-stamina-summary strong{color:var(--text);font-variant-numeric:tabular-nums}
  .review-stamina-summary>div:last-child{display:grid;gap:5px;font-size:9px;color:var(--muted)}
  .review-remove-button{align-self:flex-start;width:27px;height:27px;padding:0;border-radius:8px;font-size:19px;line-height:1}
  
  
  
  
  .review-stamina-track{height:7px;overflow:hidden;border-radius:10px;background:var(--surface-raised)}
  .review-stamina-track span{display:block;height:100%;border-radius:inherit;background:var(--accent)}
  .review-change-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 10px}
  .review-change-row{display:grid;gap:3px;align-content:start;min-width:0;padding:4px 0;border-bottom:1px solid var(--line)}
  .review-change-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}
  .review-change-heading>span,.review-cash-row>span{font-size:10px;color:var(--muted)}
  .review-cash-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)}
  .review-change-row strong,.review-cash-row strong{font-size:11px;color:var(--text);font-variant-numeric:tabular-nums}
  .review-change-row strong.positive{color:var(--green)}
  .review-change-row strong.negative{color:var(--coral)}
  .game-event-choice.planned{border-color:var(--accent);background:var(--accent-soft)}
  .review-change-row strong small{font-size:9px;color:var(--muted);font-weight:500}
  .review-empty{margin:0;padding:10px;border-radius:9px;background:var(--surface);font-size:10px;line-height:1.5;color:var(--muted)}
  .review-warning-list{display:grid;gap:4px;padding:7px 8px;border:1px solid color-mix(in srgb,var(--amber) 45%,transparent);border-radius:10px;background:color-mix(in srgb,var(--amber) 8%,transparent)}
  .review-warning-list p{margin:0;font-size:10px;line-height:1.45;color:var(--text)}
  .week-review-dialog .year-review-note{margin:0}
  @media(max-width:480px){.week-review-dialog{padding:11px;gap:7px}.week-review-dialog h2{font-size:21px}.week-review-dialog .game-event-description{font-size:10px;line-height:1.35}.review-section{gap:5px;padding-top:7px}.review-activity-row{gap:6px;padding:5px 6px}.review-change-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:1px 8px}.review-change-heading{gap:4px}.review-change-heading>span{font-size:9px}.review-change-row strong{font-size:10px}.review-planned-summary{min-height:34px}.review-stamina-summary{margin-top:3px;padding:5px 7px}}
  .main-layout-no-sidebar{grid-template-columns:minmax(0,1fr)}
</style>
