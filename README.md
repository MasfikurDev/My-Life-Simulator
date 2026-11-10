# My Life Simulator

A modern, Android-first, single-player life simulation. The game is built as a TypeScript/Svelte web app and delivered through GitHub Pages, with a lightweight native Android WebView wrapper.

## Project direction

The game is built around a connected life story: meaningful choices, evolving relationships, education, work, personal wellbeing, finances, opportunities, and consequences. It prioritizes enjoyable play, player agency, coherent simulation, replayability, and a polished mobile experience over feature count or unnecessary realism.

**Current authoritative direction:** [Current Product and Gameplay Direction](docs/CURRENT_DIRECTION.md) records the latest decisions, including the unified weekly activity list, passive activity accounting, Lifestyle Supermarket inventory and food-planning rules, and current UI constraints. Where older wording conflicts, follow that document and update the older section when next editing it.

The canonical gameplay clock is:
- **Week:** the playable turn. Players toggle personal activities in their own domain; stamina is their effort budget. Education and employment remain automatic background responsibilities; there is no player-managed timetable. The weekly review previews costs, rewards and wellbeing outcomes before resolution.
- **Month:** the intended recurring finance and reporting cadence. Monthly settlement is still a planned follow-up; current salary and household settlement remain annual.
- **Year:** birthdays, age/life-stage progression, annual financial settlement, and longer-term life review.

## Start here

- [Product vision](docs/PRODUCT_VISION.md)
- [Gameplay design](docs/GAMEPLAY_DESIGN.md)
- [Gameplay loop and acceptance criteria](docs/GAMEPLAY_LOOP.md)
- [Current product and gameplay direction](docs/CURRENT_DIRECTION.md)
- [Visual design](docs/VISUAL_DESIGN.md)
- [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [CI and delivery](docs/CI_CD.md)
- [Roadmap](docs/ROADMAP.md)
- [AI working rules](docs/AI_WORKING_RULES.md)
- [Pull request workflow](docs/PULL_REQUEST_WORKFLOW.md)

System specifications:
- [Family system](docs/FAMILY_SYSTEM.md)
- [Career progression](docs/CAREER_PROGRESSION.md)
- [Personal Technology](docs/PERSONAL_TECHNOLOGY.md)
- [Lifestyle economy](docs/LIFESTYLE_ECONOMY.md)

**The repository is the source of truth.** Contributors and AI agents must read the canonical documents before changing product direction or implementation, inspect current code/tests, distinguish implemented from planned behavior, and update affected documentation in the same change.

## Current implemented foundation

- Scenario-led character creation with coherent randomized identity and age-appropriate starting state.
- Three independent local save slots, strict current-schema validation, and explicit reset handling for unsupported old formats.
- Date-based weekly progression with automatic school/work responsibilities and stamina-based personal activities.
- Domain-native activity selection across School, Work, Family, Business, Events and Health; the Advance review is the combined activity-plan and outcome surface.
- Deterministic weekly resolution, activity effects/costs, history records, recap, and stale-plan protection.
- Domain workspaces for School, Work, Life, Finance, Lifestyle, and Business.
- A persistent family graph with targeted interactions and auditable financial support.
- Job listings, applications, interviews, expiring offers, employment changes, career previews, promotion offers, and resignation.
- Financial accounts, cards, loans, savings, recurring payments, property, investments, business ownership, taxation, and a shared transaction history.
- Overview activity history grouped by week, with the current week expanded by default; Life History is reserved for major achievements and life-stage milestones.
- Responsive dark mobile-first interface and a native Android WebView shell.

This is a substantial playable foundation, not a completed birth-to-death simulation. Retirement, mortality, terminal life completion, generational play, full School attendance/grades, monthly settlement, and deeper family lifecycle mechanics remain planned.

## Development and delivery

**Draft-first PR workflow is required.** Keep substantial work in a Draft PR throughout implementation, testing, UI review, and last-minute refinement. Mark it ready only after implementation and validation are complete; merge only after synchronizing with the latest `main`, re-running final CI, and reviewing the complete diff. See [Pull Request Workflow](docs/PULL_REQUEST_WORKFLOW.md).

- Web game: `web/` (Svelte 5, TypeScript, Vite)
- Android wrapper: `android/` (Kotlin WebView)
- CI and hosting: GitHub Actions + GitHub Pages
- Web validation runs type checking, tests, and the production build; successful pushes to `main` deploy the built web app to Pages.
- Web-only changes do not require a new APK.
- Android APK builds run only when Android wrapper sources or its workflow paths change. Successful main-branch Android builds publish a beta pre-release and a downloadable workflow artifact (subject to the active workflow configuration).

## GitHub Pages

In repository **Settings → Pages**, set **Source** to **GitHub Actions**.

Published game: https://masfikurdev.github.io/My-Life-Simulator/

## Android installation and updates

Install the latest successful `my-life-simulator-debug-apk` artifact from the Android wrapper workflow, or use the beta pre-release on GitHub Releases. The APK is a lightweight wrapper: normal web-game updates arrive from GitHub Pages on a fresh app launch, so web-only changes do not require reinstalling the APK.

The wrapper clears its WebView disk cache at fresh launch, then permits normal HTTP caching during the session. The web client does not register a service worker. See [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) for the freshness and save-compatibility policies.

## Deployment boundary

GitHub Pages is the only active web deployment target. Cloudflare Workers/Pages configuration and deployment automation were removed; do not reintroduce them unless the deployment decision is explicitly revisited.
