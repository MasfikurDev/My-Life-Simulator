# Paper Playthrough Log

**Status:** Exploratory, source-informed paper simulation; not a real save, automated test, or verified character-generator output.  
**Started:** 2026-11-20  
**Source baseline:** `main` at `5ab5a7ea975a886e8f0d3d4d9fb1b720bc4eefe6`

This log preserves the assumptions, weekly outcomes, and implementation findings from the paper playthrough. It must not be cited as proof that a full birth-to-death playthrough has passed.

## Scenario assumptions

The paper run continues an illustrative infant profile adopted in conversation. The identity and starting values were **not** produced by running the game's random generator with a verified seed.

- Character: Liam Carter; male; American; Los Angeles.
- Assumed birth date and initial calendar anchor: January 5, 2026.
- Household: lives with father Caleb Carter; father is the primary guardian.
- Family culture: strained; family background: working-class; personality includes Disciplined.
- Family bond at the start: closeness 60, trust 58, tension 0.
- No siblings, partner, children, employment, education enrollment, bank accounts, property, investments, or owned business.
- Personal cash: $0.
- No player-planned activities are selected in the weeks recorded here.
- The earlier conversation's Week 52 estimate was: Health 30, Happiness 79, Intelligence 30, Fitness 15, Stamina 100, Focus 30, Confidence 27, Discipline 82, Creativity 30, Social Skills 21, Stress 1, Comfort 100. Rechecking the actual calendar boundary shows that Week 52 advances the date to January 4, 2027 and performs annual settlement before Week 53. Therefore the corrected Week 53 input is Health 29, age 0, year 2027; all other listed stats remain as estimated. The previous Week 52 Health 30 figure omitted this settlement.

The assumed birth date is used to demonstrate actual date-derived age progression. If a real generated character or save is supplied later, replace this illustrative baseline rather than merging the two.

## Rules applied

The run follows the current source implementation inspected on the source baseline above:

- `simulation.ts`: `advanceWeek` resolves weekly wellbeing, passive lifestyle effects, stamina recovery/drift, and then advances the calendar by seven days. When the calendar year changes, it calls `settleCalendarYear`; otherwise it applies birthday-based age transition.
- `wellbeing.ts`: with no enrollment, employment, or planned activity workload, weekly workload is 0. Stress load is -3 and Happiness gains +1 while resulting stress is at most 35.
- `lifestyle.ts`: the strained-family meal activity provides +3 stamina recovery, +1 Comfort, +1 Discipline, and a stress field of -1 (which increases actual Stress by 1 because the resolver subtracts the summed stress field). The stable family-supported home adds +2 Comfort. Comfort and stats are clamped to 0–100.
- The weekly resolver adds +3 natural stamina drift at workload 0. With strained-family meals, Stamina therefore gains up to +6 per week before the 100 cap.
- `settleCalendarYear` reduces Health by 1 for a character below age 45 at each calendar-year boundary, even if that boundary occurs before the birthday. In this scenario the first settlement occurs at the end of Week 52 (next date January 4, 2027), before the January 5 birthday.
- `applyAgeTransition` adds +3 to the listed developmental stats, but first clamps each to `ageStatCeiling(age)`. The current ceiling is 34 at age 1 and 38 at age 2.
- No eligible annual contextual event exists for this character below age 6. No income or personal financial transactions occur in this scenario.

## Important implementation finding

**Birthday stat clamping can cause large downward jumps.** Weekly Happiness, Discipline, and Stamina can rise above the age-based ceiling. At the birthday, `applyAgeTransition` computes `min(ageStatCeiling, currentStat + developmentGain)`; this can reduce a stat substantially. This is observed behavior in the inspected implementation, not a desired design decision. It should be reviewed and covered by a focused regression test before changing it.

A separate time-model consequence is visible here: the assumed January 5 birthday falls after the January 1 calendar-year boundary. The 2028 annual settlement therefore reduces Health while the character is still age 1; the birthday transition to age 2 occurs in the following week.

## Weeks 53–104

Each row is the post-resolution snapshot at the end of that week, including annual settlement when the week crosses a calendar-year boundary.

