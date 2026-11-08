# Weekly Activity Review Dialog

**Status:** Planned implementation  
**Scope:** Replace the generic pre-advance review panel with a simulation-backed weekly activity and outcome review.

## Product intent

Before resolving a week, show the player exactly what the character is expected to do, what each activity costs, what it can improve, and what the combined workload is likely to do to the character. This is a decision/review surface, not a generic confirmation menu and not a second activity scheduler.

The dialog must use the same activity definitions and resolution rules as the simulation. Never maintain a separate, UI-only reward or cost table.

## Dialog structure

### 1. Header and weekly context
- Show the current week/date range and the character's current age.
- Identify this as a pre-resolution review.
- Provide a clear close/back action that returns to the current week without changing state.

### 2. Activity breakdown
List every activity that will actually resolve this week, including automatically placed activities and applicable recurring activity commitments.

For each activity show:
- Activity name and relevant category.
- Stamina cost (not time blocks).
- Expected rewards, grouped by affected stat/skill/track, with readable deltas.
- Any direct monetary cost, if applicable.
- Relevant warning when the activity is unavailable, disabled, or cannot resolve.

The list must reflect the exact accepted plan. Disabled activities must not appear as scheduled work. Do not show cancelled, rejected, or merely suggested activities as if they will resolve.

### 3. Workload and resource forecast
Show a compact before/after view for stamina:
- Current stamina.
- Total planned stamina cost.
- Expected recovery during the week.
- Projected ending stamina.

The forecast must follow the real resolution order and caps. Do not allow recovery to be counted twice or allow stamina to go below the simulation's valid minimum. If the plan is not feasible, explain the issue and disable advancement until the player can resolve it through the owning activity controls or automatic placement rules.

### 4. Combined wellbeing and character outcome
Show projected changes caused by the whole week's plan, including when relevant:
- Stress increase/decrease.
- Health increase/decrease.
- Happiness and other affected core stats.
- Fatigue, burnout, illness, or other wellbeing risks.
- Education grades/progress, work performance, relationships, and activity-specific skill progression where relevant.

Use semantic positive/negative/neutral states and concise explanations. Explicitly call out meaningful deterioration (for example, stress rising into a risk band or health declining) rather than hiding it inside a generic score. Distinguish direct activity rewards from indirect weekly consequences.

### 5. Final summary and action
End with a clear outcome summary:
- Positive changes expected.
- Negative changes or risks expected.
- Any blocked or unresolved items.
- A single primary action to resolve the week and continue.
- A secondary action to return and adjust the plan.

Do not call this a generic "Advance" confirmation. The primary action should communicate that the reviewed week will now be simulated.

## Simulation contract

- Build a pure preview/forecast function from the same deterministic rules used by weekly resolution.
- Preview must not mutate the character, save data, history, random seed, finance ledger, or schedule.
- Resolving the week after preview must apply each cost and reward exactly once.
- The preview and actual resolution must agree for deterministic effects. If random outcomes exist, show ranges or clearly label them as estimates; do not present uncertain outcomes as guaranteed.
- Stamina is the activity workload resource. Time blocks must not be charged as the cost of personal activities. Genuine recurring commitments such as school/work may continue to occupy calendar availability where the design requires it.
- The activity enable/disable state and automatic placement rules must be respected by both UI and simulation validation.
- Preserve existing saves through a non-destructive migration/default for any newly persisted activity state.
- Keep schedule conflict validation centralized; this dialog must not become an individual schedule editor.

## Visual and interaction requirements

- Use the existing shared dialog, typography, spacing, semantic color, and theme tokens.
- Keep the layout compact and mobile-first, with activity rows that scan quickly.
- Use the shared value-threshold color semantics for progress and wellbeing indicators. Red/amber/green should reflect configured limits, not arbitrary per-page styling.
- Ensure the dialog works in every supported theme, on narrow screens, and with keyboard/focus navigation.
- Avoid decorative charts, generic motivational copy, redundant stat cards, and duplicated information already visible in the top bar.

## Acceptance criteria

1. Opening the advance action presents the detailed weekly review dialog.
2. Every activity that will resolve is listed with its stamina cost and appropriate stat/skill rewards.
3. The combined forecast includes stamina recovery and meaningful positive/negative wellbeing changes, including stress and health when affected.
4. The projected summary is generated from simulation rules, not hardcoded UI values.
5. Previewing does not mutate state; resolving applies effects exactly once.
6. The review correctly handles zero activities, disabled activities, invalid plans, unavailable activities, and unresolved conflicts.
7. Returning from the dialog leaves the week unchanged.
8. Existing weekly calendar, school/work commitments, history, finance boundaries, and save compatibility remain intact.
9. Tests cover preview-vs-resolution agreement, caps, recovery, deterioration thresholds, and no double application.
