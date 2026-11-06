# Product Vision

**Canonical product direction · Reviewed 2026-11-05**

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

## Platform and non-goals
Primary platform is Android. Initial mode is single-player. GitHub Actions produces test APKs; GitHub Pages hosts the web client. Desktop browser support is useful for testing.
Not initial goals: 3D worlds, real-time character movement, multiplayer, social feeds, mandatory accounts/backend/AI, huge frameworks before a playable loop, early monetization decisions, or copying competitor assets/content/branding.


## Domain-native experiences
Every major life system must have a distinct, self-contained experience. A parent area groups related systems; it must not become a dumping ground for unrelated panels. Finance is one destination containing dedicated Banking, Cards, Loans, Bills & Subscriptions, Savings & Vault, Property, Investments, Business, and Living Costs experiences. Education and work are separate life destinations, not summaries embedded in Finance. Each system owns its vocabulary, actions, navigation, contextual feedback, and visual identity while sharing the same character and simulation state.
