# Weekly Activity Outcomes — Design

**Status:** Approved direction; implementation proposal for this change  
**Date:** 2026-11-20

## Intent
Make weekly planning and individual domain activities communicate meaningful outcomes beyond stamina while retaining the game's compact, domain-native visual identity.

## Goals
- Replace the stamina-only weekly overview with a compact forecast of every existing character/domain metric that actually changes during the upcoming resolution.
- Remove the redundant Combined Character Impact section.
- Present selected and automatic activities in the existing expandable unified activity list.
- Use shared semantic badges for real positive/negative stat changes, progression changes, income, expenses, and relevant informational states.
- Keep planned activity removal as a small top-right ×; automatic entries remain unremovable.
- Show contextual actions such as View items only when they add useful detail, with multiple purchased/consumed items grouped behind disclosure.
- Reuse the same effect presentation in individual domain workspaces without flattening their distinct layouts.

## Non-goals
- No new stats, needs, resource meters, or fabricated progression measures.
- No job-application career progress reward; application outcome remains pending until resolved.
- No timetable, universal action quota, generic mega-dashboard, or redesign of domain navigation.
- No duplicate combined-impact summary.
- No changes to save schema or weekly resolution rules unless required to expose existing, verified outcomes.

## Constraints and existing behavior
- The weekly preview must remain deterministic and use the same simulation resolver as actual resolution.
- Existing weekly plan is a list of choices, not a calendar.
- Education attendance and employment responsibilities remain automatic; applications, interviews, education tasks, personal activities, and other choices remain in their owning workspaces.
- The review's existing sections, hierarchy, expandable activity disclosure, warning behavior, and bottom actions must be preserved.
- Stamina remains a real budget and may be shown as one forecast metric and one activity effect, but must not dominate all activity presentation.
- Use UiBadge semantic tones and current theme tokens; maintain compact mobile-first spacing and touch accessibility.

## Approaches considered
1. **UI-only string parsing:** rejected because descriptive reward text is not authoritative structured effect data and could display misleading badges.
2. **Shared effect component backed by simulation-owned structured outcomes:** preferred. Keep the resolver authoritative, expose only real outcomes, and reuse the presentation across weekly review and domain workspaces.
3. **Separate redesign per workspace:** rejected because it duplicates effect logic and creates inconsistent layouts.

## Design direction
- Weekly forecast: compact rows for changed existing stats/domain metrics, showing before → after and signed delta; only changed metrics appear. Preserve a clear stamina budget explanation within this overview rather than as a separate dominant section.
- Activity rows: title + planned/automatic state + top-right × for removable planned actions + wrapping effect/cost badges. No repetitive explanatory mini-copy.
- Item-heavy actions: one concise item-count badge and a contextual View items action that opens a compact list; never emit one badge per item.
- Domain activity cards: retain each workspace's information architecture and controls; add shared effect badges only where the owning system can provide grounded effects. Keep requirements and eligibility distinct from outcomes.
- Positive outcomes use success tone; negative outcomes and expenses use danger tone; neutral statuses and counts use neutral tone. Inverse metrics such as stress must use semantic direction, not numeric sign alone.

## Acceptance criteria
- Weekly forecast contains all existing changed character/domain metrics from the deterministic preview and no unchanged metrics.
- Combined Character Impact is removed to avoid duplicate reporting.
- Stamina remains visible as one metric, not the entire overview.
- Activity badges show only verified effects and real costs/rewards; job applications do not receive invented career progress.
- Planned entries have an accessible × removal control in the header; automatic entries have none.
- Multi-item purchase/consumption details are grouped and disclosed on demand.
- Existing expandable Activities behavior, remove/recalculate behavior, warnings, cash projection, and resolution controls remain intact.
- Individual Education, Work, Lifestyle, Health, Family, and other activity surfaces retain their domain-native layout and use shared effect badge treatment where supported.
- No save schema or simulation behavior changes unless explicitly covered by tests.
- Documentation distinguishes implemented behavior from any remaining domain-specific gaps.
