# Gameplay Design

**Canonical gameplay direction · Reviewed 2026-11-08**

## Core loop
1. Review the current week, automatic education/work responsibilities, stamina, and relevant situations.
2. Toggle personal activities in their owning domain workspaces; school and work remain automatic background responsibilities.
3. Pay validated stamina and money costs. No activity reserves calendar periods; stamina is the weekly discretionary effort budget and recovery can offset selected activity costs.
4. Review every selected activity, its stamina cost and rewards, plus the projected combined wellbeing changes; then resolve commitments, events, due payments, and consequences when the player advances the week.
5. Review the weekly recap and persistent history.
6. Use monthly finance/reporting and yearly life-progression reviews at their actual calendar boundaries.

The week is the fundamental playable unit; the month is the financial/reporting unit; the year is the life-progression unit. The old three-actions-per-year model is legacy implementation and is not the target design. Do not replace it with an arbitrary fixed number of weekly action tokens. See [`GAMEPLAY_LOOP.md`](GAMEPLAY_LOOP.md) for the canonical date calendar, weekly stamina budget, resolution order, strict current-save rules, and acceptance tests.

## The intended player experience

The game is played as a sequence of meaningful weeks, grouped into monthly financial rhythms and yearly life chapters, not as a dashboard that the player advances through. The detailed weekly cycle, event rules, consequence model, life-stage experience, mortality/ending direction, genre references, and acceptance criteria are defined in [`GAMEPLAY_LOOP.md`](GAMEPLAY_LOOP.md). That document is canonical for the redesign and distinguishes planned mechanics from implemented ones.

### Core game-design rules
- Every week should offer relevant decisions, changing circumstances, or a deliberate quiet week; repeated stat grinding must not be the dominant loop.
- Automatic school/work responsibilities shape workload. Personal activity choices use a stamina budget; the player is never limited by an arbitrary weekly action quota.
- Actions, events, and monthly/yearly settlement must create understandable immediate or delayed consequences.
- Event content must be contextual, age-eligible, varied, and persistent where a choice matters.
- The player must see meaningful costs and trade-offs before committing.
- Systems remain modular in the UI but connected through explicit shared simulation state.
- Stats must influence outcomes and available options; they are not decorative scores.
- A completed life needs a terminal death state and final summary. Do not imply this is implemented until tested.

## Character creation and starting lives
Character creation is scenario-led, not a free-form stat editor. The player chooses one of seven curated starting stages: birth (0), childhood (6), teen years (13), young adulthood (18), established adulthood (30), midlife (45), or later life (65). No arbitrary age slider or manual stat allocation.

The game generates a complete character in one coherent pass. The generated profile includes name, gender identity, nationality, country, birthplace, primary language, currency, family economic background, age-appropriate education status, health, happiness, intelligence, fitness, and two personality traits.

### Random generation rules
- Generate nationality/country first; birthplace, primary language, culturally appropriate name pools, local name order and currency must come from that same country profile.
- Generate gender identity using an explicit gameplay weighting (currently 49.5% male, 49.5% female, 1% non-binary), then choose a culturally plausible name pool for that identity and nationality. This is a game distribution, not a demographic claim. Non-binary characters use curated neutral-name pools.
- Gender and nationality must not be used as proxies for intelligence, health, happiness, fitness, personality, morality or ambition.
- Personality traits and ability stats are generated independently of gender and nationality.
- Age determines education status and starting financial eligibility. Children do not receive adult personal income; paid work remains unavailable before 16.
- Family economic background can affect starting money, but does not predetermine ability or future outcomes.
- Reroll regenerates the entire character. No isolated stat rerolls or manual stat editing in the creation flow.
- The player may choose a life stage and reroll the generated person. Name, identity, birthplace and stats are not individually edited in the creation screen.
- Country and name datasets are curated starter coverage, not a claim to represent every nationality or naming tradition. Expand with reviewed country packs.
- Random generation accepts an injectable random source in tests so consistency and bounds are reproducible.

