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
16. Never silently erase current saves. Persist an explicit schema version and validate the complete current format before reading or writing. Do not implement backward migrations. Reject unsupported formats without mutating their bytes; require explicit user confirmation before resetting them.
17. Never claim work, tests, builds, deployments, or settings changes that did not actually happen.
18. Do not create local-development prerequisites for the normal workflow. Expected path: GitHub, GitHub Actions, GitHub Pages, install/test APK on Android.
19. Keep CI lean, event-driven, path-filtered, and non-duplicative. No emulator requirement for normal builds.
20. Do not publish a new APK for web-only changes.
21. When an approved decision changes, update the relevant canonical doc and this rules file in the same change.
22. Money is the primary dashboard focus; life stats are secondary. Lead the overview with the real financial state and decisions supported by the simulation. Never fabricate financial metrics or present planned finance systems as implemented.
23. Character creation supports starting ages across the life span, but do not claim every life-stage system is implemented merely because a start age is selectable.
24. Save slots are independent and device-local. Never overwrite another slot or delete a current slot without explicit confirmation. Unsupported old schemas are not migrated; show a clear notice and offer a deliberate reset to start fresh.
25. Sound effects must remain optional, user-controllable, lightweight, and safe when browser/WebView audio APIs are unavailable. No unsolicited autoplay music.
26. Character creation is scenario-led, not a free-form age/stat sandbox. Use curated life-stage starts and coherent whole-character generation; do not add arbitrary sliders or isolated stat rerolls.
27. Random identity generation must keep nationality, country, birthplace, primary language, culturally appropriate name pools/name order, and currency internally consistent. Gender may influence name/pronoun selection, but gender and nationality must never determine ability, health, personality, morality, socioeconomic background, or other personal-worth metrics. Currency denomination may vary by country but must not encode relative prosperity.
28. Family background may influence starting financial circumstances only through explicit gameplay rules; it must not predetermine ability or future outcomes. Country-specific economy values are provisional game balance, not real-world claims.
29. Current-schema character identity must be internally consistent: nationality, country, birthplace, language, culturally appropriate name pools/name order, and currency. All currency displays and costs must respect the character's currency scale.

30. Every gameplay mechanic must declare age eligibility and prerequisites, and enforce them in the simulation layer as well as the UI. Never expose adult systems prematurely; hide unavailable actions and unlock them gradually at the appropriate life stage.
31. Use the canonical life-stage bands in GAMEPLAY_DESIGN.md; age bands are progression rules, not assumptions about an individual's worth or inevitable life path.
32. Settings must expose a concise chronological game log and a portable, versioned debug snapshot. Export only game state and history required to reproduce a report; never include device identifiers, browser data, credentials, or unrelated settings.

For any change touching two or more gameplay domains, also read `docs/SYSTEM_INTEGRATION_REVIEW.md` before planning. Treat its ownership map, cross-domain contracts, confirmed findings, and staged revision sequence as binding until updated by evidence.

## Conflict resolution
Latest explicit user instruction wins for the changed requirement; preserve all other decisions. If ambiguity materially affects architecture, ask one focused question. Record approved changes and consequences in canonical docs/ADRs.

## Required task workflow
Read canonical docs and inspect implementation; state the smallest intended change; implement in a focused branch/PR; add/update tests; run relevant Actions checks; update affected docs; do not merge unless explicitly requested; report incomplete work and blockers accurately.

## Document authority
Product scope: `PRODUCT_VISION.md`; mechanics: `GAMEPLAY_DESIGN.md`; UI: `VISUAL_DESIGN.md`; implementation: `TECHNICAL_ARCHITECTURE.md`; sequencing: `ROADMAP.md`; agent conduct and decision preservation: this file.
If code and docs disagree, identify the discrepancy and reconcile it without losing user-approved behavior.

33. Education and employment mechanics must remain age-gated in both UI and simulation. Ages 16–17 may access part-time roles only; full-time employment and higher education unlock at 18; later-life flexible work is optional from 65. Existing employment may continue beyond 65.
34. Recurring finance values must be calculated by the simulation and recorded in life history. Clearly label simplified salary and living-cost assumptions as game-balance values; do not imply real-world country salary accuracy. Do not invent debt, taxes, benefits, assets, or household expenses until implemented.
35. Any incompatible persisted shape change requires a current-schema version update, complete validation, and tests. Do not add optional defaults, adapters, or migrations solely to load old saves.
36. Clipboard export must use the native Android clipboard bridge in WebView when available, then browser clipboard APIs and a user-gesture fallback. Never display a success message unless a clipboard method confirms success.

