# Personal Technology System

**Canonical system design · 2026-11-06**

## Purpose

Personal Technology models access to and ownership of everyday digital devices. It creates practical financial decisions and connects education, work, communication, entertainment, and personal development. It is a life-simulation system, not a hardware benchmark, electronics catalogue, or device-collection game.

## Product and navigation boundaries

- Lives in **Life → Personal Technology**. This workspace owns device inventory, condition, capabilities, repair, upgrades, and replacement.
- Shopping belongs in **Lifestyle → Discover**, through a distinct fictional technology retailer.
- Purchases use existing Finance payment methods and transaction records. Do not create a second wallet, card manager, or technology ledger.
- Finance owns affordability and payment execution; Life owns device use and condition; Lifestyle Discover owns retail purchase flow.
- Other workspaces may show contextual requirements or outcomes, but link to Personal Technology for management. Do not duplicate inventory or controls in School, Work, Finance, or Life Overview.

## Device categories

1. **Smartphone:** communication, messaging, navigation, photography, personal organization, mobile services, and on-the-go access.
2. **Laptop:** portable study, writing, office work, creative projects, remote work, and general computing.
3. **Desktop PC:** stationary computing, demanding creative work, advanced productivity, and gaming/entertainment.

A device is an individual instance, not just a quantity. Store only fields used by gameplay: stable ID, category, fictional make/model, new/used condition at purchase, acquisition date/price, capability tier, physical condition, and ownership/access status. Use fictional manufacturers and model names; avoid real-world brand dependencies and catalogues requiring constant updates.

## Capability model

Use a few understandable, category-aware tiers: **Basic**, **Standard**, **Advanced**, and **High-performance** where appropriate. A capability check is task-specific: basic research may need basic access; specialized creative work may require a capable laptop or PC. A smartphone does not substitute for every computer task. Avoid a universal hardware score and broad unexplained stat bonuses.

## Ownership, access, and life stages

- A character may own multiple devices, replace one, keep a backup, or own none.
- Distinguish owned, borrowed, shared, school-provided, and work-provided access. Access is not ownership and must not count as personal wealth.
- Age eligibility and guardian involvement apply to purchases, accounts, and contracts. Children cannot independently enter adult financial contracts.
- Childhood/teen access depends on family rules, household resources, school access, and age-appropriate events. Do not assume every child owns a smartphone or computer.
- Shared school/work equipment can satisfy a specific task without granting permanent ownership.
- Players without personal devices retain reasonable alternatives: shared household devices, school/work equipment, public access, or non-digital options where appropriate.
- Never make premium ownership a hard requirement for core education, employment, or life progression.

## Lifecycle and costs

- **Purchase:** compare category, capability, new/used condition, price, and terms when implemented. Show affordability before confirmation.
- **Condition:** wear accumulates gradually through modeled use/time. Avoid rapid arbitrary degradation or hidden penalties.
- **Repair/replacement:** present clear cost and expected result; older devices remain usable for basic tasks.
- **Obsolescence:** capability requirements may evolve slowly. Do not make older devices suddenly worthless.
- **Loss/damage/theft:** only contextual events with plausible causes and fair resolution options; not routine random punishment.
- **Resale:** model proceeds and fees explicitly; prevent buy/sell exploits.
- Data plans, internet, cloud storage, software and subscriptions belong to their respective service/finance systems. Do not silently bundle recurring costs into device prices.

All purchases, repairs, and resales use the shared financial transaction path. A device is a possession, but estimated resale value is not cash or liquid wealth.

## Gameplay integrations

| Domain | Examples |
|---|---|
| School | Research, digital assignments, online classes, study tools, school-provided access |
| Work | Remote-work eligibility, office/technical tasks, applications, productivity, work-provided equipment |
| Relationships | Messaging, calls, photos, social opportunities and conflicts |
| Personal growth | Learning resources, creative hobbies, technical skills, personal projects |
| Lifestyle | Shopping, entertainment, digital services |
| Finance | Affordability, supported installments, repair costs, resale proceeds |

Devices enable or improve specific opportunities, not broad unexplained bonuses to intelligence, happiness, or income. A capable laptop might enable a specialist project or reduce its time requirement; it must not automatically raise every skill. Integrations must be age-appropriate and grounded in actual save data.

## Events and decisions

Use contextual situations sparingly: a first-phone decision involving family rules; used laptop now versus saving for a better one; repair versus replacement; a school/work opportunity requiring computer access with shared-equipment alternatives; or plausible damage/loss. Show known costs, prerequisites, risks, and likely outcomes. Avoid repetitive upgrade prompts and brand advertisements.

## MVP and later expansion

**First playable slice**
1. Personal Technology workspace with owned/accessed inventory.
2. Small fictional catalogue for smartphones, laptops, and desktop PCs with clear capability tiers and prices.
3. New/used purchase flow through Lifestyle Discover and existing Finance payment methods.
4. Basic condition, repair, and replacement decisions.
5. A few tested integrations with School, Work, and Personal activities.
6. Save/load and history for purchases and major device changes.

**Later, only when the core slice is fun:** guardian rules/shared household equipment; school/work-issued devices; internet/data plans and software services; detailed battery/storage, warranties, insurance, resale/trade-in; broader device-related events.

Do not build an app store, operating-system simulator, hardware crafting tree, real-world brand database, or detailed component-by-component PC builder in the first version.

## Acceptance criteria

1. Browse fictional smartphones, laptops, and desktop PCs with understandable differences.
2. New/used options have transparent condition and price trade-offs.
3. Purchases use existing payment and ledger systems; failed purchases change neither inventory nor finances.
4. Devices persist across save/load and appear once in Personal Technology.
5. Repair/replacement changes condition or ownership and records actual costs.
6. School/Work tasks can check capability/access without duplicating device controls.
7. Shared/provided access can satisfy eligible tasks without pretending ownership.
8. Players without devices retain viable core progression alternatives.
9. Age/guardian rules prevent inappropriate independent purchases/contracts.
10. No device bonus, expense, ownership, or completed activity appears unless represented in simulation state/history.
