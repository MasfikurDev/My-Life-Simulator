import type { Character } from './types';
export const DEVELOPMENT_STATS = ['health','happiness','intelligence','fitness','stamina','focus','confidence','discipline','creativity','socialSkills','comfort'] as const;
export type DevelopmentStat = typeof DEVELOPMENT_STATS[number];
type Point = { age:number; cap:number };
const CURVES: Record<DevelopmentStat,Point[]> = {
health:[{age:0,cap:22},{age:3,cap:32},{age:6,cap:44},{age:13,cap:61},{age:16,cap:72},{age:18,cap:80},{age:25,cap:90},{age:40,cap:96},{age:60,cap:94},{age:75,cap:88},{age:90,cap:80}],
happiness:[{age:0,cap:25},{age:3,cap:35},{age:6,cap:48},{age:13,cap:65},{age:16,cap:75},{age:18,cap:82},{age:25,cap:92},{age:40,cap:96},{age:60,cap:94},{age:75,cap:90},{age:90,cap:84}],
intelligence:[{age:0,cap:16},{age:3,cap:29},{age:6,cap:43},{age:13,cap:63},{age:16,cap:73},{age:18,cap:80},{age:25,cap:91},{age:40,cap:97},{age:60,cap:97},{age:75,cap:94},{age:90,cap:90}],
fitness:[{age:0,cap:12},{age:3,cap:25},{age:6,cap:40},{age:13,cap:62},{age:16,cap:76},{age:18,cap:84},{age:25,cap:94},{age:40,cap:98},{age:60,cap:91},{age:75,cap:80},{age:90,cap:65}],
stamina:[{age:0,cap:15},{age:3,cap:27},{age:6,cap:42},{age:13,cap:64},{age:16,cap:76},{age:18,cap:84},{age:25,cap:94},{age:40,cap:98},{age:60,cap:90},{age:75,cap:78},{age:90,cap:62}],
focus:[{age:0,cap:10},{age:3,cap:24},{age:6,cap:39},{age:13,cap:61},{age:16,cap:73},{age:18,cap:81},{age:25,cap:92},{age:40,cap:97},{age:60,cap:97},{age:75,cap:94},{age:90,cap:89}],
confidence:[{age:0,cap:12},{age:3,cap:25},{age:6,cap:40},{age:13,cap:60},{age:16,cap:72},{age:18,cap:80},{age:25,cap:92},{age:40,cap:97},{age:60,cap:94},{age:75,cap:89},{age:90,cap:82}],
discipline:[{age:0,cap:8},{age:3,cap:22},{age:6,cap:38},{age:13,cap:60},{age:16,cap:73},{age:18,cap:82},{age:25,cap:94},{age:40,cap:98},{age:60,cap:98},{age:75,cap:96},{age:90,cap:92}],
creativity:[{age:0,cap:18},{age:3,cap:32},{age:6,cap:47},{age:13,cap:68},{age:16,cap:78},{age:18,cap:85},{age:25,cap:94},{age:40,cap:98},{age:60,cap:98},{age:75,cap:96},{age:90,cap:92}],
socialSkills:[{age:0,cap:8},{age:3,cap:20},{age:6,cap:37},{age:13,cap:59},{age:16,cap:72},{age:18,cap:81},{age:25,cap:93},{age:40,cap:98},{age:60,cap:96},{age:75,cap:92},{age:90,cap:86}],
comfort:[{age:0,cap:25},{age:3,cap:35},{age:6,cap:48},{age:13,cap:65},{age:16,cap:75},{age:18,cap:82},{age:25,cap:92},{age:40,cap:96},{age:60,cap:94},{age:75,cap:90},{age:90,cap:84}]
};
const clamp=(v:number,min=0,max=100)=>Math.max(min,Math.min(max,v));
export function getAgeStatCap(age:number,stat:DevelopmentStat):number{
 const a=clamp(Math.floor(age),0,120), c=CURVES[stat], i=c.findIndex(p=>p.age>=a);
 if(i===0)return c[0].cap; if(i<0)return c[c.length-1].cap;
 const lo=c[i-1],hi=c[i],t=(a-lo.age)/(hi.age-lo.age);
 return Math.round(lo.cap+(hi.cap-lo.cap)*t);
}
export function getStatCeiling(character:Pick<Character,'age'|'statPotential'>,stat:DevelopmentStat):number{
 return Math.min(100,Math.round(getAgeStatCap(character.age,stat)*clamp(character.statPotential?.[stat]??100,50,100)/100));
}
export function growStat<T extends Character>(character:T,stat:DevelopmentStat,amount:number):T{
 if(amount<=0)return character;
 return Object.assign({},character,{[stat]:Math.min(getStatCeiling(character,stat),Number(character[stat]??0)+amount)});
}
export function initializeAgeAppropriateStats<T extends Character>(character:T,random:()=>number=Math.random):T{
 const potential={...(character.statPotential??{})}, next={...character};
 for(const stat of DEVELOPMENT_STATS){
  potential[stat]=potential[stat]??Math.round(88+random()*12);
  const ceiling=Math.round(getAgeStatCap(character.age,stat)*(potential[stat]??100)/100);
  Object.assign(next,{[stat]:Math.round(ceiling*(0.62+random()*0.26))});
 }
 next.statPotential=potential; return next;
}
function weeklyRate(age:number,stat:DevelopmentStat):number{
 const base=age<3?0.075:age<6?0.065:age<13?0.055:age<18?0.04:age<25?0.025:age<45?0.012:age<65?0.006:0.002;
 return base*(['health','stamina','fitness'].includes(stat)?0.85:['happiness','comfort'].includes(stat)?0.45:1);
}
export function applyNaturalStatDevelopment<T extends Character>(character:T):{character:T;changes:DevelopmentStat[]}{
 let next=character; const changes:DevelopmentStat[]=[];
 for(const stat of DEVELOPMENT_STATS){
  const before=Number(next[stat]??0), after=Math.min(getStatCeiling(next,stat),before+weeklyRate(next.age,stat));
  if(after>before){next=Object.assign({},next,{[stat]:Math.round(after*1000)/1000});changes.push(stat);}
 }
 return {character:next,changes};
}
export function enforceWeeklyStatCaps<T extends Character>(before:Character,after:T):T{
 const next={...after};
 for(const stat of DEVELOPMENT_STATS){
  const oldValue=Number(before[stat]??0), newValue=Number(after[stat]??0);
  if(newValue>oldValue)Object.assign(next,{[stat]:Math.min(newValue,Math.max(oldValue,getStatCeiling(after,stat)))});
 }
 return next;
}