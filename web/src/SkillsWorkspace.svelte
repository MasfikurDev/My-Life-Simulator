<script lang="ts">
  import type { Character } from './lib/types';
  import UiProgress from './components/UiProgress.svelte';
  import { SKILL_CONTENT, type SkillGroup } from './lib/skill-content';
  import { SKILL_ACQUISITION_CONTENT } from './lib/skill-acquisition';
  import { CAREER_ROLES } from './lib/career-content';
  import { getSkillLevel } from './lib/skills';

  let { character, projectedCharacter = character }: { character: Character; projectedCharacter?: Character } = $props();
  let selectedGroup = $state<SkillGroup | 'all'>('all');

  const groupLabels: Record<SkillGroup, string> = {
    core: 'Core', academic: 'Academic', technical: 'Technical', practical: 'Practical',
    business: 'Business', professional: 'Professional', care: 'Care', creative: 'Creative', physical: 'Physical'
  };
  const groupOrder: SkillGroup[] = ['core','academic','technical','practical','business','professional','care','creative','physical'];

  function getSkillSources(skillId: string): string[] {
    const sources: string[] = [];
    const fields = [...SKILL_CONTENT.educationFieldSkills.entries()].filter(([, id]) => id === skillId).map(([field]) => field);
    const subjects = [...SKILL_CONTENT.educationSubjectSkills.entries()].filter(([, id]) => id === skillId).map(([subject]) => subject);
    const roles = CAREER_ROLES.filter((role) => role.skillId === skillId).map((role) => role.title);
    const careerPaths = [...SKILL_CONTENT.careerPathSkills.entries()].filter(([, id]) => id === skillId).map(([path]) => path.replaceAll('-', ' '));

    if (fields.length) sources.push('Education fields: ' + fields.slice(0, 3).join(', ') + (fields.length > 3 ? ' +' + (fields.length - 3) : ''));
    if (subjects.length) sources.push('Lessons: ' + subjects.join(', '));
    if (roles.length) sources.push('Career roles: ' + roles.join(', '));
    if (careerPaths.length) sources.push('Career path: ' + careerPaths.join(', '));

    const hasCareerSource = roles.length > 0 || careerPaths.length > 0 || skillId === 'professional-practice';
    for (const rule of SKILL_ACQUISITION_CONTENT.rules) {
      if (rule.target.kind === 'skill' && rule.target.skillId === skillId) {
        const key = rule.source + ':' + rule.action;
        const labels: Record<string, string> = {
          'activity:exercise': 'Exercise', 'activity:socialize': 'Social activities',
          'social:spend-time': 'Social connections', 'family:spend-time': 'Family time',
          'family:reach-out': 'Family outreach', 'family:reconcile': 'Resolving family conflict',
          'business:start': 'Starting a business', 'business:manage': 'Business management',
          'work:interview': 'Job interviews'
        };
        if (labels[key] && !sources.includes(labels[key])) sources.push(labels[key]);
      } else if (rule.target.kind === 'education-field' && fields.length && !sources.includes('Study and academic tasks')) {
        sources.push('Study and academic tasks');
      } else if (rule.target.kind === 'education-subject' && subjects.length && !sources.includes('Focused subject practice')) {
        sources.push('Focused subject practice');
      } else if (rule.target.kind === 'career-role' && hasCareerSource && !sources.includes('Work and career development')) {
        sources.push('Work and career development');
      }
    }
    return sources.slice(0, 4);
  }

  const skillRows = $derived(SKILL_CONTENT.skills
    .filter((skill) => getSkillSources(skill.id).length > 0)
    .map((skill) => ({
      ...skill,
      level: getSkillLevel(character, skill.id),
      projectedLevel: getSkillLevel(projectedCharacter, skill.id),
      developed: character.skills?.[skill.id] !== undefined,
      sources: getSkillSources(skill.id)
    }))
    .filter((skill) => selectedGroup === 'all' || skill.group === selectedGroup)
    .sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) || a.label.localeCompare(b.label)));
  const availableGroups = $derived(groupOrder.filter((group) => skillRows.some((skill) => skill.group === group)));
</script>

