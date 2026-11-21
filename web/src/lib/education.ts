import type { AcademicResult, Character, EducationEnrollment, EducationLevel, EducationRecord, EducationTaskType, Qualification } from './types';
import { applySkillAcquisition, getEducationSkillId, getSkillLevel } from './skills';
import { EDUCATION_PROGRAMS as educationPrograms } from './education-content';
import type { EducationProgramDefinition } from './education-content';

export interface EducationTaskSelection { taskType: EducationTaskType; subjectId?: string; }

export type EducationProgram = EducationProgramDefinition;
export { EDUCATION_PROGRAMS } from './education-content';



function completedLevels(character: Character): Set<EducationLevel> {
  return new Set((character.educationRecords ?? []).filter((record) => record.status === 'completed').map((record) => record.level));
}
export interface EducationProgramAvailability { available: boolean; reason: string; }

export function getEducationProgramAvailability(character: Character, program: EducationProgram): EducationProgramAvailability {
  if (!program.enabled) return { available: false, reason: 'This programme is not currently offered.' };
  if (character.age < program.minAge) return { available: false, reason: `Available from age ${program.minAge}.` };
  if (character.age > program.maxAge) return { available: false, reason: 'This programme is no longer age-eligible.' };
  if (program.minIntelligence !== undefined && character.intelligence < program.minIntelligence) return { available: false, reason: `Intelligence ${program.minIntelligence} required.` };
  if (program.minFocus !== undefined && (character.focus ?? 50) < program.minFocus) return { available: false, reason: `Focus ${program.minFocus} required.` };
  if (program.minDiscipline !== undefined && (character.discipline ?? 50) < program.minDiscipline) return { available: false, reason: `Discipline ${program.minDiscipline} required.` };
  if (program.prerequisite && !completedLevels(character).has(program.prerequisite) &&
      !(program.prerequisiteMinAge !== undefined && character.age >= program.prerequisiteMinAge)) {
    return { available: false, reason: `Complete ${program.prerequisite.replaceAll('-', ' ')} first.` };
  }
  return { available: true, reason: 'Entry requirements met.' };
}

export function getAvailableEducationPrograms(character: Character): EducationProgram[] {
  return educationPrograms.filter((program) => getEducationProgramAvailability(character, program).available);
}
export function getEducationProgram(programId: string): EducationProgram | undefined {
  return educationPrograms.find((program) => program.id === programId);
}
export function enrollInEducation(character: Character, programId: string, field: string): { character: Character; issue: string | null } {
  const program = getEducationProgram(programId);
  if (!program || !getAvailableEducationPrograms(character).some((item) => item.id === programId)) return { character, issue: 'This programme is not available at your current age or education level.' };
  if (!program.fieldOptions.includes(field)) return { character, issue: 'Choose a valid field of study.' };
  if (character.educationEnrollment) return { character, issue: 'Complete or leave your current programme before enrolling elsewhere.' };
  const scale = character.currencyScale ?? 1;
  const tuition = Math.round(program.tuition * scale);
  if (character.money < tuition) return { character, issue: 'You cannot afford the programme tuition right now.' };
  const id = program.id + '-' + (character.calendar?.currentDate ?? character.year + '-01-01');
  const enrollment: EducationEnrollment = {
    recordId: id, status: 'enrolled', programId, institution: program.institutionType, level: program.level, field, startedAtAge: character.age,
    tuitionPaid: tuition, weeksCompleted: 0, totalWeeks: program.durationWeeks, grade: 65, attendance: 100,
    subjects: program.subjects.map((name, index) => ({ id: 'subject-' + index, name: name.replace('{field}', field), grade: 65 }))
  };
  const record: EducationRecord = { id, level: program.level, institution: program.institutionType, field, startedAtAge: character.age, status: 'enrolled' };
  const next: Character = {
    ...character, money: character.money - tuition, educationEnrollment: enrollment,
    educationRecords: [...(character.educationRecords ?? []), record],
    financialTransactions: tuition > 0 ? [...(character.financialTransactions ?? []), {
      id: String(character.year) + '-' + String(character.age) + '-' + String((character.financialTransactions ?? []).length + 1),
      year: character.year, age: character.age, date: character.calendar?.currentDate, type: 'expense' as const, amount: tuition,
      description: 'Education tuition · ' + program.title, from: 'Cash', to: program.institutionType
    }].slice(-300) : character.financialTransactions,
    education: program.level === 'early-learning' ? 'Early learning' : program.level === 'primary' ? 'Primary education' : program.level === 'lower-secondary' || program.level === 'upper-secondary' ? 'Secondary education' : program.title
  };
  next.history = [{ id: 'education-enrol-' + id, age: next.age, year: next.year, date: next.calendar?.currentDate ?? next.year + '-01-01', kind: 'milestone', title: 'Enrolled in ' + program.title, description: 'Started ' + field + ' at ' + program.institutionType + '.', }, ...next.history];
  return { character: next, issue: null };
}

