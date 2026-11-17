# GitHub Repository Settings

**Repository:** `MasfikurDev/My-Life-Simulator`  
**Baseline reviewed:** 2026-11-17  
**Purpose:** Record the intended repository-level GitHub configuration so future contributors can understand the current setup without treating every available GitHub option as something that must be enabled.

This document records the current configuration and the decisions confirmed during the settings review. GitHub's defaults can vary by repository age, account, and product changes. Where the repository's original value was not captured, this document does **not** claim that the current value is a change from a universal GitHub default. The current value is the source of truth; use the GitHub settings page to verify it before changing anything.

## General

| Setting | Current value | Intent |
|---|---|---|
| Repository visibility | Public | Keep the game and its source publicly accessible. |
| Default branch | `main` | Stable integration and deployment branch. |
| Issues | Enabled | Track bugs and project work. |
| Projects | Enabled | Available for roadmap/project tracking; no mandatory workflow depends on it. |
| Wiki | Disabled | Keep canonical documentation in the repository under `docs/`. |
| Discussions | Disabled | Not currently needed. |
| GitHub Pages | Enabled | Hosts the web game. |
| Downloads | Disabled | Use workflow artifacts and GitHub Releases for APK distribution. |
| Forking | Enabled | Preserve normal public-repository collaboration. |
| Automatically delete head branches | Enabled | Delete merged PR head branches automatically when GitHub permits it. |
| Allow update branch | Enabled | Allow PR branches to be updated from the base branch through GitHub. |
| Auto-merge | Disabled | Merges remain deliberate; do not queue an automatic merge without an explicit decision. |

## Pull request merge methods

| Setting | Current value | Intent |
|---|---|---|
| Squash merging | Enabled | Standard merge method; produces one commit per PR on `main`. |
| Merge commits | Disabled | Avoid merge-commit noise on the integration branch. |
| Rebase merging | Disabled | Keep one consistent merge method. |
| Default squash message/title | Pull request title | Keep the resulting commit subject aligned with the PR. |

**Policy:** Merge PRs using squash. Draft PRs are the normal place for implementation, iteration, validation, and review. See [Pull Request Workflow](PULL_REQUEST_WORKFLOW.md).

## Branch ruleset: Main Protection

| Field / rule | Current value |
|---|---|
| Ruleset name | `Main Protection` |
| Enforcement | Active |
| Target | Default branch (dynamic default-branch targeting) |
| Bypass list | Empty |

### Enabled rules

| Rule | Current value | Reason |
|---|---|---|
| Restrict deletions | Enabled | Protect the default branch from deletion. |
| Require a pull request before merging | Enabled | Changes to the default branch go through a PR. |
| Require conversation resolution | Enabled | Keep review discussions resolved before merge. |
| Block force pushes | Enabled | Protect branch history from force updates. |

### Pull request requirements

| Requirement | Current value |
|---|---|
| Required approving reviews | 0 |
| Dismiss stale approvals | Disabled |
| Require review from specific teams | Disabled |
| Require review from Code Owners | Disabled |
| Require approval of the most recent reviewable push | Disabled |
| Additional approval for unattributed Copilot PRs | Disabled |
| Allowed merge methods | Squash only |

The zero-approval setting is intentional for the current solo-maintainer workflow. It does not remove the requirement to inspect the diff, validate changes, and resolve review conversations.

### Rules intentionally not enabled

