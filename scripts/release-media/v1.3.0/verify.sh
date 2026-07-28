#!/usr/bin/env bash
# Reproduces the quality/leak checks this animation's outputs were
# verified against before being accepted -- run after render.sh, before
# treating output/ as final. Modeled on demo/v1-launch/verify.sh in the
# core repo, extended with the fuller sensitive-data pattern set requested
# for this release's media generation.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${script_dir}"

FFPROBE="${FFPROBE_BIN:-ffprobe}"

need_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "FAIL: required command not found: $1" >&2; exit 1; }; }
need_cmd "${FFPROBE}"
need_cmd python3

fail=0
check() {
  local label="$1"
  local condition="$2"
  if [ "${condition}" = "0" ]; then
    echo "FAIL: ${label}"
    fail=1
  else
    echo "OK: ${label}"
  fi
}

echo "== Sensitive-identifier leak scan (source: assets/, scripts) =="
PATTERN='arn:aws:|(^|[^0-9])[0-9]{12}([^0-9]|$)|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|aws_access_key_id|aws_secret_access_key|aws_session_token|Bearer [A-Za-z0-9._-]+|certificate-authority-data|client-key-data|\.compute\.internal|(^|[^0-9])10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}([^0-9]|$)|(^|[^0-9])192\.168\.[0-9]{1,3}\.[0-9]{1,3}([^0-9]|$)|(^|[^0-9])172\.(1[6-9]|2[0-9]|3[0-1])\.[0-9]{1,3}\.[0-9]{1,3}([^0-9]|$)|vpc-[0-9a-f]{6,}|subnet-[0-9a-f]{6,}|sg-[0-9a-f]{6,}|i-[0-9a-f]{8,}|vol-[0-9a-f]{6,}'
if grep -rEqn "${PATTERN}" assets assets-16x9 record-browser.mjs record-browser-16x9.mjs render.sh render-16x9.sh 2>/dev/null; then
  echo "FAIL: sensitive-identifier pattern found in demo source"
  grep -rEn "${PATTERN}" assets assets-16x9 record-browser.mjs record-browser-16x9.mjs render.sh render-16x9.sh 2>/dev/null
  fail=1
else
  echo "OK: no sensitive-identifier pattern in demo source"
fi

echo
echo "== Output files present =="
for f in \
  output/kubepreflight-v1.3.0-evaluation-coverage.mp4 \
  output/kubepreflight-v1.3.0-evaluation-coverage-poster.png \
  output/kubepreflight-v1.3.0-evaluation-coverage.gif \
  output/kubepreflight-v1.3.0-evaluation-coverage-preview.gif
do
  check "${f} exists" "$([ -s "${f}" ] && echo 1 || echo 0)"
done

echo
echo "== MP4: format/duration/faststart (website asset -- native 16:9) =="
read -r codec w h pix < <("${FFPROBE}" -v error -select_streams v:0 -show_entries stream=width,height,codec_name,pix_fmt -of csv=p=0 output/kubepreflight-v1.3.0-evaluation-coverage.mp4 | tr ',' ' ')
dur=$("${FFPROBE}" -v error -show_entries format=duration -of csv=p=0 output/kubepreflight-v1.3.0-evaluation-coverage.mp4)
has_audio=$("${FFPROBE}" -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 output/kubepreflight-v1.3.0-evaluation-coverage.mp4)
check "resolution is 1920x1080 (got ${w}x${h})" "$([ "${w}" = "1920" ] && [ "${h}" = "1080" ] && echo 1 || echo 0)"
check "codec is h264 (got ${codec})" "$([ "${codec}" = "h264" ] && echo 1 || echo 0)"
check "pixel format is yuv420p, web-compatible (got ${pix})" "$([ "${pix}" = "yuv420p" ] && echo 1 || echo 0)"
check "duration is 15-18s (got ${dur}s)" "$(python3 -c "print(1 if 15 <= float('${dur}') <= 18.5 else 0)")"
check "no audio stream" "$([ -z "${has_audio}" ] && echo 1 || echo 0)"
check "moov atom precedes mdat (faststart)" "$(python3 -c "
data = open('output/kubepreflight-v1.3.0-evaluation-coverage.mp4', 'rb').read(2_000_000)
moov, mdat = data.find(b'moov'), data.find(b'mdat')
print(1 if 0 < moov < mdat else 0)
")"
mp4_mb=$(( $(stat -c%s output/kubepreflight-v1.3.0-evaluation-coverage.mp4) / 1024 / 1024 ))
echo "MP4 size: ${mp4_mb} MB"

echo
echo "== Poster: resolution (website asset -- native 16:9) =="
read -r w h < <("${FFPROBE}" -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 output/kubepreflight-v1.3.0-evaluation-coverage-poster.png | tr ',' ' ')
check "poster is 1920x1080 (got ${w}x${h})" "$([ "${w}" = "1920" ] && [ "${h}" = "1080" ] && echo 1 || echo 0)"

echo
echo "== GIF: readable size (social asset -- square, unaffected by the 16:9 change) =="
gif_kb=$(( $(stat -c%s output/kubepreflight-v1.3.0-evaluation-coverage.gif) / 1024 ))
check "primary GIF under 20 MB (got ${gif_kb} KB)" "$([ "${gif_kb}" -lt 20480 ] && echo 1 || echo 0)"
preview_kb=$(( $(stat -c%s output/kubepreflight-v1.3.0-evaluation-coverage-preview.gif) / 1024 ))
echo "Preview GIF size: ${preview_kb} KB"

echo
if [ "${fail}" -ne 0 ]; then
  echo "VERIFY: FAILED -- see FAIL lines above"
  exit 1
fi
echo "VERIFY: all checks passed"
