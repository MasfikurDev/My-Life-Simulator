# Career Progression Design

**Status: approved direction · detailed mechanics intentionally immature · 2026-11-06**

This document preserves the intended player experience for career growth. It is a design direction, not a claim that the current Work system already supports these mechanics. Do not implement the entire model in one pass.

## Design intent

Career progression should be understandable, motivating, and useful for planning. Keep the satisfying sense of advancement from the current job card, but do not copy another game's artificial `X/XX weeks` promotion requirement.

The player should understand:
- what their current position is and what it pays;
- how well they are currently performing;
- what the next plausible career opportunity is;
- what advancement could offer in compensation and responsibility;
- what qualifications, skills, experience, performance, or circumstances may affect eligibility.

Progression should emerge from a coherent career and workplace simulation, not from waiting out a hidden timer.

## Current job presentation

The Work workspace may retain a prominent Current Job card with:
- position title and career/occupation path;
- employer, once employer identity is actually modeled;
- pay with an explicit cadence (weekly, monthly, or annual);
- current performance or another clearly named, authoritative metric;
- current level/rank only when the career model defines what it means;
- next plausible position and a concise explanation of what matters for advancement;
- a clear route to manage the job and preview the career path.

### Progress indicators must be honest

A circular ring is a useful visual anchor, but its meaning must be explicit and backed by real state. Possible meanings include current performance or promotion readiness; these are different measures and must not be conflated.

- **Performance** describes how the character is doing in the current role.
- **Promotion readiness** describes how well the character currently meets the known requirements for a possible next role.
- **Career progression** describes position/path advancement and must not be represented as a fabricated percentage merely to fill a ring.

If the game cannot calculate a trustworthy percentage, show a qualitative status or specific requirement checklist instead. Never show 100% beside a separate incomplete promotion target without explaining the distinction.

## Career path preview

Provide a dedicated preview reachable from the Current Job card. It should show the player's current position in a readable progression tree or connected path, with plausible future roles and, where designed, alternative branches.

Each role preview may eventually include:
- role title and seniority;
- estimated salary range and pay cadence;
- potential bonus range and whether it is discretionary, performance-based, or otherwise conditional;
- benefits or other compensation, only when represented by game rules;
- typical responsibilities and scope of authority;
- qualifications, skills, experience, and performance expectations;
- eligibility/readiness status and the specific gaps the player can work on;
- vacancy or employer availability, once recruitment and employer systems support it.

A preview is guidance, not a promise. Salary and bonus figures are estimates or ranges, not guaranteed future income. Clearly distinguish typical/estimated compensation from an actual offer or contract.

## Promotion rules and player agency

Do not use a universal fixed number of weeks or years as the main promotion gate. Time in role may be a contextual factor if a future design proves it useful, but it must not be the whole challenge or a grind requirement.

Promotion criteria should be role- and career-specific and may combine:
- demonstrated job performance;
- relevant skills and qualifications;
- experience appropriate to the role;
- meaningful workplace outcomes and decisions;
- employer structure, available positions, and business circumstances;
- a fair element of uncertainty where appropriate.

Show the player the requirements that are known to them. Avoid hidden arbitrary thresholds and guarantee-like progress bars when advancement depends on employer decisions or vacancies. The player should have meaningful ways to improve readiness, pursue another path, or change employers.

## Compensation model

Keep compensation transparent and consistent with Finance:
- Every salary value has an explicit cadence and currency.
- Salary actually paid is determined by the character's current employment record and the payroll settlement rules.
- Career previews show estimates/ranges only; they do not change cash, create expected income in the ledger, or imply a promotion has occurred.
- Bonuses are separate from base salary and are paid only when an implemented rule or actual offer says they are due.
- Benefits should be introduced only when their gameplay and financial effects are modeled.
- Promotion, job change, offer acceptance, bonus payment, and payroll events must be recorded in history and use the shared financial transaction path where money changes.
- Do not double-count bonuses in salary previews or payroll.

The existing weekly gameplay direction remains authoritative: the week is the playable unit, months own recurring finance/reporting cadence, and years own long-term life progression. Career mechanics must fit the eventual weekly schedule and payroll cadence without inventing work hours or attendance before Work schedules are implemented.

## Domain boundaries

- Career discovery, path preview, applications, offers, current employment, workplace decisions, performance, promotions, and career history belong in **Work → Career**.
- Payroll is generated by Work employment state and settled through the shared Finance transaction/ledger path.
- Finance displays authoritative balances and transactions; it does not own career progression or promotion controls.
- School owns education and qualifications. Work may read those qualifications as eligibility inputs without duplicating School management.
- Shared state and history connect these domains; their interfaces remain domain-native.

## Maturity and implementation sequence

This is deliberately staged. Do not present later-stage mechanics as live until implemented and tested.

1. **Clarity first:** improve the current job presentation using only existing, authoritative save data. Label performance, pay cadence, and current position accurately. Remove unexplained or misleading progress percentages.
2. **Read-only career preview:** define a small fictional career path catalogue with role descriptions and clearly labeled estimated compensation ranges. No promotion or salary changes are caused by viewing it.
3. **Transparent readiness:** introduce role-specific skills/qualification/performance requirements and show known gaps. Keep the calculation explainable and deterministic where possible.
4. **Real promotion decisions:** connect eligibility to workplace state, employer vacancies/structure, player decisions, and outcomes. Record decisions and consequences.
5. **Compensation depth:** add conditional bonuses and benefits only when the payroll, finance, and employer rules are ready.
6. **Broader career play:** add branching paths, job changes, recruitment, negotiations, setbacks, and long-term career history as complete playable loops.

## Out of scope for the initial career preview

- Copying another game's fixed `X/XX weeks` progression gate.
- Guaranteed salary or bonus promises for future roles.
- Fake employers, vacancies, interviews, offers, or promotion decisions.
- Arbitrary universal career points or unexplained performance bonuses.
- A large static career tree with no meaningful gameplay connection.
- Showing placeholder metrics as if they were calculated from actual save data.

## Acceptance principles

- A player can tell what their current job is and exactly how much it pays, including pay cadence.
- Every progress indicator has one clear, implemented meaning.
- The player can inspect plausible future roles and understand that compensation is estimated.
- Previewing a role never mutates the save or financial ledger.
- No promotion, vacancy, qualification, bonus, or benefit is implied unless represented by actual game state/rules.
- Career decisions remain in Work; money movement remains in Finance's shared ledger.
- Existing saves remain readable; new fields are optional or migrated safely.
- The feature creates useful choices and anticipation rather than a timer-based grind.
