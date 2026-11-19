# Reusable UI Framework

## Purpose
My Life Simulator uses a small, in-repository Svelte UI framework rather than hand-authored page CSS or a third-party component library. It is a design system and composition toolkit, not a requirement that every screen or card look alike.

## Layers and ownership
1. Semantic theme tokens in web/src/styles/tokens.scss and themes.scss define palette, surfaces, typography colors, spacing, radii, controls, focus, and theme identity.
2. Framework primitives in web/src/components own reusable presentation and expose deliberate customization.
3. Domain components combine primitives while retaining domain-specific information hierarchy and behavior.
4. Pages and workspaces arrange domain components. Page CSS describes exceptional composition, not repeated card, button, spacing, or theme behavior.

## Customization contract
- Cards expose semantic surface, tone, density, radius, elevation, and interaction. Content determines height; text-bearing cards must not get fixed heights by default.
- Buttons expose semantic variant, size, width, and shape. Primary actions retain comfortable touch targets.
- `UiBadge` exposes semantic tones (`accent`, `success`, `info`, `special`, `warning`, `risk`, `danger`, `neutral`) and compact sizes. Theme tokens control its colors; optional dots and entrance motion are opt-in. Use labels as well as color, and keep routine badges static.
- Stack and Grid expose direction/columns, alignment, wrapping, and gap so layout changes are configuration, not one-off CSS.
- Components may accept a class for exceptional composition, but class overrides must not become the normal styling API.
- Variants represent meaningful design decisions, not every possible CSS property. Use CSS custom properties for continuous values such as gap and custom layout dimensions.
- Theme palettes change semantic tokens; component variants remain stable across themes.
- Decoration and motion are opt-in and reserved for focal surfaces. Do not apply one animated texture indiscriminately to every nested card.
- Prefer composition over giant components with dozens of boolean flags. Add a domain component when a repeated pattern has domain meaning.

## Compactness and accessibility
- Use content-driven height. Avoid fixed/minimum heights on text-bearing cards unless interaction or content requires them.
- Density is explicit: compact for metadata/detail grids, comfortable for normal content, spacious only for focal content.
- Preserve 44px minimum touch targets for primary controls, readable text, focus states, keyboard behavior, and reduced-motion support.
- Layout primitives own placement; cards and buttons own internal presentation.
- Test narrow phones and desktop widths; verify wrapping, overflow, bottom navigation, floating actions, and safe areas.

## Migration strategy
- Establish tokens and primitives first.
- Migrate high-reuse patterns in small slices, beginning with shared primitives and Profile details, then common workspace sections.
- Remove obsolete page-level overrides only after all consumers use the shared primitive.
- Keep gameplay logic and save formats unchanged. All application-authored stylesheets and Svelte component style blocks are now SCSS.
- Every migration should remove duplicated CSS or reduce page-specific styling rather than add another layer of overrides.


## Remaining shared interaction patterns

These are coverage areas for the shared system, not a mandate to create a component for every item. First inspect existing components and domain patterns; extract a primitive only when the same behavior or presentation is genuinely reused.

- **Navigation:** bottom navigation, active tabs, and section indicators use shared theme tokens and a single clear active treatment. Preserve the established information architecture and responsive destinations; do not create parallel navigation systems.
- **Menus and popovers:** dropdowns, context menus, tooltips, and popovers share surface, border, shadow, focus, dismissal, and layering rules. Keep them anchored to their trigger, keyboard-operable, touch-usable, and within the viewport/safe area.
- **List rows:** reusable rows for transactions, family members, jobs, holdings, and similar records may share alignment, metadata, separators, density, and interaction states. Keep domain-specific content, hierarchy, and actions owned by each domain; do not flatten every list into identical cards.
- **Loading states:** use consistent lightweight progress indicators, skeletons, and blocking overlays according to wait scope. Skeletons should approximate the actual content shape; avoid flashing them for trivial operations or using indefinite motion without a meaningful loading state.
- **Selection states:** selected cards, choices, filters, and toggles must have a clear selected treatment, visible focus, and accessible state semantics. Selection must not rely on color alone and must not be confused with hover or pressed feedback.
- **Timelines:** life events, weekly activity, and career history may share chronological markers, connector geometry, date alignment, and responsive behavior while retaining domain-specific grouping and content.
- **Stat tiles:** reusable metric presentation may share label/value hierarchy, trend/status treatment, and compact density. Use only for metrics with a clear decision or informational purpose; do not turn every number into a tile or elevate secondary stats above the dashboard's financial priorities.
- **Notification indicators:** unread counts, alerts, and new-activity markers use consistent semantic tones, compact sizing, accessible labels, and bounded counts. Do not duplicate notification content already visible in the owning screen.

