<script lang="ts">
  import type { Character } from './lib/types';
  let { character }: { character: Character } = $props();
</script>

<section class="education-history-section">
  <div class="section-heading"><div><span class="section-index">01</span><h3>Academic Record</h3></div></div>
  {#if character.academicHistory?.length || character.educationRecords?.length}
    {#each [...(character.academicHistory ?? [])].reverse() as result}
      <article class="education-history-row">
        <div><strong>{result.field}</strong><small>{result.institution} · {result.level.replaceAll('-', ' ')} · age {result.completedAtAge}</small></div>
        <span class:education-result-pass={result.outcome === 'completed'}>{result.outcome === 'completed' ? 'Completed · ' : 'Not completed · '}{Math.round(result.grade)}%</span>
      </article>
    {/each}
    {#each [...(character.educationRecords ?? [])].reverse().filter((record) => record.status === 'paused') as record}
      <article class="education-history-row"><div><strong>{record.level.replaceAll('-', ' ')}</strong><small>{record.institution} · paused at age {record.startedAtAge}</small></div><span>Paused</span></article>
    {/each}
    {#each [...(character.educationRecords ?? [])].reverse().filter((record) => record.status === 'enrolled') as record}
      <article class="education-history-row"><div><strong>{record.level.replaceAll('-', ' ')}</strong><small>{record.institution} · started at age {record.startedAtAge}</small></div><span>In progress</span></article>
    {/each}
  {:else}
    <p class="education-section-copy">Completed programmes and qualifications will appear here as your education progresses.</p>
  {/if}
  {#if character.qualifications?.length}
    <div class="section-heading"><div><span class="section-index">02</span><h3>Qualifications</h3></div></div>
    {#each [...character.qualifications].reverse() as qualification}
      <article class="education-history-row"><div><strong>{qualification.name}</strong><small>{qualification.issuer} · {qualification.field}</small></div><span>Earned at age {qualification.awardedAtAge}</span></article>
    {/each}
  {/if}
</section>
