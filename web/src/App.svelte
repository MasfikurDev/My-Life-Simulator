<script lang="ts">
  import { onMount } from 'svelte';
  import { advanceWeek, formatCharacterMoney, planEventChoiceInNextFreeTime } from './lib/simulation';
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
  import HealthWorkspace from './HealthWorkspace.svelte';
  import { clearSave, getActiveSlotId, getSaveSlots, getSoundEnabled, loadSave, saveCharacter, setActiveSlotId, setSoundEnabled } from './lib/storage';
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
  let slotToDelete = $state<SaveSlotId | null>(null);
  let pendingSlotId = $state<SaveSlotId | null>(null);
  let debugCopying = $state(false);
  let advanceReviewOpen = $state(false);
  let weeklyFinanceOpen = $state(false);
  onMount(() => {
    slots = getSaveSlots();
    activeSlotId = getActiveSlotId();
    character = loadSave(activeSlotId);
    activeTab = character ? 'home' : 'menu';
    soundEnabled = getSoundEnabled();
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
  function chooseLifeEvent(choiceId: string) {
    if (!character) return;
    const planned = planEventChoiceInNextFreeTime(character, choiceId);
    if (planned.issue) { notify(planned.message ?? 'That decision could not be scheduled.'); return; }
    const immediate = character.pendingGameEvent?.choices.find((choice) => choice.id === choiceId)?.timeBlocks === 0;
    persist(planned.character); playSound('action');
    const slot = planned.scheduledActivity;
    notify(immediate ? 'Decision recorded.' : slot ? 'Decision confirmed for ' + slot.date + ' (' + slot.startPeriod + ').' : 'Decision confirmed.');
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
    class:topbar-persistent={!!character && activeTab !== 'create' && activeTab !== 'settings'}
    aria-label="Game header"
  >
    <a class="brand" href="#home" aria-label="My Life Simulator home" onclick={() => activeTab=character ? 'home' : 'menu'}>
      <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="brand-name">My Life <span class="brand-light">Simulator</span></span>
    </a>
    {#if character && activeTab !== 'settings' && activeTab !== 'create'}
      <div class="topbar-right" aria-label="Current life status">
        <div class="topbar-life-identity">
          <span class="topbar-life-dot" aria-hidden="true"></span>
          <span class="topbar-life-name">{character.name}</span>
          <span class="topbar-life-stage">AGE {character.age} · {getLifeStage(character.age).label}</span>
        </div>
        <div class="topbar-metrics">
          <div><span>YEAR</span><strong>{character.year}</strong></div>
          <div><span>CASH</span><strong>{formatCharacterMoney(character)}</strong></div>
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
        {#each [{id:'home',label:'Overview',icon:'⌂'},{id:'education',label:'Education',icon:'▤'},{id:'health',label:'Health',icon:'♡'},...(character && character.age >= 16 ? [{id:'work',label:'Work',icon:'▣'}] : []),{id:'life',label:'Life',icon:'✳'},...(character && character.age >= 16 ? [{id:'finances',label:'Finances',icon:'◈'}] : []),{id:'settings',label:'Settings',icon:'⚙'}] as item}
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
          <div class="page-heading"><div><div class="eyebrow">MILESTONES & PROGRESS</div><h1>Achievements<em>.</em></h1><p>Milestones earned across the lives saved on this device.</p></div></div>
          {@const allLives = slots.flatMap((slot) => slot.character ? [slot.character] : [])}
          <div class="achievement-grid">
            {#each [{title:'First Chapter',detail:'Start your first life.',done:allLives.length>0,mark:'✦'},{title:'Growing Up',detail:'Reach adulthood.',done:allLives.some((life)=>life.age>=18),mark:'⌁'},{title:'A Long Journey',detail:'Reach age 65.',done:allLives.some((life)=>life.age>=65),mark:'◇'},{title:'A Life Well Lived',detail:'Reach age 90.',done:allLives.some((life)=>life.age>=90),mark:'★'}] as achievement}
              <article class:achievement-unlocked={achievement.done} class="achievement-card"><div class="achievement-mark">{achievement.mark}</div><div><strong>{achievement.title}</strong><p>{achievement.detail}</p><small>{achievement.done ? 'UNLOCKED' : 'LOCKED'}</small></div></article>
            {/each}
          </div>
          <button class="text-button" onclick={() => activeTab='menu'}>← Back to main menu</button>
        {:else if activeTab==='settings'}
          <div class="page-heading"><div><div class="eyebrow">PREFERENCES & CONTROLS</div><h1>Game <em>settings.</em></h1><p>Adjust how the game appears and manage your saved story.</p></div></div>
          {#if !character}<button class="text-button" onclick={() => activeTab='menu'}>← Back to main menu</button>{/if}
          <section class="settings-section">
            <div class="settings-section-heading"><span class="section-index">01</span><div><h3>Sound</h3><p>Control the small audio cues used for game actions.</p></div></div>
            <div class="setting-row"><div><strong>Sound effects</strong><p>Subtle original tones for actions, starting a life and advancing a week. No background music.</p></div><button class:setting-enabled={soundEnabled} class="setting-toggle" role="switch" aria-checked={soundEnabled} onclick={() => toggleSounds(!soundEnabled)}><span></span><small>{soundEnabled ? 'ON' : 'OFF'}</small></button></div>
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
              <button class="text-button settings-log-link" onclick={() => navigateTab('life')}>Open Life workspace →</button>
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
          <button class="weekly-finance-card" onclick={() => weeklyFinanceOpen = true} aria-haspopup="dialog">
            <span class="weekly-finance-heading"><span><small>THIS WEEK</small><strong>Weekly finances</strong></span><span class="weekly-finance-open">View breakdown ↗</span></span>
            <span class="weekly-finance-balance"><small>CURRENT BALANCE</small><strong>{formatCharacterMoney(character)}</strong></span>
            <span class="weekly-finance-flow">
              <span class="weekly-finance-in"><small>IN</small><strong>+{formatCharacterMoney(character, weeklyIncome)}</strong></span>
              <span class="weekly-finance-out"><small>OUT</small><strong>−{formatCharacterMoney(character, weeklyExpense)}</strong></span>
              <span class="weekly-finance-net"><small>NET THIS WEEK</small><strong>{weeklyIncome - weeklyExpense < 0 ? '−' : '+'}{formatCharacterMoney(character, Math.abs(weeklyIncome - weeklyExpense))}</strong></span>
            </span>
          </button>
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
                  <button class="game-event-choice" disabled={character.money < choice.moneyCost} onclick={() => chooseLifeEvent(choice.id)}>
                    <span class="game-event-choice-copy"><strong>{choice.label}</strong><small>{choice.detail}</small></span>
                    <span class="game-event-choice-cost">
                      {#if choice.timeBlocks > 0}<span>{choice.timeBlocks} time {choice.timeBlocks === 1 ? 'block' : 'blocks'}</span>{/if}
                      {#if choice.moneyCost > 0}<span>{formatCharacterMoney(character, choice.moneyCost)}</span>{/if}
                      {#if choice.timeBlocks === 0 && choice.moneyCost === 0}<span>No cost</span>{/if}
                    </span>
                  </button>
                {/each}
              </div>
              <p class="game-event-footnote">Time-consuming decisions are added to this week’s schedule and take effect when the week resolves. You can also leave the situation unanswered.</p>
            </section>
          {/if}
          {#if advanceReviewOpen}
            {@const plannedCount = character.weeklySchedule?.activities.length ?? 0}
            <section class="year-review-panel" aria-label="Week review">
              <div class="game-event-top"><span class="eyebrow">WEEK REVIEW · {character.calendar?.currentDate ?? character.year}</span><span class="game-event-status">BEFORE ADVANCING</span></div>
              <h2>Ready for the next week?</h2>
              <p class="game-event-description">Resolve {plannedCount} planned {plannedCount === 1 ? 'activity' : 'activities'} in order, apply their effects and costs once, then move the calendar forward by seven days. Your age changes only on your birthday.</p>
              <div class="year-review-grid">
                <div><span>Planned activities</span><strong>{plannedCount}</strong></div>
                <div><span>Current age</span><strong>{character.age}</strong></div>
                <div><span>Current year</span><strong>{character.year}</strong></div>
                <div><span>Available cash</span><strong>{formatCharacterMoney(character)}</strong></div>
              </div>
              {#if character.pendingGameEvent}
                <p class="year-review-warning">Unresolved situation: {character.pendingGameEvent.title}. It remains available for now but may expire at the year boundary if left unanswered.</p>
              {/if}
              <p class="year-review-note">Only accepted reservations are resolved. Conflicts must be fixed before the week can advance. Annual income, household costs, taxes and long-term financial settlements remain on their yearly boundary.</p>
              <div class="year-review-actions"><button class="secondary-button" onclick={closeAdvanceReview}>Back to this week</button><button class="primary-button" onclick={advanceWeekNow}>Resolve week and continue</button></div>
            </section>
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
              <p class="overview-empty-activities">Activities will appear here as you make choices and spend time.</p>
            {/if}
          </section>
        {:else if character && activeTab==='education'}
          <EducationWorkspace {character} onChange={persist} onNotify={notify} />
        {:else if character && activeTab==='health'}
          <HealthWorkspace {character} onChange={persist} onNotify={notify} />
        {:else if character && activeTab==='work' && character.age >= 16}
          <WorkWorkspace {character} onChange={persist} onNotify={notify} />

        {:else if character && activeTab==='life'}
          <LifeWorkspace {character} onChange={persist} />
        {:else if character && activeTab==='finances'}
          <FinanceWorkspace {character} onChange={persist} />
        {/if}
      </section>
    </main>
  {/if}
  {#if character && activeTab !== 'settings'}
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