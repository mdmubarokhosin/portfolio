#!/usr/bin/env bash
# সব ৯টি প্রজেক্ট শোকেস ভিডিও রেন্ডার করে renders/projects/ ফোল্ডারে
set -e
cd "$(dirname "$0")/.."
mkdir -p renders/projects
SLUGS=(abhijog ibadat365 expense-manager unified-geo-api madrasa-management chatbd overtime-bd bangla-font-cdn free-food-map)
for slug in "${SLUGS[@]}"; do
  echo "▶ Rendering ProjectShowcase: $slug"
  npx remotion render src/index.ts ProjectShowcase "renders/projects/$slug.mp4" \
    --props "{\"slug\":\"$slug\"}" --codec=h264 --crf=20
done
echo "✓ Done → renders/projects/"
