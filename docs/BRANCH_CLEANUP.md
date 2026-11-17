# Merged branch cleanup

The **Clean up merged branches** GitHub Actions workflow uses the GitHub CLI (`gh`) to identify stale branches that are safe to remove.

## How eligibility is determined

A branch is eligible only when all of these conditions hold:

- It is not the repository's default branch.
- GitHub does not mark it as protected.
- No open pull request currently uses the branch name.
- A pull request from this repository was merged at least the configured number of days ago.
- The branch's current commit exactly matches the merged pull request's head commit. Branches with additional commits after the merge are retained.

Closed-but-unmerged branches, branches without a matching merged pull request, and branches whose current tip cannot be verified are never deleted by this workflow.

## Running the workflow

1. Open **Actions → Clean up merged branches → Run workflow**.
2. Leave **dry_run** enabled first. The run summary lists eligible branches and makes no changes.
3. Review the list. If it is correct, run it again with **dry_run** disabled.
4. The default age threshold is seven days. Increase it if more time is needed before cleanup.

The workflow is manual only. It has no schedule and does not delete branches automatically after a merge. The deletion job uses the workflow's short-lived `GITHUB_TOKEN` with `contents: write` only for the cleanup job.

## Safety behavior

The script rechecks each branch's current commit and checks for open pull requests immediately before deletion. If either check indicates the branch changed or became active, it skips that branch. A deletion removes the branch reference, not the commits from the repository's history; merged changes remain in the target branch.