Abbreviations: H = Health; Ha = Happiness; I = Intelligence; Fi = Fitness; St = Stamina; Fo = Focus; Co = Confidence; D = Discipline; Cr = Creativity; So = Social Skills; Sr = Stress; Cm = Comfort.

| Week | Date range | Age | H | Ha | I | Fi | St | Fo | Co | D | Cr | So | Sr | Cm |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 53 | Jan 4–Jan 10, 2027 | 1 | 32 | 34 | 33 | 18 | 34 | 33 | 30 | 34 | 33 | 24 | 1 | 100 |
| 54 | Jan 11–Jan 17, 2027 | 1 | 32 | 35 | 33 | 18 | 40 | 33 | 30 | 35 | 33 | 24 | 1 | 100 |
| 55 | Jan 18–Jan 24, 2027 | 1 | 32 | 36 | 33 | 18 | 46 | 33 | 30 | 36 | 33 | 24 | 1 | 100 |
| 56 | Jan 25–Jan 31, 2027 | 1 | 32 | 37 | 33 | 18 | 52 | 33 | 30 | 37 | 33 | 24 | 1 | 100 |
| 57 | Feb 1–Feb 7, 2027 | 1 | 32 | 38 | 33 | 18 | 58 | 33 | 30 | 38 | 33 | 24 | 1 | 100 |
| 58 | Feb 8–Feb 14, 2027 | 1 | 32 | 39 | 33 | 18 | 64 | 33 | 30 | 39 | 33 | 24 | 1 | 100 |
| 59 | Feb 15–Feb 21, 2027 | 1 | 32 | 40 | 33 | 18 | 70 | 33 | 30 | 40 | 33 | 24 | 1 | 100 |
| 60 | Feb 22–Feb 28, 2027 | 1 | 32 | 41 | 33 | 18 | 76 | 33 | 30 | 41 | 33 | 24 | 1 | 100 |
| 61 | Mar 1–Mar 7, 2027 | 1 | 32 | 42 | 33 | 18 | 82 | 33 | 30 | 42 | 33 | 24 | 1 | 100 |
| 62 | Mar 8–Mar 14, 2027 | 1 | 32 | 43 | 33 | 18 | 88 | 33 | 30 | 43 | 33 | 24 | 1 | 100 |
| 63 | Mar 15–Mar 21, 2027 | 1 | 32 | 44 | 33 | 18 | 94 | 33 | 30 | 44 | 33 | 24 | 1 | 100 |
| 64 | Mar 22–Mar 28, 2027 | 1 | 32 | 45 | 33 | 18 | 100 | 33 | 30 | 45 | 33 | 24 | 1 | 100 |
| 65 | Mar 29–Apr 4, 2027 | 1 | 32 | 46 | 33 | 18 | 100 | 33 | 30 | 46 | 33 | 24 | 1 | 100 |
| 66 | Apr 5–Apr 11, 2027 | 1 | 32 | 47 | 33 | 18 | 100 | 33 | 30 | 47 | 33 | 24 | 1 | 100 |
| 67 | Apr 12–Apr 18, 2027 | 1 | 32 | 48 | 33 | 18 | 100 | 33 | 30 | 48 | 33 | 24 | 1 | 100 |
| 68 | Apr 19–Apr 25, 2027 | 1 | 32 | 49 | 33 | 18 | 100 | 33 | 30 | 49 | 33 | 24 | 1 | 100 |
| 69 | Apr 26–May 2, 2027 | 1 | 32 | 50 | 33 | 18 | 100 | 33 | 30 | 50 | 33 | 24 | 1 | 100 |
| 70 | May 3–May 9, 2027 | 1 | 32 | 51 | 33 | 18 | 100 | 33 | 30 | 51 | 33 | 24 | 1 | 100 |
| 71 | May 10–May 16, 2027 | 1 | 32 | 52 | 33 | 18 | 100 | 33 | 30 | 52 | 33 | 24 | 1 | 100 |
| 72 | May 17–May 23, 2027 | 1 | 32 | 53 | 33 | 18 | 100 | 33 | 30 | 53 | 33 | 24 | 1 | 100 |
| 73 | May 24–May 30, 2027 | 1 | 32 | 54 | 33 | 18 | 100 | 33 | 30 | 54 | 33 | 24 | 1 | 100 |
| 74 | May 31–Jun 6, 2027 | 1 | 32 | 55 | 33 | 18 | 100 | 33 | 30 | 55 | 33 | 24 | 1 | 100 |
| 75 | Jun 7–Jun 13, 2027 | 1 | 32 | 56 | 33 | 18 | 100 | 33 | 30 | 56 | 33 | 24 | 1 | 100 |
| 76 | Jun 14–Jun 20, 2027 | 1 | 32 | 57 | 33 | 18 | 100 | 33 | 30 | 57 | 33 | 24 | 1 | 100 |
| 77 | Jun 21–Jun 27, 2027 | 1 | 32 | 58 | 33 | 18 | 100 | 33 | 30 | 58 | 33 | 24 | 1 | 100 |
| 78 | Jun 28–Jul 4, 2027 | 1 | 32 | 59 | 33 | 18 | 100 | 33 | 30 | 59 | 33 | 24 | 1 | 100 |
| 79 | Jul 5–Jul 11, 2027 | 1 | 32 | 60 | 33 | 18 | 100 | 33 | 30 | 60 | 33 | 24 | 1 | 100 |
| 80 | Jul 12–Jul 18, 2027 | 1 | 32 | 61 | 33 | 18 | 100 | 33 | 30 | 61 | 33 | 24 | 1 | 100 |
| 81 | Jul 19–Jul 25, 2027 | 1 | 32 | 62 | 33 | 18 | 100 | 33 | 30 | 62 | 33 | 24 | 1 | 100 |
| 82 | Jul 26–Aug 1, 2027 | 1 | 32 | 63 | 33 | 18 | 100 | 33 | 30 | 63 | 33 | 24 | 1 | 100 |
| 83 | Aug 2–Aug 8, 2027 | 1 | 32 | 64 | 33 | 18 | 100 | 33 | 30 | 64 | 33 | 24 | 1 | 100 |
| 84 | Aug 9–Aug 15, 2027 | 1 | 32 | 65 | 33 | 18 | 100 | 33 | 30 | 65 | 33 | 24 | 1 | 100 |
| 85 | Aug 16–Aug 22, 2027 | 1 | 32 | 66 | 33 | 18 | 100 | 33 | 30 | 66 | 33 | 24 | 1 | 100 |
| 86 | Aug 23–Aug 29, 2027 | 1 | 32 | 67 | 33 | 18 | 100 | 33 | 30 | 67 | 33 | 24 | 1 | 100 |
| 87 | Aug 30–Sep 5, 2027 | 1 | 32 | 68 | 33 | 18 | 100 | 33 | 30 | 68 | 33 | 24 | 1 | 100 |
| 88 | Sep 6–Sep 12, 2027 | 1 | 32 | 69 | 33 | 18 | 100 | 33 | 30 | 69 | 33 | 24 | 1 | 100 |
| 89 | Sep 13–Sep 19, 2027 | 1 | 32 | 70 | 33 | 18 | 100 | 33 | 30 | 70 | 33 | 24 | 1 | 100 |
| 90 | Sep 20–Sep 26, 2027 | 1 | 32 | 71 | 33 | 18 | 100 | 33 | 30 | 71 | 33 | 24 | 1 | 100 |
| 91 | Sep 27–Oct 3, 2027 | 1 | 32 | 72 | 33 | 18 | 100 | 33 | 30 | 72 | 33 | 24 | 1 | 100 |
| 92 | Oct 4–Oct 10, 2027 | 1 | 32 | 73 | 33 | 18 | 100 | 33 | 30 | 73 | 33 | 24 | 1 | 100 |
| 93 | Oct 11–Oct 17, 2027 | 1 | 32 | 74 | 33 | 18 | 100 | 33 | 30 | 74 | 33 | 24 | 1 | 100 |
| 94 | Oct 18–Oct 24, 2027 | 1 | 32 | 75 | 33 | 18 | 100 | 33 | 30 | 75 | 33 | 24 | 1 | 100 |
| 95 | Oct 25–Oct 31, 2027 | 1 | 32 | 76 | 33 | 18 | 100 | 33 | 30 | 76 | 33 | 24 | 1 | 100 |
| 96 | Nov 1–Nov 7, 2027 | 1 | 32 | 77 | 33 | 18 | 100 | 33 | 30 | 77 | 33 | 24 | 1 | 100 |
| 97 | Nov 8–Nov 14, 2027 | 1 | 32 | 78 | 33 | 18 | 100 | 33 | 30 | 78 | 33 | 24 | 1 | 100 |
| 98 | Nov 15–Nov 21, 2027 | 1 | 32 | 79 | 33 | 18 | 100 | 33 | 30 | 79 | 33 | 24 | 1 | 100 |
| 99 | Nov 22–Nov 28, 2027 | 1 | 32 | 80 | 33 | 18 | 100 | 33 | 30 | 80 | 33 | 24 | 1 | 100 |
| 100 | Nov 29–Dec 5, 2027 | 1 | 32 | 81 | 33 | 18 | 100 | 33 | 30 | 81 | 33 | 24 | 1 | 100 |
| 101 | Dec 6–Dec 12, 2027 | 1 | 32 | 82 | 33 | 18 | 100 | 33 | 30 | 82 | 33 | 24 | 1 | 100 |
| 102 | Dec 13–Dec 19, 2027 | 1 | 32 | 83 | 33 | 18 | 100 | 33 | 30 | 83 | 33 | 24 | 1 | 100 |
| 103 | Dec 20–Dec 26, 2027 | 1 | 32 | 84 | 33 | 18 | 100 | 33 | 30 | 84 | 33 | 24 | 1 | 100 |
| 104 | Dec 27–Jan 2, 2027 / 2028 | 1 | 31 | 85 | 33 | 18 | 100 | 33 | 30 | 85 | 33 | 24 | 1 | 100 |