37. Paid gameplay actions must enforce affordability in both UI and simulation. Never grant an action's benefits for free when its cost cannot be paid; unaffordable actions must not consume an action or mutate state.


38. Keep the two supplied brand artworks in their distinct native roles: title artwork is the Android app/launcher logo; title-less life-progression artwork is the centered Android splash image that moves upward and fades when the WebView finishes its initial load. Never place either artwork in the web welcome or character-creation UI, and never redraw or alter the source PNGs.


39. Household finance mechanics unlock at age 18. Living arrangement and recurring budget must be stored on the Character, calculated by the simulation, and recorded in life history. Unpaid costs are shortfalls, not debt; never allow a negative cash balance or imply taxes, benefits, debt, or assets exist until implemented. Savings goals are targets measured against available cash, not separate or locked accounts.


40. Banking and financial products must use the shared Character financial model and auditable transaction ledger. Cash, account balances, assets, and liabilities are distinct. Transfers must preserve total money; reject overdrafts and invalid operations. Do not display a complete net-worth claim while only cash and bank balances are counted.

41. Financial-product operations must post to the shared ledger and preserve balance-sheet invariants: loan issuance creates equal cash and liability; repayment reduces both; card spending creates card liability or reduces a linked deposit account; deposits and vault transfers only move holdings. Net worth must subtract active loans and credit-card debt. Recurring payments must state their funding source and log missed payments without silently creating debt.

42. Property, investments, and businesses must be represented as assets with current values and must be included in net worth; linked mortgages, personal/business loans, and credit balances remain liabilities. Property sales must settle linked mortgages before paying proceeds. Trading transfers value between cash and holdings; never mint money. Market movements must be bounded and reproducible.

43. Fixed deposits must enforce their maturity lock in simulation functions, not only UI. Prepaid card funds are an asset: loading moves existing cash/account value and spending reduces it. Credit card balances are liabilities. All new product types must be represented in net worth and the shared transaction ledger.

44. Economic simulation must be deterministic for a given current save/year, bounded against runaway rates and asset changes. Inflation must flow into cost-of-living and recurring price assumptions; market assets must respond to economic conditions without guaranteeing returns. Clearly label all rates and market movements as fictional simplified game estimates.

44. Economic simulation must be deterministic for a given current save/year and bounded against runaway rates and asset changes. Inflation must flow into cost-of-living and recurring price assumptions; market assets must respond to economic conditions without guaranteeing returns. Clearly label all rates and market movements as fictional simplified game estimates.

45. Tax settlement must be deterministic, auditable, and never create negative cash. Pay from cash and eligible liquid accounts only; fixed deposits remain locked until maturity. Any unpaid tax must remain a visible liability included in net worth. Keep rates clearly labeled as fictional game rules, not jurisdiction-specific advice.

46. Credit score must be derived consistently from auditable financial state, bounded to 300–850, and treated as a simplified fictional metric. Rejected loan applications must be recorded in the financial ledger with a specific reason and apply a bounded negative score impact; never reject silently. Loan products must enforce the score-based minimum rate and never silently approve a rate below the floor. Do not claim the score matches any real credit bureau.

47. Trading and property sale fees and realized capital-gains taxes must be reflected in cash proceeds and the shared ledger. Include purchase fees in investment cost basis, deduct sale fees/tax from proceeds, and reject property sales that cannot settle linked debt and transaction costs. Never create money through a sale.

