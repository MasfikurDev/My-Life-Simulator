# AI Working Rules — Read Before Every Task

**Authority:** These rules and the canonical documents are binding product memory, not disposable brainstorming.

## Mandatory reading
Before planning, coding, reviewing, or changing direction, read:
1. `docs/PRODUCT_VISION.md`
2. `docs/GAMEPLAY_DESIGN.md`
3. `docs/VISUAL_DESIGN.md`
4. `docs/TECHNICAL_ARCHITECTURE.md`
5. `docs/ROADMAP.md`
6. For any UI, layout, styling, component, or responsive-behavior task, also read `.github/skills/ui-engineering/SKILL.md` and follow its verification checklist.

Then inspect relevant source and recent Git history. The repository, not an ephemeral chat, is the source of truth.

## Absolute decision-preservation rules
1. Do not reinvent the product. Existing canonical decisions remain in force unless the user explicitly changes them.
2. Do not silently reverse a decision. If a proposal conflicts with canonical docs, explain the conflict before implementation.
3. Do not turn suggestions into requirements. Only user-approved decisions and clearly marked implementation choices are binding.
4. Do not add technology for fashion. Every framework, service, engine, backend, database, or dependency needs a concrete purpose.
5. Do not inflate scope. Build the smallest complete, enjoyable increment; playable progress outranks speculative infrastructure.
6. Do not copy competitors' text, art, brand identity, or distinctive presentation.
7. Preserve the agreed modern, polished, text/card-based 2D direction. Not 3D, not retro text adventure, not spreadsheet.
8. Keep core simulation independent from UI and Android shell.
9. Compact, action-first UX is mandatory: use screen space efficiently, surface frequent actions, and keep related information easy to scan and reach. Do not create oversized whitespace or decorative blocks that push useful gameplay below the fold.
10. Compactness must never come at the cost of readability, accessibility, clear labels, or comfortable touch targets. Use progressive disclosure for secondary details and test narrow Android screens.
10a. UI implementation must follow `.github/skills/ui-engineering/SKILL.md`: use measured layout constraints, consistent spacing, reusable existing patterns, responsive checks, and visual verification. Do not rely on intuition alone for centering, spacing, or sizing.
11. Every new screen/component must justify its space and make a user task or useful information easier to access.
12. No mandatory backend, account, or AI dependency. Core game remains single-player and offline-capable as it evolves.
13. Never advance time automatically.
14. Do not add persistent caching that can pin an old deployed game. No service worker/Cache API shell unless the user approves a revised freshness strategy.
15. No WebAssembly without profiling evidence, a defined boundary, and tests.
16. Never silently break or erase saves. Version and migrate persisted data.
17. Never claim work, tests, builds, deployments, or settings changes that did not actually happen.
18. Do not create local-development prerequisites for the normal workflow. Expected path: GitHub, GitHub Actions, GitHub Pages, install/test APK on Android.
19. Keep CI lean, event-driven, path-filtered, and non-duplicative. No emulator requirement for normal builds.
20. Do not publish a new APK for web-only changes.
21. When an approved decision changes, update the relevant canonical doc and this rules file in the same change.
22. Money is the primary dashboard focus; life stats are secondary. Lead the overview with the real financial state and decisions supported by the simulation. Never fabricate financial metrics or present planned finance systems as implemented.
23. Character creation supports starting ages across the life span, but do not claim every life-stage system is implemented merely because a start age is selectable.
24. Save slots are independent and device-local. Never overwrite another slot, delete a slot without explicit confirmation, or bypass the versioned migration path. Preserve legacy single-save data during migrations.
25. Sound effects must remain optional, user-controllable, lightweight, and safe when browser/WebView audio APIs are unavailable. No unsolicited autoplay music.
26. Character creation is scenario-led, not a free-form age/stat sandbox. Use curated life-stage starts and coherent whole-character generation; do not add arbitrary sliders or isolated stat rerolls.
27. Random identity generation must keep nationality, country, birthplace, primary language, culturally appropriate name pools/name order, and currency internally consistent. Gender may influence name/pronoun selection, but gender and nationality must never determine ability, health, personality, morality, socioeconomic background, or other personal-worth metrics. Currency denomination may vary by country but must not encode relative prosperity.
28. Family background may influence starting financial circumstances only through explicit gameplay rules; it must not predetermine ability or future outcomes. Country-specific economy values are provisional game balance, not real-world claims.
29. New character identity fields must be optional or safely defaulted when loading legacy saves. All currency displays and costs must respect the character's currency scale.

## Conflict resolution
Latest explicit user instruction wins for the changed requirement; preserve all other decisions. If ambiguity materially affects architecture, ask one focused question. Record approved changes and consequences in canonical docs/ADRs.

## Required task workflow
Read canonical docs and inspect implementation; state the smallest intended change; implement in a focused branch/PR; add/update tests; run relevant Actions checks; update affected docs; do not merge unless explicitly requested; report incomplete work and blockers accurately.

## Document authority
Product scope: `PRODUCT_VISION.md`; mechanics: `GAMEPLAY_DESIGN.md`; UI: `VISUAL_DESIGN.md`; implementation: `TECHNICAL_ARCHITECTURE.md`; sequencing: `ROADMAP.md`; agent conduct and decision preservation: this file.
If code and docs disagree, identify the discrepancy and reconcile it without losing user-approved behavior.
