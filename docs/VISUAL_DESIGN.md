# Visual Design System

**Canonical visual direction · Reviewed 2026-11-15**

## Product feel
A modern, polished, mobile-first life simulation interface. It should feel like a premium interactive game with the clarity of a well-designed personal app—not a corporate admin tool, spreadsheet, retro text adventure, or 3D lobby.

## Theme direction
- AMOLED-first dark theme is the default on every device, independent of operating-system theme preference.
- Use true black (#000) for the app canvas to take advantage of OLED pixels; use near-black charcoal surfaces for cards and navigation so hierarchy remains visible.
- Use restrained emerald as the primary action and selection accent. Reserve muted blue, amber, and coral for distinct stat/event categories.
- Offer 17 distinct selectable palettes: AMOLED, Midnight, Graphite, Paper, Ocean, Forest, Lavender, Sunset, Rose, Techno, Aurora, Cyberpunk, Obsidian, Abyss, Verdant, Crimson, and Solstice. Keep each palette coherent across every workspace, control, overlay, and status state; theme changes are presentation-only and must not alter simulation or save data.
- Maintain readable contrast, clear borders, and visible keyboard/touch focus.
- Use system font stacks; do not fetch remote fonts at runtime.
- AMOLED remains the default. Players can explicitly select any of the 17 supported themes in Settings → Appearance; the preference is local, applies immediately, and does not alter character saves.

## Visual language
- 2D cards, buttons, clear sections, concise labels, readable summaries.
- Strong typographic hierarchy, deliberate spacing, compact but breathable information density.
- Near-black layered surfaces, subtle borders, restrained shadows, and low-noise gradients.
- Consistent iconography; icons support labels.
- Purposeful transitions and interaction feedback; respect reduced-motion.
- Charts only when they communicate useful trends.
- Semantic design tokens, not scattered hard-coded colors.
- Cyberpunk uses electric cyan as the primary action and focus color, magenta as a secondary decorative accent, and a softer distinct red only for danger/destructive states. Keep the neon grid low-contrast so text and controls remain dominant.
- Responsive layouts: narrow Android screens first, desktop browser usable.
- Comfortable touch targets; no hover-only interactions.
- Avoid decorative scenery that competes with the character, current situation, and decisions.

## Theme-specific animated life-event headers
- Aurora is an optional, selectable full-interface theme; it must never replace the AMOLED default or alter gameplay and save data.
- Apply its atmospheric violet surfaces, mint highlights, subtle gradients, and restrained interactive accents consistently across navigation, cards, buttons, and overlays.
- Every theme uses the shared animated category-specific life-event header when a decision is pending. Theme-specific gradients, patterns, and motion keep the header consistent in structure while giving each palette a distinct atmosphere.
- Keep title, age/category context, and event description stable and readable while decorative layers animate independently.
- Use lightweight CSS/SVG patterns (soft moving gradients, orbs, linework, rings, and restrained particles); avoid remote assets, canvas effects, and animation that competes with choices.
- Preserve the shared card structure across categories; vary only semantic color treatment and decorative pattern. Respect `prefers-reduced-motion` and maintain contrast.

## Navigation model
- Keep the established responsive navigation and domain-native destinations; do not invent a second navigation model in a redesign.
- The shared game header carries current-life identity/status and compact calendar context. It shows the month and four week-position indicators, highlighting the current week. Keep the header compact on phones.
- Do not add a global new-life (+) action to the persistent header. Character creation belongs in the appropriate entry flow.
- Avoid a second page-context header below the global header. Screens may retain a proper local title/context where the information architecture requires it, but do not duplicate life identity, date, cash, or age.
- Routine actions remain inside their owning domain. Do not route players through a generic planner to choose dates or periods.

## Dashboard priorities
Overview is the landing surface for the current life, not a duplicate of every domain. Show the shared life context once in the global header and keep Overview focused on useful current-week information and the complete activity feed. Group activities into expandable week sections, newest first, with the current week expanded by default. Keep major achievements and life-stage milestones in Life History; do not duplicate every routine activity there. Keep study controls in School, job-search/workplace details in Work, personal stats and activities in Life, and financial products in Finance. Before adding any summary or shortcut, inspect navigation and destination screens for duplicates. Never fabricate financial metrics or imply unimplemented mechanics.

- Use Title Case for all semantic page, section, card, dialog and modal headings. Keep descriptions and explanatory copy in sentence case; uppercase eyebrow labels remain a separate visual treatment.

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


## Shared component consistency

The reusable component contract is defined in [UI Framework](UI_FRAMEWORK.md). Apply its remaining pattern coverage—navigation, menus/popovers, list rows, loading, selection, timelines, stat tiles, and notification indicators—without forcing every domain into the same layout. These are reusable behavior/presentation patterns, not an instruction to create a separate component for every visual element.

Across all themes, maintain a consistent typography hierarchy, spacing/density scale, surface/elevation language, interaction-state vocabulary, and motion timing. Keep semantic meaning consistent while adapting palette treatment and contrast to each theme. Selection, status, and alerts must remain understandable without color alone. Motion is state-driven, restrained, and disabled or simplified under `prefers-reduced-motion`.

Prioritize migration by repeated use and player impact: navigation/selection, transaction and record rows, stat presentation, and loading feedback. Add other patterns only where the current UI demonstrates a real repeated need. Preserve domain-native information hierarchy and avoid mass redesign or decorative repetition.

## Component and layout engineering

The detailed implementation rules live in `.github/skills/ui-engineering/SKILL.md` and are mandatory for every UI change. The current interface is Svelte 5 with shared global CSS and an in-repository design system. Sass/SCSS is the authoring preprocessor for migrated shared component styles; existing global CSS remains valid and is migrated incrementally. Reuse the established semantic class patterns and existing components before introducing new abstractions. Keep shared layout, spacing, control sizing, and responsive behavior consistent across screens.

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
- Finance has focused destinations in this order: Banking, Business, Property, Investments, and Taxes. Banking has its own compact internal navigation for Accounts, Cards, Loans, and Savings & vault. Do not expose Cards, Loans, Bills & subscriptions, Savings & vault, or Living costs as Finance menu destinations.
- Banking uses account cards, available balances, account details, transfers, deposits/withdrawals, and a transaction activity list. Cards, loan balances/repayments, automatic savings deposits, and the personal vault are managed inside Banking. Household budgets and living-arrangement choices are not shown on the Banking screen. Tax assessments and liabilities belong in the separate Taxes view.
- Life → Lifestyle has focused internal sections: Supermarket, Subscriptions, and Owned, alongside Overview, Relationships, Family tree, and Life story. The Relationships view manages relatives and the wider social circle. Supermarket should feel like a practical shop with food, restaurant/delivery meals, fashion, and durable goods; show compact product listings, price, and clear checkout/payment selection. Buying food stocks Owned inventory; the player reserves edible items from Owned for the weekly review. Use a compact quantity stepper with minus/plus controls. Do not combine buying and weekly planning in the checkout. Subscriptions is the active service register with annual commitments, modest service-specific gameplay benefits, connectivity requirements for devices, and cancellation. Owned shows durable goods and clothing condition/style details. Relationships includes a compact social-circle and household-support editor; do not duplicate the family tree or add a generic dashboard. Housing remains in Finance → Property, not a separate Home tab. Weekly Review separates greyed-out automatic passive entries from removable planned activities.
- Cards should use payment-card terminology and card controls within Banking; Loans should emphasize principal, rate, term, repayment and credit standing within Banking; Investments should present a portfolio/market context; Property should feel like housing/property management; Business should focus on operations and business performance.
- Education owns programme discovery, enrollment, weekly study/assignment/exam tasks, automatic attendance/progression, grades, tuition, qualification history. Education and Educational Records are separate subpages; do not expose a Pause Program action. Work owns job discovery, applications, interviews, offers, employment changes, extra earnings, career development, and promotion offers. Persistent employer operations, broader workplace decisions, benefits, bonuses, and monthly payroll remain planned. Neither domain belongs inside Finance.
- Keep the shared AMOLED theme, typography, spacing, accessibility and navigation shell consistent. Domain identity comes from relevant information architecture, terminology, actions and contextual layouts—not arbitrary unrelated colors or decorative imitation.
- Use progressive disclosure within each domain. Do not show controls from unrelated domains or repeat the same summary and action on multiple screens.

## Theme system and reusable UI foundation
- AMOLED remains the default regardless of operating-system appearance. Player-selected themes are explicit and locally persisted: AMOLED, Midnight, Graphite, Paper, Ocean, Forest, Lavender, Sunset, Rose, Techno, Aurora, Cyberpunk, Obsidian, Abyss, Verdant, Crimson, and Solstice.
- Theme preference is presentation-only, stored alongside local app preferences and never inside a character save. It must not change gameplay state or require a save migration. Aurora is an optional visual variant; AMOLED remains the default.
- Theme selection is available in Settings → Appearance, updates immediately, and survives app restarts. Missing or invalid preferences fall back to AMOLED.
- Shared UI primitives live in `web/src/components/`; theme metadata and local preference handling live in `web/src/lib/theme.ts` and `web/src/lib/storage.ts`.
- Shared tokens and theme palettes are defined in `web/src/styles/`. Domain-specific components remain in their owning workspaces and consume shared primitives/tokens where appropriate.
- Build new UI from existing primitives before introducing one-off markup or CSS. Add variants only for genuinely shared behavior; do not flatten domain-native experiences into generic cards.
- Techno uses deep navy-black surfaces, neon cyan/electric-blue accents, and restrained glow on selected and primary interactive states. Glow must not reduce text clarity or create visual clutter.
- Aurora uses atmospheric violet surfaces, mint highlights, soft gradients, and animated category-specific life-event headers. Animation is decorative, lightweight, and disabled under `prefers-reduced-motion`.
- All existing screen and workspace styles are migrated to semantic theme tokens; new and revised UI must use shared tokens rather than hard-coded palette colors. Theme coverage includes navigation, forms, dialogs, activity states, financial displays, and overlays. Maintain accessible contrast and visible focus in every palette.

## Game-first copy
- Write UI copy as the game world speaks. Prefer short, natural labels used by a school, bank, workplace, home, clinic, or other in-world system; avoid generic AI-style phrases such as "Manage your...", "Current ...", "Your journey", "Overview of..." and repeated explanatory subtitles.
- Use one navigation label or one screen title to establish context, not both. Remove repeated parent/child headings, eyebrow labels, subtitles, and explanatory paragraphs when the active navigation already identifies the screen.
- Replace removed copy with compact, real game data when available: balances, rates, grade, attendance, progress, salary, requirements, capacity, dates, and status. Never invent a metric; omit it when the simulation does not track it.
- Use short action labels that describe the in-world action ("Enroll", "Apply", "Book", "Transfer", "Rest"), not UI instructions ("Click here to manage...").
- Prefer meaningful in-world names over invented dramatic names. Do not add flavor text that obscures what a system does.


## Recent visual QA refinements
- The title menu uses shrink-safe responsive tracks and natural mobile content height. Verify it at narrow Android widths before considering the menu layout complete.
- Paper controls use dark semantic text on light secondary surfaces and a light danger-soft surface for destructive actions. Recheck contrast for every new button variant added to the light theme.
- Profile presents core attributes first and secondary attributes through disclosure. Relationship cards prioritize closeness and disclose trust/tension separately without removing access to either metric.
- Supermarket category navigation is a horizontally scrollable, keyboard-focusable rail with 44px minimum touch targets and a programmatically exposed selected state.
- Avoid repeated subscription counts and maintain semantic heading order in the Life Story and Profile screens.


## Pattern and surface hierarchy (2026-11-15)
- Decorative patterns are not a universal card background. Most product, relationship, settings, profile, and information cards use quiet surfaces with theme-specific tint, shape, border, and elevation.
- Animated or high-contrast patterns are reserved for focal surfaces such as the hero, weekly finance feature, money focus, and major life-event panel. Do not apply the same pattern to every card in a workspace.
- Each theme has a distinct visual vocabulary (geometry, texture, light behavior, and motion), not merely a different accent color. Within a theme, vary emphasis by component role; do not duplicate the focal pattern across adjacent cards.
- Theme motion must remain low-contrast, lightweight, and disabled by prefers-reduced-motion. Text, prices, controls, and focus indicators always take precedence over decoration.
- Theme selection previews should communicate surface and geometry differences as well as accent color. Preserve all 17 themes and their existing palette identities.
- Mobile gameplay uses a single page-level scroll container below the persistent header. The bottom navigation and Advance action remain fixed, and the content scroll region reserves enough space for both so the final cards and controls are reachable.


## Game-feel interaction polish (2026-11-17)
- Improve the feel of the existing interface through tactile press feedback, clearer selected states, responsive card lift, soft focus-surface entrance motion, and a restrained pulse around the persistent Advance action.
- Keep motion attached to existing gameplay surfaces and controls; do not introduce a new navigation model, oversized animated hero sections, or a separate visual framework.
- Use motion to communicate hierarchy and state: selected event choices should read as selected, progress changes should feel continuous, and focal finance/event panels may enter with a short transition.
- Keep ambient motion subtle and avoid making every card glow or animate continuously. Hover-only treatments are supplemental; touch feedback and keyboard focus remain first-class.
- Respect `prefers-reduced-motion` by removing entrance, pulse, and transition effects while preserving all state and interaction cues.
- Continue to preserve compact layouts, 44px primary touch targets, theme-specific palette identity, readable content, and stable mobile navigation/safe areas.


## Event presentation and shared controls (2026-11-17)
- Pending life events use the animated category header in every theme, not Aurora alone. Keep the title, age, category, description, and decision choices consistent while theme-specific gradients and patterns provide distinct atmosphere.
- Event choices communicate selected/planned state with a clear marker and accent rail. Stamina and money costs are compact chips; disabled affordability states remain visible and understandable.
- Shared UiButton uses semantic primary, secondary, quiet, and danger variants with tactile press feedback, focus visibility, theme-aware geometry, and reduced-motion support.
- Shared UiCard uses the theme's panel radius, wash, and shadow tokens. Interactive cards gain restrained lift on hover-capable devices and retain a visible focus-within state.
- Preserve compact mobile layouts and avoid repeating one generic pattern across every card. Keep decorative motion confined to focal event surfaces and honor reduced-motion preferences.


## Touch-first gameplay surfaces and Android safe areas (2026-11-17)
- Apply visible, restrained ambient motion to the ordinary Overview and Profile screens, not only pending life-event dialogs. Prioritize the character identity/cash panel, weekly finance tiles, current-situation cards, activity feed, profile character panel, and attribute indicators.
- Motion must be perceptible on touch devices without hover: use short press feedback, lightweight ambient pattern drift, metric highlights, and progress-ring entrance treatment. Hover remains optional enhancement only.
- Give themes different pattern languages on focal surfaces; do not simply recolor one repeated texture. Keep decorative layers behind readable content and prevent them from intercepting taps.
- Keep the interface compact and preserve existing information architecture, data, and gameplay behavior. Do not add extra dashboard sections merely to create visual activity.
- Respect `prefers-reduced-motion` for every new animation.
- Android system-bar and safe-area backgrounds must use the intended dark app surface. Remove temporary debug colors from both the decor view and root container before shipping.


## Reusable UI framework (2026-11-17)
- Use the in-repository Svelte UI framework documented in docs/UI_FRAMEWORK.md; do not add a third-party styling framework for routine UI work.
- Shared semantic tokens define theme colors, spacing, radii, surfaces, control sizes, focus, and motion. Component styles consume tokens rather than hard-coded page palettes.
- Build screens from customizable primitives (card, button, stack, grid) and domain components. Reuse the foundation without flattening distinct domain experiences into identical cards.
- Cards are content-sized by default. Use explicit compact/comfortable/spacious density; compact is the default for metadata and profile detail grids. Never impose fixed heights on text-bearing cards without a content-driven reason.
- Decoration and animation are opt-in, theme-aware, and focal. Nested informational cards should remain quiet unless they carry an independent interaction or hierarchy.


## Semantic badges (2026-11-19)
- Use the shared `UiBadge` primitive for compact status and metadata labels instead of one-off pill CSS.
- Keep meaning stable across all 17 themes: success, informational, special/featured, warning, risk, danger, and neutral. Theme palettes adjust the treatment while preserving readable semantic contrast.
- Prefer subtle tinted surfaces and thin semantic borders. Status must remain understandable from its text; never rely on color alone.
- Badges are static by default. Use an entrance animation only when a meaningful status is newly introduced; do not pulse or continuously animate routine labels. Respect `prefers-reduced-motion`.
- Keep profile metadata tags neutral. Reserve stronger tones for states that communicate a meaningful outcome, eligibility, risk, or change.


## Dimensional surface direction (2026-11-19)

The interface should feel layered and tactile without becoming a generic neon dashboard. Theme identity comes from the combined behavior of surface tint, edge light, shadow character, and restrained accent treatment—not accent color alone.

- Use the shared elevation ladder: resting surfaces at level 1, raised cards at level 2, floating overlays at level 3, and accent elevation only for a small number of focal/selected surfaces.
- Keep the page canvas visually distinct from standard cards; standard cards distinct from nested raised content; and dialogs/menus clearly above the page.
- Use a subtle top-edge highlight and tonal gradient to make card planes legible. Do not outline every nested container or add shadows to every element.
- Preserve each theme's existing palette identity. Dark themes derive shadow depth from their own shadow color; Paper uses soft neutral ambient shadows and light top-edge highlights. Techno/Cyberpunk may use restrained accent light; other themes must not inherit neon glow by default.
- Keep content hierarchy and compact density unchanged. Elevation must not add vertical spacing or fixed card heights.
- Interactive cards gain a small lift on hover-capable devices and a short press response on touch. Keyboard focus remains explicit. All motion respects `prefers-reduced-motion`.
- The default card treatment remains restrained. Choose raised/floating/glow only when the screen hierarchy benefits; never apply the strongest treatment to every card.
