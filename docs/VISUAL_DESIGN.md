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
Money is the primary dashboard focus. Put the current balance and useful financial context near the top, followed by practical money-related choices and activities that change the balance. The Finances destination may show implemented annual pay, estimated living costs, employment, and education progression; clearly label simplified assumptions and never imply unimplemented debt, tax, benefits, or assets. Household budget choices and emergency savings targets are available from age 18. Life stats (health, happiness, intelligence, fitness, and future attributes) are secondary: keep them compact and easy to scan without letting them compete with the financial summary. Preserve access to meaningful activities, current situation, recent events, and deliberate time advancement. Never fabricate financial metrics.

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

## Character creation and game settings
- Character creation makes the starting point explicit, with quick choices from birth through later life (0, 6, 13, 16, 18, 25, 40, and 60) plus an exact-age slider spanning 0–90.
- Show the selected age and life-stage context before starting. Do not imply that unimplemented childhood, career, or retirement systems are already simulated.
- Settings provide accessible management for three local save slots, including load, create in an empty slot, and delete with confirmation. The gameplay snapshot export must work through the native Android clipboard bridge and supported browser clipboard fallback.
- Sound effects are optional, subtle, generated locally, and independently switchable. Do not autoplay background music.
- Clearly explain that local saves are tied to the current app/browser storage and are not cloud-backed.

## Component and layout engineering

The detailed implementation rules live in `.github/skills/ui-engineering/SKILL.md` and are mandatory for every UI change. The current interface is Svelte 5 with shared global CSS, not a pre-existing component framework. Reuse the established semantic class patterns and existing components before introducing new abstractions. Keep shared layout, spacing, control sizing, and responsive behavior consistent across screens.

A UI change is not complete merely because it compiles. Verify alignment, spacing, clipping, overflow, safe areas, and touch targets at representative phone and desktop widths. If visual preview is unavailable, state that visual verification remains outstanding rather than claiming the screen was checked.

## Content and accessibility
Use concise, factual, context-aware language. Every message must communicate useful game state, an available action, a cost, eligibility, a consequence, or a clear limitation. Remove generic motivational slogans, inspirational filler, and decorative copy that does not help the player decide or understand. Use semantic controls, keyboard support, visible focus, accessible names, readable scaling, and never rely on color alone.

## Avoid duplicate functionality
Do not render multiple controls or components for the same action or destination on one screen. Before adding a shortcut, inspect the current screen and navigation for an existing equivalent. Keep one clear primary control; remove redundant summaries that repeat the same actions already available as interactive cards. Responsive navigation may provide alternate layouts for different viewport modes, but do not show redundant desktop controls alongside the same navigation destination.


## Native app logo and splash
- Use the original title artwork only as the Android launcher/app logo.
- Use the title-less life-progression artwork only as the centered Android launch splash image. Keep it visible until the WebView's first page finishes loading; then animate it upward and fade it away.
- Do not place either native artwork in the web welcome or character-creation screens. Preserve the original PNG files unchanged.


## Domain-native interface language
- A system must look and behave like the real-world environment it represents, simplified for play. Do not reuse one generic dashboard layout for every domain.
- Finance is a parent destination with its own internal navigation. Banking, cards, loans, taxes, recurring payments, savings/vault, property, investments, business, and living costs each open a focused view. Do not stack all finance modules into one long screen.
- Banking uses account cards, available balances, account details, transfers, deposits/withdrawals, and a transaction activity list. Household budgets and living-arrangement choices are not shown on the Banking screen. Tax assessments and liabilities belong in the separate Taxes view.
- Cards should use payment-card terminology and card controls; Loans should emphasize principal, rate, term, repayment and credit standing; Investments should present a portfolio/market context; Property should feel like housing/property management; Business should focus on operations and business performance.
- Education will use school/campus navigation, student records, classes, attendance, grades, fees and learning actions. Work will use recruitment/job-search flows and a distinct workplace view for an employed character. These systems must not be represented as generic status cards inside Finance.
- Keep the shared AMOLED theme, typography, spacing, accessibility and navigation shell consistent. Domain identity comes from relevant information architecture, terminology, actions and contextual layouts—not arbitrary unrelated colors or decorative imitation.
- Use progressive disclosure within each domain. Do not show controls from unrelated domains or repeat the same summary and action on multiple screens.
