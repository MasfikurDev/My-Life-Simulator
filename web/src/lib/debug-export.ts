import type { Character, SaveSlotId } from './types';

export interface GameDebugSnapshot {
  format: 'my-life-simulator-debug';
  formatVersion: 2;
  exportedAt: string;
  saveSlotId: SaveSlotId;
  character: Character;
}

/** A portable, device-independent snapshot for bug reports and repeatable testing. */
export function createGameDebugSnapshot(character: Character, saveSlotId: SaveSlotId, now = new Date()): GameDebugSnapshot {
  // Character data is JSON-persisted already; use the same portable format here
  // instead of structuredClone, which may be missing in older Android WebViews.
  return {
    format: 'my-life-simulator-debug',
    formatVersion: 2,
    exportedAt: now.toISOString(),
    saveSlotId,
    character: JSON.parse(JSON.stringify(character)) as Character
  };
}