export function resumeEducation(character: Character): { character: Character; issue: string | null } {
  const enrollment = character.educationEnrollment;
  if (!enrollment || enrollment.status !== 'paused') return { character, issue: 'There is no paused programme to resume.' };
  const program = getEducationProgram(enrollment.programId);
  if (!program) return { character, issue: 'This programme is no longer available.' };
  return {
    character: {
      ...character,
      educationEnrollment: { ...enrollment, status: 'enrolled' },
      educationRecords: (character.educationRecords ?? []).map((record) => record.id === enrollment.recordId ? { ...record, status: 'enrolled' } : record),
    },
    issue: null
  };
}

export function pauseEducation(character: Character): Character {
  const enrollment = character.educationEnrollment;
  if (!enrollment || enrollment.status !== 'enrolled') return character;
  return {
    ...character,
    educationEnrollment: { ...enrollment, status: 'paused' },
    educationRecords: (character.educationRecords ?? []).map((record) => record.id === enrollment.recordId ? { ...record, status: 'paused' } : record),
    weeklyPlan: { ...character.weeklyPlan, activities: character.weeklyPlan.activities.filter((item) => item.action.kind !== 'education') }
  };
}

export function resolveEducationWeek(character: Character, tasks: Array<EducationTaskType | EducationTaskSelection>, weekStart: string, workload: number): { character: Character; recap: string[] } {
  const enrollment = character.educationEnrollment;
  if (!enrollment || enrollment.status !== 'enrolled') return { character, recap: [] };
  const selections = tasks.map((task) => typeof task === 'string' ? { taskType: task } : task);
  let skilledCharacter = character;
  for (const selection of selections) {
    skilledCharacter = applySkillAcquisition(skilledCharacter, 'education-task', selection.taskType, { field: enrollment.field });
    const subjectName = enrollment.subjects.find((subject) => subject.id === selection.subjectId)?.name;
    if (subjectName) skilledCharacter = applySkillAcquisition(skilledCharacter, 'education-subject', selection.taskType, { subject: subjectName, field: enrollment.field });
  }
  const stress = character.stress ?? 30;
  const fatiguePenalty = Math.max(0, Math.floor((stress - 55) / 12)) + ((character.stamina ?? 50) < 25 ? 2 : 0);
  const attendance = character.health < 25 || stress > 90 ? 65 : character.health < 45 || stress > 78 ? 82 : 100;
  const attendanceGap = attendance < 90 ? 3 : 0;
  const workloadPenalty = workload >= 17 ? 3 : workload >= 14 ? 1 : 0;
  // Attendance and sustainable workload affect course standing. Optional study tasks
  // improve the selected subject; there is no weekly quota or missed-task penalty.
  const change = -fatiguePenalty - workloadPenalty - attendanceGap;
  const fieldSkillLevel = getSkillLevel(character, getEducationSkillId(enrollment.field));
  const learningBonus = selections.length ? Math.max(-1, Math.min(2, Math.floor((fieldSkillLevel - 40) / 25))) : 0;
  const focusedSelections = selections.filter((task) => enrollment.subjects.some((subject) => subject.id === task.subjectId));
  const hasSubjectFocus = focusedSelections.length > 0;
  const subjects = enrollment.subjects.map((subject, index) => {
    const focusBonus = hasSubjectFocus
      ? focusedSelections.filter((task) => task.subjectId === subject.id).length
      : selections.length && index === enrollment.weeksCompleted % enrollment.subjects.length ? 1 : 0;
    return { ...subject, grade: Math.max(0, Math.min(100, subject.grade + change + focusBonus + (focusBonus ? learningBonus : 0))) };
  });
  // Overall course grade is derived from actual subject results, not a separate quota score.
  const grade = subjects.reduce((total, subject) => total + subject.grade, 0) / Math.max(1, subjects.length);
  const nextEnrollment: EducationEnrollment = { ...enrollment, grade, subjects, attendance: Math.max(0, Math.round((enrollment.attendance * enrollment.weeksCompleted + attendance) / (enrollment.weeksCompleted + 1))), weeksCompleted: enrollment.weeksCompleted + 1 };
  const recap = [
    'Education: classes and course progress updated.',
    ...(selections.length ? ['Education: ' + selections.length + ' academic task' + (selections.length === 1 ? '' : 's') + ' completed.'] : []),
    ...(attendance < 90 ? ['Education: health and pressure affected attendance.'] : [])
  ];
  if (nextEnrollment.weeksCompleted >= nextEnrollment.totalWeeks) {
    const outcome: AcademicResult['outcome'] = grade >= 60 && nextEnrollment.attendance >= 70 ? 'completed' : 'failed';
    const result: AcademicResult = { programId: enrollment.programId, institution: enrollment.institution, level: enrollment.level, field: enrollment.field, grade, completedAtAge: character.age, outcome };
    const records = (character.educationRecords ?? []).map((record) => record.status === 'enrolled' && record.level === enrollment.level
      ? { ...record, status: outcome === 'completed' ? 'completed' as const : 'withdrawn' as const, completedAtAge: outcome === 'completed' ? character.age : undefined }
      : record);
    let qualifications: Qualification[] = [...(character.qualifications ?? [])];
    if (outcome === 'completed' && !['early-learning', 'primary', 'lower-secondary', 'upper-secondary'].includes(enrollment.level)) qualifications.push({
      id: 'qualification-' + enrollment.programId + '-' + (character.calendar?.currentDate ?? weekStart), programId: enrollment.programId,
      name: getEducationProgram(enrollment.programId)?.title ?? enrollment.level,
      category: enrollment.level === 'vocational' ? 'diploma' : enrollment.programId === 'professional-certificate' ? 'certificate' : enrollment.level === 'professional-specialist' ? 'professional' : 'degree',
      issuer: enrollment.institution, field: enrollment.field, awardedAtAge: character.age
    });
    const next: Character = { ...skilledCharacter, educationEnrollment: null, educationRecords: records, academicHistory: [...(character.academicHistory ?? []), result], qualifications };
    next.history = [{ id: 'education-result-' + result.programId + '-' + next.year + '-' + next.academicHistory!.length, age: next.age, year: next.year, date: next.calendar?.currentDate ?? weekStart, kind: 'milestone', title: outcome === 'completed' ? 'Completed ' + result.level + ' education' : 'Did not complete ' + result.level + ' education', description: 'Final grade: ' + grade + '%. ' + (outcome === 'completed' ? 'A qualification was awarded.' : 'The programme was not passed; a future retake or alternative route remains possible.'), }, ...next.history];
    recap.push(outcome === 'completed' ? 'Education programme completed and qualification awarded.' : 'Education programme ended without a passing grade.');
    return { character: next, recap };
  }
  return { character: { ...skilledCharacter, educationEnrollment: nextEnrollment }, recap };
}
