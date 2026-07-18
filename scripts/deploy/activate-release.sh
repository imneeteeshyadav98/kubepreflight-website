#!/usr/bin/env bash
# Installed on the droplet at ~deploy/activate-release.sh by every CI deploy
# run (rsynced fresh each time, so it can never drift from what's in this
# repo). Invoked as: activate-release.sh <release-id>
#
# <release-id> must already exist at $BASE/releases/<release-id> (the CI
# workflow rsyncs the build there before calling this script).
#
# What it does, in order:
#   1. Records the release "current" currently points at (if any).
#   2. Atomically flips "current" to the new release and reloads nginx.
#   3. Smoke-checks the result over the loopback address.
#   4. On smoke-check failure, flips back to the previous release and
#      reloads again, then exits non-zero so CI reports the deploy as
#      failed even though the site is left in a working state.
#   5. On success, prunes old release directories, keeping the most
#      recent $KEEP.
#
# Requires: the deploy user owns $BASE, and can run exactly
# `systemctl reload nginx` via sudo with no password (see docs/deployment.md
# for the sudoers drop-in that grants only that one command).
set -euo pipefail

BASE="${ACTIVATE_RELEASE_BASE:-/var/www/kubepreflight}"
KEEP="${ACTIVATE_RELEASE_KEEP:-5}"
SMOKE_URL="${ACTIVATE_RELEASE_SMOKE_URL:-http://127.0.0.1/}"

RELEASE_ID="${1:?usage: activate-release.sh <release-id>}"
NEW_RELEASE="$BASE/releases/$RELEASE_ID"
CURRENT_LINK="$BASE/current"

if [ ! -d "$NEW_RELEASE" ]; then
  echo "release $RELEASE_ID not found at $NEW_RELEASE" >&2
  exit 1
fi

previous_target=""
if [ -L "$CURRENT_LINK" ]; then
  previous_target="$(readlink -f "$CURRENT_LINK")"
fi

activate() {
  ln -sfn "$1" "$CURRENT_LINK"
  sudo systemctl reload nginx
}

smoke_check() {
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$SMOKE_URL" || echo "000")"
  [ "$code" = "200" ]
}

activate "$NEW_RELEASE"

if smoke_check; then
  echo "activated $RELEASE_ID"
else
  echo "smoke check failed for $RELEASE_ID against $SMOKE_URL" >&2
  if [ -n "$previous_target" ] && [ -d "$previous_target" ]; then
    echo "rolling back to $previous_target" >&2
    activate "$previous_target"
  else
    echo "no previous release to roll back to — left pointing at the failed release" >&2
  fi
  exit 1
fi

# Prune old releases, keeping the most recent $KEEP directories.
cd "$BASE/releases"
# shellcheck disable=SC2012
ls -1t | tail -n "+$((KEEP + 1))" | xargs -r rm -rf --
