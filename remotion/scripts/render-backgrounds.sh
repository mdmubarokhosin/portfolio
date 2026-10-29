#!/usr/bin/env bash
# লাইট-থিম ব্যাকগ্রাউন্ড লুপগুলো রেন্ডার করে renders/site-videos/ ফোল্ডারে
set -e
cd "$(dirname "$0")/.."
mkdir -p renders/site-videos
declare -A MAP=( [BgGrid]=bg-grid [BgOrbs]=bg-orbs [BgWaves]=bg-waves [BgHero]=bg-hero )
for comp in BgGrid BgOrbs BgWaves BgHero; do
  echo "▶ Rendering $comp → ${MAP[$comp]}.mp4"
  npx remotion render src/index.ts "$comp" "renders/site-videos/${MAP[$comp]}.mp4" --codec=h264 --crf=20
done
echo "✓ Done → renders/site-videos/"