## Cross-component consistency contract

Every shared component and domain-owned surface must align on the following foundations while preserving its own information hierarchy:

1. **Typography:** consistent page/section/body/metadata hierarchy, restrained weight use, readable line-height, and sufficient contrast. Do not use size or weight alone to imply semantic status.
2. **Spacing and density:** use shared spacing tokens and deliberate compact/comfortable density. Align related controls and content; avoid arbitrary per-component gaps and cramped touch targets.
3. **Elevation and surfaces:** use a coherent surface/border/shadow scale. Elevation communicates layering and interaction, not decoration; popovers and dialogs must layer above page content predictably.
4. **Interaction states:** define and distinguish default, hover where available, pressed, focused, selected, disabled, loading, and invalid states. Mobile interactions must not depend on hover.
5. **Motion:** use consistent timing/easing for related transitions. Animate meaningful state changes and focal feedback only; avoid continuous decorative motion, prevent layout shifts, and honor `prefers-reduced-motion`.

Semantic meaning remains stable across all 17 themes; palettes adapt the treatment, contrast, and surface tint. Paper must retain light-theme contrast. Shared standards must not force every domain into the same card layout or visual pattern.

## Component adoption order

When existing screens are migrated, prioritize high-reuse and high-impact patterns: navigation and selection states, transaction/record rows, stat presentation, and loading feedback. Add menus/popovers, timelines, and notification indicators where a real repeated use case exists. Migrate incrementally, remove obsolete duplicate styling only after consumers move, and do not treat this list as a request for a mass redesign.


## Gameplay dialogs

`web/src/components/GameplayDialog.svelte` is the shared presentation layer for contextual situations that require a player decision. Use it instead of embedding bespoke event-choice cards in Overview or individual domain pages. The component displays context, available choices, affordability, known costs, and planned state, while callbacks delegate all mutations to the owning simulation/domain logic.

- Keep event selection, validation, consequences, history, and persistence outside the dialog component.
- Immediate decisions remain immediate only when the simulation contract says so; time-consuming choices enter the weekly plan and resolve through the normal weekly turn.
- Closing a dialog must not silently dismiss, resolve, or discard its pending situation. Provide a compact way to reopen unresolved situations.
- Dialogs must support keyboard dismissal, visible focus, accessible dialog semantics, touch-friendly choices, narrow-screen scrolling, safe-area spacing, and reduced motion.
- Do not turn routine navigation or ordinary workspace browsing into dialogs. Add information, transaction, confirmation, or multi-step variants only when a concrete flow requires them.

This is a gameplay interaction primitive, not a new simulation subsystem or save-data format.


## Theme-aware shared components (2026-11-19)

