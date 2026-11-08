# Weekly Activity Review Dialog

**Status:** Implemented on `feature/stamina-activity-review`; final CI verification pending  
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
- Its expected reward categories from the shared simulation activity definitions.
- Any direct monetary cost, if applicable.
- Relevant warning when the activity is unavailable, disabled, or cannot resolve.

Show the combined numerical stat/skill/relationship deltas in the outcome section. Do not present isolated per-action estimates as additive guarantees; weekly interactions, workload, recovery, and action order can change the combined result.

The list must reflect the exact accepted plan. Disabled activities must not appear as scheduled work. Do not show cancelled, rejected, or merely suggested activities as if they will resolve.

### 3. Workload and resource forecast
Show a compact before/after view for stamina:
- Current stamina.
- Total planned stamina cost.
- Expected recovery during the week.
- Projected ending stamina.

The forecast follows the actual weekly resolver, including action order, stamina caps, activity rewards and recovery. Stamina is clamped at zero; low stamina reduces the effectiveness of demanding activities rather than blocking a week. Invalid recurring timetable data or stale actions still block resolution.

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
- Stamina is the activity workload resource. Personal activities do not reserve or consume time blocks. Genuine recurring commitments such as school/work continue to occupy calendar availability.
- Weekly add/remove toggle state must be respected by both UI and simulation validation; there is no persistent per-activity schedule or calendar placement.
- Preserve existing saves through a non-destructive migration/default for any newly persisted activity state.
- Keep schedule conflict validation centralized; this dialog must not become an individual schedule editor.

## Visual and interaction requirements

- Use the existing shared dialog, typography, spacing, semantic color, and theme tokens.
- Keep the layout compact and mobile-first, with activity rows that scan quickly.
- Use the shared value-threshold color semantics for progress and wellbeing indicators. Red/amber/green should reflect configured limits, not arbitrary per-page styling.
- Ensure the dialog works in every supported theme, on narrow screens, and with keyboard/focus navigation.
- Avoid decorative charts, generic motivational copy, redundant stat cards, and duplicated information already visible in the top bar.

## Acceptance criteria

1. Opening the Advance FAB presents the detailed weekly review dialog.
2. Every selected activity is listed with its stamina/money cost and reward categories.
3. The combined forecast shows projected stamina, stress, health, happiness, other changed core stats and cash.
4. The projected summary is generated by running the same deterministic weekly resolver on an immutable input.
5. Previewing does not mutate state; resolving applies costs and rewards once.
6. Zero-activity weeks and invalid/stale recurring timetables are handled.
7. Activities can be toggled from their own workspaces; the central Schedule workspace provides a cancellation list.
8. Existing school/work commitments, history, annual finance boundaries and save compatibility remain intact.
9. Tests cover preview-vs-resolution agreement, stamina charging, recovery and no double application.
