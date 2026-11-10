<script lang="ts">
  import type { Character, EducationTaskType } from './lib/types';
  import GameChoice from './GameChoice.svelte';
  import ActivityStatusSeal from './components/ActivityStatusSeal.svelte';
  import { enrollInEducation, getAvailableEducationPrograms } from './lib/education';
  import EducationRecordsWorkspace from './EducationRecordsWorkspace.svelte';
  import { formatCharacterMoney, planEducationTaskInNextFreeTime, removePlannedActivity } from './lib/simulation';
  import { getActivityStaminaCost, getValueColor } from './lib/progression';
  let { character, onChange, onNotify }: { character: Character; onChange: (next: Character) => void; onNotify: (message: string) => void } = $props();
  let subpage = $state<'education' | 'records'>('education');
  let selectedProgramId = $state('');
  let selectedField = $state('');
  const programs = $derived(getAvailableEducationPrograms(character));
  const selectedProgram = $derived(programs.find((item) => item.id === selectedProgramId) ?? programs[0]);
  const enrollment = $derived(character.educationEnrollment ?? null);
  const progress = $derived(enrollment ? Math.min(100, Math.round(enrollment.weeksCompleted / enrollment.totalWeeks * 100)) : 0);
  const plannedTasks = $derived(character.weeklyPlan?.activities.filter((item) => item.action?.kind === 'education') ?? []);
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
  function gradeLabel(value: number) { if (enrollment?.level === 'early-learning') return value >= 75 ? 'Developing well' : value >= 50 ? 'On track' : 'Needs more support'; return value >= 85 ? 'Excellent' : value >= 70 ? 'Good' : value >= 60 ? 'Pass' : value >= 45 ? 'At risk' : 'Critical'; }
</script>

<nav class="finance-nav" aria-label="Education sections">
  <button class:active={subpage === 'education'} aria-current={subpage === 'education' ? 'page' : undefined} onclick={() => subpage = 'education'}>Education</button>
  <button class:active={subpage === 'records'} aria-current={subpage === 'records' ? 'page' : undefined} onclick={() => subpage = 'records'}>Educational Records</button>
</nav>

{#if subpage === 'records'}
  <EducationRecordsWorkspace {character} />
{:else}
{#if enrollment}
  <section class="education-hero domain-panel">
    <div class="education-hero-top"><div><div class="eyebrow">CURRENT ENROLLMENT · {enrollment.institution.toUpperCase()}</div><h2>{enrollment.level === 'bachelor' ? "Bachelor's degree" : enrollment.level === 'master' ? "Master's degree" : enrollment.level === 'doctorate' ? 'Doctoral programme' : enrollment.level.replaceAll('-', ' ')}</h2><p>{enrollment.field} · {enrollment.institution}</p></div><span class="domain-status">{enrollment.status === 'paused' ? 'ON HOLD' : 'ENROLLED'}</span></div>
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
  </section>

  {#if enrollment.status === 'enrolled'}
  <section class="education-task-section">
    <div class="section-heading"><div><span class="section-index">01</span><h3>This Week's Academic Work</h3></div><span class="section-hint">{plannedTasks.length} tasks selected</span></div>

        <div class="education-task-grid">
      <button class="education-task-card" class:planned={taskPlanned('study')}  onclick={() => planTask('study')}><span class="education-task-icon">↗</span><strong>{enrollment.level === 'early-learning' ? 'Guided play' : 'Focused study'}</strong><ActivityStatusSeal status={taskPlanned('study') ? 'planned' : 'available'} /><small>{enrollment.level === 'early-learning' ? 'Build curiosity, language and coordination through play' : 'Review lessons and strengthen understanding'}</small><b>{taskPlanned('study') ? 'REMOVE FROM WEEK' : 'ADD STUDY · ' + getActivityStaminaCost('study') + ' STAMINA'}</b></button>
      <button class="education-task-card" class:planned={taskPlanned('assignment')}  onclick={() => planTask('assignment')}><span class="education-task-icon">▤</span><strong>{enrollment.level === 'early-learning' ? 'Story time' : 'Assignment'}</strong><ActivityStatusSeal status={taskPlanned('assignment') ? 'planned' : 'available'} /><small>{enrollment.level === 'early-learning' ? 'Build language and communication with shared stories' : 'Complete coursework and practical exercises'}</small><b>{taskPlanned('assignment') ? 'REMOVE FROM WEEK' : 'ADD ASSIGNMENT · ' + getActivityStaminaCost('study') + ' STAMINA'}</b></button>
      <button class="education-task-card" class:planned={taskPlanned('exam')}  onclick={() => planTask('exam')}><span class="education-task-icon">✓</span><strong>{enrollment.level === 'early-learning' ? 'Discovery activity' : 'Quiz / exam prep'}</strong><ActivityStatusSeal status={taskPlanned('exam') ? 'planned' : 'available'} /><small>{enrollment.level === 'early-learning' ? 'Explore objects, sounds and movement with a caregiver' : 'Prepare for an assessment or sit a weekly quiz'}</small><b>{taskPlanned('exam') ? 'REMOVE FROM WEEK' : 'ADD ASSESSMENT · ' + getActivityStaminaCost('study') + ' STAMINA'}</b></button>
    </div>
    <div class="education-footnote">Each task uses stamina. Attendance is handled automatically as part of your education programme.</div>
  </section>
  {/if}
{:else}
  <section class="education-intro domain-panel">
    <h2>Available Programmes</h2>
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
          <div class="education-field-label"><span>Choose Your Field of Study</span>
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

{/if}

