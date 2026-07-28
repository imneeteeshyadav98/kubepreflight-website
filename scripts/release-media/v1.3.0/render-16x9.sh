#!/usr/bin/env bash
# Encodes the website's MP4 + poster from recordings/raw-capture-16x9.webm
# (the native 1920x1080 landscape Playwright recording produced by
# record-browser-16x9.mjs). Straight transcode, no crop/stretch/pad --
# the 16:9 shape comes from the scene composition itself
# (assets-16x9/*.html), not from reframing a square source.
#
# The square GIF/preview GIF for LinkedIn/GitHub are unaffected by this
# script -- see render.sh, which derives those from the separate square
# recording (recordings/raw-capture.webm).
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${script_dir}"

FFMPEG="${FFMPEG_BIN:-ffmpeg}"
RAW="recordings/raw-capture-16x9.webm"
OUT="output"
mkdir -p "${OUT}"

[ -f "${RAW}" ] || { echo "FAIL: ${RAW} not found -- run record-browser-16x9.mjs first" >&2; exit 1; }

echo "== 1. Website MP4 (1920x1080, H.264, faststart) =="
"${FFMPEG}" -y -i "${RAW}" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset slow \
  -movflags +faststart \
  -an \
  "${OUT}/kubepreflight-v1.3.0-evaluation-coverage.mp4"

echo "== 2. Website poster (t=6.8s -- not_re_evaluated comparison summary, fully settled) =="
"${FFMPEG}" -y -ss 6.8 -i "${RAW}" -frames:v 1 -update 1 \
  "${OUT}/kubepreflight-v1.3.0-evaluation-coverage-poster.png"

echo
echo "== Output sizes =="
ls -la "${OUT}/kubepreflight-v1.3.0-evaluation-coverage.mp4" "${OUT}/kubepreflight-v1.3.0-evaluation-coverage-poster.png"
