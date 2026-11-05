# Visual Design System

**Canonical visual direction · Updated 2026-11-06**

## Product feel
A modern, polished, calm, business-like life-management interface. It should feel like a premium personal dashboard for understanding and managing a life simulation—not a corporate admin tool, spreadsheet, retro text adventure, or 3D lobby.

## Theme direction
- AMOLED-first dark theme is the default on every device, independent of operating-system theme preference.
- Use true black (#000) for the app canvas to take advantage of OLED pixels; use near-black charcoal surfaces for cards and navigation so hierarchy remains visible.
- Use restrained emerald as the primary action and selection accent. Reserve muted blue, amber, and coral for distinct stat/event categories.
- Maintain readable contrast, clear borders, and visible keyboard/touch focus.
- Use system font stacks; do not fetch remote fonts at runtime.
- No automatic light/dark switching until the user explicitly requests a theme setting.

## Visual language
- 2D cards, buttons, clear sections, concise labels, readable summaries.
- Strong typographic hierarchy, deliberate spacing, compact but breathable information density.
- Near-black layered surfaces, subtle borders, restrained shadows, and low-noise gradients.
- Consistent iconography; icons support labels.
- Purposeful transitions and interaction feedback; respect reduced-motion.
- Charts only when they communicate useful trends.
- Semantic design tokens, not scattered hard-coded colors.
- Responsive layouts: narrow Android screens first, desktop browser usable.
- Comfortable touch targets; no hover-only interactions.
- Avoid decorative scenery that competes with the character, current situation, and decisions.

## Android launcher identity
- The launcher icon represents a life journey: a person looking toward new opportunities, a rising path, and a small financial symbol.
- Use a native Android vector drawable and adaptive-icon resource so the icon remains crisp at every launcher density and supports Android icon masks.
- Keep the launcher artwork independent from the in-game dark theme; do not fetch icon assets remotely.

## Navigation model
- Desktop: compact left-side navigation with a persistent character identity.
- Phones: fixed bottom navigation with safe-area padding and clearly labeled destinations.
- Likely destinations: Home (character, age, situation, stats, recent events); Activities (education, work, hobbies, exercise, entertainment); People (family, friends, romance); Finances (income, expenses, job, savings, debt, assets); Character (attributes, appearance, personality, skills, health, history).
- A contextual action area keeps common actions close. Avoid deep navigation for routine choices.

## Dashboard priorities
Money is the primary dashboard focus. Put the current balance and useful financial context near the top, followed by practical money-related choices and activities that change the balance. The Finances destination may show implemented annual pay, estimated living costs, employment, and education progression; clearly label simplified assumptions and never imply unimplemented debt, tax, benefits, assets, or household budgets. Life stats (health, happiness, intelligence, fitness, and future attributes) are secondary: keep them compact and easy to scan without letting them compete with the financial summary. Preserve access to meaningful activities, current situation, recent events, and deliberate time advancement. Never fabricate financial metrics.

## Compactness and usability are mandatory requirements

Every screen must use space deliberately and make common actions easy to reach. Compact does not mean cramped or tiny.

- Prefer concise headings, short supporting copy, compact cards, and useful information grouped together.
- Show the most decision-relevant information first; avoid oversized decorative hero areas and empty spacing that pushes gameplay below the fold.
- Keep related information visible together where practical. Use responsive grids on wider screens and efficient two-column layouts on phones when content remains readable.
- Keep frequent actions close to the information they affect; avoid unnecessary navigation depth and duplicate action placements.
- Navigation must remain obvious, reachable, and usable on small screens. Labels may be concise, but destinations must remain understandable.
- Progressive disclosure for secondary details; do not hide important information or shrink text excessively.
- Primary controls should aim for at least 44 CSS px touch targets.
- Test narrow phone widths, Android viewport behavior, safe areas, bottom navigation, and floating action collisions.
- Every screen/component must justify its vertical space and serve a clear task or information need.

## Character creation and game settings
- Character creation makes the starting point explicit, with quick choices from birth through later life plus an exact-age option.
- Show the selected age and life-stage context before starting. Do not imply that unimplemented childhood, career, or retirement systems are already simulated.
- Settings provide accessible management for three local save slots, including load, create in an empty slot, and delete with confirmation. The gameplay snapshot export must work through the native Android clipboard bridge and supported browser clipboard fallback.
- Sound effects are optional, subtle, generated locally, and independently switchable. Do not autoplay background music.
- Clearly explain that local saves are tied to the current app/browser storage and are not cloud-backed.
