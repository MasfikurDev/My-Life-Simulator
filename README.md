# My Life Simulator

A modern, Android-first life simulation game. The game is a TypeScript web app hosted on GitHub Pages and opened through a lightweight native Android WebView shell.

## Start here
- [Product vision](docs/PRODUCT_VISION.md)
- [Gameplay design](docs/GAMEPLAY_DESIGN.md)
- [Visual design](docs/VISUAL_DESIGN.md)
- [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [AI working rules](docs/AI_WORKING_RULES.md)
- [Roadmap](docs/ROADMAP.md)

**All contributors and AI agents must read the canonical documents before changing product direction or implementation.** The repository, not an ephemeral chat, is the source of truth.

## Development and delivery
- Web game: `web/` (Svelte 5, TypeScript, Vite)
- Android shell: `android/` (Kotlin WebView)
- CI and hosting: GitHub Actions + GitHub Pages
- Web changes deploy independently; they do not require a new APK.
- Android APKs are built only when Android wrapper sources or its workflow change.

## GitHub Pages setup
In repository **Settings → Pages**, set **Source** to **GitHub Actions**. The web workflow deploys the `web/` build from `main` after validation succeeds.

Published game URL: https://masfikurdev.github.io/My-Life-Simulator/

## First install
Run the **Android wrapper APK** workflow (or merge an Android change to `main`), then download the `my-life-simulator-debug-apk` artifact from its successful run and install the APK. Once installed, web-only updates arrive through Pages on the next fresh app launch; reinstalling the APK is not needed for normal game updates.

The wrapper clears its WebView disk cache at fresh launch, then permits normal HTTP caching during the session. The web client does not register a service worker. See the architecture document for the full freshness policy.

## Current state
Early playable foundation: character creation, a responsive dashboard, basic activities, deliberate year advancement, a local save, and a chronological history. This is an initial slice, not the completed game.
