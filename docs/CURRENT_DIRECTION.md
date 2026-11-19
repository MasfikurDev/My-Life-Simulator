# Current Product and Gameplay Direction

**Canonical clarification and change log · Reviewed 2026-11-15**

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
- Present contextual situations and consequential player decisions through the reusable gameplay dialog. The dialog owns presentation; simulation rules, immediate outcomes, weekly planning, and persistence remain in their owning systems. Closing a dialog leaves an unresolved situation available to reopen.
- Overview activity history is grouped by expandable week; the current week is expanded by default. Major achievements and life-stage milestones belong in Life History, not a duplicate Overview milestone panel.
- Preserve the established visual identity and semantic theme system. Do not redesign the app or copy another game's identity when implementing a focused change.
- Shared status/metadata labels use the theme-aware `UiBadge` primitive. Badge meaning stays consistent across all 17 themes; optional entrance motion is reserved for meaningful state changes and remains off by default.

## Visual QA implementation contract

- The title screen must use shrink-safe grid tracks and a single-column layout at narrow viewport widths. Text-bearing grid children use `min-width: 0`; no menu column may impose a minimum width wider than its available container. On phones the menu uses natural content height and may scroll when expanded or when the viewport is genuinely short; it must not clip the menu footer.
- Paper is a light palette. Secondary controls use readable dark text on light surfaces; primary controls use the accent with a legible foreground; danger controls use the danger-soft surface with the danger semantic color. Do not carry pale dark-theme button text into Paper.
- Profile shows the four core attributes first (Health, Happiness, Fitness, Intelligence). The remaining seven attributes remain available through progressive disclosure; no attribute is removed from the character model or hidden permanently.
- Relationship cards keep Closeness visible and disclose Trust and Tension on demand. Relationship actions and their costs remain visible and unchanged.
- Supermarket categories remain a single horizontally scrollable rail, with keyboard focus, explicit selected state, and touch targets of at least 44 CSS px. Do not wrap the complete category catalog into multiple rows on narrow screens.
- Subscription active count is shown once, in the active-subscriptions section. The page header must not repeat the same count.
- Life Story has a semantic page heading before the grouped life-history periods. Heading levels must reflect page, section, and character-name hierarchy rather than styling convenience.
- Responsive visual validation should cover 320, 360, 390, 430, 768, 1024, and 1440 CSS px where practical. Confirm no horizontal overflow, clipped controls, or safe-area/navigation collisions; reduced-motion behavior remains mandatory for animated themes.

- Standard **New Game** always begins at birth and is the only mode eligible for achievements. Keep its generated-character Reroll beside the identity.
- **Presets** is its own starting-scenario catalog with ready-made ages, circumstances, and challenges; it must not reuse the New Game page.
- **Full Custom Starting** is a separate, compact game-style scenario builder for life stage/exact age, starting circumstances, identity, and origin—not a generic settings form.
- Presets and Full Custom Starting remain non-achievement gameplay modes; never award achievements from their saves.

## Simulated investment markets

- Finance retains the established top-level order: Banking, Business, Property, Investments, Taxes. The Investments workspace contains Stocks, Crypto, and Other assets.
- Stocks and Crypto use separate market lists and portfolio subtotals but share one investment wallet, holdings, brokerage, capital-gains tax, and financial ledger.
- Stock and crypto prices are simulated locally and update deterministically each resolved in-game week. Weekly closing quotes are persisted for chart history; 1H/1D paths are explicitly modeled within-week movement, not stored candles.
- Market capitalization uses simulated quotes and catalogue supply. Volume is a simulated market profile, not actual exchange or player trade volume.
- Add funds and Move transfer money between available cash and the investment wallet. Buy, Sell, and Convert use that wallet and the existing trade fee/tax rules.
- No live market API, real-world quote, actual earnings statement, analyst rating, or dynamic token supply is claimed.
- See [Simulated Investment Markets](INVESTMENT_MARKETS.md) for the asset catalogue, rules, and remaining work.

## Shared UI coverage and consistency (2026-11-19)

- The reusable UI foundation covers theme-aware badges, buttons, cards, progress, fields, gameplay dialogs, empty states, the app notification surface, and chart semantic tokens.
- Additional shared pattern areas are navigation/active indicators, menus and popovers, domain-owned list rows, loading feedback, selection states, timelines, purposeful stat presentation, and notification indicators. These are pattern coverage goals, not a mandate to create one component per item.
- Keep typography hierarchy, spacing/density, surface/elevation, interaction states, and motion behavior consistent across the interface. Preserve domain-native layouts and information hierarchy; do not turn all screens into the same card grid.
- Semantic meaning remains consistent across all 17 themes while colors and surface treatments adapt to each palette. Never rely on color alone; preserve Paper contrast and reduced-motion behavior.
- Migrate incrementally by repeated use and player impact. Prioritize navigation/selection, transaction and record rows, stat presentation, and loading feedback. Adopt other patterns only where repeated use justifies them.
- Canonical implementation detail: `docs/UI_FRAMEWORK.md`; visual principles: `docs/VISUAL_DESIGN.md`.

