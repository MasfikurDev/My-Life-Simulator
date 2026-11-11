#!/usr/bin/env bash
set -euo pipefail
if [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then echo "Deletion guard only applies to pull requests."; exit 0; fi
base_sha="${GITHUB_BASE_SHA:?GITHUB_BASE_SHA is required for pull requests}"
deletions_reviewed="${DELETIONS_REVIEWED:-false}"
deleted_files="$(git diff --name-only --diff-filter=D "$base_sha" HEAD)"
if [[ -z "$deleted_files" ]]; then echo "No tracked files were deleted."; exit 0; fi
echo "Deleted tracked files:"
printf '%s\n' "$deleted_files"
if [[ "$deletions_reviewed" == "true" ]]; then echo "Explicit deletion-review checkbox found in the PR body; continuing."; exit 0; fi
{
  echo "## File deletion safeguard"; echo
  echo "This pull request deletes tracked files. Review each deletion and confirm that its behavior, tests, and documentation are intentionally removed or relocated."; echo
  echo 'Deleted paths:'; echo
  printf '%s\n' "$deleted_files"; echo
  echo "Check the 'Intentional file deletions reviewed' PR checklist item only after reviewing the deletions."
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
echo "::error::Tracked file deletion requires explicit review. Check the Intentional file deletions reviewed PR checklist item only after verifying the deletions."
exit 1
