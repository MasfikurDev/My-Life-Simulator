import type { AcademicResult, Character, EducationEnrollment, EducationLevel, EducationRecord, EducationTaskType, Qualification, WeeklyCommitment, DayPeriod } from './types';
import { buildWeeklySchedule } from './weekly-schedule';
import { getWeekStart, getFirstWeekStartOfYear } from './calendar';

export interface EducationProgram {
  id: string;
  title: string;
  institutionType: string;
  level: EducationLevel;
  minAge: number;
  maxAge: number;
  durationWeeks: number;
  tuition: number;
  weeklyStudyTarget: number;
  fieldOptions: string[];
  prerequisite?: EducationLevel;
  minIntelligence?: number;
  minFocus?: number;
  minDiscipline?: number;
  schedule: Array<{ weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7; startPeriod: 'morning' | 'afternoon' | 'evening'; durationBlocks: number }>;
}

const weekdays = [1, 2, 3, 4, 5] as const;
const schoolSchedule = weekdays.map((weekday) => ({ weekday, startPeriod: 'morning' as const, durationBlocks: 2 }));
const collegeSchedule = ([1, 2, 3, 4] as const).map((weekday) => ({ weekday, startPeriod: 'morning' as const, durationBlocks: 2 }));
const flexibleSchedule = ([2, 4] as const).map((weekday) => ({ weekday, startPeriod: 'evening' as const, durationBlocks: 1 }));

export const EDUCATION_PROGRAMS: EducationProgram[] = [
  { id: 'early-development', title: 'Early development & guided play', institutionType: 'Family-led early development', level: 'early-learning', minAge: 0, maxAge: 2, durationWeeks: 104, tuition: 0, weeklyStudyTarget: 1, fieldOptions: ['Play & discovery', 'Language & stories', 'Movement & coordination'], schedule: ([1, 3, 5] as const).map((weekday) => ({ weekday, startPeriod: 'morning', durationBlocks: 1 })) },
  { id: 'early-learning', title: 'Early learning & preschool', institutionType: 'Preschool', level: 'early-learning', minAge: 3, maxAge: 5, durationWeeks: 32, tuition: 0, weeklyStudyTarget: 1, fieldOptions: ['Foundations'], schedule: ([1, 3, 5] as const).map((weekday) => ({ weekday, startPeriod: 'morning', durationBlocks: 1 })) },
  { id: 'primary-school', title: 'Primary school', institutionType: 'Public school', level: 'primary', minAge: 6, maxAge: 11, durationWeeks: 240, tuition: 0, weeklyStudyTarget: 2, fieldOptions: ['General studies'], schedule: schoolSchedule },
  { id: 'lower-secondary', title: 'Lower secondary school', institutionType: 'Secondary school', level: 'lower-secondary', minAge: 12, maxAge: 14, durationWeeks: 120, tuition: 0, weeklyStudyTarget: 2, fieldOptions: ['General studies', 'Science', 'Humanities', 'Business studies'], schedule: schoolSchedule, prerequisite: 'primary' },
  { id: 'upper-secondary', title: 'Upper secondary school', institutionType: 'Secondary school / college', level: 'upper-secondary', minAge: 15, maxAge: 19, durationWeeks: 120, tuition: 0, weeklyStudyTarget: 3, fieldOptions: ['Science', 'Humanities', 'Business studies', 'Arts'], schedule: schoolSchedule, prerequisite: 'lower-secondary' },
  { id: 'vocational-diploma', title: 'Vocational diploma', institutionType: 'Technical institute', level: 'vocational', minAge: 16, maxAge: 120, durationWeeks: 64, tuition: 360, weeklyStudyTarget: 2, fieldOptions: ['Electrical trades', 'Construction', 'Hospitality', 'Automotive', 'Information technology', 'Healthcare support'], minIntelligence: 35, minDiscipline: 35, schedule: collegeSchedule },
  { id: 'college-associate', title: 'College diploma / associate degree', institutionType: 'College', level: 'associate', minAge: 18, maxAge: 120, durationWeeks: 96, tuition: 620, weeklyStudyTarget: 3, fieldOptions: ['Business', 'Computing', 'Engineering', 'Health sciences', 'Arts'], minIntelligence: 45, minFocus: 40, schedule: collegeSchedule, prerequisite: 'upper-secondary' },
  { id: 'bachelor-degree', title: "Bachelor's degree", institutionType: 'University', level: 'bachelor', minAge: 18, maxAge: 120, durationWeeks: 160, tuition: 980, weeklyStudyTarget: 3, fieldOptions: ['Computer science', 'Engineering', 'Business', 'Medicine & health sciences', 'Law', 'Education', 'Natural sciences', 'Social sciences', 'Arts'], minIntelligence: 50, minFocus: 45, minDiscipline: 40, schedule: collegeSchedule, prerequisite: 'upper-secondary' },
  { id: 'masters-degree', title: "Master's degree", institutionType: 'University / graduate school', level: 'master', minAge: 21, maxAge: 120, durationWeeks: 80, tuition: 1250, weeklyStudyTarget: 3, fieldOptions: ['Computer science', 'Engineering', 'Business', 'Public health', 'Law', 'Education', 'Research sciences'], minIntelligence: 60, minFocus: 55, minDiscipline: 55, schedule: collegeSchedule, prerequisite: 'bachelor' },
  { id: 'doctoral-degree', title: 'Doctoral / PhD programme', institutionType: 'Graduate research school', level: 'doctorate', minAge: 24, maxAge: 120, durationWeeks: 160, tuition: 1600, weeklyStudyTarget: 3, fieldOptions: ['Computing research', 'Engineering research', 'Medical research', 'Business research', 'Natural sciences', 'Social sciences'], minIntelligence: 70, minFocus: 65, minDiscipline: 65, schedule: flexibleSchedule, prerequisite: 'master' },
  { id: 'professional-specialist', title: 'Professional specialist programme', institutionType: 'Professional institute', level: 'professional-specialist', minAge: 21, maxAge: 120, durationWeeks: 48, tuition: 840, weeklyStudyTarget: 2, fieldOptions: ['Project management', 'Cybersecurity', 'Accounting', 'Teaching', 'Clinical specialization', 'Data science'], minIntelligence: 55, minFocus: 50, minDiscipline: 50, schedule: flexibleSchedule, prerequisite: 'bachelor' },
  { id: 'professional-certificate', title: 'Professional certificate course', institutionType: 'Training provider', level: 'professional-specialist', minAge: 16, maxAge: 120, durationWeeks: 12, tuition: 240, weeklyStudyTarget: 2, fieldOptions: ['Digital skills', 'Programming', 'First aid', 'Workplace safety', 'Communication', 'Small business'], minFocus: 35, minDiscipline: 35, schedule: flexibleSchedule }
];

