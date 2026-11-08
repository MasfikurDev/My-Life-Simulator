<script lang="ts">
  import type { Character, EducationTaskType } from './lib/types';
  import { enrollInEducation, getAvailableEducationPrograms, pauseEducation, resumeEducation } from './lib/education';
  import { formatCharacterMoney, planEducationTaskInNextFreeTime } from './lib/simulation';
  let { character, onChange, onNotify }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void } = $props();
  let selectedProgramId = $state('');
  let selectedField = $state('');
  const programs = $derived(getAvailableEducationPrograms(character));
  const selectedProgram = $derived(programs.find((item) => item.id === selectedProgramId) ?? programs[0]);
  const enrollment = $derived(character.educationEnrollment ?? null);
  const progress = $derived(enrollment ? Math.min(100, Math.round(enrollment.weeksCompleted / enrollment.totalWeeks * 100)) : 0);
  const plannedTasks = $derived(character.weeklySchedule?.activities.filter((item) => item.action?.kind === 'education') ?? []);
  function enroll() {
    if (!selectedProgram) return;
    const field = selectedField && selectedProgram.fieldOptions.includes(selectedField) ? selectedField : selectedProgram.fieldOptions[0];
    const result = enrollInEducation(character, selectedProgram.id, field);
    if (result.issue) { onNotify(result.issue); return; }
    onChange(result.character); onNotify('Enrollment confirmed. Your class timetable has been arranged automatically.');
  }
  function planTask(task: EducationTaskType) {
    const result = planEducationTaskInNextFreeTime(character, task);
    if (result.issue) { onNotify(result.message ?? 'Could not schedule this academic task.'); return; }
    onChange(result.character); onNotify('Academic task added to this week.');
  }
  function taskPlanned(task: EducationTaskType) { return plannedTasks.some((item) => item.action?.kind === 'education' && item.action.taskType === task); }
  function pause() { onChange(pauseEducation(character)); onNotify('Education paused. Progress has been saved.'); }
  function resume() { const result = resumeEducation(character); if (result.issue) { onNotify(result.issue); return; } onChange(result.character); onNotify('Programme resumed. Classes have been arranged automatically.'); }
  function gradeLabel(value: number) { return value >= 85 ? 'Excellent' : value >= 70 ? 'Good' : value >= 60 ? 'Pass' : value >= 45 ? 'At risk' : 'Critical'; }
</script>

<div class="page-heading"><div><div class="eyebrow">LEARNING & QUALIFICATIONS</div><h1>Education <em>journey.</em></h1><p>From early learning and school to vocational training, college, university and professional study.</p></div></div>