- `UiButton` and `UiCard` are the shared action and surface primitives. Their semantic variants consume the active theme tokens; keep their APIs stable and add variants only for a repeated interaction or hierarchy need.
- `UiProgress` presents determinate progress with an accessible label, bounded values, semantic tone, and compact size variants. Use it for tracked game progress; do not replace bespoke charts or invent progress values.
- `UiField` provides consistent label, helper, required, and validation presentation around existing native controls. Keep the actual input type, value, validation, and state owned by the calling form.
- Existing `GameplayDialog` owns player-decision presentation. Its surfaces, actions, focus, backdrop, and safe-area treatment must use semantic tokens. Do not create a second dialog system for the same flow.
- Existing `EmptyState` remains the shared empty-collection presentation. Toasts use the existing app notification surface; preserve its single notification flow.
- Charts remain domain-owned because investment and financial visualizations have different data and interaction requirements. Consume the shared `--chart-*` semantic tokens for series, grid, gain, loss, and neutral values rather than adding palette literals.
- Form controls, progress fills, dialogs, toast surfaces, and chart series must resolve from the active theme. All 17 themes must remain supported, including Paper's light contrast.
- Keep transitions tied to state changes, not continuous decoration. Honor `prefers-reduced-motion` and maintain visible keyboard focus and mobile touch targets.


## Flexible primitive APIs (2026-11-19)

The shared primitives expose configuration for common differences without requiring one-off CSS:

- **UiBadge:** semantic tone (including accent), tiny/small/medium size, pill/rounded/square shape, optional prefix or status dot, wrapping, custom class for exceptional composition, and opt-in entrance motion. Keep text labels; prefixes are decorative and hidden from assistive technology.
- **ActivityStatusSeal:** compatibility/domain wrapper around UiBadge. It maps activity states to shared semantic tones and preserves the status role. Do not add a second status color system.
- **UiButton:** semantic variant, size, shape, width, disabled state, optional accessible label, and loading state. Loading prevents duplicate activation and announces busy state. Keep the default touch target.
- **UiProgress:** determinate or indeterminate mode, semantic tone (`accent`, `success`, `info`, `coral`, `warning`, `danger`), size, optional heading/value visibility, and caller-provided value text. Use `getValueTone` for stat meters so the existing normal/inverse thresholds are preserved exactly. Keep the real accessible label; do not use progress bars for charts or arbitrary decoration.
- **UiField:** stacked or inline layout, compact or medium density, helper/error text, required marker, and custom class. The owning form still controls the native input and its validation/value.
- **UiCard:** use its existing as, density, surface, tone, radius, elevation, and interactive presentation options. Content determines height; do not add fixed-height variants for ordinary cards.
- **UiGrid / UiStack:** use configurable columns/minimum width, direction, alignment, wrapping, and gap. These are layout primitives, not card or content components.

Add a new prop only when it represents a repeated semantic need. Prefer CSS custom properties for continuous visual values; do not expose arbitrary palette overrides that bypass theme tokens. Existing call sites must remain valid when optional props are added.

## Initial screen adoption (2026-11-19)

The flexible primitives are now used in real domain screens, not only defined:

- **UiProgress**
  - Finance Accounts: credit score.
  - Finance Products: loan repayment and savings goal.
  - Education: overall course progress and subject grades.
  - Life Overview: health, stamina, intelligence, fitness, happiness, and inverse stress meters.
  - Character Creation: generated health, happiness, intelligence, fitness, stamina, focus, confidence, discipline, creativity, and social-skill meters.
  - Family: relationship closeness, trust, and tension.
  - Health: wellbeing stats and medical-condition severity.
- **UiField**
  - Finance Accounts: bank transaction amount.
  - Finance Products: extra loan repayment amount.
- **UiBadge**
  - Used by `ActivityStatusSeal` across Health, Education, Family, Work, and Finance Assets; the wrapper maps domain statuses to shared semantic tones.

The original screen-specific meters and CSS were removed where the shared progress component replaced them. Domain-specific layouts, labels, and data calculations remain in their owning screens. Stat meters use the shared `getValueTone` thresholds (including the coral band and inverse stress/severity bands), avoiding flattened or reinterpreted status colors. This is a targeted first adoption pass, not a claim that every screen has migrated.

## Component migration quality gate (2026-11-19)

A shared component is not automatically an upgrade over an existing screen implementation. Replace local UI only when the shared version is demonstrably better overall:

- Preserve or improve the screen's visual hierarchy, density, responsive behavior, and interaction feedback.
- Preserve domain semantics exactly, including thresholds, inverse metrics, labels, locked/disabled states, and accessible meaning.
- Improve theme consistency, accessibility, reuse, or maintainability without forcing generic-looking layouts.
- Compare the old and new presentation in representative themes and narrow Android layouts before treating the migration as complete.

