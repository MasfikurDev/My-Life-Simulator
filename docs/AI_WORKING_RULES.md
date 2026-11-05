# AI Working Rules — Read Before Every Task

**Authority:** These rules and the canonical documents are binding product memory, not disposable brainstorming.

## Mandatory reading
Before planning, coding, reviewing, or changing direction, read:
1. `docs/PRODUCT_VISION.md`
2. `docs/GAMEPLAY_DESIGN.md`
3. `docs/VISUAL_DESIGN.md`
4. `docs/TECHNICAL_ARCHITECTURE.md`
5. `docs/ROADMAP.md`

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
9. No mandatory backend, account, or AI dependency. Core game remains single-player and offline-capable as it evolves.
10. Never advance time automatically.
11. Do not add persistent caching that can pin an old deployed game. No service worker/Cache API shell unless the user approves a revised freshness strategy.
12. No WebAssembly without profiling evidence, a defined boundary, and tests.
13. Never silently break or erase saves. Version and migrate persisted data.
14. Never claim work, tests, builds, deployments, or settings changes that did not actually happen.
15. Do not create local-development prerequisites for the normal workflow. Expected path: GitHub, GitHub Actions, GitHub Pages, install/test APK on Android.
16. Keep CI lean, event-driven, path-filtered, and non-duplicative. No emulator requirement for normal builds.
17. Do not publish a new APK for web-only changes.
18. When an approved decision changes, update the relevant canonical doc and this rules file in the same change.

## Conflict resolution
Latest explicit user instruction wins for the changed requirement; preserve all other decisions. If ambiguity materially affects architecture, ask one focused question. Record approved changes and consequences in canonical docs/ADRs.

## Required task workflow
Read canonical docs and inspect implementation; state the smallest intended change; implement in a focused branch/PR; add/update tests; run relevant Actions checks; update affected docs; do not merge unless explicitly requested; report incomplete work and blockers accurately.

## Document authority
Product scope: `PRODUCT_VISION.md`; mechanics: `GAMEPLAY_DESIGN.md`; UI: `VISUAL_DESIGN.md`; implementation: `TECHNICAL_ARCHITECTURE.md`; sequencing: `ROADMAP.md`; agent conduct and decision preservation: this file.
If code and docs disagree, identify the discrepancy and reconcile it without losing user-approved behavior.
