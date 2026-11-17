#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_REPOSITORY_OWNER:?GITHUB_REPOSITORY_OWNER is required}"
: "${DEFAULT_BRANCH:?DEFAULT_BRANCH is required}"

DRY_RUN="${DRY_RUN:-true}"
MINIMUM_AGE_DAYS="${MINIMUM_AGE_DAYS:-7}"

if [[ "$DRY_RUN" != "true" && "$DRY_RUN" != "false" ]]; then
  echo "::error::DRY_RUN must be true or false."
  exit 1
fi
if ! [[ "$MINIMUM_AGE_DAYS" =~ ^[0-9]+$ ]] || (( MINIMUM_AGE_DAYS < 1 || MINIMUM_AGE_DAYS > 365 )); then
  echo "::error::MINIMUM_AGE_DAYS must be an integer between 1 and 365."
  exit 1
fi

echo "Loading repository branches and merged/open pull requests..."
branches_json="$(gh api --paginate --slurp "repos/${GITHUB_REPOSITORY}/branches?per_page=100" | jq 'add')"
merged_prs_json="$(gh pr list --state merged --limit 1000 --json headRefName,headRefOid,mergedAt,headRepositoryOwner)"
open_prs_json="$(gh pr list --state open --limit 1000 --json headRefName)"

now_epoch="$(date -u +%s)"
candidate_lines="$(jq -r \
  --arg owner "$GITHUB_REPOSITORY_OWNER" \
  --arg default "$DEFAULT_BRANCH" \
  --argjson min_age "$MINIMUM_AGE_DAYS" \
  --argjson now "$now_epoch" \
  --argjson branches "$branches_json" \
  --argjson merged "$merged_prs_json" \
  --argjson open "$open_prs_json" '
    [ $open[].headRefName ] as $open_names
    | $branches[]
    | select(.name != $default and .protected != true)
    | . as $branch
    | select(($open_names | index($branch.name)) == null)
    | [
        $merged[]
        | select(
            .headRefName == $branch.name
            and .headRefOid == $branch.commit.sha
            and .headRepositoryOwner.login == $owner
          )
      ] as $matching_prs
    | select(($matching_prs | length) > 0)
    | ($matching_prs | max_by(.mergedAt)) as $pr
    | ((($now - ($pr.mergedAt | fromdateiso8601)) / 86400) | floor) as $age_days
    | select($age_days >= $min_age)
    | [$branch.name, $branch.commit.sha, ($pr.number | tostring), $pr.mergedAt, ($age_days | tostring)]
    | @tsv
  ')"

candidate_count=0
deleted_count=0
skipped_count=0

if [[ "$DRY_RUN" == "true" ]]; then
  echo "DRY RUN: no branches will be deleted."
else
  echo "LIVE MODE: eligible branches will be deleted after final safety checks."
fi

while IFS=$'\t' read -r branch expected_sha pr_number merged_at age_days; do
  [[ -n "$branch" ]] || continue
  candidate_count=$((candidate_count + 1))
  echo "Candidate: $branch (PR #$pr_number, merged $merged_at, ${age_days} days ago)"

  if [[ "$DRY_RUN" == "true" ]]; then
    continue
  fi

  current_sha="$(gh api "repos/${GITHUB_REPOSITORY}/git/ref/heads/$branch" --jq '.object.sha' 2>/dev/null || true)"
  if [[ "$current_sha" != "$expected_sha" ]]; then
    echo "Skipping $branch: its tip changed after the inventory."
    skipped_count=$((skipped_count + 1))
    continue
  fi

  if gh pr list --state open --limit 1000 --json headRefName --jq '.[].headRefName' | grep -Fxq -- "$branch"; then
    echo "Skipping $branch: an open pull request now uses it."
    skipped_count=$((skipped_count + 1))
    continue
  fi

  gh api --method DELETE "repos/${GITHUB_REPOSITORY}/git/refs/heads/$branch"
  echo "Deleted: $branch"
  deleted_count=$((deleted_count + 1))
done <<< "$candidate_lines"

{
  echo "## Merged branch cleanup"
  echo
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "- Mode: dry run (no changes made)"
  else
    echo "- Mode: deletion"
  fi
  echo "- Minimum age: $MINIMUM_AGE_DAYS days"
  echo "- Eligible branches: $candidate_count"
  echo "- Deleted: $deleted_count"
  echo "- Skipped after final checks: $skipped_count"
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

echo "Finished. Eligible=$candidate_count Deleted=$deleted_count Skipped=$skipped_count"
