# Career Progression Design

**Status: first playable recruitment and career slice implemented · 2026-11-07**

This document defines the intended player experience and records the current implementation boundary. The first playable Jobs & Career slice is now implemented; the deeper workplace, compensation, and labor-market systems remain staged rather than implied to be complete.

## Current implementation · 2026-11-07

The Work workspace now has a functional first recruitment and career loop:

- A deterministic weekly job board generates a small set of fictional openings across Customer service, Operations, Technology, and Sales. Listings refresh with the game week; employer names and salary values are generated game data, not real companies or real-world market claims.
- Each listing has an employment type, annual base-pay amount, role description, and visible age, education, knowledge, and experience requirements. Ineligible jobs remain inspectable so players can understand future opportunities.
- Applying for a job reserves one weekly period. The application resolves during weekly advancement into either an interview invitation or an unsuccessful application.
- An interview reserves two weekly periods. A successful interview creates an offer; the player explicitly accepts or declines it. Offers expire after 14 calendar days.
- Accepting an offer creates the current employment record, replaces the recurring Work shifts in the weekly schedule, and preserves accumulated career experience when changing jobs. Full-time roles reserve weekday morning/afternoon periods; part-time and flexible roles use lighter three-period patterns. Resignation removes Work commitments and any now-invalid career-development reservation without erasing career history or experience.
- Four role-based career paths provide a read-only progression preview and estimated annual salary bands.
- Promotion readiness is based on the next role's age, education, knowledge, applicable role-specific attributes, career experience and current-performance requirements. When requirements are met at annual review, the game creates a time-limited promotion offer. The player decides whether to accept it; promotion is no longer granted automatically.
- Work applications and interviews are confirmed from the relevant job listing or invitation. The simulation automatically places them into suitable free time; the Work screen reports the selected date/period. They resolve through the weekly schedule. Offers, job starts, resignation, and promotions remain direct career decisions and are recorded in Life History.

Current limitations are intentional and visible: payroll and household settlement still occur annually; salary is displayed as annual base pay; employer operations, vacancies as persistent company state, workplace decisions, layoffs, bonuses, benefits, negotiations, and monthly payroll are not implemented yet. The current role catalogue uses age, education, intelligence, experience and a small number of role-specific character attributes (focus, social skills, confidence, discipline and creativity). Structured education and qualification records have been added to the save model, but full education pathways, course completion and certificate/license issuance are not yet playable.

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
- employer identity from the generated job offer, when available;
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
- Promotion, job change, offer acceptance, resignation, bonus payment, and payroll events must be recorded in history and use the shared financial transaction path where money changes.
- Do not double-count bonuses in salary previews or payroll.

The existing weekly gameplay direction remains authoritative: the week is the playable unit, months own recurring finance/reporting cadence, and years own long-term life progression. Work now supplies a simplified default shift pattern based on employment type; detailed shift selection, attendance, employer scheduling, and monthly payroll remain future work. School attendance remains unmodeled until its own schedule loop is implemented.

## Domain boundaries

- Career discovery, path preview, applications, offers, current employment, workplace decisions, performance, promotions, and career history belong in **Work → Career**.
- Payroll is generated by Work employment state and settled through the shared Finance transaction/ledger path.
- Finance displays authoritative balances and transactions; it does not own career progression or promotion controls.
- Education owns formal enrollment, learning history, courses, certificates and licenses. Work reads verified qualification records and relevant attributes as eligibility inputs without duplicating Education management.
- Shared state and history connect these domains; their interfaces remain domain-native.

## Maturity and implementation sequence

This is deliberately staged. Do not present later-stage mechanics as live until implemented and tested.

1. **Implemented — recruitment foundation:** job listings, requirements, scheduled applications and interviews, expiring offers, acceptance/decline, job changes, and resignation.
2. **Implemented — career preview:** four fictional role paths with clearly labeled estimated annual salary bands. Viewing a path never changes the save or ledger.
3. **Implemented — transparent first-pass readiness:** age, education, general knowledge, career experience, and current performance are checked separately. Detailed role-specific skills remain future work.
4. **Implemented — attribute-aware role requirements:** selected roles now check focus, social skills, confidence, discipline or creativity in addition to age, education, intelligence and experience. Qualification ID checks are supported by the role requirement model; no production role currently depends on a newly issued certificate until the education system can award one.
5. **Implemented — player-controlled promotion:** eligible employees receive a time-limited promotion offer at annual review; the player accepts or declines. A stale offer cannot promote a different job after a job change, and changing jobs clears the previous promotion offer.
6. **Next — education and qualification integration:** formal school stages, subject/field choices, vocational routes, degree progression, course enrollment, attendance, certificates/licenses, expiry and renewal, with real role unlocks.
7. **Next — workplace depth:** employer structures, real vacancies, workplace decisions, performance outcomes, layoffs, and career stability.
8. **Later — compensation depth:** monthly payroll, conditional bonuses, benefits, and negotiation only when the finance and employer rules are ready.

## Out of scope for the initial career preview

- Copying another game's fixed `X/XX weeks` progression gate.
- Guaranteed salary or bonus promises for future roles.
- Fake employers, vacancies, interviews, offers, or promotion decisions.
- Arbitrary universal career points or unexplained performance bonuses.
- A large static career tree with no meaningful gameplay connection.
- Showing placeholder metrics as if they were calculated from actual save data.

## Acceptance principles

- A player can tell what their current job is and exactly how much its annual base pay is; the UI labels the annual cadence and current annual payroll limitation.
- Every progress indicator has one clear, implemented meaning.
- The player can inspect plausible future roles and understand that compensation is estimated.
- Previewing a role never mutates the save or financial ledger.
- No promotion, vacancy, qualification, bonus, or benefit is implied unless represented by actual game state/rules.
- Career decisions remain in Work; money movement remains in Finance's shared ledger.
- Existing saves remain readable; new fields are optional or migrated safely.
- The feature creates useful choices and anticipation rather than a timer-based grind.
