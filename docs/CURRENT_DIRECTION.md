# Current Product and Gameplay Direction

**Canonical clarification and change log · Reviewed 2026-11-10**

This document records the latest decisions that supersede older wording elsewhere in the repository. It is an implementation contract, not a claim that every listed behavior is already implemented. Use the live code and tests to determine implementation status; use this document and the linked specifications for intended behavior.

## Product direction

- Android-first, single-player life simulator delivered as a modern Svelte/TypeScript web game inside a lightweight Kotlin WebView wrapper.
- Primarily text, cards, compact summaries, clear controls, and polished responsive themes. No 3D-world direction.
- Prioritize coherent, enjoyable systems and meaningful consequences over feature count, artificial complexity, or unnecessary realism.
- Money is the primary dashboard metric, but the game must not become a stamina-only or finance-only experience. Relationships, family, health, education, work, comfort, and meaningful choices must interact.
- Keep each major domain modular and domain-native. Shared state and explicit simulation contracts connect domains; screens must not become generic dumping grounds.
- The repository is the source of truth. Update affected documentation in the same change as behavior or direction changes.

## Time and weekly play

- Week is the player-controlled turn. Month is the intended financial/reporting cadence; year owns birthdays, life-stage progression, annual review, and annual mechanics that have not yet migrated.
- The player explicitly advances one week. Visiting screens, saving, or loading never advances time.
- Education and employment are automatic background responsibilities. Do not introduce a player-managed timetable, day/period grid, or fixed weekly action quota.
- Personal activities are selected in their owning domains and appear together in the Advance/Weekly Review surface.
- Stamina is one constraint, not the whole game. Affordability, prerequisites, age, health, stress, workload, relationships, and context also matter.
- Weekly resolution must be deterministic and simulation-owned. The UI displays returned outcomes; it must not invent or silently omit effects.

## One unified weekly activity list

The weekly review must present **one unified activity list**, not separate planned and passive activity sections.

- Player-selected activities and automatically derived passive activities appear in the same chronological/consistent list.
- Player-selected activities remain removable before the week resolves. Passive activities are system-derived, visibly distinguished (for example, muted/greyed styling), and cannot be removed by the player.
- Passive entries must be included in the review's activity count and combined outcome summary. Do not hide them in a separate total or omit them from the week recap.
- The list must make it clear which entries are player choices and which are automatic background experiences without splitting them into separate lists.
- Automatic household meals, family culture, partner/friend/child/extended-family support, and housing effects must be derived from actual household, relationship, and residence state. Never invent relationships or support.
- Passive effects may include stamina, energy/recovery, health, happiness, comfort, discipline, stress, and realistic responsibilities/pressure. Values must be bounded and explainable.
- Automatic passive recovery must be represented in the same activity/outcome accounting. Any automatic stamina adjustment (including a fixed +5 effect) must be recorded as an explicit effect/history entry and reflected in the review/recap; a state change that is invisible to the player is not acceptable.
- Recovery and passive effects must be applied exactly once in the deterministic resolution. Do not double-credit them in both budget calculation and final state mutation.

## Lifestyle Supermarket, food, and services

Top-level Life contains the modular Lifestyle experience: **Supermarket, Subscriptions, and Owned**. Do not restore the retired Discover / My services / Home navigation or add a separate generic living-cost destination.

- Supermarket checkout buys and stocks inventory; it does not plan meals. The purchase is charged immediately through the existing Finance payment and transaction path. Failed payment must not create an item, reward, or ledger charge.
- Food and edible goods are retained in Owned inventory after checkout. The player chooses which owned portions to reserve for the current weekly review; reserved portions are consumed when the week resolves. Excess purchases remain in inventory and grant no effects until selected.
- Multiple food types may be planned in the same week. Each food bonus is capped independently by stat (stamina recovery, health, happiness, stress and comfort); once a stat's weekly food cap is reached, another item cannot add more of that stat but may still provide an uncapped different benefit. Food is not a magical serum.
- Use compact product listings and a quantity stepper with minus/plus controls on both sides of the quantity value. The purchase action is simply **Buy**; do not combine checkout and weekly planning.
- Automatic replenishment of selected foods is a future option and must require an eligible credit card plus explicit player configuration. Cash-only purchases cannot be planned as automatic purchases.
- Reusable or permanent goods enter Owned after successful checkout. Subscriptions remain recurring commitments using the shared recurring-payment model and provide modest service-specific weekly benefits (for example, entertainment/mood and fitness/health).
- A smartphone requires an active mobile service subscription for connected use; a laptop or desktop PC requires active broadband. Device models, specifications, condition and upgrade mechanics belong to the next Personal Technology update, not this slice.
- Housing remains represented through existing Finance property and household state; housing comfort may contribute passive effects but must not create a duplicate Home destination.

## Family and passive life

- Family and social support are driven by persistent people, explicit relationships, co-residence, household arrangement, and family culture.
- Do not assume the character has a partner, children, friends, or supportive relatives. Only recorded connections can contribute.
- Passive family/social experiences are automatic and unremovable, but they still appear in the unified activity list and count toward the weekly summary.
- Player-initiated relationship-building remains an active choice in the appropriate domain. It can change later passive support only through actual relationship/household state transitions.
- Do not make passive support a guaranteed free stat boost. Support can be positive, neutral, or create responsibilities/pressure depending on circumstances.

## UI and interaction rules

- Compactness is a requirement, not permission to hide important costs, state, or consequences.
- Avoid duplicate information, duplicate summaries, generic motivational copy, and unnecessary navigation destinations.
- Use clear, distinguishable states for available, selected/planned, locked, and unmet-requirement actions.
- Keep actions in their owning domain. The weekly review is the unified summary/confirmation surface, not a replacement for domain-native selection.
- Overview activity history is grouped by expandable week; the current week is expanded by default. Major achievements and life-stage milestones belong in Life History, not a duplicate Overview milestone panel.
- Preserve the established visual identity and semantic theme system. Do not redesign the app or copy another game's identity when implementing a focused change.

## Architecture, saves, and quality

- Keep simulation rules in pure TypeScript modules, independent of Svelte/browser APIs. UI collects choices and renders simulation-returned effects.
- Keep domain state transitions in their owning modules and use shared ledger/history contracts for cross-domain consequences.
- Current saves are strict and versioned. Incompatible persisted shape changes require a deliberate schema update and validator/tests; do not add silent backward migrations or compatibility defaults.
- Failed actions must leave the complete prior state unchanged. Weekly resolution and financial effects must be deterministic and applied once.
- Test both the local rule and integrated scenarios. Run Svelte checking, the full Vitest suite, and production build after gameplay changes.
- Do not introduce Rust/WASM or other low-level complexity without profiling evidence and a bounded use case.

## Current known follow-up

- Verify and fix the automatic +5 stamina effect so it is represented in the unified activity accounting, state effects, and recap. Do not mark this complete until a regression test proves the recorded effect and prevents double application.

## Change-control rule

When a newer explicit decision conflicts with an older document, this file records the current direction. Update the older canonical section and its acceptance criteria when next touching that area; do not revive superseded UX or mechanics from historical notes. Before implementing a feature, inspect the current code and tests and label it **implemented**, **partially implemented**, or **planned** accurately.