48. Every major life system must be modular and domain-native. Keep domain UI, vocabulary, navigation, controls, and feedback inside its owning experience. Parent areas group related destinations; they must not become long pages containing unrelated systems.
49. Finance has top-level Banking, Business, Property, Investments, and Taxes destinations, in that order. Banking internally contains Accounts, Cards, Loans, and Savings & vault. Lifestyle is the renamed top-level destination; its internal navigation exposes Overview, Market, Subscriptions, Owned, Relationships, Family tree, and Life story. The former Home tab and its household-budget controls are removed in this rework; existing household arrangement and annual-cost simulation state/settlement remain intact, but do not invent a replacement management destination or move it into Banking without approval. Emergency savings targets stay in Banking. Never place household budget controls on Banking or education/work summaries inside Finance.
50. Education must feel like a school/institution and Work must feel like recruitment/workplace. Do not implement them as generic dashboard cards or finance sub-panels. Share simulation state and global navigation without merging domain experiences.
51. A focused domain view should show its relevant controls by default, use progressive disclosure for secondary operations, and avoid repeating unrelated summaries or messages. Age locks must be explicit and consistent with simulation eligibility.

52. Keep Education and Work as separate age-gated top-level destinations. Study, enrollment, attendance, grades, tuition, and qualifications belong in Education. Job applications, interviews, offers, employment, extra work, and career development belong in Work. These mechanics now have playable foundations; describe only records and outcomes actually supported by the character state and tested simulation actions. Do not imply persistent employer operations or a full workplace simulation.

53. Lifestyle is the renamed parent workspace (the internal route remains `life`). `LifeWorkspace.svelte` exposes Overview, Market, Subscriptions, Owned, Family, Family tree, and Life story. Overview composes Health; Life story groups non-activity events and financial records by age/year. Do not describe Personal Growth or Personal activities as current navigation sections until implemented. Keep the money-first Overview from becoming a duplicate life-stat or activity page. Reuse existing Character fields, eligibility/affordability rules, simulation actions, and shared history; do not invent unimplemented health, family, or relationship systems.


54. The main Overview header must present authoritative current-life context: age/life stage, education stage, and employment status, with age-appropriate wording derived from progression and Character state. Do not imply school enrollment, qualifications, employment, or career progress that the save does not contain. Keep detailed education controls in Education, employment/career controls in Work, personal stats and activities in Lifestyle, and financial products in Finance. Before adding Overview content, compare it with persistent navigation and each domain workspace; remove repeated identity, summaries, shortcuts, and actions unless the repetition serves a distinct navigation or decision purpose.


55. Finance navigation is limited to Banking, Business, Property, Investments, and Taxes, in that order. Banking owns accounts, cards, loans, savings deposits, and personal vault. Cards and loans are internal Banking sections, not Finance destinations. Do not reintroduce separate Finance menu entries for Cards, Loans, Bills & Subscriptions, Savings & Vault, or Living Costs.
56. The main navigation destination is Lifestyle (internal route remains `life`); it is the parent workspace for Overview, Market, Subscriptions, Owned, Family, Family tree, and Life story. Within Lifestyle, Market sells food, eating-out/delivery meals, fashion, and durable goods; Subscriptions owns provider discovery and active recurring plans; Owned is the inventory for purchased non-food goods and clothing. The former Discover, My services, and Home subviews are obsolete. Housing remains managed through Finance → Property; preserve existing household arrangement and annual settlement data, but do not recreate a Home tab.
57. Payment-card controls and authoritative card balances exist only in Banking. Lifestyle may show a concise read-only card/payment-method reference to explain how a subscription is paid, but must not duplicate card controls or imply a separate card ledger. Subscription records remain in the existing recurringPayments field; do not create a second subscription store.
58. Provider subscriptions must use the existing recurringPayments records and annual settlement rules, with a confirmation dialog showing annual price and selected payment source, age eligibility, cancellation, and missed-payment behavior. Food checkout debits cash, the selected bank account, or selected active card immediately, then adds a bought food action to the current weekly plan; stamina, health, happiness, comfort, and stress effects apply only when the week resolves. Bought food appears in weekly review with a distinct BOUGHT seal and never enters Owned. Non-food reusable/permanent products use normal checkout and enter ownedLifestyleItems only after successful payment. Failed payment must not grant inventory or food effects, and must never silently create debt.
59. Weekly Review must show derived passive activities separately from player-planned activities. Passive entries are greyed out, unremovable, and never count as player-selected actions or planned stamina effort. Derive them from actual household, family, social-circle, and housing state; apply their bounded effects during deterministic weekly resolution. Do not invent support from absent relationships. Family meals depend on family culture; partner/friend/child/extended-family support depends on explicitly recorded connections and household presence. Independent adults without family-provided or cohabiting-partner meals need to buy food during the week or receive a modest nutrition/wellbeing penalty. Independent adults without a rental, owned residence, shared household, or cohabiting partner home receive a modest housing-insecurity penalty. Social time is a planned six-stamina action that strengthens the selected connection.
60. Lifestyle Market includes food, eating out, delivery, and fashion alongside durable goods. Bought food is a current-week action; clothing is durable Owned inventory with style, formality, condition, and one explicitly equipped outfit. Only the equipped outfit affects presentation and wears down gradually; the player can change outfits from Owned. Formality must match the context, and clothing has only a modest influence on interview first impressions—never make expensive brands a guarantee of success. Housing remains managed through existing Finance → Property rental/purchase actions; derive weekly comfort from actual residence and household state, and do not recreate a Home tab.
61. Before changing navigation or adding a summary, inspect all relevant destinations for duplicate information and actions. Keep one authoritative management location; use read-only references elsewhere only when they explain a genuine cross-domain relationship.


