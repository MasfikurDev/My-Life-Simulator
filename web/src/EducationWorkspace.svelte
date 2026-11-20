<script lang="ts">
  import type { Character, EducationTaskType } from './lib/types';
  import GameChoice from './GameChoice.svelte';
  import ActivityStatusSeal from './components/ActivityStatusSeal.svelte';
  import UiProgress from './components/UiProgress.svelte';
  import { enrollInEducation, getAvailableEducationPrograms, resumeEducation } from './lib/education';
  import EducationRecordsWorkspace from './EducationRecordsWorkspace.svelte';
  import { formatCharacterMoney, planEducationTaskInNextFreeTime, removePlannedActivity } from './lib/simulation';
  import { getActivityStaminaCost, getValueTone } from './lib/progression';
  let { character, projectedCharacter = character, onChange, onNotify }: { character: Character; projectedCharacter?: Character; onChange: (next: Character) => void; onNotify: (message: string) => void } = $props();
  let subpage = $state<'education' | 'records'>('education');
  let selectedProgramId = $state('');
  let selectedField = $state('');
  let selectedSubjectId = $state('');
  const programs = $derived(getAvailableEducationPrograms(character));
  const selectedProgram = $derived(programs.find((item) => item.id === selectedProgramId) ?? programs[0]);
  const enrollment = $derived(character.educationEnrollment ?? null);
  const projectedEnrollment = $derived(projectedCharacter.educationEnrollment ?? enrollment);
  const progress = $derived(enrollment ? Math.min(100, Math.round(enrollment.weeksCompleted / enrollment.totalWeeks * 100)) : 0);
  const projectedProgress = $derived(projectedEnrollment ? Math.min(100, Math.round(projectedEnrollment.weeksCompleted / projectedEnrollment.totalWeeks * 100)) : progress);
  const plannedTasks = $derived(character.weeklyPlan?.activities.filter((item) => item.action?.kind === 'education') ?? []);
  const selectedSubject = $derived(enrollment?.subjects.find((subject) => subject.id === selectedSubjectId) ?? enrollment?.subjects[0] ?? null);
  const plannedStudyPoints = $derived(plannedTasks.reduce((total, item) => total + (item.action?.kind === 'education' ? item.action.taskType === 'assignment' ? 1.25 : item.action.taskType === 'exam' ? 1.6 : 1 : 0), 0));
  const studyTargetProgress = $derived(enrollment ? Math.min(100, plannedStudyPoints / Math.max(1, enrollment.weeklyStudyTarget) * 100) : 0);
  function enroll() {
    if (!selectedProgram) return;
    const field = selectedField && selectedProgram.fieldOptions.includes(selectedField) ? selectedField : selectedProgram.fieldOptions[0];
    const result = enrollInEducation(character, selectedProgram.id, field);
    if (result.issue) { onNotify(result.issue); return; }
    onChange(result.character); onNotify('Enrollment confirmed. Your class timetable has been arranged automatically.');
  }
  function resumeLegacyEnrollment() {
    const result = resumeEducation(character);
    if (result.issue) { onNotify(result.issue); return; }
    onChange(result.character); onNotify('Programme continued. Your progress has been retained.');
  }
  function planTask(task: EducationTaskType) {
    const existing = plannedTasks.find((item) => item.action?.kind === 'education' && item.action.taskType === task);
    if (existing) { onChange(removePlannedActivity(character, existing.id)); onNotify('Academic task removed from this week.'); return; }
    const result = planEducationTaskInNextFreeTime(character, task, selectedSubject?.id);
    if (result.issue) { onNotify(result.message ?? 'Could not add this academic task.'); return; }
    onChange(result.character); onNotify('Academic task added to this week.');
  }
  function taskPlanned(task: EducationTaskType) { return plannedTasks.some((item) => item.action?.kind === 'education' && item.action.taskType === task); }
  function taskFocus(task: EducationTaskType) {
    const item = plannedTasks.find((entry) => entry.action?.kind === 'education' && entry.action.taskType === task);
    return item?.action?.kind === 'education' ? enrollment?.subjects.find((subject) => subject.id === item.action.subjectId)?.name ?? 'General study' : selectedSubject?.name ?? 'General study';
  }
  function taskTitle(task: EducationTaskType) {
    if (character.age < 6) return task === 'assignment' ? 'Creative activity' : task === 'exam' ? 'Learning check-in' : 'Guided exploration';
    if (character.age < 12) return task === 'assignment' ? 'Learning project' : task === 'exam' ? 'Knowledge check' : 'Guided practice';
    if (enrollment?.level === 'vocational') return task === 'assignment' ? 'Practical workshop' : task === 'exam' ? 'Competency assessment' : 'Technical practice';
    return task === 'assignment' ? 'Coursework' : task === 'exam' ? 'Assessment preparation' : 'Subject study';
  }
  function taskDescription(task: EducationTaskType) {
    if (character.age < 6) return task === 'assignment' ? 'Create, build and express ideas through guided activities' : task === 'exam' ? 'Check developing language, number and discovery skills' : 'Explore stories, objects and movement with guidance';
    if (character.age < 12) return task === 'assignment' ? 'Apply classroom learning in a small project' : task === 'exam' ? 'Revisit core knowledge and check understanding' : 'Practice reading, numeracy and current lessons';
    if (enrollment?.level === 'vocational') return task === 'assignment' ? 'Apply techniques to a hands-on task' : task === 'exam' ? 'Prepare for a practical or theory assessment' : 'Build confidence with your trade skills';
    return task === 'assignment' ? 'Complete coursework and apply subject knowledge' : task === 'exam' ? 'Review material for an upcoming assessment' : 'Strengthen understanding through focused practice';
  }
  function gradeLabel(value: number) { if (enrollment?.level === 'early-learning') return value >= 75 ? 'Developing well' : value >= 50 ? 'On track' : 'Needs more support'; return value >= 85 ? 'Excellent' : value >= 70 ? 'Good' : value >= 60 ? 'Pass' : value >= 45 ? 'At risk' : 'Critical'; }
