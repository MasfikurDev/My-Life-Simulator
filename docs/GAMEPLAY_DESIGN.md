# Gameplay Design

**Canonical gameplay direction · Updated 2026-11-06**

## Core loop
1. Review the character's life and circumstances.
2. Choose an activity, interaction, or response to an event.
3. Pay its cost (time, money, energy, or opportunity).
4. Apply immediate effects and schedule delayed consequences.
5. Review the updated life and history.
6. Advance time deliberately when ready.

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

### Education progression
- Education status follows the age bands: not started (0–2), early learning (3–5), primary education (6–12), secondary education (13–17), and secondary education completed at 18.
- Study consumes an annual action, improves intelligence, and advances learning progress. Progress resets at the next school-stage boundary.
- From age 18, five study actions (20 progress each) can complete the higher-education qualification. Higher education improves access to professional roles and application odds.
- Education is a game progression model, not a detailed curriculum, school attendance simulation, or real qualification equivalency.

### Employment and recurring finances
- At ages 16–17, a successful application creates a part-time assistant role. Adult full-time employment is not available before age 18.
- From age 18, a successful application creates an operations role; higher education unlocks a higher-paid professional role. At 65+, new applications offer flexible work. Existing jobs can continue.
- Application outcomes use education, intelligence, and selected personality traits. Randomness is injectable for deterministic tests.
- Career development consumes an action and raises job performance. After at least two years of experience, performance of 85 or more can trigger a promotion, increasing salary by 20%. Promotions are capped at three in this first implementation.
- Paid activities must be affordable before they can be selected or applied. The simulation is authoritative: an unaffordable action changes neither money nor stats and does not consume an action. Costs use the character's currency scale.
- Salary is credited when the player advances a year. Before age 18, the existing simplified employment expense rates remain in place. From age 18, a selectable family-supported, shared, or independent living arrangement determines recurring housing, food, transport, utilities, and personal costs. The annual budget is calculated from job pay, or a provisional baseline when unemployed.
- Household costs are paid from income and available cash. If funds cannot cover the estimate, the unpaid amount is recorded as a shortfall and happiness decreases; balances never become negative and no debt is silently created. This is a game-pressure mechanic, not a real-world cost model.
- Players can set an emergency savings target of one, three, or six months of estimated household costs. Progress is measured against the current cash balance; savings are not a separate account or locked funds.
- One-off extra work remains a separate action. Taxes, unemployment benefits, debt, assets, and detailed country-aware cost models are not implemented.
- New household, savings-goal, and finance-history fields are optional on Character so existing local saves remain readable without a schema migration.

Build progression in connected layers: early development and schooling; teen education/interests and limited earning; adult employment and recurring finances from 18; career growth and household responsibilities as prerequisites and age permit; midlife health/financial planning; later-life retirement and flexible work. Unlock only mechanics that are implemented and eligible. Hide unavailable actions instead of showing dead controls. Explain an unlock only when it helps the player understand the next stage.

## Game log and debug export
The settings page provides a concise recent-log view backed by the character's chronological life history and a copyable, versioned JSON debug snapshot. The snapshot includes the active save slot, full character state, and complete history; it excludes device identifiers, browser details, and account data. Keep the export portable and deterministic apart from its explicit export timestamp. Do not include secrets or unrelated local settings.

## Banking and unified financial foundation
- Characters age 16+ may open up to eight personal bank accounts: everyday/checking, savings, and fixed deposits. Fixed deposits lock funds for 1–10 years and earn a simplified 4.5% annual rate; withdrawals are blocked until maturity. Savings earn 2% and checking earns 0%. Older saves without bank fields remain valid.
- Cash remains immediately available money; bank balances are separate holdings. Net worth currently includes cash plus bank account balances only. Do not present it as complete net worth until debts and other assets exist.
- Deposits, withdrawals, account opening, transfers, employment income, household expenses, and interest are recorded in an append-only per-character financial transaction history (latest 300 entries). Account operations reject invalid amounts, overdrafts, missing accounts, and same-account transfers.
- Savings accounts currently earn a simplified 2% annual rate; checking accounts earn 0%. Rates are game-balance values, not real bank offers. Interest is credited on year advancement.
- The finance screen exposes account creation, cash deposits/withdrawals, account-to-account transfers, balances, and recent transactions. Cards, credit, loans, property, investments, vaults, auto-pay, and subscriptions are not implemented yet.

