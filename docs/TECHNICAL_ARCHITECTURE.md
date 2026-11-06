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


## Household finance model
Household arrangement, savings-goal duration, annual income, paid expenses, and unpaid shortfall are optional Character fields. `getHouseholdBudget` is a pure simulation calculation; `advanceYear` settles the annual budget, applies financial-pressure effects, and records history. No negative balance or debt is generated. The savings target is derived from the selected number of months of estimated costs and current cash; it is not a separate account. Existing local saves require no schema-version bump.


## Banking and financial ledger
- Optional `bankAccounts` and `financialTransactions` fields extend Character without a schema-version bump; legacy saves remain cash-only until accounts are opened.
- Cash and account balances are distinct integer currency units. `getNetWorth` currently sums cash and bank balances only; expand it when liabilities and other assets are implemented.
- Account operations are pure simulation functions. Each successful operation returns a new Character and records a transaction. Reject overdrafts, invalid values, missing accounts, same-account transfers, and accounts beyond the configured limit.
- The transaction ledger is bounded to the latest 300 records. Annual income, household expense settlement, and savings interest also append ledger entries.
- Current products: checking (0% annual interest) and savings (2% annual interest). Rates are provisional game values.


## Financial products
- Cards, loans, recurring payments, automatic deposits, and personal vault balances are optional Character fields for legacy-save compatibility.
- Debit card purchases debit a linked account; credit card purchases increase a liability up to the configured limit. Credit card debt is included in net worth and accrues a simplified annual rate.
- Loan issuance adds cash and an equal liability. Interest and repayments are posted to the common ledger during year settlement. Extra repayments reduce both cash/account holdings and principal liability.
- Recurring payments are annual game-time charges with explicit funding source. Failed cash/account payments do not create debt. Card-funded charges require available credit.
- Auto-deposit rules transfer cash to an account after household costs. Vault operations transfer cash into/out of a separate holding. All these movements must preserve net worth except for actual spending, interest, and loan interest.
- Year settlement is deterministic in order: income and household costs, automatic deposits, recurring payments, loan interest/installments, credit interest/minimum payments. The ledger is capped at 300 entries.


## Property, markets and business assets
- Optional property, rental-home, investment-holding, market-price, and business arrays preserve compatibility with existing saves.
- Mortgage-financed property acquisition issues an equal loan liability and asset value; the down payment is cash outflow. Property sale pays off the linked mortgage before proceeds return to cash.
- Rental income and business operating results are posted to the financial ledger. Property maintenance is included in the annual housing budget. Property appreciation and market movements update asset values during year advancement.
- Stock-index and gold holdings use whole units and current simulated prices. Trading moves cash to/from asset value. Market price updates are deterministic per simulated year to keep saves and tests reproducible while still allowing gains and losses.
- Business startup moves cash into business valuation; operating profit/loss changes cash, and management consumes an action plus a cash cost.
- Net worth includes all modeled asset classes and subtracts loan and credit-card liabilities.


## Additional bank products
- Checking and savings accounts remain liquid. Fixed deposits store a maturity year and lock withdrawals until that simulated year; their simplified annual rate is 4.5%.
- Prepaid cards store a positive funded balance. Loading transfers value from cash or a bank account; purchases and recurring charges reduce the stored balance. Prepaid balances are assets in net worth, unlike credit card balances which are liabilities.

- Recurring debit-card charges debit the card's linked deposit account; recurring credit-card charges increase the card liability; prepaid-card charges reduce the stored prepaid balance.


## Economic simulation
- `Character.economy` is optional for save compatibility and stores bounded inflation, growth, benchmark rate, cycle, cost-of-living index, and last update year.
- Annual economic conditions are derived deterministically from simulated year and age. The same input save produces the same rates and market update.
- Inflation updates the cost index, recurring charges, rental agreements, and household budget. Market asset updates are bounded: equities respond primarily to growth, gold responds more to inflation, property growth responds to both, and business operating results respond to growth and performance.
- Economic values are fictional and should be labeled as simplified estimates. Avoid presenting them as real market predictions.


## Tax settlement
- Optional `lastYearTax` and `taxBalance` fields preserve legacy saves. Progressive wage tax, positive rental/business income tax, and property levy are assessed annually after asset income and before financial-product autopay.
- Tax settlement draws cash first, then checking/savings balances. Fixed-deposit accounts cannot be used before maturity. Any unpaid amount remains a liability and is deducted from net worth; no negative cash balance is permitted.
- Tax amounts are game-balance assumptions, not jurisdiction-specific tax advice. Ledger entries record paid amounts and remaining liability.


## Creditworthiness
- Credit score is derived from the capped financial ledger, active credit-card utilization, active loan balance relative to annual income, and outstanding tax liability. It is deterministic and does not require a separate migration field.
- Loan issuance enforces age, active-loan count, minimum credit score, and a score-based minimum interest rate per loan type. The score does not yet calculate a full affordability ratio or a country-specific bureau report.


## Trading and property transaction costs
- Stock-index and gold trades charge a 0.5% brokerage fee. Buy fees are included in the holding's average cost basis; sell fees reduce proceeds. Positive realized gains incur a simplified 10% capital-gains tax recorded in the ledger.
- Property purchases and sales charge a 1% service/transfer fee. Positive realized property gains incur a simplified 10% capital-gains tax. Sale proceeds must cover linked mortgage debt, fees, and tax or the sale is rejected.
- Fees reduce net worth; transfers between cash and holdings preserve value only before fees. Capital-gains taxes are paid from proceeds and recorded separately.


## Domain module architecture
Keep the simulation domain model independent from Svelte components. Organize UI and simulation capabilities around bounded life-system modules; shared types and persistence are contracts, not a reason to combine screens.