Current country packs: Bangladesh, India, United States, United Kingdom, Canada, Australia, Japan, Nigeria, Brazil and Germany. Countries are currently selected evenly for gameplay variety, not by global population share. Currency is stored with the character and all money UI must format using that currency.

## Current implementation boundaries
Selectable stages and generated identity do not imply complete life-stage simulation. Childhood, education pathways, retirement, family relationships and local economic systems still need gameplay implementation. Starting financial values are a lightweight foundation, not a realistic national economic model.

## Age-specific progression and eligibility
Every system, activity, event, responsibility, and financial mechanic must declare an age eligibility range and any additional prerequisites. Age is a progression boundary, not merely a label on the dashboard. Ineligible actions are removed from the available-action list and rejected again by the simulation layer; the UI is never the only gate.

Current life-stage bands are 0–2 early childhood, 3–5 preschool, 6–12 childhood, 13–15 early teens, 16–17 later teens, 18–24 young adulthood, 25–44 adulthood, 45–64 midlife, and 65+ later life. These are game-design bands, not claims that every person follows the same life path.

Current action eligibility: learning/study becomes available at age 3; one-off earning and part-time job applications become available at age 16; full-time employment and higher education become available at age 18; flexible employment is available as a new option from age 65. Existing jobs do not automatically end at 65. Career development is available only while employed. Adult job applications remain available for job changes. Exercise/play and social/family time remain age-adapted across stages.

### Education, qualifications and lifelong learning

Education is a continuous life system, not a single study bar or one generic higher-education flag. The intended progression begins with early childhood development and can continue through advanced academic and professional specialization. A doctorate is an option, not a mandatory endpoint.

- **Early development (0–5):** family care, play, language, motor development, curiosity and early-learning activities. These shape foundational attributes; they are not formal degrees.
- **Primary education (roughly 6–11):** foundational literacy, numeracy, science and general learning.
- **Lower secondary (roughly 12–14) and upper secondary (roughly 15–17):** broader subjects, performance, subject strengths and choices that influence later pathways.
- **Vocational and technical routes:** practical training, trade programs, apprenticeships and industry credentials. These can lead to skilled work without requiring a university degree.
- **Higher education:** associate/foundation programs where applicable, bachelor's degrees, master's degrees, doctorates and professional/specialist programs. Admission, duration and availability depend on age, prior qualifications, academic performance, field prerequisites, finances and the character's circumstances.
- **Lifelong learning:** certificates, licenses, short training courses, continuing professional development and reskilling remain available throughout adult life when prerequisites are met.

Formal education, vocational training, certificates/licenses and informal learning are separate records. A certificate must not silently become a degree; course completion must not grant a regulated license unless the modeled qualification explicitly represents it. Qualifications may have fields, issuers, completion ages and expiry/renewal rules.

Access and outcomes should depend on relevant factors rather than one intelligence score: prior education, subject knowledge, focus, discipline, creativity, health, stamina, stress, finances, time availability and course-specific prerequisites. Performance should reflect sustained attendance/effort and choices, with room for setbacks, pauses, transfers and alternative routes. Avoid assuming every character follows one uninterrupted school-to-university path.

School and training decisions originate in the Education workspace. Once confirmed, education attendance/progression is handled automatically; the player chooses optional study, assignment and assessment activities. The player does not manually construct a generic timetable. Weekly learning activities produce progress; academic terms and course milestones resolve on their modeled dates. Education history remains inspectable.

**Implemented education loop:** the Education workspace offers early learning/preschool, primary, lower and upper secondary, vocational diplomas, college/associate programmes, bachelor's, master's, doctoral, professional-specialist and short professional-certificate courses. Programme availability checks age, completed prerequisites and relevant intelligence/focus/discipline thresholds. Enrollment charges tuition where applicable and records the programme; it does not create class timetable reservations. The player toggles weekly study, assignment and assessment tasks directly. Each task consumes stamina; missing the programme's weekly target reduces grades, while completed work improves them. Attendance, subject grades, overall grade, workload, health, stamina and stress affect results. Courses resolve after their required weeks and award a recorded qualification on a passing result. Players can pause and resume without losing progress. Completed education history and qualifications are retained separately from the legacy education label.

