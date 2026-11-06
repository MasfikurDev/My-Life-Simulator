# Technical Architecture

**Canonical implementation direction · Reviewed 2026-11-05**

## Delivery architecture
The game is a TypeScript web application hosted on GitHub Pages and opened inside a small native Android WebView shell. Gameplay/UI updates publish through GitHub without reinstalling the APK for every web change.

```mermaid
flowchart TD
  Player --> APK[Android APK - Kotlin WebView]
  APK -->|HTTPS| Pages[GitHub Pages]
  Pages --> Web[Svelte 5 + TypeScript web client]
  Web --> UI[Responsive UI]
  UI <--> Sim[Pure TypeScript simulation]
  Web <--> Save[Versioned local save]
  Repo[Git repository] --> CI[GitHub Actions]
  CI -->|deploy web build| Pages
  CI -->|build on Android changes| APK
```

## Technology decisions
- Web UI: Svelte 5 + TypeScript + Vite.
- Simulation: plain TypeScript domain modules independent of Svelte/browser APIs.
- Tests: Vitest for deterministic simulation and persistence behavior.
- Hosting: GitHub Pages, deployed through GitHub Actions.
- Android: Kotlin Activity + Android WebView; no game logic in the shell.
- Android build: GitHub-hosted runners; no local Android Studio requirement for the normal workflow.
- Initial persistence: versioned local save storage behind a storage adapter; move to IndexedDB only when size/transaction needs justify it.
- WASM: only for a measured CPU-heavy workload with a clear, tested boundary. Keep authoritative game rules in TypeScript until profiling proves a bottleneck.

## Repository layout
- `web/`: Svelte web client, simulation, styles, tests, Vite build.
- `android/`: minimal WebView wrapper.
- `docs/`: canonical product and engineering decisions.
- `.github/workflows/`: lean validation, Pages deployment, Android build.

## Freshness and cache policy
- Wrapper loads the HTTPS GitHub Pages URL.
- Clear WebView disk cache at a fresh app launch, then allow normal HTTP caching during that session. This checks for a fresh deployment without disabling caching for every asset request.
- Do not register a service worker or persistent Cache API shell in the initial implementation.
- Vite production assets use content hashes, so changed files have new URLs.
- The entry HTML is requested afresh on each cold launch; do not restore a previously rendered WebView page after process recreation.
- Provide a refresh/retry path for a user who leaves the app open during a deployment.
- Never treat mutable content or save data as immutable assets.
- Never use HTTP, disable TLS checks, or enable mixed content to work around hosting.
- GitHub Pages does not honor arbitrary server config files such as a presumed `_headers` file; do not rely on one.

## Save compatibility
Persist an explicit schema version. Validate data before use. Add forward migrations when shape changes. Malformed/unsupported data must not crash the app or silently overwrite an existing save. Keep game state separate from transient UI state. Web deployments must not reset saves without an explicit migration and documented reason.

The current localStorage adapter supports three independent save slots. Schema version 2 stores the active slot ID and each slot's character plus update timestamp. Version 1's single-character save migrates into slot 1 without discarding the character. Settings such as sound preference are stored separately from game state. Saves remain device-local; no cloud sync or backup is implied.

## Simulation boundaries
Core simulation inputs are game state, action/choice, and random source/seed. Outputs are updated state plus explicit effects/history. No DOM, Svelte, localStorage, network, or Android imports in core simulation. Time advancement is an explicit domain operation. Use integer minor units for money once currency arithmetic expands. Validate invariants at boundaries.

## Performance
Keep initial bundle small; avoid unnecessary dependencies. Lazy-load optional heavy features. Profile before optimizing. WASM is not automatically faster: boundary crossings, conversion, build complexity, and mobile constraints must be measured. Test on a real mid-range Android device and throttled mobile connection. Avoid blocking animations and layout shifts.

## Security and privacy
No accounts/backend needed initially. Keep saves on-device unless opt-in sync is later approved. No secrets in the web bundle/repository. WebView loads only the exact HTTPS game host; unrelated links open in the system browser. Disable file/content access and mixed content.


## Native clipboard bridge
The Android WebView exposes a narrowly scoped `AndroidApp.copyToClipboard(text)` JavaScript interface method. It writes a user-requested gameplay debug snapshot through Android's system ClipboardManager and reports success synchronously. Web UI code prefers this native bridge, then uses the secure-context browser Clipboard API, then a focused `execCommand('copy')` fallback for older WebViews. Never report a successful copy unless one of these methods confirms it. Keep the bridge limited to explicit user-initiated copy actions.

## Education, employment, and recurring finances
Education progress, employment records, salary, annual living-cost estimates, performance, experience, and promotions are fields on the simulation's Character model. These new fields are optional to preserve existing save compatibility; no storage schema bump is required. Eligibility is centralized in `progression.ts` and checked again by `performActivity`. Annual income/expenses and promotion outcomes are applied in `advanceYear`, then recorded in the character history. Keep country salary balancing explicitly provisional and never use the UI to invent finance state.


## Native Android branding and launch experience
- The original title artwork is the Android launcher/app logo, referenced by the adaptive launcher icon foreground. Keep the source PNG unchanged.
- The title-less life-progression artwork is the centered Android splash image. The AndroidX SplashScreen compatibility API holds it while the hosted game loads, then moves it upward and fades it out when the first page finishes (or a main-frame load error is shown).
- These two artworks are native Android assets only. Do not render either image inside the welcome or character-creation web UI.
- Preserve the splash's black background and avoid adding a second in-page loading/branding hero.
