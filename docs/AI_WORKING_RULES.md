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
11a. UI copy must be useful and factual: remove generic motivational slogans, inspirational filler, and decorative messages. Keep copy only when it explains game state, an action, a cost, eligibility, a consequence, or a limitation.
11b. Do not duplicate the same action, shortcut, summary, or destination control on one screen. Check existing components and navigation before adding another; keep one clear primary control for each function.
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

30. Every gameplay mechanic must declare age eligibility and prerequisites, and enforce them in the simulation layer as well as the UI. Never expose adult systems prematurely; hide unavailable actions and unlock them gradually at the appropriate life stage.
31. Use the canonical life-stage bands in GAMEPLAY_DESIGN.md; age bands are progression rules, not assumptions about an individual's worth or inevitable life path.
32. Settings must expose a concise chronological game log and a portable, versioned debug snapshot. Export only game state and history required to reproduce a report; never include device identifiers, browser data, credentials, or unrelated settings.

## Conflict resolution
Latest explicit user instruction wins for the changed requirement; preserve all other decisions. If ambiguity materially affects architecture, ask one focused question. Record approved changes and consequences in canonical docs/ADRs.

## Required task workflow
Read canonical docs and inspect implementation; state the smallest intended change; implement in a focused branch/PR; add/update tests; run relevant Actions checks; update affected docs; do not merge unless explicitly requested; report incomplete work and blockers accurately.

## Document authority
Product scope: `PRODUCT_VISION.md`; mechanics: `GAMEPLAY_DESIGN.md`; UI: `VISUAL_DESIGN.md`; implementation: `TECHNICAL_ARCHITECTURE.md`; sequencing: `ROADMAP.md`; agent conduct and decision preservation: this file.
If code and docs disagree, identify the discrepancy and reconcile it without losing user-approved behavior.

33. Education and employment mechanics must remain age-gated in both UI and simulation. Ages 16–17 may access part-time roles only; full-time employment and higher education unlock at 18; later-life flexible work is optional from 65. Existing employment may continue beyond 65.
34. Recurring finance values must be calculated by the simulation and recorded in life history. Clearly label simplified salary and living-cost assumptions as game-balance values; do not imply real-world country salary accuracy. Do not invent debt, taxes, benefits, assets, or household expenses until implemented.
35. Add new character/save fields as optional or safely defaulted. Existing local saves must continue to load without destructive schema changes.
36. Clipboard export must use the native Android clipboard bridge in WebView when available, then browser clipboard APIs and a user-gesture fallback. Never display a success message unless a clipboard method confirms success.

37. Paid gameplay actions must enforce affordability in both UI and simulation. Never grant an action's benefits for free when its cost cannot be paid; unaffordable actions must not consume an action or mutate state.


38. Keep the two supplied brand artworks in their distinct native roles: title artwork is the Android app/launcher logo; title-less life-progression artwork is the centered Android splash image that moves upward and fades when the WebView finishes its initial load. Never place either artwork in the web welcome or character-creation UI, and never redraw or alter the source PNGs.


39. Household finance mechanics unlock at age 18. Living arrangement and recurring budget must be stored on the Character, calculated by the simulation, and recorded in life history. Unpaid costs are shortfalls, not debt; never allow a negative cash balance or imply taxes, benefits, debt, or assets exist until implemented. Savings goals are targets measured against available cash, not separate or locked accounts. Preserve legacy saves with optional fields.


40. Banking and financial products must use the shared Character financial model and auditable transaction ledger. Cash, account balances, assets, and liabilities are distinct. Transfers must preserve total money; reject overdrafts and invalid operations. Legacy saves remain readable. Do not display a complete net-worth claim while only cash and bank balances are counted.

41. Financial-product operations must post to the shared ledger and preserve balance-sheet invariants: loan issuance creates equal cash and liability; repayment reduces both; card spending creates card liability or reduces a linked deposit account; deposits and vault transfers only move holdings. Net worth must subtract active loans and credit-card debt. Recurring payments must state their funding source and log missed payments without silently creating debt. Legacy saves must remain readable.

42. Property, investments, and businesses must be represented as assets with current values and must be included in net worth; linked mortgages, personal/business loans, and credit balances remain liabilities. Property sales must settle linked mortgages before paying proceeds. Trading transfers value between cash and holdings; never mint money. Market movements must be bounded and reproducible. Legacy saves remain valid.