The current catalogue is a playable first pass, not a claim to model every country's exact school calendar or accreditation law. It uses representative institution paths and simplified fees/durations. Course catalog breadth, localized curricula, detailed term breaks, scholarships, retakes, qualification expiry/renewal, regulated professional licensing and richer practical placements remain future expansions.

### Character attributes and condition

Character values are gameplay inputs, not decorative scores. Keep enduring abilities distinct from temporary condition:

- **Core ability:** intelligence, focus, creativity, discipline, confidence and social skills.
- **Physical condition:** health, fitness and stamina.
- **Wellbeing:** happiness and stress (stress is inverse: lower is better).

These values change through relevant weekly activities, life events, work demands, education and recovery. They should have clear, bounded effects. Health, happiness, fitness and intelligence already exist; stamina, focus, confidence, discipline, creativity, social skills and stress are now generated and receive initial weekly activity effects. **Implemented wellbeing loop:** workload is measured from automatic education/work responsibilities and selected activity effort. Heavy weeks raise stress and reduce stamina;  sustained high stress can create burnout/anxiety conditions and reduce study/work efficiency. Rest and mindfulness recover condition; counselling treats persistent mental pressure; medical check-ups diagnose conditions and may initiate a short treatment course. Active conditions and medication progress through weekly resolution. Deeper condition variety, long-term chronic care, injuries, insurance and localized healthcare systems remain future expansions.

### Employment, careers and qualifications

- Work is a connected progression from safe, age-appropriate part-time opportunities and school-compatible work to internships, apprenticeships, skilled occupations, professional careers, management and later-life flexible work. Availability must follow the game's age rules and local/legal context represented by the character's country.
- Job eligibility is role-specific. Age, education level, relevant subject/field, certificates or licenses, character attributes, experience, practical skills and work history can all matter. A university degree must not be the universal key to every occupation; vocational routes must be equally meaningful where appropriate.
- Training and certifications can unlock roles, improve performance or satisfy renewal requirements. A role requiring a specific license must check the actual qualification record, not a generic education string.
- Career changes should remain possible through transferable skills, bridging courses, retraining and experience. Advancement should be based on capability, performance and opportunity, not a fixed grind timer.
- The current job board and four starter career paths remain a limited foundation. Role-specific attribute gates supplement age, education, knowledge and experience. Work eligibility now recognizes completed degree-level education records and earned qualification programme IDs; a broad occupation catalog, employer structures, internships/apprenticeships and more detailed training-driven career changes remain planned.


### Employment and recurring finances
- At ages 16–17, a successful application creates a part-time assistant role. Adult full-time employment is not available before age 18.
- From age 18, a successful application creates an operations role; higher education unlocks a higher-paid professional role. At 65+, new applications offer flexible work. Existing jobs can continue.
- Application outcomes use education, intelligence, and selected personality traits. Randomness is injectable for deterministic tests.
- The current implementation has a career-development action, performance and experience progression, four read-only career-path previews with estimated annual salary bands, and player-controlled promotion offers at annual review when modeled requirements are met. Do not copy a fixed X/XX-week promotion grind. See [CAREER_PROGRESSION.md](CAREER_PROGRESSION.md) for the staged design and remaining workplace/compensation work.
- Paid activities must be affordable before they can be selected or applied. The simulation is authoritative: an unaffordable action changes neither money nor stats and does not consume an action. Costs use the character's currency scale.
- Salary is credited during annual settlement. Before age 18, the existing simplified employment expense rates remain in place. From age 18, a selectable family-supported, shared, or independent living arrangement determines recurring housing, food, transport, utilities, and personal costs. The annual budget is calculated from job pay, or a provisional baseline when unemployed.
- Household costs are paid from income and available cash. If funds cannot cover the estimate, the unpaid amount is recorded as a shortfall and happiness decreases; balances never become negative and no debt is silently created. This is a game-pressure mechanic, not a real-world cost model.
- Players can set an emergency savings target of one, three, or six months of estimated household costs. Progress is measured against the current cash balance; savings are not a separate account or locked funds.
- One-off extra work remains a separate action. Taxes, loans/debt, property, investments, business assets, and a unified financial ledger are implemented foundations. Unemployment benefits, detailed country-aware cost models, and monthly payroll/settlement remain unimplemented.
- Household, savings-goal, and finance-history fields are present when their gameplay state applies. Incompatible persisted shape changes require a current-schema update; do not add compatibility defaults or migrations for old saves.