62. This is a GAME. Optimize for enjoyable play, player agency, replayability, pacing, meaningful decisions, surprise, and satisfying feedback—not for the number of menus, stats, or modeled real-world details. A realistic system that creates no interesting player decision is not automatically worth building.
63. Treat `docs/GAMEPLAY_LOOP.md` as the canonical redesign specification. Read it before changing annual progression, events, stats, life stages, mortality, or game balance. Keep it synchronized with GAMEPLAY_DESIGN.md and ROADMAP.md.
64. The weekly loop is the playable chapter: contextual decisions, a stamina-backed weekly activity plan, automatic education/work responsibilities, explicit player-controlled week advancement, deterministic resolution, and a concise recap. The current financial settlement cadence is annual; monthly payroll, recurring obligations, and reporting remain planned. Years own birthdays, annual settlement, life-stage progression, and long-term reviews. Never auto-advance time.
65. Every event must be contextually eligible, age-appropriate, non-repetitive, and connected to state. Choices must communicate known costs/risks and produce materially different immediate or delayed outcomes. Record important choices and consequences in history. No fake choices or random events that contradict the save.
66. Do not let repeated Advance Week presses become the dominant strategy. Review time-capacity exploits, stat grinding, predictable income exploits, and dominant strategies in every gameplay test. Do not impose a universal weekly action quota; stamina, affordability, health, stress, prerequisites, and modeled workload determine sustainable activity choices.
67. Make stats consequential and understandable. Health, happiness, intelligence, and fitness must influence appropriate actions/outcomes, with bounded values and recovery paths. Never add hidden arbitrary penalties or make a single stat the answer to every situation.
68. Keep the UI domain-native and the simulation connected. Cross-domain consequences must use explicit shared state, transactions, event flags, and history; never merge School, Work, Life, Lifestyle, or Finance into a generic mega-dashboard.
69. Retirement, mortality, and legacy are planned mechanics until implemented and tested. Never claim a character dies at zero health, retires, receives a pension, has family support, inherits assets, or passes on a legacy unless the save and simulation actually represent that state.
70. Death must be a terminal simulation state. After death, block year advancement and living-character actions, preserve the completed save, and show a final summary based only on recorded data. No indefinite aging beyond a terminal state.
71. Use genre references as design research, not implementation specifications. Learn from BitLife's year-by-year life arc and contextual choices, The Sims' interacting needs/relationships, and choice-led games' concise dilemmas. Never copy proprietary content, event scripts, artwork, branding, or distinctive presentation.
72. Before calling a milestone playable, test multiple years as a player—not only isolated functions. Include different ages and financial conditions, verify delayed consequences, replay determinism, save/load continuity, and terminal-state behavior when implemented.


