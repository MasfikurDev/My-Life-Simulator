# Reusable UI Framework

## Purpose
My Life Simulator uses a small, in-repository Svelte UI framework rather than hand-authored page CSS or a third-party component library. It is a design system and composition toolkit, not a requirement that every screen or card look alike.

## Layers and ownership
1. Semantic theme tokens in web/src/styles/tokens.css and themes.css define palette, surfaces, typography colors, spacing, radii, controls, focus, and theme identity.
2. Framework primitives in web/src/components own reusable presentation and expose deliberate customization.
3. Domain components combine primitives while retaining domain-specific information hierarchy and behavior.
4. Pages and workspaces arrange domain components. Page CSS describes exceptional composition, not repeated card, button, spacing, or theme behavior.

## Customization contract
- Cards expose semantic surface, tone, density, radius, elevation, and interaction. Content determines height; text-bearing cards must not get fixed heights by default.
- Buttons expose semantic variant, size, width, and shape. Primary actions retain comfortable touch targets.
- `UiBadge` exposes semantic tones (`success`, `info`, `special`, `warning`, `risk`, `danger`, `neutral`) and compact sizes. Theme tokens control its colors; optional dots and entrance motion are opt-in. Use labels as well as color, and keep routine badges static.
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
- Do not mass-rewrite every workspace in one PR. Keep gameplay logic and save formats unchanged.
- Every migration should remove duplicated CSS or reduce page-specific styling rather than add another layer of overrides.


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