## Checkpoints

### Week 53 — first birthday

- Week: January 4–10, 2027; the assumed birthday is January 5.
- The weekly effects resolve first: Happiness +1, Discipline +1, Stamina remains capped at 100.
- The character enters the week at age 0, year 2027, with Health 29 after the annual settlement at the end of Week 52.
- The January 5 birthday changes age to 1 during the week and applies +3 development, subject to the age-1 ceiling of 34. No second annual health reduction occurs in Week 53.
- Result: H32, Ha34, I33, Fi18, St34, Fo33, Co30, D34, Cr33, So24, Sr1, Cm100.
- The ceiling unexpectedly drops Happiness, Stamina, and Discipline from their higher pre-birthday values to 34.

### Week 104 — end of this 52-week continuation

- Week: December 27, 2027–January 2, 2028.
- The next calendar date becomes January 3, 2028. The character remains age 1 because the January 5 birthday has not yet arrived.
- Annual settlement reduces Health from 32 to 31. No age-transition development is applied in this week.
- Result: H31, Ha85, I33, Fi18, St100, Fo33, Co30, D85, Cr33, So24, Sr1, Cm100.
- No income, expenses, or other personal financial changes occur under the scenario assumptions.

### Next transition — Week 105 (not included above)

The assumed January 5, 2028 birthday falls in Week 105 (January 3–9). Based on the inspected resolver, the week resolves first and then age becomes 2. The age-2 ceiling is 38, so the birthday transition is expected to clamp Happiness, Stamina, and Discipline to 38 while applying +3 to other developmental stats. This is a source-derived projection, not yet a separately executed simulation.

## Limitations and follow-up

- The starting character and Week 52 snapshot are illustrative conversation state, not a reproducible game save.
- This is a no-action baseline, not a representative playthrough. It does not exercise education, work, finance, events, player choices, or family interactions.
- It does not validate the random character generator, persistence, save/load, or runtime UI.
- The age-ceiling behavior should be evaluated as a gameplay correctness issue. Do not silently alter this paper log to reflect a proposed fix; record future implementation changes separately.
- For a reproducible run, create or export a real character state, preserve its exact calendar and stats, then replay `advanceWeek` with deterministic inputs and compare each weekly snapshot.
