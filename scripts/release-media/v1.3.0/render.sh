#!/usr/bin/env bash
# Encodes the square GIF/preview GIF (LinkedIn/GitHub) from
# recordings/raw-capture.webm (the 1080x1080 Playwright recording
# produced by record-browser.mjs). Modeled on demo/v1-launch/render.sh in
# the core repo.
#
# The website's MP4/poster are NOT produced here -- they're a separate,
# natively-composed 16:9 recording (assets-16x9/*.html,
# record-browser-16x9.mjs, render-16x9.sh). Squashing this square source
# into a 16:9 shape would mean stretching or letterboxing it; the website
# scenes are laid out for the wide canvas instead. See render-16x9.sh.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${script_dir}"

FFMPEG="${FFMPEG_BIN:-ffmpeg}"
RAW="recordings/raw-capture.webm"
OUT="output"
mkdir -p "${OUT}"

[ -f "${RAW}" ] || { echo "FAIL: ${RAW} not found -- run record-browser.mjs first" >&2; exit 1; }

echo "== 1. Primary GIF (highlight cut, 2.0s-10.4s: the problem -> not_re_evaluated -> honest coverage) =="
"${FFMPEG}" -y -ss 2.0 -to 10.4 -i "${RAW}" \
  -vf "fps=12,scale=1080:1080:flags=lanczos,split[a][b];[a]palettegen=max_colors=160:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
  -loop 0 \
  "${OUT}/kubepreflight-v1.3.0-evaluation-coverage.gif"

GIF_BYTES=$(stat -c%s "${OUT}/kubepreflight-v1.3.0-evaluation-coverage.gif")
echo "Primary GIF size: $((GIF_BYTES / 1024)) KB"

echo "== 2. Preview GIF (720x720, lighter weight for constrained contexts) =="
"${FFMPEG}" -y -ss 2.0 -to 10.4 -i "${RAW}" \
  -vf "fps=10,scale=720:720:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
  -loop 0 \
  "${OUT}/kubepreflight-v1.3.0-evaluation-coverage-preview.gif"

echo
echo "== Output sizes =="
ls -la "${OUT}"
