import type { Character, EducationLevel } from './types';
import {
  EDUCATION_PROGRAMS,
  getEducationProgramAvailability,
  getAvailableEducationPrograms,
  type EducationProgram
} from './education';

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

function hasCompletedProgram(character: Character, program: EducationProgram): boolean {
  if ((character.academicHistory ?? []).some((result) => result.programId === program.id && result.outcome === 'completed')) return true;
  if ((character.qualifications ?? []).some((qualification) => qualification.programId === program.id)) return true;
  return (character.educationRecords ?? []).some((record) =>
    record.status === 'completed' && record.level === program.level &&
    (record.id === program.id || record.id.startsWith(program.id + '-'))
  );
}

export function getEducationTree(character: Character): EducationTree {
  const programs = EDUCATION_PROGRAMS.filter((program) => program.enabled);
  const available = new Set(getAvailableEducationPrograms(character).map((program) => program.id));
  const enrollment = character.educationEnrollment;
  const nodes: EducationTreeNode[] = programs.map((program, index) => {
    const completed = hasCompletedProgram(character, program);
    const currentEnrollment = enrollment?.programId === program.id ? enrollment : null;
    const current = currentEnrollment !== null;
    const isAvailable = available.has(program.id) && !enrollment;
    const status: EducationTreeStatus = current ? 'current' : completed ? 'completed' : isAvailable ? 'available' : 'locked';
    const progress = currentEnrollment
      ? Math.min(100, Math.round(currentEnrollment.weeksCompleted / Math.max(1, currentEnrollment.totalWeeks) * 100))
      : completed ? 100 : 0;
    const availability = getEducationProgramAvailability(character, program);
    const reason = currentEnrollment ? currentEnrollment.status === 'paused' ? 'Programme paused · progress retained' : 'Currently enrolled'
      : completed ? 'Programme completed'
      : enrollment ? 'Complete or leave your current programme first'
      : availability.reason;
    // Catalogue order supplies a stable fallback layout; adding a programme needs no TypeScript coordinate entry.
    const column = index % 3;
    const row = Math.floor(index / 3);
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
      x: 65 + column * 115,
      y: 100 + row * 115
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: EducationTreeEdge[] = [];
  for (const program of programs) {
    if (program.prerequisite) {
      for (const source of programs.filter((candidate) => candidate.level === program.prerequisite)) {
        if (source.id !== program.id) edges.push({ from: source.id, to: program.id, style: 'required' });
      }
    }
    for (const connection of program.treeConnections ?? []) {
      if (nodeIds.has(connection.from)) edges.push({ from: connection.from, to: program.id, style: connection.style });
    }
  }
  const uniqueEdges = edges.filter((edge, index) =>
    nodeIds.has(edge.from) && nodeIds.has(edge.to) &&
    edges.findIndex((candidate) => candidate.from === edge.from && candidate.to === edge.to) === index
  );
  const subjects = enrollment?.subjects.map((subject) => ({
    id: subject.id,
    title: subject.name,
    grade: Math.max(0, Math.min(100, Math.round(subject.grade))),
    programId: enrollment.programId
  })) ?? [];
  return { nodes, edges: uniqueEdges, subjects };
}