{#if enrollment}
  <section class="education-hero domain-panel">
    <div class="education-hero-top"><div><div class="eyebrow">CURRENT ENROLLMENT · {enrollment.institution.toUpperCase()}</div><h2>{enrollment.level === 'bachelor' ? "Bachelor's degree" : enrollment.level === 'master' ? "Master's degree" : enrollment.level === 'doctorate' ? 'Doctoral programme' : enrollment.level.replaceAll('-', ' ')}</h2><p>{enrollment.field} · {enrollment.institution}</p></div><span class="domain-status">{enrollment.status === 'paused' ? 'PAUSED' : 'ENROLLED'}</span></div>
    <div class="education-metrics">
      <div><span>OVERALL GRADE</span><strong>{Math.round(enrollment.grade)}%</strong><small>{gradeLabel(enrollment.grade)}</small></div>
      <div><span>ATTENDANCE</span><strong>{Math.round(enrollment.attendance)}%</strong><small>Class participation</small></div>
      <div><span>COURSE PROGRESS</span><strong>{progress}%</strong><small>{enrollment.weeksCompleted}/{enrollment.totalWeeks} weeks</small></div>
    </div>
    <div class="meter"><span class="blue" style="width:{progress}%"></span></div>
    <div class="education-subjects">
      {#each enrollment.subjects as subject}
        <div class="education-subject"><span>{subject.name}</span><strong>{Math.round(subject.grade)}%</strong><div class="meter"><span class="blue" style="width:{subject.grade}%"></span></div></div>
      {/each}
    </div>
    <div class="education-footnote">{#if enrollment.status === 'paused'}This programme is paused. Your grades and completed weeks are preserved. Resume when you are ready.{:else}Classes are reserved automatically each week. Your weekly study target is {enrollment.weeklyStudyTarget} task points. Missing study, assignments or exams lowers your grades; workload, stress, stamina and health also affect results.{/if}</div>
    {#if enrollment.status === 'paused'}<button class="primary-button education-pause" onclick={resume}>Resume programme</button>{:else}<button class="secondary-button education-pause" onclick={pause}>Pause programme</button>{/if}
  </section>

  {#if enrollment.status === 'enrolled'}
  <section class="education-task-section">
    <div class="section-heading"><div><span class="section-index">01</span><h3>This week's academic work</h3></div><span class="section-hint">{plannedTasks.length} tasks scheduled</span></div>
    <p class="education-section-copy">Choose the work you can realistically complete. Each task is automatically placed in free time around classes, work and other commitments.</p>
    <div class="education-task-grid">
      <button class="education-task-card" disabled={taskPlanned('study')} onclick={() => planTask('study')}><span class="education-task-icon">↗</span><strong>Focused study</strong><small>Review lessons and strengthen understanding · 1 time block</small><b>{taskPlanned('study') ? 'Scheduled' : 'Plan study'}</b></button>
      <button class="education-task-card" disabled={taskPlanned('assignment')} onclick={() => planTask('assignment')}><span class="education-task-icon">▤</span><strong>Assignment</strong><small>Complete coursework and practical exercises · 1 time block</small><b>{taskPlanned('assignment') ? 'Scheduled' : 'Plan assignment'}</b></button>
      <button class="education-task-card" disabled={taskPlanned('exam')} onclick={() => planTask('exam')}><span class="education-task-icon">✓</span><strong>Quiz / exam prep</strong><small>Prepare for an assessment or sit a weekly quiz · 1 time block</small><b>{taskPlanned('exam') ? 'Scheduled' : 'Plan assessment'}</b></button>
    </div>
    <div class="education-footnote">A study task is not free: it uses time, energy and a small learning expense. Doing every possible task is not always the best strategy if you are already overloaded.</div>
  </section>
  {/if}
{:else}
  <section class="education-intro domain-panel">
    <div class="eyebrow">YOUR NEXT STEP</div><h2>Choose a learning path</h2><p>Programmes unlock through age and completed qualifications. Vocational routes and professional certificates can lead to meaningful careers without following a university-only path.</p>
    {#if programs.length}
      <div class="education-program-list">
        {#each programs as program}
          <button class:education-program-selected={selectedProgram?.id === program.id} class="education-program-card" onclick={() => { selectedProgramId = program.id; selectedField = ''; }}>
            <span class="education-program-type">{program.institutionType}</span><strong>{program.title}</strong><small>{program.durationWeeks} weeks · {program.weeklyStudyTarget} weekly study points</small>
            <span class="education-program-cost">{program.tuition ? formatCharacterMoney(character, program.tuition * (character.currencyScale ?? 1)) : 'No tuition'}</span>
          </button>
        {/each}
      </div>
      {#if selectedProgram}
        <div class="education-enrol-panel">
          <div><div class="eyebrow">PROGRAMME DETAILS</div><h3>{selectedProgram.title}</h3><p>{selectedProgram.durationWeeks} weeks · {selectedProgram.institutionType} · age {selectedProgram.minAge}{selectedProgram.maxAge < 120 ? '–' + selectedProgram.maxAge : '+'}</p></div>
          <label class="education-field-label">Field of study
            <select value={selectedField || selectedProgram.fieldOptions[0]} onchange={(event) => selectedField = event.currentTarget.value}>
              {#each selectedProgram.fieldOptions as field}<option value={field}>{field}</option>{/each}
            </select>
          </label>
          <div class="education-enrol-footer"><span>Tuition: <strong>{selectedProgram.tuition ? formatCharacterMoney(character, selectedProgram.tuition * (character.currencyScale ?? 1)) : 'Free'}</strong></span><button class="primary-button" onclick={enroll}>Enroll & arrange classes</button></div>
        </div>
      {/if}
    {:else}
      <p class="education-section-copy">There are no new programmes available at this stage. Review completed qualifications or continue independent learning.</p>
    {/if}
  </section>
{/if}

{#if character.academicHistory?.length || character.educationRecords?.length}
  <section class="education-history-section">
    <div class="section-heading"><div><span class="section-index">02</span><h3>Academic record</h3></div></div>
    {#each [...(character.academicHistory ?? [])].reverse() as result}
      <div class="education-history-row"><div><strong>{result.field}</strong><small>{result.institution} · {result.level.replaceAll('-', ' ')} · age {result.completedAtAge}</small></div><span class:education-result-pass={result.outcome === 'completed'}>{result.outcome === 'completed' ? 'Completed · ' : 'Not completed · '}{Math.round(result.grade)}%</span></div>
    {/each}
    {#each (character.educationRecords ?? []).filter((record) => record.status === 'paused') as record}
      <div class="education-history-row"><div><strong>{record.level.replaceAll('-', ' ')}</strong><small>{record.institution} · paused at age {record.startedAtAge}</small></div><span>Paused</span></div>
    {/each}
  </section>
{/if}
