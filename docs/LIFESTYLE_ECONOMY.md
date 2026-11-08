# Lifestyle Economy — Quality of Life Through Money

**Status:** Design specification; implementation planned  
**Purpose:** Make money a practical lever that changes how a character lives, not just a number that grows in Finance.

## Core design

The character's financial position should shape the quality, safety, convenience, and range of everyday choices. Early in life, especially with low income, the player must prioritize necessities, compare value, avoid unnecessary spending, and build savings or earning capacity. Once income, savings, and assets provide genuine stability, the character can afford better nutrition, more reliable goods, safer options, professional services, comfort, and richer experiences.

Wealth should create access and reduce avoidable friction. It should not guarantee happiness, health, success, or immunity from consequences.

## Food and nutrition

Food is the clearest everyday example because price and quality have understandable trade-offs.

| Tier | Typical role | Cost | Expected effects |
|---|---|---:|---|
| Budget / fast food | Cheap, convenient, filling | Low | May satisfy hunger cheaply, but offers limited nutrition; frequent reliance can harm health or energy over time |
| Basic home meals | Affordable everyday food | Low–moderate | Reliable baseline nutrition and reasonable value |
| Balanced meals | Higher-quality routine diet | Moderate | Better nutrition, health maintenance, and energy/recovery support |
| Premium / gourmet | High-quality ingredients and preparation | High | Strong nutrition and wellbeing benefits, more satisfaction/comfort, but diminishing returns |

Do not make a single gourmet meal cure poor health or grant large permanent stat boosts. Nutrition should accumulate over time, be affected by consistency, and be balanced against other health factors. Cheap food is not automatically harmful; the penalty should come from poor nutritional quality and repeated reliance, not from price alone.

Food access and responsibility must fit the character's age and household. Children should not be expected to manage adult grocery budgets independently. Household food spending should eventually integrate with the existing Lifestyle marketplace and Finance ledger.

## Everyday goods and services

Extend the same quality/value logic to other domains:

- **Clothing and essentials:** inexpensive basics meet needs; higher-quality options last longer, improve comfort, and reduce replacement frequency.
- **Devices and tools:** reliable equipment improves capability and reduces failure/downtime; premium tiers offer convenience or specialist capability, not arbitrary intelligence boosts.
- **Housing:** safe, stable, well-maintained housing reduces health and security risks; better housing can improve comfort and privacy while increasing rent, mortgage, maintenance, or utility costs.
- **Transport:** low-cost options save money but may take more time or carry inconvenience; safer/reliable options reduce disruption and risk.
- **Healthcare and prevention:** affordability can determine whether the character can access timely checkups, treatment, counselling, and insurance; delaying care can create compounding costs and risks.
- **Experiences and recreation:** low-cost activities remain available; premium experiences can improve satisfaction, relationships, or opportunities but should be optional.

Each category should be implemented only when it has a complete ownership, affordability, effect, and ledger contract. Avoid adding superficial premium/standard/cheap selectors to every screen.

## Financial progression

Use the following progression as a balancing guide, not rigid account-balance gates:

1. **Financially constrained:** income is low or unstable. Necessities compete with savings, education, transport, and health. The player values cheap, reliable choices and avoids debt where possible.
2. **Getting by:** recurring income covers most essentials, but emergencies or large purchases still require planning. Small upgrades are possible, but trade-offs remain.
3. **Stable:** income and reserves reliably cover essentials. The character can choose balanced nutrition, preventative care, better tools, safer transport, and some leisure without constant budget pressure.
4. **Comfortable / affluent:** the character has meaningful discretionary income and reserves. Premium food, services, convenience, high-quality goods, and broader experiences become viable. Asset income and financial resilience can reduce exposure to common shocks.

A character's true lifestyle capacity should consider disposable income, liquid reserves, debt obligations, dependants, and cost of living—not cash on hand alone. High income with high debt or poor liquidity should not be treated as secure wealth.

## Gameplay rules

- Prices scale with the character's country/currency and local economy.
- Every purchase checks affordability at the simulation boundary and records through the existing Finance transaction/ledger path.
- No free stat rewards when a purchase fails.
- Benefits should be specific to the purchase: nutrition improves health maintenance; reliable tools reduce failure; safer housing reduces exposure; convenience may reduce workload or stress.
- Apply diminishing returns. Moving from poor nutrition to balanced meals should matter more than moving from already excellent meals to gourmet.
- Repeated habits and consistency matter more than one-off purchases.
- Keep player agency: a wealthy character can still choose to save, buy budget goods, or spend on experiences.
- Do not punish low-income characters with unavoidable severe stat loss. Provide viable baseline options and make the biggest trade-offs understandable.
- Premium purchases must not become mandatory prerequisites for education, work, or basic progression.
- Money should enable better options; character skills, decisions, relationships, health, and circumstances still determine outcomes.

## Implementation sequence

1. Food/nutrition as a complete, ledger-backed system with recurring household costs and quality effects.
2. Everyday essentials and durable goods, connected to existing Lifestyle marketplace and future Personal Technology.
3. Housing quality, safety, maintenance, and transport trade-offs.
4. Preventative services and optional experiences.
5. Scenario balancing across low-income, stable, and affluent lives.

## Acceptance

A financially constrained character can live and progress through sensible budget choices. A character who builds stable finances can afford better nutrition, safer/reliable items, preventative services, and more activities, and receives appropriate benefits over time. The game never treats wealth as an automatic win condition, and all purchases remain auditable in the shared Finance ledger.