<div class="page-heading skills-heading">
  <div>
    <div class="eyebrow">CAPABILITIES & EXPERIENCE</div>
    <h1>Skills</h1>
    <p>Abilities grow through study, work and the experiences you choose.</p>
  </div>
  <label class="skills-filter-label">
    <span>Category</span>
    <select bind:value={selectedGroup} aria-label="Filter skills by category">
      <option value="all">All skills</option>
      {#each availableGroups as group}
        <option value={group}>{groupLabels[group]}</option>
      {/each}
    </select>
  </label>
</div>

<div class="skills-guidance domain-panel">
  <strong>How skill levels work</strong>
  <span>Untrained skills begin from relevant character abilities. Practice creates lasting skill progress. High stress or low stamina slows development.</span>
</div>

<div class="skills-grid">
  {#each skillRows as skill}
    <article class="skill-card domain-panel">
      <div class="skill-card-top">
        <div class="skill-title">
          <span class="skill-category">{groupLabels[skill.group]}</span>
          <h2>{skill.label}</h2>
        </div>
        <div class="skill-value">
          <strong>{skill.level}%</strong>
          {#if skill.projectedLevel !== skill.level}
            <small class:positive={skill.projectedLevel > skill.level} class:negative={skill.projectedLevel < skill.level}>→ {skill.projectedLevel}%</small>
          {:else}
            <small>{skill.developed ? 'DEVELOPED' : 'STARTING LEVEL'}</small>
          {/if}
        </div>
      </div>
      <UiProgress label={skill.label} value={skill.level} previewValue={skill.projectedLevel} tone="neutral" previewTone={skill.projectedLevel >= skill.level ? 'success' : 'danger'} size="small" showLabel={false} />
      <p class="skill-description">{skill.description}</p>
      <p class="skill-effect"><strong>Gameplay effect:</strong> {skill.effect}</p>
      <div class="skill-sources">
        <span>Develop through</span>
        <div>{#each skill.sources as source}<small>{source}</small>{/each}</div>
      </div>
    </article>
  {/each}
</div>

<style lang="scss">
  .skills-heading{align-items:flex-end;gap:14px}
  .skills-filter-label{display:grid;gap:5px;min-width:116px;color:var(--subtle);font-size:10px;font-weight:750}
  .skills-filter-label select{min-height:36px;padding:0 28px 0 10px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--text);font:inherit;font-size:12px}
  .skills-guidance{display:grid;gap:4px;padding:12px 14px}
  .skills-guidance strong{font-size:12px}
  .skills-guidance span{color:var(--muted);font-size:11px;line-height:1.45}
  .skills-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .skill-card{display:grid;gap:9px;min-width:0;padding:13px}
  .skill-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
  .skill-title{display:grid;gap:3px;min-width:0}
  .skill-title h2{margin:0;font-size:14px;font-weight:760;overflow-wrap:anywhere}
  .skill-category{color:var(--subtle);font-size:9px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}
  .skill-value{display:grid;justify-items:end;gap:1px;flex:0 0 auto;font-variant-numeric:tabular-nums}
  .skill-value strong{font-size:16px}
  .skill-value small{font-size:8px;font-weight:800;letter-spacing:.45px;color:var(--subtle)}
  .skill-value small.positive{color:var(--success)}
  .skill-value small.negative{color:var(--danger)}
  .skill-description,.skill-effect{margin:0;color:var(--muted);font-size:10px;line-height:1.45}
  .skill-effect strong{color:var(--text);font-weight:700}
  .skill-sources{display:grid;gap:4px;padding-top:7px;border-top:1px solid var(--line)}
  .skill-sources>span{font-size:9px;color:var(--subtle);font-weight:800;text-transform:uppercase;letter-spacing:.6px}
  .skill-sources>div{display:flex;flex-wrap:wrap;gap:4px}
  .skill-sources small{padding:3px 6px;border:1px solid var(--line);border-radius:6px;color:var(--muted);font-size:9px;line-height:1.2}
  @media(max-width:620px){.skills-heading{align-items:flex-start}.skills-filter-label{min-width:104px}.skills-grid{grid-template-columns:1fr}}
</style>
