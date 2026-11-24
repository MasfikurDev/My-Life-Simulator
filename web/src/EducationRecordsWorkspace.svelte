<script lang="ts">
  import type { Character } from './lib/types';
  let { character }: { character: Character } = $props();
  let filter = $state<'all' | 'qualifications' | 'certificates' | 'history'>('all');
  const results = $derived([...(character.academicHistory ?? [])].reverse());
  const qualifications = $derived([...(character.qualifications ?? [])].reverse());
  const activeRecords = $derived([...(character.educationRecords ?? [])].filter((record) => record.status === 'enrolled' || record.status === 'paused').reverse());
  const completedCount = $derived(results.filter((result) => result.outcome === 'completed').length + qualifications.length);
  const certificateCount = $derived(qualifications.filter((item) => item.category === 'certificate').length);
  function levelName(level: string) { return level.replaceAll('-', ' ').replace(/\\b\\w/g, (letter) => letter.toUpperCase()); }
</script>

<section class="records-page">
  <header class="records-heading"><div><span class="eyebrow">YOUR LEARNING HISTORY</span><h2>Educational Records</h2><p>Qualifications, certificates and academic results earned throughout life.</p></div></header>
  <div class="records-summary">
    <div><strong>{completedCount}</strong><span>Completed records</span></div>
    <div><strong>{qualifications.length}</strong><span>Qualifications</span></div>
    <div><strong>{certificateCount}</strong><span>Certificates</span></div>
  </div>
  <nav class="records-filters" aria-label="Filter educational records">
    <button class:active={filter === 'all'} onclick={() => filter = 'all'}>All records</button>
    <button class:active={filter === 'qualifications'} onclick={() => filter = 'qualifications'}>Qualifications</button>
    <button class:active={filter === 'certificates'} onclick={() => filter = 'certificates'}>Certificates</button>
    <button class:active={filter === 'history'} onclick={() => filter = 'history'}>Academic history</button>
  </nav>

  {#if (filter === 'all' || filter === 'qualifications' || filter === 'certificates') && qualifications.filter((item) => filter !== 'certificates' || item.category === 'certificate').length}
    <section class="record-group">
      <div class="record-group-heading"><h3>{filter === 'certificates' ? 'Certificates' : 'Qualifications'}</h3><span>{qualifications.filter((item) => filter !== 'certificates' || item.category === 'certificate').length}</span></div>
      {#each qualifications.filter((item) => filter !== 'certificates' || item.category === 'certificate') as qualification}
        <article class="qualification-card">
          <span class="qualification-symbol">{qualification.category === 'certificate' ? '▧' : qualification.category === 'diploma' ? '◇' : '✦'}</span>
          <div class="qualification-copy"><strong>{qualification.name}</strong><small>{qualification.issuer} · {qualification.field}</small><span>Earned at age {qualification.awardedAtAge}</span></div>
          <span class="record-check">✓</span>
        </article>
      {/each}
    </section>
  {:else if filter === 'qualifications' || filter === 'certificates'}
    <p class="records-empty">No {filter === 'certificates' ? 'certificates' : 'qualifications'} recorded yet. Completed programmes will appear here.</p>
  {/if}

  {#if (filter === 'all' || filter === 'history') && (results.length || activeRecords.length)}
    <section class="record-group">
      <div class="record-group-heading"><h3>Academic history</h3><span>{results.length + activeRecords.length}</span></div>
      {#each activeRecords as record}
        <article class="history-card"><div><strong>{levelName(record.level)}</strong><small>{record.institution} · {record.field} · started age {record.startedAtAge}</small></div><span class:record-paused={record.status === 'paused'}>{record.status === 'paused' ? 'On hold' : 'In progress'}</span></article>
      {/each}
      {#each results as result}
        <article class="history-card"><div><strong>{levelName(result.level)} · {result.field}</strong><small>{result.institution} · completed age {result.completedAtAge}</small></div><span class:record-passed={result.outcome === 'completed'} class:record-failed={result.outcome !== 'completed'}>{result.outcome === 'completed' ? 'Passed' : 'Not completed'} · {Math.round(result.grade)}%</span></article>
      {/each}
    </section>
  {:else if filter === 'history'}
    <p class="records-empty">Your academic history will appear here as programmes are started and completed.</p>
  {/if}

  {#if filter === 'all' && !qualifications.length && !results.length && !activeRecords.length}
    <p class="records-empty">There are no educational records yet. Enrol in a programme to begin building your academic history.</p>
  {/if}
</section>

<style lang="scss">
  .records-page{display:grid;gap:14px;min-width:0}
  .records-heading h2{margin:5px 0 4px;font-size:22px;letter-spacing:-.5px}.records-heading p{margin:0;color:var(--muted);font-size:10px;line-height:1.5}
  .eyebrow{color:var(--muted);font-size:9px;font-weight:800;letter-spacing:.8px}
  .records-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
  .records-summary>div{display:grid;gap:4px;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
  .records-summary strong{font-size:20px}.records-summary span{color:var(--muted);font-size:8px}
  .records-filters{display:flex;gap:6px;overflow-x:auto;padding:2px 0 5px;scrollbar-width:thin}
  .records-filters button{flex:none;min-height:36px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--muted);font-size:9px;font-weight:700;white-space:nowrap}
  .records-filters button.active{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
  .record-group{display:grid;gap:7px}
  .record-group-heading{display:flex;align-items:center;justify-content:space-between}.record-group-heading h3{margin:0;font-size:14px}.record-group-heading span{color:var(--muted);font-size:9px}
  .qualification-card,.history-card{display:flex;align-items:center;gap:10px;min-width:0;padding:11px;border:1px solid var(--line);border-radius:10px;background:var(--surface)}
  .qualification-symbol{display:grid;place-items:center;width:34px;height:34px;flex:none;border-radius:9px;background:var(--surface-raised);color:var(--accent);font-size:17px}
  .qualification-copy,.history-card>div{display:grid;gap:3px;min-width:0;flex:1}
  .qualification-copy strong,.history-card strong{font-size:11px;line-height:1.3}.qualification-copy small,.history-card small{color:var(--muted);font-size:9px;line-height:1.35}
  .qualification-copy>span{color:var(--muted);font-size:8px}
  .record-check{color:var(--success);font-size:14px}.history-card>span{flex:none;color:var(--muted);font-size:8px;text-align:right}.history-card>span.record-passed{color:var(--success)}.history-card>span.record-failed{color:var(--danger)}.history-card>span.record-paused{color:var(--warning)}
  .records-empty{margin:0;padding:16px;border:1px dashed var(--line-strong);border-radius:10px;color:var(--muted);font-size:10px;line-height:1.5;text-align:center}
  @media(max-width:380px){.records-summary{gap:5px}.records-summary>div{padding:8px 6px}.records-summary span{font-size:7px}.history-card{align-items:flex-start;flex-wrap:wrap}.history-card>span{margin-left:auto}}
</style>