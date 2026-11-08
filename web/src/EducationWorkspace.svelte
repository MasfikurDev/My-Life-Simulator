<script lang="ts">
  import type { Character, EducationTaskType } from './lib/types';
  import GameChoice from './GameChoice.svelte';
  import { enrollInEducation, getAvailableEducationPrograms, pauseEducation, resumeEducation } from './lib/education';
  import { formatCharacterMoney, getActivityCost, planActivityInNextFreeTime, planEducationTaskInNextFreeTime, removePlannedActivity } from './lib/simulation';
  import { getActivityStaminaCost, getValueColor } from './lib/progression';
  let { character, onChange, onNotify }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void } = $props();
  let selectedProgramId = $state('');
  let selectedField = $state('');
  const programs = $derived(getAvailableEducationPrograms(character));
  const selectedProgram = $derived(programs.find((item) => item.id === selectedProgramId) ?? programs[0]);
  const enrollment = $derived(character.educationEnrollment ?? null);
  const progress = $derived(enrollment ? Math.min(100, Math.round(enrollment.weeksCompleted / enrollment.totalWeeks * 100)) : 0);
  const plannedTasks = $derived(character.weeklySchedule?.activities.filter((item) => item.action?.kind === 'education') ?? []);
  const classCommitments = $derived(character.weeklySchedule?.commitments.filter((item) => item.domain === 'school') ?? []);
  const independentStudy = $derived(character.weeklySchedule?.activities.find((item) => item.activityId === 'study' && item.action?.kind === 'activity'));
  function weekdayName(day: number) { return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day - 1] ?? 'Day'; }
  function enroll() {
    if (!selectedProgram) return;
    const field = selectedField && selectedProgram.fieldOptions.includes(selectedField) ? selectedField : selectedProgram.fieldOptions[0];
    const result = enrollInEducation(character, selectedProgram.id, field);
    if (result.issue) { onNotify(result.issue); return; }
    onChange(result.character); onNotify('Enrollment confirmed. Your class timetable has been arranged automatically.');
  }
  function planTask(task: EducationTaskType) {
    const existing = plannedTasks.find((item) => item.action?.kind === 'education' && item.action.taskType === task);
    if (existing) { onChange(removePlannedActivity(character, existing.id)); onNotify('Academic task removed from this week.'); return; }
    const result = planEducationTaskInNextFreeTime(character, task);
    if (result.issue) { onNotify(result.message ?? 'Could not add this academic task.'); return; }
    onChange(result.character); onNotify('Academic task added to this week.');
  }
  function taskPlanned(task: EducationTaskType) { return plannedTasks.some((item) => item.action?.kind === 'education' && item.action.taskType === task); }
  function toggleIndependentStudy() {
    if (independentStudy) { onChange(removePlannedActivity(character, independentStudy.id)); onNotify('Independent study removed from this week.'); return; }
    const result = planActivityInNextFreeTime(character, 'study');
    if (result.issue) { onNotify(result.message ?? 'Could not add independent study.'); return; }
    onChange(result.character); onNotify('Independent study added to this week.');
  }
  function pause() { onChange(pauseEducation(character)); onNotify('Education paused. Progress has been saved.'); }
  function resume() { const result = resumeEducation(character); if (result.issue) { onNotify(result.issue); return; } onChange(result.character); onNotify('Programme resumed. Classes have been arranged automatically.'); }
  function gradeLabel(value: number) { if (enrollment?.level === 'early-learning') return value >= 75 ? 'Developing well' : value >= 50 ? 'On track' : 'Needs more support'; return value >= 85 ? 'Excellent' : value >= 70 ? 'Good' : value >= 60 ? 'Pass' : value >= 45 ? 'At risk' : 'Critical'; }
</script>