Build progression in connected layers: early development and schooling; teen education/interests and limited earning; adult employment and recurring finances from 18; career growth and household responsibilities as prerequisites and age permit; midlife health/financial planning; later-life retirement and flexible work. Unlock only mechanics that are implemented and eligible. Hide unavailable actions instead of showing dead controls. Explain an unlock only when it helps the player understand the next stage.

## Game log and debug export
The settings page provides a concise recent-log view backed by the character's chronological life history and a copyable, versioned JSON debug snapshot. The snapshot includes the active save slot, full character state, and complete history; it excludes device identifiers, browser details, and account data. Keep the export portable and deterministic apart from its explicit export timestamp. Do not include secrets or unrelated local settings.

## Banking and unified financial foundation
- Characters age 16+ may open up to eight personal bank accounts: checking, savings, and fixed deposits. Fixed deposits lock funds for 1–10 years and earn a simplified 4.5% annual rate; withdrawals and outgoing payments are blocked until maturity. Savings earn 2% and checking earns 0%. These are fictional game-balance rates.
- Cash, bank balances, vault cash, prepaid balances, property, investments, and business valuations are modeled assets. `getNetWorth` includes these values and subtracts active loan balances, credit-card balances, and unpaid tax liabilities. It is a simplified estimate, not a real-world valuation.
- Deposits, withdrawals, account opening, transfers, employment income, household expenses, and interest are recorded in an append-only per-character financial transaction history (latest 300 entries). Account operations reject invalid amounts, overdrafts, missing accounts, and same-account transfers.
- Savings accounts currently earn a simplified 2% annual rate; checking accounts earn 0%. Rates are game-balance values, not real bank offers. Interest is credited on year advancement.
- Banking presents owned accounts before available account products, sorted checking, savings, then fixed deposits. Selecting an owned account opens its deposits, withdrawals, transfers, automatic deposits, and eligible autopay controls. Accounts, Cards, Loans, and Savings & vault are internal Banking sections. The expandable credit profile appears only in Loans and is collapsed by default; do not repeat the score card on other Banking views.

## Cards, credit, recurring payments and personal vault
- Age 16+ characters can issue debit cards linked to an existing account or prepaid cards that must be loaded before use; age 18+ characters can issue credit cards with a defined limit. Prepaid balances count as assets, while credit balances count as liabilities. Debit purchases immediately reduce linked bank balances. Credit purchases add to card liability and cannot exceed available credit.
- Credit card balances accrue a simplified 18% annual rate and attempt a 5% minimum payment each year from the linked account or cash. Players can make explicit repayments. Rates are game values, not real offers.
- Age 18+ characters can apply for up to five personal, mortgage, or business loans. Active loans appear in a compact list; new applications use a dialog showing age, credit score, income, debt-to-income, amount, term, rate, and repayment-account criteria. Approved proceeds increase cash and liability equally. Interest accrues annually; a simplified principal installment is attempted from cash or a selected bank account. Extra repayments are supported. Missed payments do not erase balances or create hidden negative cash.
- Up to twelve annual recurring bills/subscriptions can be set up and paid from cash, a bank account, or a debit, credit, or prepaid card. Debit-card charges debit the linked bank account; credit-card charges use available credit; prepaid charges use the loaded balance. Failed cash/account payments are logged as missed without creating debt; credit-card subscriptions use available credit. Players can cancel them.
- Up to five automatic deposit rules move a fixed amount or percentage of annual income into a selected bank account after household costs. Deposits only happen when cash is sufficient.
- Age 16+ characters can store and withdraw cash in a personal safe/vault. Vault holdings earn no interest and remain part of net worth.
- Prepaid balances are assets; credit-card balances are liabilities. Unpaid tax is also a liability. These values feed the shared simplified net-worth calculation alongside cash, accounts, vault, property, investments, businesses, and active loans.