## Cards, credit, recurring payments and personal vault
- Age 16+ characters can issue debit cards linked to an existing account or prepaid cards that must be loaded before use; age 18+ characters can issue credit cards with a defined limit. Prepaid balances count as assets, while credit balances count as liabilities. Debit purchases immediately reduce linked bank balances. Credit purchases add to card liability and cannot exceed available credit.
- Credit card balances accrue a simplified 18% annual rate and attempt a 5% minimum payment each year from the linked account or cash. Players can make explicit repayments. Rates are game values, not real offers.
- Age 18+ characters can take up to five personal, mortgage, or business loans. Loan proceeds increase cash and liability equally. Interest accrues annually; a simplified principal installment is attempted from cash or a selected bank account. Extra repayments are supported. Missed payments do not erase balances or create hidden negative cash.
- Up to twelve annual recurring bills/subscriptions can be set up and paid from cash, a bank account, or a debit, credit, or prepaid card. Debit-card charges debit the linked bank account; credit-card charges use available credit; prepaid charges use the loaded balance. Failed cash/account payments are logged as missed without creating debt; credit-card subscriptions use available credit. Players can cancel them.
- Up to five automatic deposit rules move a fixed amount or percentage of annual income into a selected bank account after household costs. Deposits only happen when cash is sufficient.
- Age 16+ characters can store and withdraw cash in a personal safe/vault. Vault holdings earn no interest and remain part of net worth.
- Net worth now includes cash, bank balances, and vault cash, less active loan balances and credit-card debt. It remains a simplified balance sheet; property, businesses, stocks, gold and other assets are not included yet.

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
- Market movements respond to the economic cycle: broad stock-index holdings react more strongly to growth and downturns; gold reacts more to inflation and can still lose value. Property appreciation responds to both inflation and growth. Business operating results respond to economic growth as well as management performance.
- Economic conditions are deterministic for a given simulated year/age so saves and tests remain reproducible. Rates and returns are simplified fictional game mechanics, not financial advice or real market forecasts. Detailed monetary policy and variable-rate debt remain future work.

## Simplified taxation
- Adults pay progressive annual income tax: the first 12,000 currency units (scaled to the character's currency) are tax-free, followed by 10%, 15%, and 20% marginal bands. These are game rules, not jurisdiction-specific tax advice.
- Property owners pay an annual 0.5% property levy based on estimated market value. Positive net rental and small-business operating income is taxed at a simplified 10% rate.
- Annual tax is automatically paid from cash first, then liquid checking/savings accounts. Fixed deposits remain locked until maturity. If funds are insufficient, the unpaid amount carries as a tax liability and reduces net worth; no negative cash balance is created.
- Tax is assessed once per simulated year and appears in the financial ledger, with the outstanding balance and prior-year amount shown in Banking. There are no tax forms, deductions, jurisdiction-specific rules, or tax penalties yet.

## Creditworthiness and loan pricing
- Adults have a simplified credit score from 300 to 850, starting at 700. The score reflects missed loan/card payments, successful repayments, credit-card utilization, debt relative to income, and unpaid tax balances.
- Loan products have different starting rates: personal 9%, mortgage 6.5%, business 11%. The score adjusts the minimum eligible rate; players can choose a higher rate but cannot take a loan below their score-based floor. Poor credit can eventually block new borrowing.
- The score is a game abstraction, not a real credit-bureau score. It does not model a specific country's lending regulations or bureau rules.

## Candidate systems
Health; family; education; career; finance; relationships; lifestyle; contextual/scheduled/random/player-created events. Build incrementally and connect systems. Do not implement every system at once.

## Event model
A future event definition should include a stable ID/content version, eligibility conditions (age, location, finances, health, education, relationships, job, prior flags), trigger type, narrative, choices, costs, immediate effects, delayed consequences, and a history entry.
Randomness adds uncertainty but never overrides plausibility or eligibility. Avoid excessive repetition. Outcomes should be explainable from the character's circumstances.

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

## First playable slice
Scenario-led character creation with coherent randomized profiles, a modern dashboard, several meaningful activities, a limited number of actions per year, deliberate year advancement, contextual events, basic finances, persistent save, and life history.

## Later, not MVP blockers
Marriage/children, richer family trees, deeper education/career, property/assets, generational play, achievements, expanded event packs, cloud backup, online features. Prioritize based on demonstrated fun and player feedback.


## System boundaries and player experiences
- Each life domain is a dedicated destination with its own focused screen flow. A domain's overview may link to its sub-systems, but must not embed every sub-system's controls and status panels in one long page.
- Finance is a parent destination, not one monolithic screen. Its child destinations are Banking, Cards, Loans, Taxes, Bills & Subscriptions, Savings & Vault, Property, Investments, Business, and Living Costs. Household budgets belong only in Living Costs; bank balances, transfers, account opening, and bank activity belong only in Banking. Tax estimates and liabilities belong in Taxes, never Banking.
- Banking should use banking language and interaction patterns (accounts, balances, statements/activity, transfers, deposits, withdrawals). Cards, loans, and recurring payments each have their own focused workspace. Property, investments, and business ownership are separate asset experiences.
- School, Work, and Life are separate top-level destinations, not a combined Activities list. Study belongs to School; job applications, extra work, and career development belong to Work. Life contains modular Wellbeing (health, happiness, fitness), Personal Growth (intelligence), Personal activities (exercise/play and social time), and Life History. Keep these as focused sections inside the Life workspace.
- The current School workspace presents age-appropriate education stage, existing study progress, and the existing Study action. It does not imply that enrollment, attendance, classes, grades, fees, or a detailed curriculum are implemented.
- The current Work workspace presents job-search or current-role status, existing pay/performance/experience/promotion values, and existing job-application, extra-work, and career-development actions. It does not imply that interviews, offers, named employers, colleagues, or a full recruitment pipeline are implemented.
- Do not place generic education/employment summaries inside Finance or other unrelated domains. Cross-domain effects (for example, salary paid into a bank account) are represented in the relevant transaction/history records, not by merging the screens.
- Shared navigation, character identity, time progression, notifications, and save state may be global. Domain-specific controls and copy remain inside their owning system.
