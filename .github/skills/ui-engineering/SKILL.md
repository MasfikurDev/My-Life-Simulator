---
name: ui-engineering
description: Build and modify My Life Simulator UI with precise alignment, controlled spacing, consistent components, responsive layouts, and verified visual behavior. Use for every Svelte, CSS, component, screen, navigation, modal, form, or responsive UI task.
---

# UI Engineering Skill

## Mission
Prevent avoidable UI defects: off-center content, arbitrary padding/margins, inconsistent component sizes, cramped or wasteful layouts, clipping, overflow, unsafe-area collisions, and layouts that only work at one width. Treat layout as a system with explicit constraints; do not guess.

## Required context
Before changing UI:
1. Read `docs/AI_WORKING_RULES.md` and `docs/VISUAL_DESIGN.md`.
2. Inspect the relevant Svelte markup and the CSS selectors it actually uses.
3. Reuse existing components, semantic classes, tokens, and layout patterns.
4. Preserve AMOLED-first dark UI, compact/action-first gameplay, money-first dashboard, mobile-first behavior, accessibility, and Android safe areas.

Current implementation:
- Svelte 5 + TypeScript + Vite.
- Shared global CSS in `web/src/app.css`.
- No Tailwind, Bootstrap, Material Web, or established external component library.
- Do not add a styling framework or UI dependency for routine layout work.

## Layout and alignment
- Identify the containing block first. Center relative to the intended parent, not the viewport by accident.
- For normal horizontal centering, prefer a constrained block with `width: 100%`, an appropriate `max-width`, and `margin-inline: auto`.
- Use Grid/Flexbox with explicit `place-items`, `align-items`, `justify-content`, or `place-content` for alignment.
- Use `min-width: 0` on shrinkable grid/flex children; use `minmax(0, 1fr)` for flexible grid tracks.
- Do not use absolute positioning or `translate(-50%, -50%)` as a default centering technique. Reserve it for intentional overlays and anchored controls.
- Distinguish centering a container from centering its contents.
- Avoid fixed heights on text-bearing cards. Use aspect ratios only when the content requires them.
- The global stylesheet already uses `box-sizing: border-box`; preserve that model.
- Avoid unexplained magic numbers. Document exceptional values.

## Spacing and density
- Follow a consistent 4px rhythm: 4, 8, 12, 16, 20, 24, 32, 40, 48px.
- Prefer nearby existing patterns. Put any new shared spacing tokens centrally in `:root` in `web/src/app.css`; do not scatter a second spacing system.
- Use tighter spacing inside controls, moderate spacing for related content, and larger spacing between distinct sections.
- Do not use child margins/padding to compensate for a broken parent layout. Fix the parent constraint.
- Prefer `gap` over stacked adjacent margins when it describes the relationship.
- Do not add oversized vertical padding that pushes primary gameplay actions below the fold.
- Compact does not mean cramped: retain readable line height, clear grouping, and at least 44 CSS px for primary interactive touch targets.
- Responsive spacing must solve a real readability or density problem, not be arbitrary.

## Component consistency
- Search for an existing component/class before creating another button, card, heading, field, badge, navigation item, dialog, or action pattern.
- Keep variants explicit and limited; avoid near-duplicate classes with slightly different padding/alignment.
- Layout containers control placement; components control their internal presentation.
- Avoid fragile deep selectors and incidental DOM-nesting dependencies; use semantic classes.
- Prefer semantic HTML and native controls. Custom controls must preserve keyboard behavior, labels, focus visibility, disabled states, and accessible names.
- Avoid global selectors that unexpectedly alter unrelated screens.

## Responsive and Android checks
For layout-affecting changes, check 320, 360, 390, 430, 768, 1024, and 1440 CSS px where practical.
- No unintended horizontal page scrolling or clipped text, controls, cards, dialogs, or financial amounts.
- Long names/numbers must wrap, truncate, or scroll intentionally.
- Grid columns must collapse before content becomes cramped.
- Bottom navigation and floating actions must not overlap or hide content.
- Respect top/bottom safe-area insets and the Android notch.
- Controls remain reachable by touch; never rely on hover.
- Desktop and mobile navigation must behave appropriately at breakpoints.
Do not add a breakpoint merely to patch one screenshot; identify the actual content constraint.

## Visual verification workflow
1. Inspect the existing screen at relevant viewport sizes when preview tools are available.
2. Implement the smallest coherent change.
3. Re-check the same sizes plus at least one narrower and one wider viewport.
4. Check alignment against parent edges/centerline, not visual guesswork.
5. Compare spacing with neighboring components.
6. Check overflow, focus, disabled/loading states, and safe-area collisions.
7. Run checks from `web/`: `npm run check`, `npm test`, and `npm run build` (build already includes check and tests).
8. Report what was actually verified. Passing TypeScript/build checks does not prove visual correctness.

If screenshot/browser preview is unavailable, do not claim pixel-level visual verification. Explicitly report the remaining screen and viewport checks.

## Completion checklist
- [ ] Correct parent/container controls alignment.
- [ ] Centering is layout-defined, not patched with arbitrary offsets.
- [ ] Padding, margin, and gap follow the shared rhythm and have a reason.
- [ ] Existing components/classes are reused where appropriate.
- [ ] No accidental fixed heights, overflow, or horizontal scrolling.
- [ ] Relevant phone and desktop widths are checked.
- [ ] Safe areas, bottom navigation, and floating actions do not collide.
- [ ] Text, focus, labels, contrast, and touch targets remain accessible.
- [ ] Automated checks pass; visual limitations are reported honestly.

## Never
- Add arbitrary `margin-left`, `top`, or transforms to fake centering at one width.
- Add child padding to hide a parent alignment problem.
- Mix unrelated spacing scales.
- Solve every mobile issue with `overflow: hidden`.
- Fix variable text content to a pixel height without a demonstrated need.
- Shrink fonts or touch targets merely to fit more content.
- Add a component library/framework for a small visual adjustment.
- Claim screenshot or device verification that did not occur.
