#!/usr/bin/env bash
# Encode rendered frames into the scrub video and cut the three stills the site uses.
#   scripts/hero/encode.sh <frames dir> [--install]
# Frames come from:  blender -b --python scripts/hero/build_hero.py -- anim <out> <kenney kits dir> <models dir> scripts/hero/logo-screen.png
set -euo pipefail
FRAMES="${1:?frames dir}"; OUT="$(dirname "$FRAMES")/out"; mkdir -p "$OUT"
P="$(cd "$(dirname "$0")/../.." && pwd)/public/assets"
n=$(ls "$FRAMES" | grep -c '\.png$'); echo "frames: $n"; [ "$n" -ge 600 ] || { echo "expected 600 frames"; exit 1; }
# A keyframe every 8 frames so scroll-seeking lands fast, no scene-cut keyframes, 4:2:0 for Safari,
# faststart so the browser reads the index before the whole file arrives, no audio. CRF 22: the
# photo-textured render lands near 11.6 MB there (13.3 MB at 21, 10.1 MB at 23); override with CRF=.
ffmpeg -v error -y -framerate 24 -i "$FRAMES/f_%04d.png" -c:v libx264 -preset slow -crf "${CRF:-22}" -profile:v high -level 4.0 \
  -g 8 -keyint_min 8 -sc_threshold 0 -bf 0 -pix_fmt yuv420p -movflags +faststart -an "$OUT/hero-scrub.mp4"
ffmpeg -v error -y -i "$FRAMES/f_0001.png" -q:v 3 "$OUT/hero-poster.jpg"      # first frame: mobile hero + poster
ffmpeg -v error -y -i "$FRAMES/f_0250.png" -q:v 3 "$OUT/hero-threshold.jpg"   # mid-shatter: the Why page plate
ffmpeg -v error -y -i "$FRAMES/f_0600.png" -q:v 3 "$OUT/hero-ending.jpg"      # last frame: closer plate + OG image
ls -la "$OUT"; echo "bytes: $(stat -c %s "$OUT/hero-scrub.mp4")  (update VIDEO_BYTES in src/components/hero/useScrubHero.js)"
if [ "${2:-}" = "--install" ]; then cp "$OUT"/hero-*.{mp4,jpg} "$P/"; echo "installed into public/assets"; fi