function completedLevels(character: Character): Set<EducationLevel> {
  return new Set((character.educationRecords ?? []).filter((record) => record.status === 'completed').map((record) => record.level));
}
export function getAvailableEducationPrograms(character: Character): EducationProgram[] {
  const completed = completedLevels(character);
  return EDUCATION_PROGRAMS.filter((program) => {
    if (character.age < program.minAge || character.age > program.maxAge) return false;
    if (program.minIntelligence && character.intelligence < program.minIntelligence) return false;
    if (program.minFocus && (character.focus ?? 50) < program.minFocus) return false;
    if (program.minDiscipline && (character.discipline ?? 50) < program.minDiscipline) return false;
    if (!program.prerequisite || completed.has(program.prerequisite)) return true;
    if (program.prerequisite === 'primary') return character.age >= 12;
    if (program.prerequisite === 'lower-secondary') return character.age >= 15;
    if (program.prerequisite === 'upper-secondary') return character.age >= 18;
    return false;
  });
}
export function getEducationProgram(programId: string): EducationProgram | undefined {
  return EDUCATION_PROGRAMS.find((program) => program.id === programId);
}
function createClassCommitments(character: Character, program: EducationProgram, recordId: string): { commitments: WeeklyCommitment[]; issue: string | null } {
  const schedule = character.weeklySchedule ?? { version: 1 as const, commitments: [], activities: [] };
  const baseSchedule = { ...schedule, commitments: schedule.commitments.filter((item) => item.domain !== 'school') };
  const weekStart = getWeekStart(character.calendar?.currentDate ?? getFirstWeekStartOfYear(character.year));
  const preferred = character.employment?.type === 'full-time'
    ? program.schedule.slice(0, Math.min(2, program.schedule.length)).map((slot) => ({ ...slot, startPeriod: 'evening' as const, durationBlocks: 1 }))
    : program.schedule;
  const candidates: Array<{ weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7; startPeriod: DayPeriod; durationBlocks: number }> = [];
  for (const slot of [...preferred, ...program.schedule]) {
    for (const period of [slot.startPeriod, 'afternoon', 'evening', 'morning'] as DayPeriod[]) {
      const candidate = { weekday: slot.weekday, startPeriod: period, durationBlocks: Math.min(slot.durationBlocks, 1) };
      if (!candidates.some((item) => item.weekday === candidate.weekday && item.startPeriod === candidate.startPeriod)) candidates.push(candidate);
    }
  }
  const commitments: WeeklyCommitment[] = [];
  for (const slot of candidates) {
    if (commitments.length >= preferred.length) break;
    if (commitments.some((item) => item.weekday === slot.weekday)) continue;
    const candidate: WeeklyCommitment = {
      id: 'education-' + recordId + '-' + commitments.length,
      title: program.level === 'early-learning' ? 'Early learning' : 'Classes · ' + program.institutionType,
      domain: 'school', ...slot
    };
    const trial = { ...baseSchedule, commitments: [...baseSchedule.commitments, ...commitments, candidate] };
    if (buildWeeklySchedule(weekStart, trial).valid) commitments.push(candidate);
  }
  if (commitments.length < Math.min(preferred.length, 2)) return { commitments: [], issue: 'There is not enough free time for this programme alongside current commitments. Reduce other commitments or choose a more flexible course.' };
  return { commitments, issue: null };
}

