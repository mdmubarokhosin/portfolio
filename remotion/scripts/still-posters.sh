#!/usr/bin/env bash
# সব ৯টি প্রজেক্ট পোস্টার (JPG) রেন্ডার করে renders/projects/ ফোল্ডারে
set -e
cd "$(dirname "$0")/.."
mkdir -p renders/projects
SLUGS=(abhijog ibadat365 expense-manager unified-geo-api madrasa-management chatbd overtime-bd bangla-font-cdn free-food-map)
for slug in "${SLUGS[@]}"; do
  echo "▶ Still ProjectPoster: $slug"
  npx remotion still src/index.ts ProjectPoster "renders/projects/$slug-poster.jpg" \
    --props "{\"slug\":\"$slug\"}" --quality=100
done
echo "✓ Done → renders/projects/"