43. Fixed deposits must enforce their maturity lock in simulation functions, not only UI. Prepaid card funds are an asset: loading moves existing cash/account value and spending reduces it. Credit card balances are liabilities. All new product types must be represented in net worth and the shared transaction ledger.

44. Recurring card payments must honor the card's funding model: debit cards debit their linked bank account, credit cards increase liabilities only within available credit, and prepaid cards spend only loaded funds. Missed charges must be recorded without creating hidden balances.

44. Economic simulation must be deterministic for a given save/year, bounded against runaway rates and asset changes, and preserve legacy-save compatibility. Inflation must flow into cost-of-living and recurring price assumptions; market assets must respond to economic conditions without guaranteeing returns. Clearly label all rates and market movements as fictional simplified game estimates.

45. Tax settlement must be deterministic, auditable, and never create negative cash. Pay from cash and eligible liquid accounts only; fixed deposits remain locked until maturity. Any unpaid tax must remain a visible liability included in net worth. Keep rates clearly labeled as fictional game rules, not jurisdiction-specific advice.

46. Credit score must be derived consistently from auditable financial state, bounded to 300–850, and treated as a simplified fictional metric. Loan products must enforce the score-based minimum rate and never silently approve a rate below the floor. Do not claim the score matches any real credit bureau.

47. Trading and property sale fees and realized capital-gains taxes must be reflected in cash proceeds and the shared ledger. Include purchase fees in investment cost basis, deduct sale fees/tax from proceeds, and reject property sales that cannot settle linked debt and transaction costs. Never create money through a sale.

48. Every major life system must be modular and domain-native. Keep domain UI, vocabulary, navigation, controls, and feedback inside its owning experience. Parent areas group related destinations; they must not become long pages containing unrelated systems.
49. Finance has top-level Banking, Taxes, Property, Investments, and Business destinations. Banking internally contains Accounts, Cards, Loans, and Savings & vault. Life → Lifestyle contains Discover, My services, and Home; Home owns household arrangement and estimated living costs, while emergency savings targets stay in Banking. Never place household budget controls on Banking or education/work summaries inside Finance.
50. Education must feel like a school/institution and Work must feel like recruitment/workplace. Do not implement them as generic dashboard cards or finance sub-panels. Share simulation state and global navigation without merging domain experiences.
51. A focused domain view should show its relevant controls by default, use progressive disclosure for secondary operations, and avoid repeating unrelated summaries or messages. Age locks must be explicit and consistent with simulation eligibility.

52. Keep School and Work as separate age-gated top-level destinations. Study belongs in School; job applications, extra work, and career development belong in Work. Reuse existing simulation state and actions. Never imply enrollment, attendance, grades, interviews, offers, employers, or workplace features exist until their mechanics are implemented and tested.

53. Life is the parent workspace for personal wellbeing, personal growth, personal activities, and complete life history. Keep its sections modular: Overview, Wellbeing (health, happiness, fitness), Personal Growth (intelligence), Personal (exercise/play and social time), and Life History. Do not keep Personal or Life History as separate top-level navigation destinations. The money-first dashboard must not become a duplicate life-stat or activity page. Reuse existing Character fields, eligibility/affordability rules, simulation actions, and shared history; do not invent unimplemented health, family, or relationship systems.


54. The main Overview header must present authoritative current-life context: age/life stage, education stage, and employment status, with age-appropriate wording derived from progression and Character state. Do not imply school enrollment, qualifications, employment, or career progress that the save does not contain. Keep detailed education controls in School, employment/career controls in Work, personal stats and activities in Life, and financial products in Finance. Before adding Overview content, compare it with persistent navigation and each domain workspace; remove repeated identity, summaries, shortcuts, and actions unless the repetition serves a distinct navigation or decision purpose.


55. Finance navigation is limited to Banking, Taxes, Property, Investments, and Business. Banking owns accounts, cards, loans, savings deposits, and personal vault. Cards and loans are internal Banking sections, not Finance destinations. Do not reintroduce separate Finance menu entries for Cards, Loans, Bills & Subscriptions, Savings & Vault, or Living Costs.
56. Life → Lifestyle owns Discover, My services, and Home. Discover is the marketplace for fictional provider subscriptions and everyday purchases such as supermarket baskets. My services lists active subscriptions, recurring commitments, and payment methods in use. Home owns the existing household arrangement and annual living-cost estimates. Emergency savings targets are managed in Banking → Savings & vault. Do not move these back into Finance navigation.
57. Payment-card controls and authoritative card balances exist only in Banking. Lifestyle may show a concise read-only card/payment-method reference to explain how a subscription is paid, but must not duplicate card controls or imply a separate card ledger. Subscription records remain in the existing recurringPayments field; do not create a second subscription store.
58. Provider subscriptions must use the existing recurring-payment settlement rules and explicitly show annual price, payment method, age eligibility, cancellation, and missed-payment behavior. One-time supermarket checkouts must debit cash, the selected bank account, or the selected active card and record financial activity/history. Never silently create debt for a failed cash/card purchase.
59. Before changing navigation or adding a summary, inspect all relevant destinations for duplicate information and actions. Keep one authoritative management location; use read-only references elsewhere only when they explain a genuine cross-domain relationship.


