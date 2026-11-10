# Simulation Testing Ground

**Purpose:** test whether a character can sustain a life, make progress toward a chosen goal, and actually reach it through the existing weekly gameplay loop.

This is a developer-only testing harness. It does not add a player-facing mode, alter game balance, or change the normal save format.

## What it must answer

A simulation run must answer two separate questions:

1. **Can the character survive the path?** Can they keep advancing weeks without invalid plans, impossible stamina budgets, broken cash bounds, or wellbeing collapsing?
2. **Can they reach the intended outcome?** Does the chosen strategy produce the qualification, capability, career state, financial milestone, relationship state, or other goal it was pursuing within a reasonable time?

A run that advances 52 weeks but makes no meaningful progress is not a successful goal test. A run that reaches a goal by destroying health, exhausting all cash, or relying on an exploit is not a healthy success either.

## Scenario contract

Each scenario defines:

- A deterministic seed and a reproducible starting character.
- A time horizon expressed in weekly advances.
- A specific, measurable goal predicate.
- A weekly strategy that chooses actions using only information available to the character at that point.
- Survival and progression metrics collected after every successful advance.

The test harness records whether the character survived the full horizon, whether and when the goal was reached, planned action and recovery counts, blocked weeks, minimum health/happiness/stamina/cash, maximum stress, and final state. Each run emits one `SIMULATION_LAB` JSON line in CI logs.

Starting-state normalization is allowed only to isolate the mechanic under test. Preserve generated identity and family context; document any resource or stat overrides in the scenario.

## First scenarios

The first implementation adds two goal-directed scenarios starting at age 18:

- **Professional programming certificate:** enroll, complete the weekly learning target through study and assignment actions, recover when stamina or stress makes further effort unwise, and verify that the qualification is awarded.
- **Physical fitness:** pursue a defined fitness threshold across 52 weeks while using rest when effort or stress becomes unsafe. Run across multiple deterministic character seeds to expose starting-state sensitivity.

The existing age-18 annual audit remains complementary: it checks ordinary household, resource-pressure, and strong-support survival conditions and verifies weekly/passive resolution accounting.

## How to judge results

Do not treat a single passing seed as proof of balance. Use scenario matrices and compare:

- **Goal success rate:** how many generated starting states can reach the stated goal?
- **Time to goal:** how many weeks does it take, and does that fit the intended life stage?
- **Survival cost:** minimum health, happiness, stamina and cash; peak stress; recovery time.
- **Choice burden:** how often the strategy must plan actions, recover, or repair blocked turns.
- **Path flexibility:** can different reasonable strategies reach the same goal, or is one exact sequence mandatory?
- **Opportunity cost:** what did the character give up by pursuing this goal?
- **Failure explanation:** if a goal is missed, identify the actual bottleneck (eligibility, affordability, stamina, stress, workload, randomness, or missing system support).

Success thresholds should be goal-specific. A short certificate and a long professional career should not share one arbitrary completion window or minimum resource threshold.

## Strategy levels

As the harness grows, run the same goals with three policy styles:

- **Casual:** chooses a small number of understandable actions based on interests and immediate circumstances; does not optimize every stat.
- **Intentional:** prioritizes a declared life direction and balances supporting needs.
- **Expert:** uses full system knowledge to optimize action timing, prerequisites, finances, and recovery.

A goal that only the expert policy can reach may be too opaque or demanding. A goal that every policy reaches effortlessly may lack meaningful trade-offs. Casual play should still produce a coherent life, while expertise should improve reliability, timing, or quality.

These are policy simulations, not a substitute for human usability testing. They test the rules and strategy space; later UI playtests must check whether real players can understand the available choices and predict their consequences.

## Expansion order

Add scenarios when their underlying systems are implemented and stable:

1. Education and capability goals across several fields and programme lengths.
2. First job, career specialization, promotion, and career change.
3. Independent living with recurring expenses and emergency setbacks.
4. Savings, property, business ownership, and debt recovery.
5. Relationship, family, and social-support goals.
6. Health recovery and long-term wellbeing.
7. Multi-decade paths with competing goals, life-stage transitions, retirement, and end-of-life outcomes.

Do not invent goal success by directly editing character state during a run. Strategies must use the same public game actions available to the player. Goal predicates may inspect resulting state, but they must not cause progression.

## Current limitations

The first slice tests education and fitness goals for young adults. It does not yet simulate the full player interface, monthly financial cadence, a complete birth-to-death life, or all career/business/relationship goals. The weekly simulation still has incomplete long-term systems; scenarios must not imply those systems are finished.