73. **Weekly time model is live and canonical:** one simulated week is the playable time unit; monthly recurring finance/reporting cadence remains planned; current settlement is annual; years own birthdays, annual settlement, life-stage progression, and long-term reviews. The old annual-action system has been retired.
74. Never impose a universal weekly action quota. Personal activities are toggled for the current week and consume stamina; they do not reserve calendar periods. No personal timetable or day/period reservations exist. Education and employment are automatic background responsibilities; do not simulate every hour or require filling every day.
75. Education and Work own their education/employment records and automatic weekly progression. They do not create time-slot reservations. Never claim attendance/work participation unless the corresponding domain state supports it. Unimplemented domains must not invent commitments.
76. Weekly time advancement is always explicit and deterministic. Screen visits, background time, app inactivity, save/load, and wall-clock time never advance the simulation.
77. Monthly and annual financial settlement must have explicit due dates/cadences and exactly-once behavior. Never double-charge by running both annual and monthly versions of the same obligation. Do not divide annual values by 12 without documented rounding, due dates, and payment-failure behavior.
78. The current save format is schema-versioned and strict. Do not migrate older saves. Preserve current-schema slot and ledger invariants; reject unsupported old formats without changing stored bytes and require explicit confirmation before reset. Test every current-schema shape change.
79. Bulk advancement must resolve each intervening week in order and stop at meaningful decisions, deadlines, events, birthdays, and payment failures. Never skip simulation by applying a coarse multi-week approximation.


80. Personal Technology is a planned Life domain for smartphones, laptops, and desktop PCs. Do not expose device management as implemented until device ownership, condition, capabilities, and actions are represented in persisted state and UI. When implemented, retail discovery/purchase should belong in Lifestyle → Market; payments and ledger entries should use Finance.
81. Devices are optional assets and capability enablers, not mandatory paywalls. Provide shared, school/work-provided, public, or non-digital alternatives for core progression where reasonable. Do not grant broad stat bonuses for owning expensive hardware.
82. Distinguish ownership from borrowed/shared/provided access. Never count non-owned access as a personal asset or invent devices. Age and guardian rules apply to purchases and contracts.
83. Device purchases, repairs, and resale must use the existing Finance transaction path and be atomic with device-state changes. Do not create a separate technology wallet or duplicate device controls in School, Work, or Finance.
84. Keep hardware simulation lightweight: fictional models, category-aware capability tiers, condition, and meaningful repair/replacement decisions. Do not add detailed benchmarks, battery/storage meters, subscriptions, or real-world brand catalogues without a demonstrated gameplay need.


85. Career progression must follow `docs/CAREER_PROGRESSION.md`. Preserve clear current-job information and meaningful progression; do not copy fixed X/XX-week promotion grinds. Distinguish current role performance, experience, promotion offers, and any read-only career-path estimates. Estimates are not guaranteed income or ledger entries. Keep career management in Work and actual payroll/bonus transactions in Finance. The current foundation includes job listings, applications, interviews, expiring offers, employment changes, resignation, career development, and promotion offers; persistent employer operations, broad vacancy ecosystems, benefits, bonuses, and monthly payroll remain planned unless separately implemented and tested.

86. Treat lower-level simulation languages and WebAssembly as exploratory options, not requirements. Keep the near-term engine in framework-independent TypeScript with explicit domain contracts. Do not rewrite working systems or add a second toolchain without a measured performance bottleneck or concrete portability need. Any future WASM proposal must include representative mobile benchmarks (including boundary/data-conversion costs), a bounded implementation plan, deterministic tests, current-schema validation, and a clear gameplay benefit. Never let speculative optimization delay playable milestones.

87. Family must be a simulation-owned persistent graph, not a UI-only relationship list or single relationship score. Follow docs/FAMILY_SYSTEM.md. Keep player identity authoritative in Character; represent relatives as stable people with validated directional kinship/guardianship links and separate closeness, trust, and tension. Do not assume partners, children, co-residence, care, or family support. Family financial support must be affordable, atomic, and recorded through the shared Finance ledger. Existing saves without family data require explicit initialization; never silently invent relatives on load. Do not implement future mortality, adoption, parenthood, caregiving, or inheritance as placeholders.

88. Apply stamina-based weekly activity selection consistently across every domain. Education, Work, Family, Business, Events, Health and Life initiate their own actions; the player toggles selected activities directly in those workspaces. Personal activities do not receive date/period reservations. Education and Work remain automatic background responsibilities without calendar reservations. Do not add a Schedule workspace; the Advance review is the combined plan/outcome surface. Never silently drop a selected activity.