Current Finance UI boundary:
- FinanceWorkspace.svelte is the Finance parent shell and owns finance-only sub-navigation.
- FinanceAccounts.svelte owns Banking: account opening, balances, cash/account movement, and transaction activity.
- FinanceProducts.svelte owns reusable focused product views for cards, loans, recurring bills/subscriptions, and automatic savings/vault. A view selects one module at a time.
- FinanceTaxes.svelte owns tax estimates, annual assessments, and outstanding tax liabilities; tax information does not appear in Banking.
- FinanceAssets.svelte owns focused Property, Investments, and Business views, selected independently.
- FinanceLivingCosts.svelte owns household arrangements, estimated living costs, and emergency savings targets.
- App.svelte owns global navigation, character lifecycle, persistence, and time progression. It should not assemble all finance modules inline.

Future Education and Work modules must follow the same boundary pattern:
- Education owns school enrollment, classes, attendance, grades, fees, study sessions, and education history.
- Work owns job discovery, applications, interviews, offers, employment, workplace actions/performance, payroll and career history.
- Do not implement Education/Work as status panels inside Finance. Their simulation logic should be callable through domain functions and their UI should be independent components/destinations.

Shared cross-domain effects are communicated through explicit simulation transactions, history events, or narrowly scoped state changes. A bank account may receive salary, but the bank screen does not become a work screen. Keep each domain independently testable and progressively unlockable by age/eligibility.


## Life workspace
The top-level Life destination is a modular UI workspace, not a new simulation subsystem. Its focused sections are Overview, Wellbeing (health, happiness, fitness), Personal Growth (intelligence), Personal (exercise and social activities), and Life History. The workspace reuses Character fields, existing activity eligibility and affordability functions, `performActivity`, and the shared chronological `history` array. Do not duplicate or migrate persisted state solely to support navigation. School and Work remain separate top-level destinations; settings may show a short recent-log preview but the complete history belongs in Life.


## Banking and Lifestyle ownership

- `FinanceWorkspace.svelte` owns only Finance-level destinations: Banking, Taxes, Property, Investments, and Business.
- `FinanceAccounts.svelte` is the Banking shell and owns internal Accounts, Cards, Loans, and Savings & vault sections. It composes the existing `FinanceProducts.svelte` views for card, loan, and savings/vault operations.
- `LifeWorkspace.svelte` owns the Lifestyle destination and composes `LifestyleWorkspace.svelte`.
- `LifestyleWorkspace.svelte` provides Discover, My services, and Home. Discover uses existing recurring-payment actions for provider subscriptions and simulation purchase actions for supermarket checkouts. My services reads the existing `recurringPayments`, `cards`, and `financialTransactions` state; it does not maintain duplicate records. Home reuses `FinanceLivingCosts.svelte` for household arrangement and budget settings. Emergency savings goals are owned by the Banking savings section in `FinanceProducts.svelte`.
- `makeCashPurchase` and `makeAccountPurchase` debit their selected source and write a financial transaction plus life-history event. Card purchases continue through `makeCardPurchase`, which enforces the card's own available balance or credit limit.
- No Character schema migration is required. Existing `recurringPayments`, card, bank-account, and household fields remain the source of truth.


## Annual progression and event architecture (planned)

The simulation will evolve from a mostly deterministic annual stat/finance update into a phase-based, event-driven yearly chapter. Keep the core pure TypeScript and independent of Svelte/browser APIs.

Planned boundaries:
- `year-cycle.ts` (or equivalent domain module) coordinates explicit phases: prepare year, resolve player decisions, validate unresolved choices, settle annual systems, age/progress, and produce a recap. Do not introduce this module until its boundaries are clear from the existing simulation code.
- `events/` owns event definitions, eligibility, selection weights/cooldowns, choice validation, immediate effects, delayed effects, follow-up flags, and history descriptions.
- Domain modules (School, Work, Life/Health, Relationships/Family, Finance, Lifestyle) own their state transitions. The event resolver may invoke domain operations but must not duplicate their business rules.
- The save owns persistent event state: resolved event IDs/versions, cooldowns, choice flags, pending consequences, and a reproducible random seed/state. New fields must be optional/defaulted or migrated safely.
- Event content is data-driven where useful, but do not build a generic event scripting language or content platform before a small playable set proves the pattern.
- Event and year resolution must be deterministic for the same save, choices, and random seed. Avoid ambient `Math.random()` in authoritative simulation paths.
- Year-end resolution order must be explicit, documented, and tested. A proposed order is: income/financial settlement; recurring commitments and liabilities; school/work progression; household/family changes; health/relationship drift; delayed event consequences; age/life-stage transition; next-year event preparation. Adjust only when domain dependencies require it.
- Return structured effects/recap data from simulation functions so UI can explain meaningful outcomes without re-deriving rules.
- Keep player-facing event content, consequences, and history portable across save/load. Content-version changes must not replay completed events or corrupt pending outcomes.

### Simulation test requirements
- Unit-test event eligibility, costs, outcomes, cooldowns, follow-ups, and invalid choices.
- Test deterministic replay from identical state/seed and save/load continuity with pending consequences.
- Test age/circumstance eligibility in the simulation layer, not only UI.
- Test that financial events preserve ledger and balance-sheet invariants.
- Test that dead characters cannot advance time or perform living-character actions.
- Add multi-year scenario tests that exercise several connected systems; isolated unit tests alone are insufficient evidence of an enjoyable gameplay loop.

The complete design contract and player-facing acceptance criteria are in `docs/GAMEPLAY_LOOP.md`. These are planned boundaries; do not claim they exist until implemented and tested.
