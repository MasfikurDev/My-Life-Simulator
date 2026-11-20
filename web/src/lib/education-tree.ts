import type { Character, EducationLevel } from './types';
import { EDUCATION_PROGRAMS, getAvailableEducationPrograms, type EducationProgram } from './education';

export type EducationTreeStatus = 'completed' | 'current' | 'available' | 'locked';
export type EducationTreeNodeKind = 'programme';

export interface EducationTreeNode {
  id: string;
  kind: EducationTreeNodeKind;
  title: string;
  subtitle: string;
  status: EducationTreeStatus;
  progress: number;
  reason: string;
  programId?: string;
  field?: string;
  category?: string;
  durationWeeks?: number;
  tuition?: number;
  ageRange?: string;
  x: number;
  y: number;
}

export interface EducationTreeEdge {
  from: string;
  to: string;
  style: 'required' | 'alternative' | 'independent';
}

export interface EducationTreeSubject { id: string; title: string; grade: number; programId: string; }

export interface EducationTree {
  nodes: EducationTreeNode[];
  edges: EducationTreeEdge[];
  subjects: EducationTreeSubject[];
}

const PROGRAM_POSITIONS: Record<string, { x: number; y: number }> = {
  'early-development': { x: 180, y: 100 },
  'early-learning': { x: 180, y: 215 },
  'primary-school': { x: 180, y: 330 },
  'lower-secondary': { x: 180, y: 445 },
  'upper-secondary': { x: 180, y: 560 },
  'vocational-diploma': { x: 65, y: 685 },
  'college-associate': { x: 180, y: 685 },
  'bachelor-degree': { x: 295, y: 685 },
  'professional-certificate': { x: 65, y: 925 },
  'professional-specialist': { x: 180, y: 810 },
  'masters-degree': { x: 295, y: 810 },
  'doctoral-degree': { x: 295, y: 925 }
};

const PROGRAM_EDGES: EducationTreeEdge[] = [
  { from: 'early-development', to: 'early-learning', style: 'alternative' },
  { from: 'early-learning', to: 'primary-school', style: 'alternative' },
  { from: 'primary-school', to: 'lower-secondary', style: 'required' },
  { from: 'lower-secondary', to: 'upper-secondary', style: 'required' },
  { from: 'upper-secondary', to: 'vocational-diploma', style: 'alternative' },
  { from: 'upper-secondary', to: 'professional-certificate', style: 'alternative' },
  { from: 'upper-secondary', to: 'college-associate', style: 'required' },
  { from: 'upper-secondary', to: 'bachelor-degree', style: 'required' },
  { from: 'bachelor-degree', to: 'professional-specialist', style: 'required' },
  { from: 'bachelor-degree', to: 'masters-degree', style: 'required' },
  { from: 'masters-degree', to: 'doctoral-degree', style: 'required' }
];

function hasCompletedProgram(character: Character, program: EducationProgram): boolean {
  if ((character.academicHistory ?? []).some((result) => result.programId === program.id && result.outcome === 'completed')) return true;
  if ((character.qualifications ?? []).some((qualification) => qualification.programId === program.id)) return true;
  return (character.educationRecords ?? []).some((record) =>
    record.status === 'completed' && record.level === program.level &&
    (record.id === program.id || record.id.startsWith(program.id + '-'))
  );
}

function lockedReason(character: Character, program: EducationProgram, completedLevels: Set<EducationLevel>): string {
  if (character.age < program.minAge) return `Available from age ${program.minAge}`;
  if (character.age > program.maxAge) return 'This programme is no longer age-eligible';
  if (program.minIntelligence && character.intelligence < program.minIntelligence) return `Intelligence ${program.minIntelligence} required`;
  if (program.minFocus && (character.focus ?? 50) < program.minFocus) return `Focus ${program.minFocus} required`;
  if (program.minDiscipline && (character.discipline ?? 50) < program.minDiscipline) return `Discipline ${program.minDiscipline} required`;
  if (program.prerequisite && !completedLevels.has(program.prerequisite)) {
    const ageFallback = program.prerequisite === 'primary' ? character.age >= 12
      : program.prerequisite === 'lower-secondary' ? character.age >= 15
      : program.prerequisite === 'upper-secondary' ? character.age >= 18 : false;
    if (!ageFallback) return `Complete ${program.prerequisite.replaceAll('-', ' ')} first`;
  }
  return 'Complete or leave your current programme first';
}

export function getEducationTree(character: Character): EducationTree {
  const available = new Set(getAvailableEducationPrograms(character).map((program) => program.id));
  const completedLevels = new Set((character.educationRecords ?? [])
    .filter((record) => record.status === 'completed').map((record) => record.level));
  const enrollment = character.educationEnrollment;
  const nodes: EducationTreeNode[] = EDUCATION_PROGRAMS.map((program) => {
    const completed = hasCompletedProgram(character, program);
    const currentEnrollment = enrollment?.programId === program.id ? enrollment : null;
    const current = currentEnrollment !== null;
    const isAvailable = available.has(program.id) && !enrollment;
    const position = PROGRAM_POSITIONS[program.id] ?? { x: 180, y: 1040 };
    const status: EducationTreeStatus = current ? 'current' : completed ? 'completed' : isAvailable ? 'available' : 'locked';
    const progress = currentEnrollment
      ? Math.min(100, Math.round(currentEnrollment.weeksCompleted / Math.max(1, currentEnrollment.totalWeeks) * 100))
      : completed ? 100 : 0;
    const reason = currentEnrollment ? currentEnrollment.status === 'paused' ? 'Programme paused · progress retained' : 'Currently enrolled'
      : completed ? 'Programme completed'
      : isAvailable ? 'Entry requirements met'
      : lockedReason(character, program, completedLevels);
    return {
      id: program.id,
      kind: 'programme',
      title: program.title,
      subtitle: program.institutionType,
      status,
      progress,
      reason,
      programId: program.id,
      category: program.level,
      field: currentEnrollment?.field,
      durationWeeks: program.durationWeeks,
      tuition: program.tuition,
      ageRange: program.maxAge < 120 ? `${program.minAge}–${program.maxAge}` : `${program.minAge}+`,
      ...position
    };
  });

  const edges = PROGRAM_EDGES.filter((edge) => nodes.some((node) => node.id === edge.from) && nodes.some((node) => node.id === edge.to));
  const subjects = enrollment?.subjects.map((subject) => ({ id: subject.id, title: subject.name, grade: Math.max(0, Math.min(100, Math.round(subject.grade))), programId: enrollment.programId })) ?? [];
  return { nodes, edges, subjects };
}