export function enrollInEducation(character: Character, programId: string, field: string): { character: Character; issue: string | null } {
  const program = getEducationProgram(programId);
  if (!program || !getAvailableEducationPrograms(character).some((item) => item.id === programId)) return { character, issue: 'This programme is not available at your current age or education level.' };
  if (!program.fieldOptions.includes(field)) return { character, issue: 'Choose a valid field of study.' };
  if (character.educationEnrollment) return { character, issue: 'Complete, pause or leave your current programme before enrolling elsewhere.' };
  const scale = character.currencyScale ?? 1;
  const tuition = Math.round(program.tuition * scale);
  if (character.money < tuition) return { character, issue: 'You cannot afford the programme tuition right now.' };
  const id = program.id + '-' + (character.calendar?.currentDate ?? character.year + '-01-01');
  const planned = createClassCommitments(character, program, id);
  if (planned.issue) return { character, issue: planned.issue };
  const enrollment: EducationEnrollment = {
    recordId: id, status: 'enrolled', programId, institution: program.institutionType, level: program.level, field, startedAtAge: character.age,
    tuitionPaid: tuition, weeksCompleted: 0, totalWeeks: program.durationWeeks, grade: 65, attendance: 100,
    weeklyStudyTarget: program.weeklyStudyTarget,
    subjects: (program.id === 'early-development' ? ['Language & stories', 'Movement', 'Play & discovery'] : program.level === 'primary' || program.level === 'early-learning' ? ['Literacy', 'Numeracy', 'Discovery'] :
      program.level === 'lower-secondary' || program.level === 'upper-secondary' ? ['Core studies', field, 'Communication'] :
      ['Core theory', field, 'Practical work']).map((name, index) => ({ id: 'subject-' + index, name, grade: 65 }))
  };
  const record: EducationRecord = { id, level: program.level, institution: program.institutionType, field, startedAtAge: character.age, status: 'enrolled' };
  const schedule = character.weeklySchedule ?? { version: 1 as const, commitments: [], activities: [] };
  const next: Character = {
    ...character, money: character.money - tuition, educationEnrollment: enrollment,
    educationRecords: [...(character.educationRecords ?? []), record],
    weeklySchedule: { ...schedule, commitments: [...schedule.commitments.filter((item) => item.domain !== 'school'), ...planned.commitments] },
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
  const planned = createClassCommitments(character, program, enrollment.recordId);
  if (planned.issue) return { character, issue: planned.issue };
  const schedule = character.weeklySchedule ?? { version: 1 as const, commitments: [], activities: [] };
  return {
    character: {
      ...character,
      educationEnrollment: { ...enrollment, status: 'enrolled' },
      educationRecords: (character.educationRecords ?? []).map((record) => record.id === enrollment.recordId ? { ...record, status: 'enrolled' } : record),
      weeklySchedule: { ...schedule, commitments: [...schedule.commitments.filter((item) => item.domain !== 'school'), ...planned.commitments] }
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
    weeklySchedule: { ...(character.weeklySchedule ?? { version: 1 as const, commitments: [], activities: [] }), commitments: (character.weeklySchedule?.commitments ?? []).filter((item) => item.domain !== 'school') }
  };
}

export function resolveEducationWeek(character: Character, tasks: EducationTaskType[], weekStart: string, workload: number): { character: Character; recap: string[] } {
  const enrollment = character.educationEnrollment;
  if (!enrollment || enrollment.status !== 'enrolled') return { character, recap: [] };
  const taskScore = tasks.reduce((score, task) => score + (task === 'assignment' ? 1.25 : task === 'exam' ? 1.6 : 1), 0);
  const stress = character.stress ?? 30;
  const fatiguePenalty = Math.max(0, Math.floor((stress - 55) / 12)) + ((character.stamina ?? 50) < 25 ? 2 : 0);
  const expected = enrollment.weeklyStudyTarget;
  const attendance = character.health < 25 || stress > 90 ? 65 : character.health < 45 || stress > 78 ? 82 : 100;
  const attendanceGap = attendance < 90 ? 3 : 0;
  const missedPenalty = taskScore < expected ? Math.ceil((expected - taskScore) * 2) : 0;
  const workloadPenalty = workload >= 17 ? 3 : workload >= 14 ? 1 : 0;
  const improvement = taskScore >= expected ? Math.min(5, Math.floor(taskScore - expected) + 2) : 0;
  const change = improvement - missedPenalty - fatiguePenalty - workloadPenalty - attendanceGap;
  const grade = Math.max(0, Math.min(100, enrollment.grade + change));
  const subjects = enrollment.subjects.map((subject, index) => ({
    ...subject,
    grade: Math.max(0, Math.min(100, subject.grade + change + (tasks.length && index === enrollment.weeksCompleted % enrollment.subjects.length ? 1 : 0)))
  }));
  const nextEnrollment: EducationEnrollment = { ...enrollment, grade, subjects, attendance: Math.max(0, Math.round((enrollment.attendance * enrollment.weeksCompleted + attendance) / (enrollment.weeksCompleted + 1))), weeksCompleted: enrollment.weeksCompleted + 1 };
  const recap = [taskScore >= expected ? 'Education: weekly learning target met.' : 'Education: missed learning work lowered academic progress.', ...(attendance < 90 ? ['Education: health and pressure affected attendance.'] : [])];
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
      category: enrollment.level === 'vocational' ? 'diploma' : enrollment.level === 'professional-specialist' ? 'professional' : 'degree',
      issuer: enrollment.institution, field: enrollment.field, awardedAtAge: character.age
    });
    const next: Character = { ...character, educationEnrollment: null, educationRecords: records, academicHistory: [...(character.academicHistory ?? []), result], qualifications, weeklySchedule: { ...(character.weeklySchedule ?? { version: 1 as const, commitments: [], activities: [] }), commitments: (character.weeklySchedule?.commitments ?? []).filter((item) => item.domain !== 'school') } };
    next.history = [{ id: 'education-result-' + result.programId + '-' + next.year + '-' + next.academicHistory!.length, age: next.age, year: next.year, date: next.calendar?.currentDate ?? weekStart, kind: 'milestone', title: outcome === 'completed' ? 'Completed ' + result.level + ' education' : 'Did not complete ' + result.level + ' education', description: 'Final grade: ' + grade + '%. ' + (outcome === 'completed' ? 'A qualification was awarded.' : 'The programme was not passed; a future retake or alternative route remains possible.'), }, ...next.history];
    recap.push(outcome === 'completed' ? 'Education programme completed and qualification awarded.' : 'Education programme ended without a passing grade.');
    return { character: next, recap };
  }
  return { character: { ...character, educationEnrollment: nextEnrollment }, recap };
}
