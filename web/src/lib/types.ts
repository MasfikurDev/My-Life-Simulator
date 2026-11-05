export type ActivityId = 'study' | 'exercise' | 'socialize' | 'work';
export interface LifeEvent { id: string; year: number; age: number; title: string; description: string; kind: 'milestone' | 'activity' | 'event'; }
export interface Character {
  name: string; age: number; year: number; health: number; happiness: number;
  intelligence: number; fitness: number; money: number; actionsRemaining: number;
  history: LifeEvent[];
}
export interface SaveData { schemaVersion: number; character: Character; }