## Architecture, saves, and quality

- Keep simulation rules in pure TypeScript modules, independent of Svelte/browser APIs. UI collects choices and renders simulation-returned effects.
- Keep domain state transitions in their owning modules and use shared ledger/history contracts for cross-domain consequences.
- Current saves are strict and versioned. Incompatible persisted shape changes require a deliberate schema update and validator/tests; do not add silent backward migrations or compatibility defaults.
- Failed actions must leave the complete prior state unchanged. Weekly resolution and financial effects must be deterministic and applied once.
- Test both the local rule and integrated scenarios. Run Svelte checking, the full Vitest suite, and production build after gameplay changes.
- Do not introduce Rust/WASM or other low-level complexity without profiling evidence and a bounded use case.

## Verified passive stamina accounting

- The automatic family-meal +5 stamina recovery is represented in the unified weekly activity review, included in the recap, and applied during weekly resolution. `web/src/lib/lifestyle.test.ts` covers the review reward, recap entry, and resulting stamina increase. Preserve this regression coverage and continue to ensure recovery is applied exactly once.

## Change-control rule

When a newer explicit decision conflicts with an older document, this file records the current direction. Update the older canonical section and its acceptance criteria when next touching that area; do not revive superseded UX or mechanics from historical notes. Before implementing a feature, inspect the current code and tests and label it **implemented**, **partially implemented**, or **planned** accurately.


## Mobile shell and theme-pattern correction
- On phone layouts, use one vertical scroll owner for the page content below the persistent game header. Do not nest a full-height, independently scrolling content element inside an overflow-hidden main layout; this creates a clipped horizontal cutout at the bottom of long pages.
- Keep the bottom navigation fixed and visible. Reserve bottom scroll padding for both the navigation and the floating Advance action, including the device safe-area inset. The final content item must be fully reachable.
- Decorative patterns are reserved for focal feature surfaces. Generic cards and product tiles stay visually quiet; theme identity is expressed through palette, geometry, surface finish, borders, shadows, and a limited signature pattern on focal panels.
- All 17 themes must remain available. Pattern intensity and repetition must not obscure content or make every component in a theme look identical. Respect reduced-motion preferences.


## Age-aware life events and weekly choice dialogs
- The narrative event system must begin at age 0. Standard New Game opens with a birth/arrival introduction grounded in generated character, origin, family and household data; a newborn is never asked to make decisions.
- Event eligibility follows actual age/date, life stage and relevant domain state. Early-childhood decisions are made by an appropriate parent/guardian/responsible adult; player agency increases gradually as the character matures.
- Build age-appropriate event content from infancy through later life. Do not assume a standard family structure, education path, relationship status, health condition or financial situation.
- Important weekly events use a focused, accessible, one-at-a-time choice dialog. Show context, involved people, known costs, requirements, likely outcomes and material risks. Informational events and single-response situations are allowed; do not fabricate choices.
- Keep event actions integrated with the existing weekly plan and simulation validation. Persist pending events, deadlines, outcomes and follow-ups; record consequences in Life History. Quiet weeks remain quiet.
- Status: the existing three-event catalogue and pending-choice/expiry/follow-up mechanics are only an initial event-engine slice. Birth introduction, guardian-mediated child decisions, full age-stage coverage and the dedicated queued weekly dialog experience remain planned.


## Reusable UI framework direction (2026-11-17)
- Build a small, in-repository, theme-aware Svelte UI framework to replace repeated manual CSS changes. It is a shared foundation, not a mandate for uniform-looking screens.
- Use semantic theme tokens, configurable primitives, reusable domain components, and page-level composition. Each component must support meaningful variants for density, surface, hierarchy, layout, tone, and interaction while preserving domain-native identity.
- Cards must size to content by default; Profile metadata cards use compact density. Avoid fixed heights and repetitive decoration.
- Migrate incrementally, beginning with shared primitives and Profile details. Preserve gameplay behavior, save formats, offline operation, and the existing 17-theme palette.
- Shared primitives must be flexible enough for repeated semantic differences (tone, density, shape, surface, layout, and interaction) through backward-compatible props. `ActivityStatusSeal` reuses `UiBadge` semantics rather than maintaining a duplicate status palette. This is foundation work; screen adoption remains incremental and domain-native.
- Canonical implementation contract: docs/UI_FRAMEWORK.md.

## Shared UI adoption update (2026-11-19)
- `UiProgress` is now adopted for Finance Accounts credit/savings progress, Finance Products loan/savings progress, Education course/subject progress, Family relationship metrics, and Health wellbeing/condition meters.
- `UiField` is adopted for bank transaction amount and extra loan repayment amount fields.
- `ActivityStatusSeal` delegates semantic status styling to `UiBadge`. Continue migrating repeated patterns incrementally; do not force domain-specific layouts into generic components.

- Progress-component adoption must preserve the existing semantic bands exactly, including the intermediate coral band and inverse thresholds for stress/severity. `getValueTone` is the shared source for mapping stat values to `UiProgress` tones; do not simplify thresholds during UI migration.
