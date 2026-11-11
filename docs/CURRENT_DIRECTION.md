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
- Direct year advancement must resolve the current passive household/lifestyle state once as part of its coarse annual turn, without replaying player-selected weekly actions or duplicating annual financial settlement. Ordinary weekly advancement continues to resolve passive effects every week. Natural development occurs on age transitions, begins from age-scaled child attributes, and is bounded by age-appropriate ceilings.

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

## Lifestyle supermarket, purchases, and food

Top-level Life contains the modular Lifestyle experience: **Supermarket, Subscriptions, and Owned**. Do not restore the retired Discover / My services / Home navigation or add a separate generic living-cost destination.

- Supermarket checkout buys items into Owned inventory; it does not create a weekly plan. Payment is immediate and failed payment must not create an item, activity, reward, or ledger charge.
- Food and edible items remain in Owned until the player selects portions for the weekly plan. Only reserved portions are consumed when the week resolves; excess stock remains available for later weeks.
- Owned food may be mixed across types. Each food's effects are item-specific and modest. Weekly food bonuses are capped independently by stat (including stamina, health, happiness, comfort, and stress), so food that cannot improve an already-capped stat may still contribute another benefit.
- Cash checkout is purchase-only. Automatic replenishment is a future option that requires an eligible credit card and explicit player-selected items/settings; never imply cash purchases can be automatically planned or replenished.
- Food rewards are not magical stat boosts. Prices should reflect distinct, believable differences in nutrition, convenience, quality, and enjoyment; do not reward stockpiling.
- Subscriptions use the shared recurring-payment model and provide modest service-specific benefits: entertainment/music may support happiness or stress relief; fitness memberships may support fitness and health. Avoid large passive bonuses.
- Connectivity services are requirements, not universal stat buffs: smartphones require an active mobile connection plan; laptops and PCs require active broadband to use connected features.
- Physical devices are durable Owned inventory. Model-specific specifications and a device upgrade menu are a later update; do not add speculative device tiers in this change.
- Food effects resolve through the weekly simulation and appear in the unified activity list and review. Avoid duplicate food summaries or separate activity-cost panels.
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

- Standard **New Game** always begins at birth and is the only mode eligible for achievements. Presets and Full Custom Starting remain separate, non-achievement gameplay modes; never award achievements from their saves.

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
