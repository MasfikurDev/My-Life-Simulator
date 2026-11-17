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