89. The global game header is the single source for current-life identity/status, year, cash, month, and the four-position month-week indicator. Do not add a duplicate Overview page header or a global new-life (+) action. Keep page headings on domain screens when they establish useful context. Overview shows all everyday activity records in expandable, newest-first Monday–Sunday simulation-week groups; expand the current simulation week by default. Life History remains for major achievements and life-stage milestones only.


90. The shared UI design system is the source of truth for reusable presentation: semantic tokens, theme palettes, and Svelte primitives live in their documented shared locations. AMOLED remains the default; player themes are local app preferences, never character-save data. New UI must reuse shared primitives/tokens where they fit while preserving domain-native experiences. Do not add a third-party UI framework for routine styling.

91. Treat `web/src/styles/tokens.css` and `web/src/styles/themes.css` as the only shared palette source. Existing and new Svelte component styles must use semantic color tokens for text, surfaces, borders, overlays, shadows, and status states; do not add hard-coded colors in CSS. Exceptions are intentional artwork and the fixed color swatches used to preview themes. Use the spacing/radius/control tokens and existing `UiButton`, `UiCard`, `SectionHeader`, and `ThemeOption` primitives where the pattern matches. Keep domain-specific structure and behavior in its owning workspace rather than forcing every screen into generic cards.


92. Overview activity history must use compact expandable simulation-week groups with the current week expanded by default. Show action counts before expansion; keep individual records inside each group.
93. Use shared semantic stat colors for stable/healthy, caution, danger, and severe progress bands. Inverse metrics such as stress reverse thresholds. Keep colors theme-aware and pair them with readable numeric/status cues.
94. Work navigation order is Jobs, Extra Earnings, Career Path, Career History. Applications and their statuses belong inside Jobs; extra shifts/casual work belong only in Extra Earnings. Do not retain an Extra Earnings banner above navigation.
95. Finance Overview must not contain navigation shortcut tiles. Summarize actual financial state including investment holdings, business value/performance, and outstanding debt. Finance navigation order is Banking, Business, Property, Investments, Taxes; Taxes is last.
96. Banking acquisition uses predefined account/card products with clear fictional terms and Apply/Open actions. Owned products show Applied and cannot be acquired twice. Preserve existing eligibility, affordability, product limits, and ledger behavior.

97. A selected career path is saved on the character and filters job discovery. Changing paths must not be overwritten by the current role unless no path has been chosen. Applications and interviews must use candidate attributes and employment context; every rejection must record a specific, understandable reason grounded in the modeled factors.
98. Extra Earnings is a separate optional weekly shift/casual-work action. Calculate its payout from employment pay, role performance, currency scale, and workload/stress; record every payout in the shared financial ledger. Never silently grant a fixed generic amount.
99. Banking's account list combines owned accounts and available account products. Selecting an owned account opens its account-specific actions; do not add a separate Move Money destination or duplicate Available Accounts section. Fixed deposits must respect maturity and cannot fund outgoing payments before maturity.
100. Bank cards are predefined products with clear fictional eligibility, linked-account requirements, credit limits, APR, rewards rates, and credit-score/asset thresholds. Enforce eligibility in simulation functions, persist product terms, accrue rewards from eligible purchases, and require an explicit redemption action.
101. Business and property acquisition use predefined opportunities with disclosed startup/down-payment costs and useful risk, growth, cash-intensity, profitability, upkeep, and yield information. Those profiles must affect simulation outcomes; avoid free-form arbitrary valuation inputs as the primary acquisition flow.
102. Investments is the trading workspace. Show open positions, units, average cost, current value, unrealized performance, order controls, fees, and realized-gain tax. All trades settle through cash and the common ledger; never create value through trading.


103. Player-facing writing must sound like a life-simulation game, not a family-services tool, case-management system, or technical dashboard. Use direct, natural language that frames relationships as people, choices, shared moments, and consequences. Keep accurate relationship terms where they identify a real person or mechanic, but avoid system-led phrases such as “family support,” “household support,” “family connections,” and explanations of internal simulation processing in player-facing copy. Explain stamina, costs, and outcomes in concise gameplay language. This is a copy rule only: never rename or alter internal IDs, relationship data, eligibility, rewards, financial effects, or save formats to satisfy it.
