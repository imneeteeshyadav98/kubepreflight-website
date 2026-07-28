#!/usr/bin/env bash
# Encodes the final export formats from recordings/raw-capture.webm (the
# single continuous Playwright recording produced by record-browser.mjs).
# Modeled on demo/v1-launch/render.sh in the core repo. All exports are
# derived from that one source -- nothing here re-records or fabricates
# footage.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${script_dir}"

FFMPEG="${FFMPEG_BIN:-ffmpeg}"
RAW="recordings/raw-capture.webm"
OUT="output"
mkdir -p "${OUT}"

[ -f "${RAW}" ] || { echo "FAIL: ${RAW} not found -- run record-browser.mjs first" >&2; exit 1; }

echo "== 1. MP4 (1080x1080, H.264, faststart) =="
"${FFMPEG}" -y -i "${RAW}" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset slow \
  -movflags +faststart \
  -an \
  "${OUT}/kubepreflight-v1.3.0-evaluation-coverage.mp4"

echo "== 2. Poster frame (t=6.0s -- not_re_evaluated comparison summary visible) =="
"${FFMPEG}" -y -ss 6.0 -i "${RAW}" -frames:v 1 -update 1 \
  "${OUT}/kubepreflight-v1.3.0-evaluation-coverage-poster.png"

echo "== 3. Primary GIF (highlight cut, 2.0s-10.4s: the problem -> not_re_evaluated -> honest coverage) =="
"${FFMPEG}" -y -ss 2.0 -to 10.4 -i "${RAW}" \
  -vf "fps=12,scale=1080:1080:flags=lanczos,split[a][b];[a]palettegen=max_colors=160:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
  -loop 0 \
  "${OUT}/kubepreflight-v1.3.0-evaluation-coverage.gif"

GIF_BYTES=$(stat -c%s "${OUT}/kubepreflight-v1.3.0-evaluation-coverage.gif")
echo "Primary GIF size: $((GIF_BYTES / 1024)) KB"

echo "== 4. Preview GIF (720x720, lighter weight for constrained contexts) =="
"${FFMPEG}" -y -ss 2.0 -to 10.4 -i "${RAW}" \
  -vf "fps=10,scale=720:720:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
  -loop 0 \
  "${OUT}/kubepreflight-v1.3.0-evaluation-coverage-preview.gif"

echo
echo "== Output sizes =="
ls -la "${OUT}"