## Property, housing, investments and businesses
- Adults can rent a house/apartment with a recurring annual rent or buy a property using cash and/or a mortgage. Mortgage purchases require at least 20% down payment. Property value is an asset; linked mortgage balance is a liability.
- Players can make an owned property their primary residence, list a non-primary property for rent, receive annual rental income, and sell property. Selling settles the linked mortgage from sale proceeds; a sale is rejected if proceeds cannot cover the outstanding mortgage, sale fees, and capital-gains tax.
- Property purchases and sales have a simplified 1% transfer/service fee; realized gains on property sales are taxed at 10%.
- Housing budgets use the selected rental amount or owned-home maintenance instead of the previous default housing estimate. Property maintenance is estimated at 1% of current value annually. Houses and apartments have modest different annual appreciation rates; these are game-balance assumptions.
- Adults can buy and sell whole units of a broad index-fund proxy or gold using cash. Each trade has a 0.5% brokerage fee; realized gains are taxed at 10%. Prices change once per simulated year with deterministic volatility; market returns are not guaranteed. Gold is not guaranteed inflation protection.
- Adults can start up to three small businesses (retail, online, cafe) with startup capital. Business value begins at invested capital; yearly operating profit/loss depends on performance. Management consumes an action and a small cash cost; businesses can be sold for 90% of estimated value.
- Net worth includes cash, bank accounts, vault, property, investments at current market prices, and business valuation, less active loans and credit-card debt. This is a simplified balance sheet; fees and capital-gains tax are simplified game assumptions, not jurisdiction-specific rules.

## Macroeconomic conditions and inflation
- Each simulated year advances a compact economy model with an expansion, stable, or recession cycle; inflation, economic growth, and a benchmark interest rate are shown in the finance area.
- Inflation changes the cost-of-living index, recurring bill/subscription amounts, and rental agreements. Deflation is possible but bounded. Household costs use the cost index rather than silently ignoring changing prices.
- Market movements respond to the economic cycle: broad index holdings follow growth and downturns; technology and energy shares have higher sector volatility; government bonds have lower price volatility and pay a 4% annual coupon, with prices reacting inversely to benchmark rates; gold reacts more to inflation and can still lose value. Property appreciation responds to its selected growth/volatility profile and macro conditions. Business operating results respond to growth, business model, cash intensity, volatility, and management performance.
- Economic conditions are deterministic for a given simulated year/age so saves and tests remain reproducible. Rates and returns are simplified fictional game mechanics, not financial advice or real market forecasts. Detailed monetary policy and variable-rate debt remain future work.

