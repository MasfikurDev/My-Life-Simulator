export type ActivityId = 'study' | 'exercise' | 'socialize' | 'work';
export type Gender = 'male' | 'female' | 'non-binary';
export interface LifeEvent { id: string; year: number; age: number; title: string; description: string; kind: 'milestone' | 'activity' | 'event'; }
export interface Character {
  name: string; age: number; year: number; health: number; happiness: number;
  intelligence: number; fitness: number; money: number; actionsRemaining: number;
  gender?: Gender; nationality?: string; country?: string; birthplace?: string; language?: string; currency?: string;
  currencyScale?: number; familyBackground?: string; personality?: string[]; education?: string;
  appearance?: { height: string; build: string; hair: string; eyes: string };
  history: LifeEvent[];
}
export type SaveSlotId = 'slot-1' | 'slot-2' | 'slot-3';
export interface SaveSlot { id: SaveSlotId; character: Character | null; updatedAt: number | null; }
export interface SaveData { schemaVersion: number; activeSlotId: SaveSlotId; slots: SaveSlot[]; }
