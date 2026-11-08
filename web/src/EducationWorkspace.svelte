<script lang="ts">
  import type { Character, EducationTaskType } from './lib/types';
  import GameChoice from './GameChoice.svelte';
  import { enrollInEducation, getAvailableEducationPrograms, pauseEducation, resumeEducation } from './lib/education';
  import { formatCharacterMoney, planEducationTaskInNextFreeTime, removePlannedActivity } from './lib/simulation';
  let { character, onChange, onNotify }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void } = $props();
  let selectedProgramId = $state('');
  let selectedField = $state('');
  const programs = $derived(getAvailableEducationPrograms(character));
  const selectedProgram = $derived(programs.find((item) => item.id === selectedProgramId) ?? programs[0]);
  const enrollment = $derived(character.educationEnrollment ?? null);
  const progress = $derived(enrollment ? Math.min(100, Math.round(enrollment.weeksCompleted / enrollment.totalWeeks * 100)) : 0);
  const plannedTasks = $derived(character.weeklySchedule?.activities.filter((item) => item.action?.kind === 'education') ?? []);
  const classCommitments = $derived(character.weeklySchedule?.commitments.filter((item) => item.domain === 'school') ?? []);
  function weekdayName(day: number) { return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day - 1] ?? 'Day'; }
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
  function removeTask(id: string) { onChange(removePlannedActivity(character, id)); onNotify('Academic task removed from this week.'); }
  function pause() { onChange(pauseEducation(character)); onNotify('Education paused. Progress has been saved.'); }
  function resume() { const result = resumeEducation(character); if (result.issue) { onNotify(result.issue); return; } onChange(result.character); onNotify('Programme resumed. Classes have been arranged automatically.'); }
  function gradeLabel(value: number) { if (enrollment?.level === 'early-learning') return value >= 75 ? 'Developing well' : value >= 50 ? 'On track' : 'Needs more support'; return value >= 85 ? 'Excellent' : value >= 70 ? 'Good' : value >= 60 ? 'Pass' : value >= 45 ? 'At risk' : 'Critical'; }
</script>

<div class="page-heading"><div><div class="eyebrow">LEARNING & QUALIFICATIONS</div><h1>Education <em>journey.</em></h1><p>From early learning and school to vocational training, college, university and professional study.</p></div></div>

{#if enrollment}
  <section class="education-hero domain-panel">
    <div class="education-hero-top"><div><div class="eyebrow">CURRENT ENROLLMENT · {enrollment.institution.toUpperCase()}</div><h2>{enrollment.level === 'bachelor' ? "Bachelor's degree" : enrollment.level === 'master' ? "Master's degree" : enrollment.level === 'doctorate' ? 'Doctoral programme' : enrollment.level.replaceAll('-', ' ')}</h2><p>{enrollment.field} · {enrollment.institution}</p></div><span class="domain-status">{enrollment.status === 'paused' ? 'PAUSED' : 'ENROLLED'}</span></div>
    <div class="education-metrics">
      <div><span>{enrollment.level === 'early-learning' ? 'DEVELOPMENT' : 'OVERALL GRADE'}</span><strong>{Math.round(enrollment.grade)}%</strong><small>{gradeLabel(enrollment.grade)}</small></div>
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
    {#if classCommitments.length}<div class="education-class-schedule"><strong>Automatic weekly timetable</strong>{#each classCommitments as item}<span>{weekdayName(item.weekday)} · {item.startPeriod} · {item.title}</span>{/each}</div>{/if}
  </section>

  {#if enrollment.status === 'enrolled'}
  <section class="education-task-section">
    <div class="section-heading"><div><span class="section-index">01</span><h3>This week's academic work</h3></div><span class="section-hint">{plannedTasks.length} tasks scheduled</span></div>
    <p class="education-section-copy">Choose the work you can realistically complete. Each task is automatically placed in free time around classes, work and other commitments.</p>
    {#if plannedTasks.length}<div class="education-planned-list"><strong>Already planned</strong>{#each plannedTasks as task}<div class="education-planned-row"><span>{task.date} · {task.startPeriod} · {task.action?.kind === 'education' ? task.action.taskType.replaceAll('-', ' ') : 'Academic task'}</span><button class="text-button" onclick={() => removeTask(task.id)}>Remove</button></div>{/each}</div>{/if}
    <div class="education-task-grid">
      <button class="education-task-card" class:planned={taskPlanned('study')} disabled={taskPlanned('study')} aria-label={taskPlanned('study') ? 'Focused study planned' : 'Plan focused study'} onclick={() => planTask('study')}><span class="education-task-icon">↗</span><strong>{enrollment.level === 'early-learning' ? 'Guided play' : 'Focused study'}</strong><small>{enrollment.level === 'early-learning' ? 'Curiosity, language and coordination' : 'Review lessons and strengthen understanding'}</small><span class="activity-choice-meta">1 time block</span></button>
      <button class="education-task-card" class:planned={taskPlanned('assignment')} disabled={taskPlanned('assignment')} aria-label={taskPlanned('assignment') ? 'Assignment planned' : 'Plan assignment'} onclick={() => planTask('assignment')}><span class="education-task-icon">▤</span><strong>{enrollment.level === 'early-learning' ? 'Story time' : 'Assignment'}</strong><small>{enrollment.level === 'early-learning' ? 'Build language and communication' : 'Complete coursework and exercises'}</small><span class="activity-choice-meta">1 time block</span></button>
      <button class="education-task-card" class:planned={taskPlanned('exam')} disabled={taskPlanned('exam')} aria-label={taskPlanned('exam') ? 'Assessment preparation planned' : 'Plan assessment preparation'} onclick={() => planTask('exam')}><span class="education-task-icon">✓</span><strong>{enrollment.level === 'early-learning' ? 'Discovery activity' : 'Quiz / exam prep'}</strong><small>{enrollment.level === 'early-learning' ? 'Explore objects, sounds and movement' : 'Prepare for an assessment'}</small><span class="activity-choice-meta">1 time block</span></button>
    </div>
    <div class="education-footnote">A study task is not free: it uses time, energy and a small learning expense. Doing every possible task is not always the best strategy if you are already overloaded.</div>
  </section>
  {/if}
{:else}
  <section class="education-intro domain-panel">
    <div class="eyebrow">YOUR NEXT STEP</div><h2>Choose a learning path</h2><p>Programmes unlock through age, completed qualifications and relevant character attributes. Vocational routes and professional certificates can lead to meaningful careers without following a university-only path.</p>
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
          <div class="education-field-label"><span>Choose your field of study</span>
            <GameChoice label="Field of study" value={selectedField || selectedProgram.fieldOptions[0]} options={selectedProgram.fieldOptions.map((field) => ({ value: field, label: field }))} onSelect={(field) => selectedField = field} columns={Math.min(3, selectedProgram.fieldOptions.length)} />
          </div>
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