| Rule | Current value | Reason |
|---|---|---|
| Restrict creations | Disabled | Avoid unnecessary restrictions on branch creation. |
| Restrict updates | Disabled | Allow normal work on non-protected branches. |
| Require linear history | Disabled | Squash-only merging already provides the chosen PR merge style; avoid a redundant restriction. |
| Require deployments to succeed | Disabled | Deployment gating is not currently part of the merge policy. |
| Require signed commits | Disabled | Not currently required by the project's signing setup. |
| Require status checks to pass | Disabled; no required checks selected | Existing workflows use path filters and intentionally skip unrelated work. Do not add a required check that can remain pending for a PR where its workflow is skipped. |
| Require branches to be up to date | Disabled | No required status check currently makes this setting applicable. |
| Do not require status checks on creation | Not enabled | No status-check creation exception is needed while required checks are disabled. |
| Require code scanning results | Disabled | Not currently part of the merge policy. |
| Require code quality results | Disabled | Not currently part of the merge policy. |
| Restrict code coverage | Disabled | Not currently part of the merge policy. |
| Automatically request Copilot code review | Disabled | Not required for the current workflow. |

**Important:** The absence of required status checks is deliberate, not an oversight. The current CI workflows are path-filtered to avoid unnecessary web, Android, and simulation work. Do not make a workflow mandatory merely because its name appears in the Actions tab. Reconsider this only if the CI design changes in a way that makes a reliable, always-reported check available without adding brittle manual maintenance.

## Settings not included in this verified baseline

The following administrative settings were not independently verified during this review. Their values must not be inferred from this document:

- Actions → General: allowed actions, fork pull-request permissions, workflow permissions, and whether Actions may create or approve pull requests.
- Code security and analysis: Dependabot alerts/updates, secret scanning, push protection, and code scanning.
- Pages deployment environment protection.
- Webhooks, deploy keys, and other integrations.

If these areas are changed later, verify their live values and update this document in the same PR.

## Maintenance rules

1. Treat this file as a record of intentional repository configuration, not a checklist to enable every GitHub feature.
2. Before changing a setting, check the current live value, identify the behavior it affects, and confirm that it fits the current workflow.
3. Prefer settings that adapt to project growth (for example, targeting the default branch) over hard-coded branch names or manually maintained lists where practical.
4. Do not add mandatory approvals, status checks, deployment gates, signed-commit requirements, or other hard rules without a demonstrated need and a compatible workflow.
5. When a repository setting is changed, update this document in the same PR with the new value, reason, and any relevant migration/operational impact.
6. Re-audit this document when GitHub changes the settings UI or behavior; do not assume a renamed or newly introduced option has the same semantics as an older one.

## Review history

- **2026-11-17:** Recorded the reviewed General settings, squash-only merge policy, and active `Main Protection` ruleset. Required status checks remain intentionally disabled. Administrative Actions and security settings remain unverified.


## Public repository and code protection

The repository is intentionally public. Public visibility allows anyone to read and clone the source; it does not grant a general copyright license to reuse, redistribute, or publish modified versions. No license is currently declared. Do not add a license or change repository visibility without an explicit maintainer decision.

### Repository security features

The live values for GitHub's security and analysis settings have not yet been verified. Check **Settings → Code security and analysis** directly. Recommended protections for this public repository are:

- Secret scanning alerts, with push protection enabled where available.
- Dependabot alerts and security updates.
- Review dependency update pull requests before merging.
- Keep Actions permissions least-privileged and pin third-party Actions to verified full commit SHAs.
- Keep credentials, local environment files, signing keystores, and generated build outputs out of Git.

Do not record a feature as enabled until its live setting has been checked. Public repository visibility alone is not proof that every security feature is configured.

### Workflow supply-chain policy

Every third-party or GitHub-maintained action used by repository workflows should be pinned to a full commit SHA. Keep a human-readable version comment beside each pin and update pins deliberately after checking the upstream release and commit. Avoid floating major-version tags such as `@v4` in workflow files.

### Local file hygiene

The root `.gitignore` excludes common local environment files, signing material, editor state, dependency directories, and generated web/Android build output. Ignore rules prevent accidental additions; they do not remove files already tracked or erase credentials from Git history. If a credential is ever committed, revoke or rotate it immediately and assess history cleanup separately.

### Security reporting

See [Security Policy](../.github/SECURITY.md). Keep vulnerability reports private until the maintainer has assessed and addressed the issue.
