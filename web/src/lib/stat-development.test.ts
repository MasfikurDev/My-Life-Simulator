import { describe, expect, it } from 'vitest';
import { advanceWeek, generateRandomCharacter } from './simulation';
import { applyNaturalStatDevelopment, enforceWeeklyStatCaps, getAgeStatCap, getStatCeiling } from './stat-development';
import { isActivityAvailable } from './progression';
describe('age-aware stat development',()=>{
 it('generates lower starting capabilities for children than adults',()=>{
  const child=generateRandomCharacter(5,()=>0.5),adult=generateRandomCharacter(25,()=>0.5);
  for(const stat of ['health','intelligence','stamina','focus'] as const)expect(child[stat]).toBeLessThan(adult[stat]);
 });
 it('locks formal exercise and social activities until early childhood',()=>{
  expect(isActivityAvailable(1,'exercise')).toBe(false);
  expect(isActivityAvailable(1,'socialize')).toBe(false);
  expect(isActivityAvailable(2,'exercise')).toBe(true);
  expect(isActivityAvailable(2,'socialize')).toBe(true);
 });
 it('raises age ceilings across childhood and young adulthood',()=>{
  expect(getAgeStatCap(5,'stamina')).toBeLessThan(getAgeStatCap(13,'stamina'));
  expect(getAgeStatCap(13,'intelligence')).toBeLessThan(getAgeStatCap(18,'intelligence'));
  expect(getAgeStatCap(18,'fitness')).toBeLessThan(getAgeStatCap(30,'fitness'));
 });
 it('makes natural development respond to family support and wellbeing',()=>{
  const base=generateRandomCharacter(8,()=>0.5);
  const supported=applyNaturalStatDevelopment({...base,familyCulture:'supportive',health:90,stress:20,stamina:80}).character;
  const neglected=applyNaturalStatDevelopment({...base,familyCulture:'neglectful',health:90,stress:20,stamina:80}).character;
  expect(supported.statDevelopmentProgress?.intelligence).toBeGreaterThan(neglected.statDevelopmentProgress?.intelligence ?? 0);
  const rested=applyNaturalStatDevelopment({...base,familyCulture:'supportive',health:90,stress:20,stamina:80}).character;
  const strained=applyNaturalStatDevelopment({...base,familyCulture:'supportive',health:35,stress:90,stamina:10}).character;
  expect(rested.statDevelopmentProgress?.intelligence).toBeGreaterThan(strained.statDevelopmentProgress?.intelligence ?? 0);
 });
 it('combines age ceiling and personal potential',()=>{
  expect(getStatCeiling({age:18,statPotential:{intelligence:80}},'intelligence')).toBeLessThan(getStatCeiling({age:18,statPotential:{intelligence:100}},'intelligence'));
 });
 it('applies small natural development over repeated successful weekly advances',()=>{
  let character=generateRandomCharacter(8,()=>0.4);
  const before=character.intelligence;
  for(let week=0;week<52;week++){
   const result=advanceWeek(character);
   expect(result.issue).toBeNull();
   character=result.character;
  }
  expect(character.intelligence).toBeGreaterThan(before);
  expect(character.intelligence).toBeLessThanOrEqual(getStatCeiling(character,'intelligence'));
 });
 it('lets multiple capabilities develop over a full year without exceeding their age ceilings',()=>{
  let character=generateRandomCharacter(8,()=>0.4);
  const tracked=['intelligence','fitness','stamina','focus','discipline','confidence','creativity','socialSkills'] as const;
  const starting=Object.fromEntries(tracked.map(stat=>[stat,character[stat]]));
  for(let week=0;week<52;week++){
   const result=advanceWeek(character);
   expect(result.issue).toBeNull();
   character=result.character;
  }
  for(const stat of tracked){
   expect(character[stat]).toBeGreaterThan(starting[stat]);
   expect(character[stat]).toBeLessThanOrEqual(getStatCeiling(character,stat));
  }
 });

 it('preserves above-cap legacy values but blocks further gains',()=>{
  const character={...generateRandomCharacter(10,()=>0.35),intelligence:99};
  expect(applyNaturalStatDevelopment(character).character.intelligence).toBe(99);
  const attemptedGain={...character,intelligence:100};
  expect(enforceWeeklyStatCaps(character,attemptedGain).intelligence).toBe(99);
 });
});
