import { describe, expect, it } from 'vitest';
import { createCharacter } from './simulation';
import { enrollInEducation, resolveEducationWeek } from './education';
import { getEducationTree } from './education-tree';

describe('education progression tree', () => {
  it('projects age-eligible programmes as available and future routes as locked', () => {
    const child = createCharacter('Student', 10);
    const tree = getEducationTree(child);
    expect(tree.nodes.find((node) => node.id === 'primary-school')?.status).toBe('available');
    expect(tree.nodes.find((node) => node.id === 'bachelor-degree')?.status).toBe('locked');
  });

  it('keeps early development and preschool as optional routes', () => {
    const tree = getEducationTree(createCharacter('Student', 10));
    expect(tree.nodes.find((node) => node.id === 'primary-school')?.status).toBe('available');
    expect(tree.edges.find((edge) => edge.from === 'early-development' && edge.to === 'early-learning')?.style).toBe('alternative');
    expect(tree.edges.find((edge) => edge.from === 'early-learning' && edge.to === 'primary-school')?.style).toBe('alternative');
    expect(tree.edges.some((edge) => edge.to === 'primary-school' && edge.style === 'required')).toBe(false);
  });

  it('shows current enrollment progress and its actual subjects', () => {
    const enrolled = enrollInEducation(createCharacter('Student', 16), 'upper-secondary', 'Science').character;
    const character = {
      ...enrolled,
      educationEnrollment: {
        ...enrolled.educationEnrollment!,
        weeksCompleted: 30,
        subjects: enrolled.educationEnrollment!.subjects.map((subject, index) => ({ ...subject, grade: 72 + index }))
      }
    };
    const tree = getEducationTree(character);
    const programme = tree.nodes.find((node) => node.id === 'upper-secondary');
    expect(programme?.status).toBe('current');
    expect(programme?.progress).toBe(25);
    expect(tree.subjects).toHaveLength(3);
    expect(tree.subjects.find((subject) => subject.id === 'subject-0')?.grade).toBe(72);
  });

  it('marks an earned professional credential as completed without replacing its source record', () => {
    const capable = { ...createCharacter('Adult', 25), intelligence: 85, focus: 85, discipline: 85, health: 90 };
    const enrolled = enrollInEducation(capable, 'professional-certificate', 'Programming').character;
    const completed = resolveEducationWeek({
      ...enrolled,
      educationEnrollment: { ...enrolled.educationEnrollment!, totalWeeks: 1, grade: 90, attendance: 100 }
    }, ['study', 'assignment', 'exam'], '2026-11-02', 0).character;
    const tree = getEducationTree(completed);
    expect(tree.nodes.find((node) => node.id === 'professional-certificate')?.status).toBe('completed');
    expect(completed.qualifications?.some((item) => item.programId === 'professional-certificate')).toBe(true);
  });

  it('keeps parallel education routes distinct instead of forcing every credential into one chain', () => {
    const tree = getEducationTree(createCharacter('Adult', 30));
    expect(tree.edges).toContainEqual({ from: 'upper-secondary', to: 'bachelor-degree', style: 'required' });
    expect(tree.edges).toContainEqual({ from: 'bachelor-degree', to: 'masters-degree', style: 'required' });
    expect(tree.edges.find((edge) => edge.to === 'professional-certificate')?.style).toBe('alternative');
    expect(tree.edges.some((edge) => edge.to === 'professional-certificate' && edge.style === 'required')).toBe(false);
  });
});