</script>

<nav class="education-nav" aria-label="Education sections">
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
      <div><span>{enrollment.level === 'early-learning' ? 'DEVELOPMENT' : 'OVERALL GRADE'}</span><strong>{Math.round(enrollment.grade)}%{#if projectedEnrollment && projectedEnrollment.grade !== enrollment.grade} → {Math.round(projectedEnrollment.grade)}%{/if}</strong><small>{gradeLabel(enrollment.grade)}</small></div>
      <div><span>ATTENDANCE</span><strong>{Math.round(enrollment.attendance)}%{#if projectedEnrollment && projectedEnrollment.attendance !== enrollment.attendance} → {Math.round(projectedEnrollment.attendance)}%{/if}</strong><small>Present / scheduled</small></div>
      <div><span>COURSE PROGRESS</span><strong>{progress}%{#if projectedProgress !== progress} → {projectedProgress}%{/if}</strong><small>{enrollment.weeksCompleted}/{enrollment.totalWeeks} weeks</small></div>
    </div>
    <UiProgress label="Course progress" value={progress} previewValue={projectedProgress} previewTone={projectedProgress >= progress ? 'success' : 'danger'} tone={getValueTone(progress)} showLabel={false} showValue valueText={`${progress}% → ${projectedProgress}%`} />
    <div class="education-subjects">
      {#each enrollment.subjects as subject}
        <div class="education-subject"><span>{subject.name}</span><strong>{Math.round(subject.grade)}%</strong><UiProgress label={`${subject.name} grade`} value={subject.grade} previewValue={projectedEnrollment?.subjects.find((item) => item.name === subject.name)?.grade ?? subject.grade} previewTone={(projectedEnrollment?.subjects.find((item) => item.name === subject.name)?.grade ?? subject.grade) >= subject.grade ? 'success' : 'danger'} tone={getValueTone(subject.grade)} size="small" showLabel={false} showValue valueText={`${Math.round(subject.grade)}% → ${Math.round(projectedEnrollment?.subjects.find((item) => item.name === subject.name)?.grade ?? subject.grade)}%`} /></div>
      {/each}
    </div>
    <div class="education-footnote">{#if enrollment.status === 'paused'}Progress retained{:else}{enrollment.weeklyStudyTarget} study points required each week{/if}</div>
    {#if enrollment.status === 'paused'}<button class="primary-button" onclick={resumeLegacyEnrollment}>Continue Programme</button>{/if}
  </section>

  {#if enrollment.status === 'enrolled'}
  <section class="education-task-section">
    <div class="section-heading"><div><span class="section-index">01</span><h3>This Week's Academic Work</h3></div><span class="section-hint">{plannedTasks.length} tasks selected</span></div>

        <div class="education-study-planner">
      <div class="study-focus-row">
        <label class="study-focus-select"><span>Study focus</span><select value={selectedSubject?.id ?? ''} onchange={(event) => selectedSubjectId = event.currentTarget.value}>
          {#each enrollment.subjects as subject}<option value={subject.id}>{subject.name} · {Math.round(subject.grade)}%</option>{/each}
        </select></label>
        <div class="study-target"><span>WEEKLY STUDY TARGET</span><strong>{plannedStudyPoints.toFixed(2).replace(/\.00$/, '')} / {enrollment.weeklyStudyTarget} pts</strong><div class="study-target-track"><i style:width={studyTargetProgress + '%'}></i></div></div>
      </div>
      <div class="education-task-grid">
        {#each (['study', 'assignment', 'exam'] as EducationTaskType[]) as task}
          <button class="education-task-card" class:planned={taskPlanned(task)} onclick={() => planTask(task)}>
            <span class="education-task-icon">{task === 'study' ? '✦' : task === 'assignment' ? '▤' : '✓'}</span>
            <strong>{taskTitle(task)}</strong>
            <ActivityStatusSeal status={taskPlanned(task) ? 'planned' : 'available'} />
            <small>{taskDescription(task)}</small>
            <span class="task-focus">FOCUS · {taskFocus(task)}</span>
            <b>{taskPlanned(task) ? 'REMOVE FROM WEEK' : 'ADD · ' + (task === 'assignment' ? '1.25' : task === 'exam' ? '1.6' : '1') + ' PTS · ' + getActivityStaminaCost('study') + ' STAMINA'}</b>
          </button>
        {/each}
      </div>
      <div class="study-outcome-note">Each planned task uses {getActivityStaminaCost('study')} stamina and adds 1 point to its focused subject grade, on top of the weekly academic result. The final change also reflects attendance, workload and fatigue.</div>
    </div>
    <div class="education-footnote">Attendance is handled automatically. Your weekly review previews the expected grade and subject changes before you advance.</div>
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

<style lang="scss">
  .education-nav {
    display:flex;
    align-items:center;
    gap:6px;
    min-width:0;
    overflow-x:auto;
    overscroll-behavior-inline:contain;
    -webkit-overflow-scrolling:touch;
    padding:2px 0 8px;
    scrollbar-width:thin;
    scrollbar-color:var(--line-strong) transparent;
  }
  .education-nav button {
    flex:0 0 auto;
    min-height:44px;
    padding:0 13px;
    border:1px solid var(--line);
    border-radius:10px;
    background:var(--surface);
    color:var(--muted);
    font-size:11px;
    font-weight:650;
    white-space:nowrap;
    transition:color .18s,background .18s,border-color .18s;
  }
  .education-nav button:hover {
    border-color:var(--line-strong);
    color:var(--text);
  }
  .education-nav button.active {
    border-color:color-mix(in srgb,var(--accent) 50%,transparent);
    background:var(--accent-soft);
    color:var(--accent);
  }
  .education-nav button:focus-visible {
    outline:2px solid var(--accent);
    outline-offset:2px;
  }
  .education-study-planner{display:grid;gap:11px}
  .study-focus-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(130px,.8fr);gap:10px;align-items:end;padding:11px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
  .study-focus-select{display:grid;gap:6px;color:var(--muted);font-size:10px;font-weight:700}
  .study-focus-select select{width:100%;min-width:0;min-height:40px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--text);font:inherit}
  .study-target{display:grid;gap:5px}
  .study-target>span{color:var(--muted);font-size:8px;font-weight:800;letter-spacing:.5px}
  .study-target strong{color:var(--text);font-size:12px;font-variant-numeric:tabular-nums}
  .study-target-track{height:5px;overflow:hidden;border-radius:99px;background:var(--line)}
  .study-target-track i{display:block;height:100%;border-radius:inherit;background:var(--accent);transition:width .2s}
  .task-focus{color:var(--accent);font-size:8px;font-weight:800;letter-spacing:.4px}
  .study-outcome-note{padding:9px 11px;border-left:2px solid var(--accent);background:var(--surface);color:var(--muted);font-size:9px;line-height:1.5}
  @media(max-width:420px){.study-focus-row{grid-template-columns:1fr}.study-target{grid-template-columns:1fr auto;align-items:center}.study-target-track{grid-column:1/-1}}
  @media(max-width:620px) {
    .education-nav { padding-bottom:7px; }
    .education-nav button {
      min-height:44px;
      padding:0 11px;
      font-size:10px;
    }
  }
</style>
