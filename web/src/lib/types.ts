export type ActivityId = 'study' | 'exercise' | 'socialize' | 'work' | 'apply-job' | 'career';
export type Gender = 'male' | 'female' | 'non-binary';
export type EmploymentType = 'part-time' | 'full-time' | 'flexible';
export interface Employment {
  title: string;
  type: EmploymentType;
  annualSalary: number;
  experienceYears: number;
  performance: number;
  promotions: number;
  startedAtAge: number;
}
export interface LifeEvent { id: string; year: number; age: number; title: string; description: string; kind: 'milestone' | 'activity' | 'event'; }
export interface Character {
  name: string; age: number; year: number; health: number; happiness: number;
  intelligence: number; fitness: number; money: number; actionsRemaining: number;
  gender?: Gender; nationality?: string; country?: string; birthplace?: string; language?: string; currency?: string;
  currencyScale?: number; familyBackground?: string; personality?: string[]; education?: string;
  educationProgress?: number; employment?: Employment | null;
  lastYearIncome?: number; lastYearExpenses?: number;
  appearance?: { height: string; build: string; hair: string; eyes: string };
  history: LifeEvent[];
}
export type SaveSlotId = 'slot-1' | 'slot-2' | 'slot-3';
export interface SaveSlot { id: SaveSlotId; character: Character | null; updatedAt: number | null; }
export interface SaveData { schemaVersion: number; activeSlotId: SaveSlotId; slots: SaveSlot[]; }
