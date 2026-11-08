# Visual Design System

**Canonical visual direction · Reviewed 2026-11-08**

## Product feel
A modern, polished, mobile-first life simulation interface. It should feel like a premium interactive game with the clarity of a well-designed personal app—not a corporate admin tool, spreadsheet, retro text adventure, or 3D lobby.

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
- Keep the established responsive navigation and domain-native destinations; do not invent a second navigation model in a redesign.
- The shared game header carries current-life identity/status and compact calendar context. It shows the month and four week-position indicators, highlighting the current week. Keep the header compact on phones.
- Do not add a global new-life (+) action to the persistent header. Character creation belongs in the appropriate entry flow.
- Avoid a second page-context header below the global header. Screens may retain a proper local title/context where the information architecture requires it, but do not duplicate life identity, date, cash, or age.
- Routine actions remain inside their owning domain. Do not route players through a generic planner to choose dates or periods.

## Dashboard priorities
Overview is the landing surface for the current life, not a duplicate of every domain. Show the shared life context once in the global header and keep Overview focused on useful current-week information and the complete activity feed. Group activities into expandable week sections, newest first, with the current week expanded by default. Keep major achievements and life-stage milestones in Life History; do not duplicate every routine activity there. Keep study controls in School, job-search/workplace details in Work, personal stats and activities in Life, and financial products in Finance. Before adding any summary or shortcut, inspect navigation and destination screens for duplicates. Never fabricate financial metrics or imply unimplemented mechanics.

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
- Character creation uses the implemented curated starting-life-stage choices and generates a coherent identity and starting state.
- Do not document an arbitrary age slider or manual stat editor unless that interaction is implemented.
- Show the selected starting stage and explain that choosing a stage does not imply that every life-stage system is already simulated.
- Settings provide accessible management for three local save slots, including load, create in an empty slot, and delete with confirmation. The gameplay snapshot export must work through the native Android clipboard bridge and supported browser clipboard fallback.
- Sound effects are optional, subtle, generated locally, and independently switchable. Do not autoplay background music.
- Clearly explain that local saves are tied to the current app/browser storage and are not cloud-backed.

## Component and layout engineering

The detailed implementation rules live in `.github/skills/ui-engineering/SKILL.md` and are mandatory for every UI change. The current interface is Svelte 5 with shared global CSS, not a pre-existing component framework. Reuse the established semantic class patterns and existing components before introducing new abstractions. Keep shared layout, spacing, control sizing, and responsive behavior consistent across screens.

A UI change is not complete merely because it compiles. Verify alignment, spacing, clipping, overflow, safe areas, and touch targets at representative phone and desktop widths. If visual preview is unavailable, state that visual verification remains outstanding rather than claiming the screen was checked.

- Workspace page titles share one visual scale regardless of heading tag; section headings remain subordinate and use the same index/title alignment.
- Section hints stay beside headings when space allows and move below the heading on narrow screens instead of clipping or squeezing the title.
- Use the shared `EmptyState` component for empty collections so title, optional detail, surface, border, padding, and typography remain consistent. Keep empty-state copy factual and short.
- Settings action buttons use the same secondary/danger control sizing; do not mix compact and full-size variants within one action list.
- The title menu must fit its natural content height on phone screens. Allow scrolling only when the user expands content or the viewport is genuinely too short; do not force a fixed viewport-height minimum that hides the footer.

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
- Finance has focused destinations for Banking, Taxes, Property, Investments, and Business. Banking has its own compact internal navigation for Accounts, Cards, Loans, and Savings & vault. Do not expose Cards, Loans, Bills & subscriptions, Savings & vault, or Living costs as Finance menu destinations.
- Banking uses account cards, available balances, account details, transfers, deposits/withdrawals, and a transaction activity list. Cards, loan balances/repayments, automatic savings deposits, and the personal vault are managed inside Banking. Household budgets and living-arrangement choices are not shown on the Banking screen. Tax assessments and liabilities belong in the separate Taxes view.
- Life → Lifestyle has focused internal sections: Discover, My services, and Home. Discover feels like a real marketplace with provider plan listings, clear annual prices, payment selection, and a supermarket basket/checkout. My services is the player's personal service register: active subscriptions, annual commitments, recurring charges, and a read-only reference to payment cards in use. Card controls must link back to Banking rather than being duplicated. Home contains household arrangement and estimated living costs. Do not put a generic recurring-payment creation form in Finance or duplicate subscriptions across screens.
- Cards should use payment-card terminology and card controls within Banking; Loans should emphasize principal, rate, term, repayment and credit standing within Banking; Investments should present a portfolio/market context; Property should feel like housing/property management; Business should focus on operations and business performance.
- School owns the current learning/study experience; enrollment, attendance, classes, grades, and fees remain planned until their full simulation loop exists. Work owns the implemented recruitment/job-search and employment/career flows. These systems must not be represented as generic status cards inside Finance.
- Keep the shared AMOLED theme, typography, spacing, accessibility and navigation shell consistent. Domain identity comes from relevant information architecture, terminology, actions and contextual layouts—not arbitrary unrelated colors or decorative imitation.
- Use progressive disclosure within each domain. Do not show controls from unrelated domains or repeat the same summary and action on multiple screens.

## Theme system and reusable UI foundation
- AMOLED remains the default regardless of operating-system appearance. Player-selected themes are explicit and locally persisted: AMOLED, Midnight, Graphite, and Paper.
- Theme preference is presentation-only, stored alongside local app preferences and never inside a character save. It must not change gameplay state or require a save migration.
- Theme selection is available in Settings → Appearance, updates immediately, and survives app restarts. Missing or invalid preferences fall back to AMOLED.
- Shared UI primitives live in `web/src/components/`; theme metadata and local preference handling live in `web/src/lib/theme.ts` and `web/src/lib/storage.ts`.
- Shared tokens and theme palettes are defined in `web/src/styles/`. Domain-specific components remain in their owning workspaces and consume shared primitives/tokens where appropriate.
- Build new UI from existing primitives before introducing one-off markup or CSS. Add variants only for genuinely shared behavior; do not flatten domain-native experiences into generic cards.
- All existing screen and workspace styles are migrated to semantic theme tokens; new and revised UI must use shared tokens rather than hard-coded palette colors. Theme coverage includes navigation, forms, dialogs, activity states, financial displays, and overlays. Maintain accessible contrast and visible focus in every palette.

## Game-first copy
- Write UI copy as the game world speaks. Prefer short, natural labels used by a school, bank, workplace, home, clinic, or other in-world system; avoid generic AI-style phrases such as "Manage your...", "Current ...", "Your journey", "Overview of..." and repeated explanatory subtitles.
- Use one navigation label or one screen title to establish context, not both. Remove repeated parent/child headings, eyebrow labels, subtitles, and explanatory paragraphs when the active navigation already identifies the screen.
- Replace removed copy with compact, real game data when available: balances, rates, grade, attendance, progress, salary, requirements, capacity, dates, and status. Never invent a metric; omit it when the simulation does not track it.
- Use short action labels that describe the in-world action ("Enroll", "Apply", "Book", "Transfer", "Rest"), not UI instructions ("Click here to manage...").
- Prefer meaningful in-world names over invented dramatic names. Do not add flavor text that obscures what a system does.