If the shared component cannot meet the existing implementation's quality, keep the local implementation and improve the primitive first. Do not migrate solely to increase component adoption or reduce CSS line count. Expressive artwork and genuinely domain-specific compositions may remain bespoke.

## Reviewed patterns intentionally left bespoke (2026-11-19)

The following patterns were found during the wider source search and are not migration targets yet:

- **Weekly stamina forecast:** the compact accent-only track in the weekly review has a different visual role and density from the current `UiProgress`. Keep it until the shared primitive can reproduce that treatment without adding unnecessary border/gradient weight or changing its compact footprint.
- **Section navigation:** Finance, Life, Education, and Work use related horizontal navigation patterns, but differ in active treatment, disabled/locked items, and spacing. `UiButton` is not a navigation replacement. A dedicated, variant-aware navigation primitive may be worthwhile, but do not migrate until it can preserve these differences and improve keyboard/mobile behavior.
- **Event header and bank-card artwork:** fixed expressive colors are intentional illustration/art direction, not ordinary theme-surface styling. Preserve them unless a separate design decision calls for artwork changes.
- **Career performance meter:** the matching selector currently appears only in stylesheet search results, with no confirmed active markup usage. Do not create component adoption work for unused styling.
- **Domain cards and action buttons:** retain local composition where a shared card/button would flatten hierarchy, change touch sizing, or impose its hover/gradient treatment. Revisit only when a shared variant demonstrably improves the screen.


## Layered elevation foundation (2026-11-19)

The shared theme tokens now define one elevation ladder consumed by components rather than hard-coded per-screen shadows:

- `--elevation-1`: resting information surface, with a fine top-edge highlight.
- `--elevation-2`: raised cards and interactive surfaces.
- `--elevation-3`: floating overlays and high-priority surfaces.
- `--elevation-accent`: focal accent lift, reserved for selected/featured elements.
- `--surface-edge`: theme-aware edge separation.

`UiCard` implements its existing surface, tone, density, radius, interaction, and elevation API: `flat`, `default`, `raised`, `floating`, and `glow`. The default remains restrained; elevation is chosen by hierarchy, not applied to every nested card. `surface="raised"` creates a stronger plane, `surface="tinted"` adds a theme-accent wash, and `surface="outlined"` remains intentionally flat.

All elevation values derive from the active theme's shadow, text, line, and accent tokens. Paper has a dedicated soft neutral shadow ladder to retain natural light-surface depth. AMOLED keeps its black canvas and uses edge highlights and tonal separation rather than broad bright glows. No theme-specific component forks are required.

Use raised/floating levels only where the content hierarchy justifies them. Avoid nested shadow stacking, avoid glow on routine status labels, and keep interactive lift available on touch via press feedback. Reduced-motion disables lift transitions without removing focus or selected-state cues.

## SCSS authoring and compilation

- Sass with SCSS syntax is the preprocessor for shared Svelte component styles. The Vite Svelte plugin uses `vitePreprocess()`; component styles opt in with `<style lang="scss">`.
- Shared compile-time helpers live in `web/src/styles/_mixins.scss`. Use Sass modules with `@use` (namespaced by default); do not introduce legacy Sass `@import` or global helper leakage.
- Sass variables, functions, and mixins are compile-time authoring tools. Runtime theme palettes and player-selected appearance remain CSS custom properties in `tokens.scss` and `themes.scss`; do not duplicate the 17 theme palettes in Sass maps or hard-code theme colors in component styles.
- All application-authored stylesheets and Svelte component style blocks use SCSS. Preserve the separation between global foundations, shared framework styles, and component-scoped styles; do not create parallel CSS files or change visual behavior just to reorganize selectors.
- Keep Sass pinned in `web/package.json` and `web/package-lock.json`. The normal `npm ci` workflow must remain reproducible.
