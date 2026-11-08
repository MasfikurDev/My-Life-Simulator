# My Life Simulator — game-first UI review

**Reviewed:** 2026-11-09  
**Target:** GitHub Pages web game, mobile-first Svelte 5 client  
**Review mode:** Read-only design review; no application code changed.

## Coverage

**11 top-level screens/destinations identified in source; 4 live screens/states inspected; 0 critical, 1 serious, 2 moderate, 0 minor findings.**

The live browser inspected the main menu, character creation, active-life Overview, event choice, and week-review flow. It created one temporary randomized character and advanced one week in an isolated automated browser session after confirming there was no existing save. No existing save was overwritten or deleted.

Source inventory: Main Menu, Character Creation, Custom Character Creation, Achievements, Settings, Profile, Overview, Education, Work, Finance, and Life. Life contains Health, Lifestyle, Family, Family Tree, and Life Story views. Finance has its own domain views. A route-based feature map could not be generated because this Svelte application uses state-driven screens rather than route files.

## Product framing

This is a **life-simulation game**, not a SaaS dashboard. Preserve the existing game identity: AMOLED-first presentation, restrained emerald accent, title-screen atmosphere, character profile, life-stage selection, stat display, compact life HUD, domain-specific workspaces, contextual events, and explicit weekly advancement.

Do not install a generic dashboard or catalog design system over the existing visual system. `docs/VISUAL_DESIGN.md` is the maintained visual contract and the live site's extracted tokens agree with its black/emerald/Inter direction.

## Findings

### Serious

#### 1. Fresh-install main menu visually emphasizes a disabled action

- **Rule:** `rule/no-generic-dashboard-frame` (primary user moment should own the strongest first-view hierarchy).
- **Evidence:** `web/src/MainMenu.svelte:13-14`; `web/src/app.css:827-836`.
- **Classification:** Derived from source and confirmed in the live main menu.
- **Finding:** Continue always receives `title-menu-primary`, but is disabled when there are no saved lives. New Game remains visually equivalent to the secondary menu actions. On a fresh install, the strongest visual emphasis therefore belongs to an unavailable action.
- **Recommendation:** Make New Game the primary visual action when no save exists; make Continue primary when at least one saved life exists. Keep the other menu destinations and the current game-menu structure.

### Moderate

#### 2. Character attributes are visible before their gameplay meaning is explained

- **Rule coverage:** The returned Better Design review rules do not include a dedicated life-simulation stat-teaching rule; record as a game-specific coverage gap, not a WCAG failure.
- **Evidence:** `web/src/CharacterCreation.svelte:52-58`.
- **Classification:** Derived from source; character creation was also inspected live.
- **Finding:** Ten numerical attributes are shown as labels, values and meters, but the creation view does not explain how they affect the player's options or outcomes.
- **Recommendation:** Keep character creation compact. Explain stats contextually where they matter—for example, in an activity's requirements, choice preview or outcome recap—instead of adding a wall of descriptions to the generated-character card.

#### 3. Weekly pacing can feel quiet after the yearly event is resolved

- **Rule coverage:** The current review library has no dedicated rule for life-simulation event cadence; record as a game-design risk, not a visual defect.
- **Evidence:** `web/src/lib/events.ts: eligibleEvents/prepareGameEvent`; `web/src/App.svelte:467-489`.
- **Classification:** Derived from source and observed during one live week transition.
- **Finding:** The event preparation guard is year-scoped (`eventPreparedYear`), and the test character received one optional opportunity. After choosing “Decline for now” and advancing to the next week, no new event appeared and the week had no planned activities. This is consistent with the current yearly event preparation design, but repeated quiet weeks could make the weekly turn loop feel inert.
- **Recommendation:** Review event cadence as a gameplay system: retain low-frequency authored life events, while allowing meaningful domain-triggered opportunities, deadlines and follow-through when the character's actual circumstances justify them. Do not force a random event every week or add filler tasks merely to populate the screen.

## Confirmed strengths

- The title screen's orbit/horizon artwork and New Game / Continue language establish a game identity rather than an admin-product identity.
- Character creation communicates a generated life, lets the player choose a starting life stage, and uses “Start this life” rather than form-oriented submit language.
- The life-stage picker and generated identity are compact and age-aware; random generation is an intentional product choice, not a missing customization form.
- The live HUD keeps character identity, age/life stage, cash, year, month and week-position indicators visible.
- The Overview combines the current character, weekly financial flow, current education/work context, a contextual event, and the weekly activity history. These are game-state cues, not generic SaaS metric cards.
- Event choices expose their time and money costs and explain the possible follow-up.
- The Advance FAB leads to a review before resolving the week. The review shows planned activity count, age, year and cash, and the player explicitly confirms “Resolve week and continue.”
- The event decision is retained in Life Story. The Overview activity feed intentionally filters routine activity records; the absence of a declined event from that feed is not evidence that the decision was lost.
- Three save slots are implemented. The automated first-pass suggestion that the slot label implied a single-save system was incorrect.
- The four week dots are a compact month-position indicator. The observed display does not prove that the simulation uses 28-day months; do not describe it as a four-week calendar model.

## Automated review results and interpretation

- Better Design comprehension checks flagged the main menu for 8 visible actions / 84 words and Overview for 70 words. These are text-only heuristics. They were **not** accepted as defects: a game title menu is expected to expose several destinations, and the Overview contains HUD labels, game state and a choice panel rather than one prose block.
- The same menu check treated “MY” as an unexplained acronym and “Continue” as an unclear action. Those are false positives in the context of the full title and standard game-menu convention.
- A generic catalog search returned SaaS, crypto-wallet and metrics-console systems. None is an appropriate replacement for this game's existing identity; no catalog system was selected or installed.
- The initial automated note about an orange fish could not be corroborated in the current menu component or CSS and is excluded as unverified.

## Verification limits

- **Live visual review completed:** Main Menu, Character Creation, Overview, event choice and Week Review.
- **Gameplay flow:** One temporary test life was started and advanced exactly one week in an isolated browser session.
- **Not live-inspected:** Custom Character Creation, Achievements, Settings, Profile, Education, Work, Finance, and nested Life views (Health, Lifestyle, Family, Family Tree, Life Story).
- **Not measured:** Better Design DOM spacing capture at 390 / 1440 / 1728 widths; the tool returned a capture script but no browser DOM-state capture was available to complete the measurement. No numeric spacing score is claimed.
- **Not run:** Full five-walk first-visit suite, physical Android device testing, all-theme screenshot comparison, keyboard/screen-reader walkthrough, and full gameplay balance review.
- The live visual pass did not identify an obvious clipping or overlap defect in the inspected main menu and character-creation screens. This is not a full responsive pass.

## Recommended order

1. Correct the dynamic main-menu primary action.
2. Improve stat learning at the point of gameplay decisions and outcome feedback.
3. Review weekly content cadence and event follow-through without forcing filler events.
4. Continue the separate accessibility and mobile/theme QA backlog.
5. Complete live review of every remaining domain workspace and dialog, then run measured spacing and interaction checks.

**Scope boundary:** This is a review report only. It does not authorize a redesign, changes to random character generation, extra stat/trait systems, new HUD widgets, or changes to the established visual identity.
