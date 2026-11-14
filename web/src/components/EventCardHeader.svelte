<script lang="ts">
  let { active, category, title, description, age }: {
    active: boolean; category: string; title: string; description: string; age: number;
  } = $props();
  const categoryClass = $derived(category.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
  const categorySymbol = $derived.by(() => {
    const key = category.toLowerCase();
    if (key.includes('family') || key.includes('relationship') || key.includes('social')) return '♡';
    if (key.includes('health')) return '✚';
    if (key.includes('education') || key.includes('school')) return '◇';
    if (key.includes('finance') || key.includes('money')) return '⌁';
    if (key.includes('achievement')) return '★';
    if (key.includes('opportunity')) return '✦';
    return '✧';
  });
</script>

{#if active}
  <header class="event-card-header event-theme-{categoryClass}">
    <div class="event-art" aria-hidden="true">
      <span class="event-orb event-orb-one"></span><span class="event-orb event-orb-two"></span><span class="event-orb event-orb-three"></span>
      <span class="event-grid"></span><span class="event-rings"></span>
      <svg class="event-wave" viewBox="0 0 640 180" preserveAspectRatio="none">
        <path d="M-20 120 C90 35 150 175 270 92 S460 30 660 100" />
        <path d="M-20 145 C100 65 180 195 310 115 S500 55 660 125" />
      </svg>
      <span class="event-spark event-spark-one"></span><span class="event-spark event-spark-two"></span><span class="event-spark event-spark-three"></span>
    </div>
    <div class="event-header-main">
      <div class="event-category-icon" aria-hidden="true">{categorySymbol}</div>
      <div class="event-heading-copy">
        <div class="event-eyebrow">LIFE EVENT <span>·</span> AGE {age} <span>·</span> {category.toUpperCase()}</div>
        <h2>{title}</h2><p>{description}</p>
      </div>
      <span class="event-decision-label">DECISION</span>
    </div>
  </header>
{:else}
  <div class="game-event-top"><span class="eyebrow">THIS YEAR · {category.toUpperCase()}</span><span class="game-event-status">DECISION</span></div>
  <h2>{title}</h2><p class="game-event-description">{description}</p>
{/if}

<style>
  .event-card-header{--event-a:#7048c7;--event-b:#a044a5;--event-glow:rgba(220,190,255,.34);position:relative;isolation:isolate;overflow:hidden;min-height:132px;padding:18px 16px;color:#fff;background:linear-gradient(112deg,var(--event-a),var(--event-b))}
  .event-art,.event-header-main{position:relative;z-index:1}.event-art{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
  .event-orb{position:absolute;display:block;border-radius:50%;background:var(--event-glow);filter:blur(1px);mix-blend-mode:screen}
  .event-orb-one{width:170px;height:170px;right:8%;top:-112px;animation:event-drift-one 13s ease-in-out infinite alternate}
  .event-orb-two{width:112px;height:112px;right:28%;bottom:-75px;opacity:.72;animation:event-drift-two 17s ease-in-out infinite alternate}
  .event-orb-three{width:68px;height:68px;left:22%;top:52%;opacity:.45;animation:event-drift-one 19s ease-in-out infinite alternate-reverse}
  .event-grid{position:absolute;inset:-45%;opacity:.16;background-image:linear-gradient(30deg,transparent 48%,rgba(255,255,255,.35) 49%,transparent 50%),linear-gradient(120deg,transparent 48%,rgba(255,255,255,.22) 49%,transparent 50%);background-size:34px 34px;transform:rotate(-12deg);animation:event-grid-pan 32s linear infinite}
  .event-rings{position:absolute;width:230px;height:230px;right:-55px;top:-115px;border:1px solid rgba(255,255,255,.18);border-radius:50%;box-shadow:0 0 0 22px rgba(255,255,255,.035),0 0 0 46px rgba(255,255,255,.025);animation:event-ring-turn 40s linear infinite}
  .event-wave{position:absolute;inset:0;width:100%;height:100%;opacity:.25}.event-wave path{fill:none;stroke:rgba(255,255,255,.72);stroke-width:1.2;stroke-dasharray:8 10;animation:event-wave-flow 18s linear infinite}
  .event-wave path+path{opacity:.55;animation-duration:24s;animation-direction:reverse}
  .event-spark{position:absolute;width:4px;height:4px;border-radius:50%;background:#fff;box-shadow:0 0 10px 3px rgba(255,255,255,.45);animation:event-sparkle 3.5s ease-in-out infinite}
  .event-spark-one{left:48%;top:22%}.event-spark-two{right:16%;bottom:24%;animation-delay:1.2s}.event-spark-three{left:12%;bottom:18%;animation-delay:2.1s}
  .event-header-main{display:flex;align-items:center;gap:12px;min-width:0}
  .event-category-icon{width:54px;height:54px;flex:none;display:grid;place-items:center;border:1px solid rgba(255,255,255,.38);border-radius:15px;background:rgba(255,255,255,.14);font-size:27px;box-shadow:inset 0 1px rgba(255,255,255,.15)}
  .event-heading-copy{min-width:0;flex:1}.event-eyebrow{font-size:9px;font-weight:800;letter-spacing:1px;color:rgba(255,255,255,.78);line-height:1.4}.event-eyebrow span{padding:0 2px;opacity:.7}
  .event-heading-copy h2{margin:4px 0 3px;color:#fff;font-size:clamp(16px,2.2vw,20px);line-height:1.18;letter-spacing:-.35px;text-transform:none;overflow-wrap:anywhere}
  .event-heading-copy p{margin:0;color:rgba(255,255,255,.88);font-size:11px;line-height:1.45;max-width:58ch}
  .event-decision-label{align-self:flex-start;flex:none;padding:5px 7px;border:1px solid rgba(255,255,255,.32);border-radius:6px;background:rgba(20,10,40,.12);color:#fff;font-size:8px;font-weight:800;letter-spacing:.7px}
  .event-theme-personal,.event-theme-health{--event-a:#177c73;--event-b:#286a9c;--event-glow:rgba(160,255,224,.32)}
  .event-theme-family,.event-theme-relationship,.event-theme-social{--event-a:#b13d83;--event-b:#7547b7;--event-glow:rgba(255,190,222,.36)}
  .event-theme-education,.event-theme-school{--event-a:#246ca4;--event-b:#5749b7;--event-glow:rgba(170,220,255,.34)}
  .event-theme-finance,.event-theme-money{--event-a:#9b6922;--event-b:#557b45;--event-glow:rgba(255,230,160,.34)}
  .event-theme-achievement{--event-a:#b47a20;--event-b:#a74477;--event-glow:rgba(255,226,155,.4)}
  .event-theme-opportunity{--event-a:#7544c9;--event-b:#a23d99;--event-glow:rgba(222,188,255,.38)}
  .event-theme-challenge{--event-a:#a34a35;--event-b:#8d3d65;--event-glow:rgba(255,190,165,.38)}
  @keyframes event-drift-one{to{transform:translate(-24px,20px) scale(1.12)}}@keyframes event-drift-two{to{transform:translate(26px,-15px) scale(.88)}}
  @keyframes event-grid-pan{to{background-position:68px 34px}}@keyframes event-ring-turn{to{transform:rotate(360deg)}}
  @keyframes event-wave-flow{to{stroke-dashoffset:-144}}@keyframes event-sparkle{0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:scale(1.35)}}
  @media(max-width:480px){.event-card-header{min-height:124px;padding:15px 12px}.event-category-icon{width:46px;height:46px;border-radius:13px;font-size:23px}.event-header-main{gap:9px}.event-decision-label{font-size:7px;padding:4px 5px}.event-heading-copy p{font-size:10px}}
  @media(prefers-reduced-motion:reduce){.event-card-header *{animation:none!important}}
</style>
