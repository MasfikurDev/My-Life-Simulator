import type { Character, EducationLevel } from './types';
import { EDUCATION_PROGRAMS, getAvailableEducationPrograms, type EducationProgram } from './education';

export type EducationTreeStatus = 'completed' | 'current' | 'available' | 'locked';
export type EducationTreeNodeKind = 'programme' | 'subject';

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
  x: number;
  y: number;
}

export interface EducationTreeEdge {
  from: string;
  to: string;
  style: 'required' | 'alternative' | 'independent';
}

export interface EducationTree {
  nodes: EducationTreeNode[];
  edges: EducationTreeEdge[];
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
  'professional-certificate': { x: 65, y: 810 },
  'professional-specialist': { x: 180, y: 810 },
  'masters-degree': { x: 295, y: 810 },
  'doctoral-degree': { x: 295, y: 925 }
};

const PROGRAM_EDGES: EducationTreeEdge[] = [
  { from: 'early-development', to: 'early-learning', style: 'required' },
  { from: 'early-learning', to: 'primary-school', style: 'required' },
  { from: 'primary-school', to: 'lower-secondary', style: 'required' },
  { from: 'lower-secondary', to: 'upper-secondary', style: 'required' },
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
    const current = enrollment?.programId === program.id;
    const isAvailable = available.has(program.id) && !enrollment;
    const position = PROGRAM_POSITIONS[program.id] ?? { x: 180, y: 1040 };
    const status: EducationTreeStatus = completed ? 'completed' : current ? 'current' : isAvailable ? 'available' : 'locked';
    const progress = current
      ? Math.min(100, Math.round(enrollment.weeksCompleted / Math.max(1, enrollment.totalWeeks) * 100))
      : completed ? 100 : 0;
    const reason = completed ? 'Programme completed'
      : current ? enrollment.status === 'paused' ? 'Programme paused · progress retained' : 'Currently enrolled'
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
      field: current ? enrollment.field : undefined,
      ...position
    };
  });

  if (enrollment) {
    enrollment.subjects.forEach((subject, index) => {
      nodes.push({
        id: `subject:${subject.id}`,
        kind: 'subject',
        title: subject.name,
        subtitle: 'Current subject',
        status: 'current',
        progress: Math.max(0, Math.min(100, Math.round(subject.grade))),
        reason: `Current grade: ${Math.round(subject.grade)}%`,
        programId: enrollment.programId,
        field: enrollment.field,
        x: index === 0 ? 90 : index === 1 ? 180 : 270,
        y: 1040
      });
    });
  }

  const edges = PROGRAM_EDGES.filter((edge) => nodes.some((node) => node.id === edge.from) && nodes.some((node) => node.id === edge.to));
  if (enrollment?.subjects.length) {
    enrollment.subjects.forEach((subject) => edges.push({
      from: enrollment.programId,
      to: `subject:${subject.id}`,
      style: 'alternative'
    }));
  }
  return { nodes, edges };
}