60. This is a GAME. Optimize for enjoyable play, player agency, replayability, pacing, meaningful decisions, surprise, and satisfying feedback—not for the number of menus, stats, or modeled real-world details. A realistic system that creates no interesting player decision is not automatically worth building.
61. Treat `docs/GAMEPLAY_LOOP.md` as the canonical redesign specification. Read it before changing annual progression, events, stats, life stages, mortality, or game balance. Keep it synchronized with GAMEPLAY_DESIGN.md and ROADMAP.md.
62. The annual loop must be a playable chapter: open-year context, meaningful player decisions, contextual events, year review, explicit player-controlled advancement, deterministic year-end settlement, and a useful recap. Never auto-advance time.
63. Every event must be contextually eligible, age-appropriate, non-repetitive, and connected to state. Choices must communicate known costs/risks and produce materially different immediate or delayed outcomes. Record important choices and consequences in history. No fake choices or random events that contradict the save.
64. Do not let repeated Advance Year presses become the dominant strategy. Review action-budget bypasses, stat grinding, predictable income exploits, and dominant strategies in every gameplay test. Keep the action budget simple unless playtesting proves it needs change.
65. Make stats consequential and understandable. Health, happiness, intelligence, and fitness must influence appropriate actions/outcomes, with bounded values and recovery paths. Never add hidden arbitrary penalties or make a single stat the answer to every situation.
66. Keep the UI domain-native and the simulation connected. Cross-domain consequences must use explicit shared state, transactions, event flags, and history; never merge School, Work, Life, Lifestyle, or Finance into a generic mega-dashboard.
67. Retirement, mortality, and legacy are planned mechanics until implemented and tested. Never claim a character dies at zero health, retires, receives a pension, has family support, inherits assets, or passes on a legacy unless the save and simulation actually represent that state.
68. Death must be a terminal simulation state. After death, block year advancement and living-character actions, preserve the completed save, and show a final summary based only on recorded data. No indefinite aging beyond a terminal state.
69. Use genre references as design research, not implementation specifications. Learn from BitLife's year-by-year life arc and contextual choices, The Sims' interacting needs/relationships, and choice-led games' concise dilemmas. Never copy proprietary content, event scripts, artwork, branding, or distinctive presentation.
70. Before calling a milestone playable, test multiple years as a player—not only isolated functions. Include different ages and financial conditions, verify delayed consequences, replay determinism, save/load continuity, and terminal-state behavior when implemented.


40. **Weekly time model is canonical:** the target gameplay unit is one simulated week; months own recurring finance/reporting cadence; years own birthdays, annual settlement, life-stage progression, and long-term reviews. The current annual-action implementation is legacy behavior, not the target design.
41. Do not replace three annual action tokens with a fixed weekly action quota. Use actual recurring commitments and available discretionary time blocks; activities have explicit durations and may conflict. Do not simulate every hour or require filling every day.
42. School and Work own their schedules and recurring commitments. Never reserve time or claim attendance/work participation unless the corresponding schedule and state are actually implemented. Unimplemented domains must not invent commitments.
43. Weekly time advancement is always explicit and deterministic. Screen visits, background time, app inactivity, save/load, and wall-clock time never advance the simulation.
44. Monthly and annual financial settlement must have explicit due dates/cadences and exactly-once behavior. Never double-charge by running both annual and monthly versions of the same obligation. Do not divide annual values by 12 without documented rounding and migration rules.
45. A weekly save migration must preserve age/date semantics, all three save slots, cash, accounts, assets, liabilities, ledgers, education/work state, history, event choices, and pending consequences. Do not switch live progression to weekly until migration and multi-week scenario tests pass.
46. Bulk advancement must resolve each intervening week in order and stop at meaningful decisions, deadlines, events, birthdays, and payment failures. Never skip simulation by applying a coarse multi-week approximation.
