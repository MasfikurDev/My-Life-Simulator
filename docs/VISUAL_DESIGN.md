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

## Navigation model
- Desktop: compact left-side navigation with a persistent character identity.
- Phones: fixed bottom navigation with safe-area padding and clearly labeled destinations.
- Likely destinations: Home (character, age, situation, stats, recent events); Activities (education, work, hobbies, exercise, entertainment); People (family, friends, romance); Finances (income, expenses, job, savings, debt, assets); Character (attributes, appearance, personality, skills, health, history).
- A contextual action area keeps common actions close. Avoid deep navigation for routine choices.

## Dashboard priorities
At a glance: who the character is and their age; current situation; relevant wellbeing/financial indicators; recent events; meaningful available actions; how/when time advances. Do not overwhelm the dashboard with every statistic.

## Compactness and usability are mandatory requirements

Every screen must use space deliberately and make common actions easy to reach. Compact does not mean cramped or tiny.

- Prefer concise headings, short supporting copy, compact cards, and useful information grouped together.
- Show the most decision-relevant information first; avoid oversized decorative hero areas and empty spacing that pushes gameplay below the fold.
- Keep related information visible together where practical. Use responsive grids on wider screens and efficient two-column layouts on phones when content remains readable.
- Keep frequent actions close to the information they affect; avoid unnecessary navigation depth and duplicate action placements.
- Navigation must remain obvious, reachable, and usable on small screens. Labels may be concise, but destinations must remain understandable.
- Preserve readable typography, sufficient contrast, clear grouping, and comfortable touch targets (aim for at least 44 CSS px for primary interactive controls).
- Do not solve density by hiding important information, shrinking text excessively, removing labels, or making controls difficult to tap.
- Use progressive disclosure for secondary detail rather than filling the first view with every available statistic.
- Test narrow phone widths, typical Android viewport sizes, and desktop layouts; account for bottom navigation, floating actions, and system safe areas.
- Every new screen or component must justify its vertical space and provide a clear user task or useful information.

## Content and accessibility
Use natural, concise, context-aware language. Communicate costs, risks, eligibility, and known consequences. Do not imply certainty for probabilistic outcomes. Use semantic controls, keyboard support, visible focus, accessible names, readable scaling, and never rely on color alone.
