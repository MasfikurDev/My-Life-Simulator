<script lang="ts">
import type { SaveSlot } from './lib/types';
type Props={slots:SaveSlot[];onContinue:()=>void;onNewGame:()=>void;onPresets:()=>void;onFullCustom:()=>void;onAchievements:()=>void;onSettings:()=>void;onExit:()=>void};
let {slots,onContinue,onNewGame,onPresets,onFullCustom,onAchievements,onSettings,onExit}:Props=$props();
let customOpen=$state(false);
const savedCount=$derived(slots.filter((slot)=>slot.character).length);
</script>
<section class="title-screen" aria-label="Main menu">
<div class="title-screen-art" aria-hidden="true"><div class="title-orbit orbit-a"></div><div class="title-orbit orbit-b"></div><div class="title-sun"></div><div class="title-horizon horizon-back"></div><div class="title-horizon horizon-front"></div><div class="title-art-label">EVERY CHOICE SHAPES A LIFE</div></div>
<div class="title-screen-content"><div class="title-kicker"><span></span>A LIFE SIMULATION</div><h1>MY LIFE<br/><em>SIMULATOR</em></h1><p class="title-subtitle">Your life. Your choices. Your story.</p>
<div class="title-menu-actions">
<button class="title-menu-button title-menu-primary" onclick={onContinue} disabled={savedCount===0}><span class="title-menu-icon">▶</span><span><strong>Continue</strong><small>{savedCount?savedCount+' saved '+(savedCount===1?'life':'lives')+' available':'No saved life yet'}</small></span><i>→</i></button>
<button class="title-menu-button" onclick={onNewGame}><span class="title-menu-icon">✦</span><span><strong>New Game</strong><small>Begin a new life with a generated character</small></span><i>→</i></button>
<div class="title-custom-wrap"><button class:menu-submenu-active={customOpen} class="title-menu-button" onclick={()=>customOpen=!customOpen} aria-expanded={customOpen}><span class="title-menu-icon">⚒</span><span><strong>Custom</strong><small>Choose a preset or build your own starting life</small></span><i>{customOpen?'−':'+'}</i></button>
{#if customOpen}<div class="title-submenu"><button onclick={onPresets}><span>01</span><span><strong>Presets</strong><small>Start from a ready-made life setup</small></span><i>→</i></button><button onclick={onFullCustom}><span>02</span><span><strong>Full Custom Starting</strong><small>Set identity, country and starting circumstances</small></span><i>→</i></button></div>{/if}</div>
<button class="title-menu-button title-menu-secondary" onclick={onAchievements}><span class="title-menu-icon">◇</span><span><strong>Achievements</strong><small>Milestones across your saved lives</small></span><i>→</i></button>
<button class="title-menu-button title-menu-secondary" onclick={onSettings}><span class="title-menu-icon">⚙</span><span><strong>Settings</strong><small>Game preferences and save management</small></span><i>→</i></button>
<button class="title-menu-button title-menu-exit" onclick={onExit}><span class="title-menu-icon">↗</span><span><strong>Exit</strong><small>Close the game</small></span><i>→</i></button>
</div><div class="title-screen-foot"><span>MY LIFE. MY STORY.</span><span>EARLY PLAYABLE</span></div></div></section>