## Simplified taxation
- Adults pay progressive annual income tax: the first 12,000 currency units (scaled to the character's currency) are tax-free, followed by 10%, 15%, and 20% marginal bands. These are game rules, not jurisdiction-specific tax advice.
- Property owners pay an annual 0.5% property levy based on estimated market value. Positive net rental and small-business operating income is taxed at a simplified 10% rate.
- Annual tax is automatically paid from cash first, then liquid checking/savings accounts. Fixed deposits remain locked until maturity. If funds are insufficient, the unpaid amount carries as a tax liability and reduces net worth; no negative cash balance is created.
- Tax is assessed once per simulated year and appears in the financial ledger, with the outstanding balance and prior-year amount shown in the separate Taxes destination. There are no tax forms, deductions, jurisdiction-specific rules, or tax penalties yet.

## Creditworthiness and loan pricing
- Adults have a simplified credit score from 300 to 850, starting at 700. The score reflects missed loan/card payments, successful repayments, rejected loan applications, credit-card utilization, debt relative to income, and unpaid tax balances. Each rejected loan application is recorded with its specific reason and reduces the score by 25 points, with a cumulative rejection penalty capped at 100 points.
- Loan products have different starting rates: personal 9%, mortgage 6.5%, business 11%. The score adjusts the minimum eligible rate; players can choose a higher rate but cannot take a loan below their score-based floor. Poor credit, absent income, excessive principal relative to income, high debt-to-income, too many active loans, invalid terms, or an unavailable repayment account can lead to a specific rejection. Missed payments and other recorded financial defaults also reduce credit standing.
- The score is a game abstraction, not a real credit-bureau score. It does not model a specific country's lending regulations or bureau rules. A rejected application is recorded as a zero-value expense-ledger entry with its reason and a history event; each rejection reduces the score by 25 points, with the cumulative rejection penalty capped at 100.

## Future system expansions
The core Health, Family, Education, Career, Finance, Relationships, and Lifestyle foundations now exist. Expand them through tested gameplay depth—such as family lifecycle, chronic care, workplace operations, and richer event chains—rather than rebuilding their existing foundations or adding disconnected menus.

## Event model
A game event uses a stable ID, eligibility conditions, narrative, choices, costs, immediate effects, optional delayed consequences, and a chronological history entry. Randomness adds uncertainty but never overrides plausibility or eligibility. Avoid excessive repetition. Outcomes should be explainable from the character's circumstances.

### Implemented first event slice
- `web/src/lib/events.ts` owns the first contextual event catalogue, eligibility, deterministic selection, choice validation, immediate stat/money/action effects, unresolved-event expiry, and scheduled follow-up resolution.
- The initial authored events cover a school reading group (ages 6–17), an adult side project (ages 18–64), and a wellbeing check-in (age 35+ when health is 60 or lower). Each event is unique per life in this first slice.
- Choices are stored in the character save as a pending event. Costs are validated in the simulation layer; accepted choices are recorded in Life History. Selected choices can schedule a persistent next-year consequence.
- Advancing without choosing explicitly lets the situation pass and records that outcome. It does not spend an action or silently grant benefits.
- The Home overview shows the current situation and recent year recap. This is an initial event loop, not yet the complete year-planning/review interface or a broad event engine.

## Simulation rules
- Actions consume a communicated resource, usually time, money, or energy.
- Attribute changes have sensible bounds.
- Attributes influence outcomes but do not dictate them.
- Use reproducible random seeds where practical.
- Financial changes balance against income, expenses, assets, and liabilities.
- Relationships evolve through interactions, compatibility, time, and events.
- Earlier choices can set flags, create obligations, unlock opportunities, or affect later events.
- Record meaningful changes chronologically.
- Time advances only through an explicit player action.
- Never silently discard a save.

## Current playable foundation
The current game has scenario-led character creation with coherent randomized identity, three independent local save slots, a date-based weekly progression calendar, automatic education/work responsibilities, and a stamina-backed weekly activity plan, a simulation-backed weekly review, deterministic weekly resolution, contextual events, domain-native School/Work/Life/Finance/Lifestyle workspaces, a simulation-owned family foundation, recruitment and career progression, and a connected financial system covering accounts, cards, loans, recurring payments, property, investments, businesses, and taxation. Overview records everyday activities by simulation week; Life History is reserved for major achievements and life-stage milestones.

This is a substantial playable foundation, not a complete life simulator. The old annual action-token system is retired. Weekly turns are explicit; monthly financial settlement remains planned while the current financial settlement cadence is annual.

## Remaining major game milestones
Richer date-based event chains and deadlines, monthly financial settlement, expanded family lifecycle and dependants, deeper chronic-care/insurance/localized healthcare, personal technology, retirement, mortality, terminal-life completion, generational play, broader event packs, achievements/challenges, and balance across full-life playthroughs remain staged. Cloud backup and online features are later options, not requirements for the core game.


## System boundaries and player experiences
- Each life domain is a dedicated destination with its own focused screen flow. A domain's overview may link to its sub-systems, but must not embed every sub-system's controls and status panels in one long page.
- Finance is a parent destination, not one monolithic screen. Its child destinations are Banking, Business, Property, Investments, and Taxes, in that order. Banking contains dedicated internal sections for accounts, cards, loans, and savings/vault; these are not separate Finance destinations. Household arrangements and estimated living costs remain in simulation state and annual settlement, but the current Lifestyle navigation has no dedicated household-management view. Tax estimates and liabilities belong in Taxes, never Banking.
- Banking should use banking language and interaction patterns (accounts, balances, statements/activity, transfers, deposits, withdrawals). Cards, loans, automatic savings deposits, and the personal vault are focused internal Banking sections. Card management and credit balances are authoritative only in Banking. Lifestyle may show a read-only summary of cards used as payment methods, without duplicating card controls or balances in another place.
- Lifestyle is the renamed top-level destination (internal route `life`) and keeps Overview, Family, Family tree, and Life story alongside the Lifestyle workspace. The Lifestyle workspace itself has exactly three views: Market, Subscriptions, and Owned. Market sells food, fashion, and reusable/permanent products. Food is paid for at checkout and then appears in the current weekly plan as a bought food action; stamina, health, happiness, comfort, and stress effects apply only when the week resolves. Groceries/prepared meals, restaurant meals, and delivery are player-purchased food choices; food never enters Owned. Clothing is durable Owned inventory with style, formality, and condition. The player equips one outfit from Owned; only the equipped outfit affects presentation and loses condition weekly. Formality fit changes its usefulness by context, and presentation modestly influences interview first impressions. Subscriptions uses the existing recurringPayments records, annual billing, selected payment source, age eligibility, and cancellation. Banking remains the sole authority for card management. The old Discover, My services, and Home tabs are removed. Existing housing purchase/rental flows remain in Finance → Property; household arrangement and annual living-cost settlement remain simulation-owned. Housing quality, household support, and co-resident relationships contribute to weekly comfort and wellbeing without creating a duplicate Home destination.
- Weekly Review uses one unified activity list for both player-planned and passive activities. Planned entries remain removable; passive entries are derived from current family/household/social/housing state, greyed out and unremovable. Both types count in the combined activity/outcome summary. Passive support can include family-provided meals, cohabiting partner support, friend check-ins, extended-family support, time with children, and stable housing. No partner, friend, child, or extended relative is assumed: record social connections explicitly in Lifestyle → Family. Social connections can be strengthened through planned social time; their closeness determines the strength/type of ongoing support. Family culture changes the effects of household meals. Passive effects, including stamina/energy changes, must be explicit in simulation effects/history and applied once.
- Food checkout remains auditable: cash, selected bank account, or selected active card is charged immediately and one bought food action is added to the current weekly plan. All meal effects are deferred until weekly resolution, shown with a BOUGHT seal, and excluded from Owned. Non-food goods enter Owned only after successful payment. Failed payment grants neither inventory nor food effects and never silently creates debt.
- Lifestyle purchases must be auditable: food checkout debits cash, the selected bank account, or the selected active card immediately and creates a financial transaction/history record; it then adds one bought food action to the current weekly plan. Food effects are deferred until weekly resolution, shown with a BOUGHT seal in the weekly review, and excluded from Owned. Non-food reusable/permanent purchases debit the selected source and enter Owned only after successful payment. Provider subscriptions reuse recurringPayments and annual settlement; never create a second subscription ledger or silently create debt for a failed purchase.
- Overview, Education, Work, Finance, Lifestyle, and Profile are the in-game top-level destinations, in that order; Work and Finance unlock at age 16. Lifestyle currently exposes Overview, Market, Subscriptions, Owned, Family, Family tree, and Life story. The Overview composes the Health workspace; Family tree is a separate view; Life story groups non-activity history and financial records by age/year. Do not describe Personal Growth or Personal activities as current Life navigation sections unless they are actually present in `LifeWorkspace.svelte`. Profile owns character identity, background, appearance, attributes, save-slot management, and all game settings. Keep each domain focused and avoid a combined Activities list.
- The Education workspace owns enrollment, automatic attendance and progression, weekly academic tasks, grades, attendance, tuition, pause/resume and qualification history. Life → Health & wellbeing owns condition monitoring, care planning, recovery and treatment by composing the existing Health workspace. Do not duplicate these systems inside Finance.
- The current Work workspace includes a weekly job board, job applications, interview invitations, expiring offers, acceptance/decline, job changes, resignation, extra earnings, career development, and promotion offers. Persistent employer operations, broad vacancy lifecycles, colleagues, workplace decisions, benefits, bonuses, and monthly payroll remain planned.
- Do not place generic education/employment summaries inside Finance or other unrelated domains. Cross-domain effects (for example, salary paid into a bank account) are represented in the relevant transaction/history records, not by merging the screens.
- Shared navigation, character identity, time progression, notifications, and save state may be global. Domain-specific controls and copy remain inside their owning system.


## Personal Technology

The character may own or access smartphones, laptops, and desktop PCs. Devices are durable assets that create contextual options across school, work, relationships, personal growth, and lifestyle. Manage them in Life → Personal Technology; browse and buy them through Lifestyle → Market; pay through the existing Finance system.

Keep the first version focused on fictional models, understandable capability tiers, new/used condition, purchase, ownership/access, basic wear, repair, and replacement. Devices should enable specific opportunities rather than grant broad unexplained stat bonuses. Never make premium ownership a hard requirement for core life progression; shared, provided, public, and non-digital alternatives should be available. Full rules and acceptance tests: [PERSONAL_TECHNOLOGY.md](PERSONAL_TECHNOLOGY.md).

## Family system

Family is a connected life system built around persistent people, kinship/guardianship links, relationship bonds, household membership, dependency, and family history. It is not a single relationship score or an assumed spouse-and-children template. See [FAMILY_SYSTEM.md](FAMILY_SYSTEM.md) for the complete domain specification and implementation stages.

The current code implements family-of-origin generation, graph validation, and a targeted interaction loop. New characters may begin with parents/guardians and siblings; partners and children are never assumed in the kinship graph. Existing saves require explicit family-background initialization. Family interactions change the selected bond and record history; adult financial support debits cash and writes to the common Finance ledger. Family interactions are scheduled through the weekly activity plan.

Independent adults must arrange their own meals through paid groceries, prepared food, delivery, or restaurant choices; missing meals create a small weekly wellbeing penalty. Independent living without a rental, owned residence, shared household, or cohabiting partner home also creates a modest housing-insecurity penalty. Renting or owning a more comfortable home provides a stronger weekly comfort benefit.

A separate lightweight social-circle record lets the player explicitly record friends, a partner, children, and extended relatives for household/social support. It is not a replacement for the kinship graph and does not yet model full partnership, parenthood, adoption, custody, caregiving, mortality, inheritance, or legacy. Social time is scheduled as a six-stamina weekly activity and raises the selected connection's closeness; closeness controls passive check-in/household support. Do not present the lightweight social record as a complete family-life simulation.

## Life tree and decision progression

A dedicated **Life tree** is implemented inside Life. It groups recorded decisions into Life choices, Education, Career, Relationships, Health, and Finance branches. Each recorded decision shows the chosen route, alternatives, direct modeled effects, and any recorded follow-up. The tree is a read-only projection of `decisionTreeHistory`; viewing it grants no additional reward. Empty branches must remain honest and must not be populated with placeholders.

Decision rewards must be meaningful and tied to the choice. Use the existing simulation effect system for actual stat changes; the tree displays those same effects rather than inventing separate bonuses. Do not grant a second reward merely for viewing the tree. As new decision systems are added, record their choices in the appropriate tree category so the tabs become populated by real gameplay rather than placeholder nodes.
