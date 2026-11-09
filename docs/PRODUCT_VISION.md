# Product Vision

**Canonical product direction · Reviewed 2026-11-08**

## One-sentence vision
A modern, replayable life simulator where the player shapes a believable life through meaningful choices, evolving relationships, opportunities, setbacks, and consequences.

## Product identity
- Android-first, single-player life simulation.
- A modern mobile app experience, not a retro text adventure.
- Primarily text, choices, cards, compact visual summaries, and subtle motion.
- Grounded, coherent, sometimes surprising simulation; fun and replayability matter more than maximal system count.
- Offline-capable gameplay is a product goal. Optional online services may come later, but core gameplay must not depend on accounts, a backend, or AI services.
- Genre inspiration includes DeepLife Simulator, AltLife, and Life Pop. Create original mechanics, writing, presentation, and identity; do not copy their content or distinctive UI.

## Non-negotiable principles
1. Logic before volume: a few interacting systems beat hundreds of disconnected events.
2. Choices matter: decisions create understandable immediate/delayed effects and alter future possibilities.
3. Contextual plausibility: events/actions respect age, life stage, finances, health, education, relationships, and circumstances.
4. Player agency: time progression is deliberate; opening a screen never ages the character.
5. Readable, fast UX: important information is scannable and actions are discoverable.
6. Replayability through variation: starting circumstances, traits, choices, and event sequences create different lives.
7. No artificial depth: no currencies, meters, menus, or complexity without gameplay purpose.
8. Traceability: the player can review important events and understand major outcomes.
9. Respect player time: quick sessions feel productive; long sessions offer meaningful decisions.
10. Build a playable game early: architecture and planning must not delay the first enjoyable loop.

## Experience pillars
- A connected life: family, education, work, money, health, and relationships affect one another.
- A personal life: the player recognizes how earlier decisions shaped the present.
- A surprising life: plausible uncertainty and contextual events prevent repetitive playthroughs.
- A polished interface: typography, hierarchy, cards, clear actions, themes, responsive layouts, restrained animation.

## Game feel and genre direction
My Life Simulator must be fun to play as a game, not merely comprehensive as a life-management model. Its primary rhythm is a sequence of playable weeks, grouped into monthly financial rhythms and yearly life chapters. Weeks contain relevant decisions, contextual events, schedule trade-offs, consequences, and concise recaps; months organize recurring financial obligations and reports; years organize birthdays, life-stage changes, and long-term milestones. The player should be able to make progress in a short mobile session and still build a distinct life over a longer playthrough.

Genre references are used for design lessons only:
- BitLife demonstrates the accessibility of a year-by-year life timeline, broad roleplaying paths, and consequential events.
- The Sims demonstrates how needs, traits, relationships, and interactions can produce emergent situations when systems influence one another.
- Choice-led narrative games demonstrate the value of concise dilemmas, readable options, and immediate feedback.

Do not copy competitor content, event writing, assets, branding, monetization, or distinctive UI. Our direction combines a readable yearly life story with modular domain systems, persistent consequences, age-aware progression, and a complete life arc. See [`GAMEPLAY_LOOP.md`](GAMEPLAY_LOOP.md) for the canonical loop and staged implementation plan.

## Platform and non-goals
Primary platform is Android. Initial mode is single-player. GitHub Actions produces test APKs; GitHub Pages hosts the web client. Desktop browser support is useful for testing.
Not initial goals: 3D worlds, real-time character movement, multiplayer, social feeds, mandatory accounts/backend/AI, huge frameworks before a playable loop, early monetization decisions, or copying competitor assets/content/branding.


## Domain-native experiences
Every major life system must have a distinct, self-contained experience. A parent area groups related systems; it must not become a dumping ground for unrelated panels. Finance contains Banking, Business, Property, Investments, and Taxes, in that order. Banking internally groups accounts, cards, loans, savings and vault. Life contains a Lifestyle experience with Discover (provider subscriptions and everyday shopping), My services (purchased subscriptions, recurring commitments and payment methods in use), and Home (household arrangement and estimated living costs). Do not expose Bills & Subscriptions or Living Costs as separate Finance destinations. Card controls and credit balances remain exclusively in Banking; Lifestyle may reference cards as payment methods. Education and work are separate life destinations, not summaries embedded in Finance. Each system owns its vocabulary, actions, navigation, contextual feedback, and visual identity while sharing the same character and simulation state.

## School, Work, and personal activities
Education, Work, Life, and Finance are distinct top-level workspaces. Education owns programme discovery, enrollment, weekly study/assignment/exam actions, automatic attendance/progression, grades, tuition, and qualification history. Work owns job discovery, applications, interviews, offers, employment, extra earnings, career development, and promotion offers. Life owns wellbeing, Lifestyle, Family, the decision-based Life tree, and Life History. Personal activities remain inside their owning domain rather than becoming a separate top-level destination. All workspaces share the same character, weekly simulation, automatic background responsibilities, and event history without mixing domain-specific controls.


Personal Technology is a planned part of everyday life: smartphones, laptops, and desktop PCs may support communication, education, work, creativity, and entertainment. Devices should create meaningful purchase, maintenance, and upgrade decisions while remaining optional assets rather than mandatory gates. Do not present device ownership or management as implemented until the corresponding persisted model, gameplay actions, and UI exist.

## Family as a persistent life system

Family is a simulation-owned network of people and relationships across the character's life. It must support varied family structures and optional life paths without assuming marriage, parenthood, or guaranteed support. Family decisions should create meaningful consequences in wellbeing, education, work, time, and finances through explicit cross-domain contracts. The UI is only the domain-native interface to this state. See [FAMILY_SYSTEM.md](FAMILY_SYSTEM.md).



## UI refinement direction · November 2026
- Overview activity history groups actions by simulation week in compact expandable groups; the current week is expanded by default.
- Attributes and progress meters use shared semantic colors for stable, caution, danger, and severe bands. Inverse metrics such as stress reverse the scale, and numeric/status cues remain visible.
- Work navigation is Jobs, Extra Earnings, Career Path, and Career History. Applications and their statuses live within Jobs; extra shifts/casual work live on their own subpage.
- Finance Overview removes navigation shortcuts and reports actual portfolio value/holdings, business value/performance, debt, cash, and net worth. Finance navigation order is Banking, Business, Property, Investments, Taxes.
- Banking sorts owned accounts and cards consistently ahead of available products. Cards use a concise owned-card register followed by the available card catalogue, without a generic payment-methods section. Active loans are a compact list; new applications use a dialog with visible eligibility criteria and specific rejection reasons.
- Banking uses a contextual 300–850 credit score: detailed factors are collapsed by default on Loans; Cards may show only the score needed to explain eligibility; Accounts do not repeat a credit dashboard. The breakdown includes payment record, rejected applications, utilization, debt-to-income context, and loan-rate tiers. Credit score is a gameplay system: responsible repayments and manageable balances help; missed installments, high utilization, excessive debt, and unpaid taxes hurt. Loan pricing and eligibility use the same score calculation; do not create a separate UI-only score.