{#if enrollment}
  <section class="education-hero domain-panel">
    <div class="education-hero-top"><div><div class="eyebrow">CURRENT ENROLLMENT · {enrollment.institution.toUpperCase()}</div><h2>{enrollment.level === 'bachelor' ? "Bachelor's degree" : enrollment.level === 'master' ? "Master's degree" : enrollment.level === 'doctorate' ? 'Doctoral programme' : enrollment.level.replaceAll('-', ' ')}</h2><p>{enrollment.field} · {enrollment.institution}</p></div><span class="domain-status">{enrollment.status === 'paused' ? 'PAUSED' : 'ENROLLED'}</span></div>
    <div class="education-metrics">
      <div><span>{enrollment.level === 'early-learning' ? 'DEVELOPMENT' : 'OVERALL GRADE'}</span><strong>{Math.round(enrollment.grade)}%</strong><small>{gradeLabel(enrollment.grade)}</small></div>
      <div><span>ATTENDANCE</span><strong>{Math.round(enrollment.attendance)}%</strong><small>Present / scheduled</small></div>
      <div><span>COURSE PROGRESS</span><strong>{progress}%</strong><small>{enrollment.weeksCompleted}/{enrollment.totalWeeks} weeks</small></div>
    </div>
    <div class="meter"><span class="blue" style="width:{progress}%;background:{getValueColor(progress)}"></span></div>
    <div class="education-subjects">
      {#each enrollment.subjects as subject}
        <div class="education-subject"><span>{subject.name}</span><strong>{Math.round(subject.grade)}%</strong><div class="meter"><span class="blue" style="width:{subject.grade}%;background:{getValueColor(subject.grade)}"></span></div></div>
      {/each}
    </div>
    <div class="education-footnote">{#if enrollment.status === 'paused'}Progress retained{:else}{enrollment.weeklyStudyTarget} study points required each week{/if}</div>
    {#if enrollment.status === 'paused'}<button class="primary-button education-pause" onclick={resume}>Resume programme</button>{:else}<button class="secondary-button education-pause" onclick={pause}>Pause programme</button>{/if}
    {#if classCommitments.length}<div class="education-class-schedule"><strong>Automatic weekly timetable</strong>{#each classCommitments as item}<span>{weekdayName(item.weekday)} · {item.startPeriod} · {item.title}</span>{/each}</div>{/if}
  </section>

  {#if enrollment.status === 'enrolled'}
  <section class="education-task-section">
    <div class="section-heading"><div><span class="section-index">01</span><h3>This week's academic work</h3></div><span class="section-hint">{plannedTasks.length} tasks selected</span></div>

        <div class="education-task-grid">
      <button class="education-task-card" class:planned={taskPlanned('study')}  onclick={() => planTask('study')}><span class="education-task-icon">↗</span><strong>{enrollment.level === 'early-learning' ? 'Guided play' : 'Focused study'}</strong><small>{enrollment.level === 'early-learning' ? 'Build curiosity, language and coordination through play' : 'Review lessons and strengthen understanding'}</small><b>{taskPlanned('study') ? 'REMOVE FROM WEEK' : 'ADD STUDY · ' + getActivityStaminaCost('study') + ' STAMINA'}</b></button>
      <button class="education-task-card" class:planned={taskPlanned('assignment')}  onclick={() => planTask('assignment')}><span class="education-task-icon">▤</span><strong>{enrollment.level === 'early-learning' ? 'Story time' : 'Assignment'}</strong><small>{enrollment.level === 'early-learning' ? 'Build language and communication with shared stories' : 'Complete coursework and practical exercises'}</small><b>{taskPlanned('assignment') ? 'REMOVE FROM WEEK' : 'ADD ASSIGNMENT · ' + getActivityStaminaCost('study') + ' STAMINA'}</b></button>
      <button class="education-task-card" class:planned={taskPlanned('exam')}  onclick={() => planTask('exam')}><span class="education-task-icon">✓</span><strong>{enrollment.level === 'early-learning' ? 'Discovery activity' : 'Quiz / exam prep'}</strong><small>{enrollment.level === 'early-learning' ? 'Explore objects, sounds and movement with a caregiver' : 'Prepare for an assessment or sit a weekly quiz'}</small><b>{taskPlanned('exam') ? 'REMOVE FROM WEEK' : 'ADD ASSESSMENT · ' + getActivityStaminaCost('study') + ' STAMINA'}</b></button>
    </div>
    <div class="education-footnote">Each task uses stamina. Class attendance remains on your automatic school timetable.</div>
  </section>
  {/if}
{:else}
  <section class="education-intro domain-panel">
    <div class="education-independent-study">
      <div><strong>Independent study</strong><p>Build intelligence, focus and discipline without enrolling in a programme.</p><small>{getActivityStaminaCost('study')} stamina · {character.age >= 16 ? formatCharacterMoney(character, getActivityCost(character, 'study')) : 'No direct fee'}</small></div>
      <button class:planned={!!independentStudy} onclick={toggleIndependentStudy}>{independentStudy ? 'Remove from this week' : 'Add study'}</button>
    </div>
    <h2>Available programmes</h2>
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
          <div><h3>{selectedProgram.title}</h3><p>{selectedProgram.durationWeeks} weeks · age {selectedProgram.minAge}{selectedProgram.maxAge < 120 ? '–' + selectedProgram.maxAge : '+'}</p></div>
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
